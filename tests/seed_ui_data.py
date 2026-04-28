import os
import requests


BASE_URL = (os.environ.get("EXPO_BACKEND_URL") or "").rstrip("/")
USER_ID = "natur-e2e-seed-001"


def main() -> None:
    if not BASE_URL:
        raise RuntimeError("EXPO_BACKEND_URL is required")

    session = requests.Session()
    session.headers.update({"Content-Type": "application/json"})

    session.delete(f"{BASE_URL}/api/profile/{USER_ID}", timeout=30)

    bootstrap = session.post(
        f"{BASE_URL}/api/profile/bootstrap",
        json={"userId": USER_ID, "displayName": "Felix", "allowLocation": False},
        timeout=30,
    )
    bootstrap.raise_for_status()

    def save_finding(danish_name: str, latin_name: str, captured_at: str, category: str, subcategory: str) -> None:
        payload = {
            "userId": USER_ID,
            "imageData": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAAB",
            "latitude": 55.6761,
            "longitude": 12.5683,
            "municipality": "København",
            "userNote": "TEST_seed",
            "aiVerifiedStatus": "AI-vurderet",
            "capturedAt": captured_at,
            "analysis": {
                "primarySuggestion": {
                    "danishName": danish_name,
                    "latinName": latin_name,
                    "category": category,
                    "subcategory": subcategory,
                    "family": "Test-familie",
                    "confidenceScore": 0.86,
                    "description": f"{danish_name} testbeskrivelse",
                    "characteristics": ["Kendetegn 1", "Kendetegn 2"],
                    "habitat": "Skov",
                    "rarityStatus": "Almindelig",
                    "warning": "Ikke farlig for mennesker",
                    "cautionAdvice": "Hold afstand og tag kun billeder.",
                    "size": "Lille",
                    "appearance": "Test-udseende",
                    "diet": "Blandet",
                    "activePeriod": "Dag",
                    "confusionSpecies": [],
                    "funFact": "Sjovt fakta",
                    "childFriendlyExplanation": "Børnevenlig forklaring",
                    "commonality": "Almindelig i Danmark",
                },
                "alternativeSuggestions": [],
                "imageQuality": {"quality": "Middel", "issues": []},
                "shouldAskForNewPhoto": False,
                "aiDisclaimer": "AI-vurderingen kan være usikker, især når arter ligner hinanden.",
                "retryHint": "Prøv et nyt billede tættere på dyret.",
            },
        }
        response = session.post(f"{BASE_URL}/api/findings", json=payload, timeout=30)
        response.raise_for_status()

    save_finding("Rådyr", "Capreolus capreolus", "2026-01-10T10:00:00Z", "Pattedyr", "Hjortedyr")
    save_finding("Rådyr", "Capreolus capreolus", "2026-01-11T10:00:00Z", "Pattedyr", "Hjortedyr")
    save_finding("Gråspurv", "Passer domesticus", "2026-01-12T10:00:00Z", "Fugle", "Spurve")

    print("Seed complete for natur-e2e-seed-001")


if __name__ == "__main__":
    main()