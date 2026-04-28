import base64
from typing import Optional
from urllib.parse import quote

import requests


WIKIPEDIA_SUMMARY_URL = "https://en.wikipedia.org/api/rest_v1/page/summary/{title}"
TIMEOUT = 12


def fetch_reference_image_data(latin_name: str) -> Optional[str]:
    if not latin_name.strip():
        return None

    try:
        response = requests.get(
            WIKIPEDIA_SUMMARY_URL.format(title=quote(latin_name.strip())),
            timeout=TIMEOUT,
            headers={"accept": "application/json"},
        )
        response.raise_for_status()
        payload = response.json()
        thumbnail = (payload.get("thumbnail") or {}).get("source")
        if not thumbnail:
            return None

        image_response = requests.get(thumbnail, timeout=TIMEOUT)
        image_response.raise_for_status()
        content_type = image_response.headers.get("content-type", "image/jpeg")
        encoded = base64.b64encode(image_response.content).decode("utf-8")
        return f"data:{content_type};base64,{encoded}"
    except Exception:
        return None