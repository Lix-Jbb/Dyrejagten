# Supabase backend for Dyrejagten

Replaces the old FastAPI + MongoDB stack. Three pieces:

- **migrations/** — schema, triggers, RPCs. Apply with `supabase db push` or paste into the SQL editor in order.
- **functions/analyze-animal/** — Edge Function that calls OpenAI vision (port of `backend/ai.py`).
- **rate_limits** table — created by `20260507120000_schema.sql`; backs the per-user daily cap in the Edge Function.

## Apply

```sh
supabase login
supabase link --project-ref <your-project-ref>
supabase db push
supabase functions deploy analyze-animal --no-verify-jwt=false
supabase secrets set OPENAI_API_KEY=sk-...
# Optional:
supabase secrets set OPENAI_MODEL=gpt-5.2
supabase secrets set ANALYZE_DAILY_CAP=30
```

## Migration order

| File | What it does |
|---|---|
| `20260507120000_schema.sql` | Tables (`profiles`, `species`, `findings`, `rate_limits`), indexes, RLS policies, `findings` storage bucket |
| `20260507120100_categories.sql` | `normalize_category()` function + auto-normalize triggers on `findings` and `species` |
| `20260507120200_award_trigger.sql` | Computes `awardedPoints`, `isNewSpecies`, `isFirstInCategory` on insert (port of `calculate_award`) |
| `20260507120300_badges.sql` | `badges` table seeded with 16 badges + `season_of()` + `get_badges()` RPC |
| `20260507120400_dashboard_rpc.sql` | `get_dashboard()` RPC — single-call dashboard payload (port of `build_dashboard`) |
| `20260507120500_species_detail_rpc.sql` | `get_species_detail()` RPC — species + user findings in one round-trip |

## Frontend wiring

Frontend calls these via the JS SDK:

```ts
// Auth
await supabase.auth.signInAnonymously();

// Profile
await supabase.from("profiles").upsert({ userId, displayName, allowLocation });

// Findings
const { data } = await supabase.from("findings").select().eq("userId", userId);
await supabase.storage.from("findings").upload(`${userId}/${id}.jpg`, blob);
await supabase.from("findings").insert({ ..., imagePath: `${userId}/${id}.jpg` });

// Aggregates
await supabase.rpc("get_dashboard", { p_user_id: userId });
await supabase.rpc("get_badges", { p_user_id: userId });
await supabase.rpc("get_species_detail", { p_user_id: userId, p_slug: slug });

// AI
await supabase.functions.invoke("analyze-animal", {
  body: { imageBase64, mimeType },
});
```
