// analyze-animal — Supabase Edge Function (Deno).
// Replaces backend/ai.py:34-109 analyze_animal_image. Calls OpenAI vision API directly.
//
// Auth: invoked with the user's JWT (supabase.functions.invoke from the app).
// Secrets required:
//   OPENAI_API_KEY     — the OpenAI key (set with `supabase secrets set OPENAI_API_KEY=...`)
//   OPENAI_MODEL       — optional, defaults to "gpt-5.2"
//   ANALYZE_DAILY_CAP  — optional, defaults to 30 (calls/day/user)
//
// Provided automatically by the Edge Functions runtime:
//   SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

const SYSTEM_PROMPT = `Du er en naturvejleder og artsgenkender for dyr i Danmark.
Du må kun foreslå dyr, der realistisk findes i Danmark.
Skriv alt på dansk.
Vær ærlig om usikkerhed og returnér kun JSON uden markdown.
Hvis billedet er uklart, så sæt shouldAskForNewPhoto=true og forklar kort hvorfor.
Ved dyr der kan stikke, bide eller være giftige, skal cautionAdvice sige: 'Rør ikke dyret. Hold afstand og tag kun billeder.'`;

const USER_PROMPT = `Analyser billedet af dyret og returnér præcis dette JSON-format uden ekstra tekst:
{
  "primarySuggestion": {
    "danishName": "",
    "latinName": "",
    "category": "",
    "subcategory": "",
    "family": "",
    "confidenceScore": 0.0,
    "description": "",
    "characteristics": [""],
    "habitat": "",
    "rarityStatus": "Almindelig",
    "warning": "",
    "cautionAdvice": "",
    "size": "",
    "appearance": "",
    "diet": "",
    "activePeriod": "",
    "confusionSpecies": [""],
    "funFact": "",
    "childFriendlyExplanation": "",
    "commonality": ""
  },
  "alternativeSuggestions": [
    {
      "danishName": "",
      "latinName": "",
      "confidenceScore": 0.0,
      "category": "",
      "subcategory": ""
    }
  ],
  "imageQuality": {
    "quality": "",
    "issues": [""]
  },
  "shouldAskForNewPhoto": false,
  "aiDisclaimer": "AI-vurderingen kan være usikker, især når arter ligner hinanden.",
  "retryHint": "Prøv et nyt billede tættere på dyret og gerne fra siden eller ovenfra."
}

Regler:
- Prioritér arter i Danmark.
- confidenceScore skal være mellem 0 og 1.
- category skal altid være præcis én af disse: Insekter, Fugle, Pattedyr, Krybdyr og padder, Fisk, Edderkopper og smådyr, Hav- og stranddyr, Andre dyr i Danmark.
- Giv 1-3 alternative forslag ved usikkerhed.
- Hvis du er meget usikker, så brug en lav confidenceScore og shouldAskForNewPhoto=true.
- Brug venlig, enkel og naturformidlende tone.`;

const DEFAULT_DISCLAIMER = "AI-vurderingen kan være usikker, især når arter ligner hinanden.";
const DEFAULT_RETRY_HINT = "Prøv et nyt billede tættere på dyret og gerne fra siden eller ovenfra.";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function cleanJsonResponse(raw: string): string {
  let cleaned = raw.trim();
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/, "");
  }
  return cleaned.trim();
}

async function checkAndIncrementRateLimit(
  serviceClient: ReturnType<typeof createClient>,
  userId: string,
  cap: number,
): Promise<{ allowed: boolean; current: number }> {
  const today = new Date().toISOString().slice(0, 10);
  const { data: existing } = await serviceClient
    .from("rate_limits")
    .select("count")
    .eq("userId", userId)
    .eq("bucket", "analyze_animal")
    .eq("windowDate", today)
    .maybeSingle();

  const current = existing?.count ?? 0;
  if (current >= cap) {
    return { allowed: false, current };
  }
  await serviceClient
    .from("rate_limits")
    .upsert({
      userId,
      bucket: "analyze_animal",
      windowDate: today,
      count: current + 1,
    }, { onConflict: "userId,bucket,windowDate" });
  return { allowed: true, current: current + 1 };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  if (req.method !== "POST") {
    return jsonResponse({ detail: "Method not allowed" }, 405);
  }

  // Verify caller is authenticated.
  const authHeader = req.headers.get("Authorization") ?? "";
  if (!authHeader.startsWith("Bearer ")) {
    return jsonResponse({ detail: "Manglende godkendelse" }, 401);
  }
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

  const userClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
  });
  const { data: userData, error: userError } = await userClient.auth.getUser();
  if (userError || !userData.user) {
    return jsonResponse({ detail: "Ugyldig session" }, 401);
  }
  const userId = userData.user.id;

  // Rate limit
  const cap = parseInt(Deno.env.get("ANALYZE_DAILY_CAP") ?? "30", 10);
  const serviceClient = createClient(supabaseUrl, serviceRoleKey);
  const { allowed, current } = await checkAndIncrementRateLimit(serviceClient, userId, cap);
  if (!allowed) {
    return jsonResponse(
      { detail: `Du har brugt din daglige analyse-grænse (${cap}). Prøv igen i morgen.` },
      429,
    );
  }

  // Parse body
  let body: { imageBase64?: string; mimeType?: string };
  try {
    body = await req.json();
  } catch {
    return jsonResponse({ detail: "Ugyldigt JSON" }, 400);
  }
  const imageBase64 = body.imageBase64;
  const mimeType = body.mimeType ?? "image/jpeg";
  if (!imageBase64 || imageBase64.length < 100) {
    return jsonResponse({ detail: "Manglende eller ugyldigt billede" }, 400);
  }

  // OpenAI key
  const apiKey = Deno.env.get("OPENAI_API_KEY")?.trim();
  if (!apiKey) {
    return jsonResponse({ detail: "OPENAI_API_KEY mangler i Edge Function-secrets" }, 503);
  }
  const model = Deno.env.get("OPENAI_MODEL") ?? "gpt-5.2";

  // Call OpenAI Chat Completions with vision
  const openaiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: [
            { type: "text", text: USER_PROMPT },
            {
              type: "image_url",
              image_url: { url: `data:${mimeType};base64,${imageBase64}` },
            },
          ],
        },
      ],
    }),
  });

  if (!openaiResponse.ok) {
    const errText = await openaiResponse.text();
    console.error("OpenAI error", openaiResponse.status, errText);
    return jsonResponse(
      { detail: "AI-analysen kunne ikke gennemføres lige nu. Prøv igen om et øjeblik." },
      502,
    );
  }

  const openaiData = await openaiResponse.json();
  const rawText: string = openaiData?.choices?.[0]?.message?.content ?? "";
  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(cleanJsonResponse(rawText));
  } catch (err) {
    console.error("Failed to parse OpenAI JSON", err, rawText);
    return jsonResponse(
      { detail: "AI-vurderingen kunne ikke fortolkes. Prøv et nyt billede." },
      502,
    );
  }

  // Apply same fallbacks as backend/ai.py:101-108
  if (typeof parsed.aiDisclaimer !== "string" || !parsed.aiDisclaimer) {
    parsed.aiDisclaimer = DEFAULT_DISCLAIMER;
  }
  if (typeof parsed.retryHint !== "string" || !parsed.retryHint) {
    parsed.retryHint = DEFAULT_RETRY_HINT;
  }

  return jsonResponse(parsed, 200);
});
