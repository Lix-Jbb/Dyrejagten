import json
import os
import uuid
from typing import Any, Dict

from emergentintegrations.llm.chat import ImageContent, LlmChat, UserMessage

from schemas import AnalysisResponse


SYSTEM_PROMPT = """
Du er en naturvejleder og artsgenkender for dyr i Danmark.
Du må kun foreslå dyr, der realistisk findes i Danmark.
Skriv alt på dansk.
Vær ærlig om usikkerhed og returnér kun JSON uden markdown.
Hvis billedet er uklart, så sæt shouldAskForNewPhoto=true og forklar kort hvorfor.
Ved dyr der kan stikke, bide eller være giftige, skal cautionAdvice sige: 'Rør ikke dyret. Hold afstand og tag kun billeder.'
""".strip()


def get_api_key() -> str:
    return os.getenv("EMERGENT_LLM_KEY", "").strip() or os.getenv("OPENAI_API_KEY", "").strip()


def clean_json_response(raw_text: str) -> str:
    cleaned = raw_text.strip()
    if cleaned.startswith("```"):
        cleaned = cleaned.strip("`")
        if cleaned.startswith("json"):
            cleaned = cleaned[4:]
    return cleaned.strip()


async def analyze_animal_image(image_base64: str) -> AnalysisResponse:
    api_key = get_api_key()
    if not api_key:
        raise ValueError("OPENAI_API_KEY mangler i backend/.env")

    chat = LlmChat(
        api_key=api_key,
        session_id=f"animal-analysis-{uuid.uuid4()}",
        system_message=SYSTEM_PROMPT,
    ).with_model("openai", "gpt-5.2")

    prompt = """
Analyser billedet af dyret og returnér præcis dette JSON-format uden ekstra tekst:
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
- Giv 1-3 alternative forslag ved usikkerhed.
- Hvis du er meget usikker, så brug en lav confidenceScore og shouldAskForNewPhoto=true.
- Brug venlig, enkel og naturformidlende tone.
""".strip()

    response_text = await chat.send_message(
        UserMessage(text=prompt, file_contents=[ImageContent(image_base64=image_base64)])
    )
    parsed: Dict[str, Any] = json.loads(clean_json_response(response_text))
    parsed.setdefault(
        "aiDisclaimer",
        "AI-vurderingen kan være usikker, især når arter ligner hinanden.",
    )
    parsed.setdefault(
        "retryHint",
        "Prøv et nyt billede tættere på dyret og gerne fra siden eller ovenfra.",
    )
    return AnalysisResponse(**parsed)