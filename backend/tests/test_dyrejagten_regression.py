import os
import uuid
from pathlib import Path

import pytest
import requests


# Dyrejagten regression: manuel navnerettelse, kategori-normalisering, stedredigering og kortflow
def _resolve_base_url() -> str:
    env_value = (os.environ.get("EXPO_BACKEND_URL") or os.environ.get("EXPO_PUBLIC_BACKEND_URL") or "").strip()
    if env_value:
        return env_value.rstrip("/")

    frontend_env = Path("/app/frontend/.env")
    if frontend_env.exists():
        for line in frontend_env.read_text().splitlines():
            if line.startswith("EXPO_PUBLIC_BACKEND_URL="):
                return line.split("=", 1)[1].strip().strip('"').rstrip("/")

    return ""


BASE_URL = _resolve_base_url()


@pytest.fixture(scope="session")
def api_client():
    session = requests.Session()
    session.headers.update({"Content-Type": "application/json"})
    return session


@pytest.fixture(scope="session")
def test_user(api_client):
    if not BASE_URL:
        pytest.skip("EXPO backend URL mangler")

    user_id = f"TEST_dyrejagten_{uuid.uuid4().hex[:10]}"
    payload = {"userId": user_id, "displayName": "TEST_Felix", "allowLocation": False}
    response = api_client.post(f"{BASE_URL}/api/profile/bootstrap", json=payload, timeout=30)
    assert response.status_code == 200
    created = response.json()
    assert created["userId"] == user_id
    yield user_id
    api_client.delete(f"{BASE_URL}/api/profile/{user_id}", timeout=30)


def _analysis_payload(danish_name: str, latin_name: str, category: str):
    return {
        "primarySuggestion": {
            "danishName": danish_name,
            "latinName": latin_name,
            "category": category,
            "subcategory": "Edderkopper",
            "family": "Agelenidae",
            "confidenceScore": 0.74,
            "description": "Testfund til regression.",
            "characteristics": ["8 ben", "Laver spind"],
            "habitat": "Hjem og have",
            "rarityStatus": "Almindelig",
            "warning": "Ikke farlig for mennesker",
            "cautionAdvice": "Hold afstand og tag kun billeder.",
            "size": "Lille",
            "appearance": "Brun",
            "diet": "Små insekter",
            "activePeriod": "Aften",
            "confusionSpecies": ["Kælderedderkop"],
            "funFact": "Bygger tragtspind",
            "childFriendlyExplanation": "En lille edderkop med mange ben",
            "commonality": "Almindelig i Danmark",
        },
        "alternativeSuggestions": [],
        "imageQuality": {"quality": "Middel", "issues": []},
        "shouldAskForNewPhoto": False,
        "aiDisclaimer": "AI-vurderingen kan være usikker, især når arter ligner hinanden.",
        "retryHint": "Prøv et nyt billede tættere på dyret og gerne fra siden eller ovenfra.",
    }


def test_manual_name_save_persists_and_species_route_works(api_client, test_user):
    manual_name = "Min husedderkop"
    payload = {
        "userId": test_user,
        "imageData": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAAB",
        "latitude": 57.721,
        "longitude": 10.583,
        "municipality": "Skagen",
        "userNote": "",
        "aiVerifiedStatus": "Navn rettet af mig",
        "capturedAt": "2026-01-08T11:22:00Z",
        "analysis": _analysis_payload(manual_name, manual_name, "Leddyr"),
    }

    create_response = api_client.post(f"{BASE_URL}/api/findings", json=payload, timeout=30)
    assert create_response.status_code == 200
    created = create_response.json()
    assert created["danishName"] == manual_name
    assert created["latinName"] == manual_name
    finding_id = created["id"]

    get_response = api_client.get(f"{BASE_URL}/api/findings/{finding_id}", timeout=30)
    assert get_response.status_code == 200
    fetched = get_response.json()
    assert fetched["danishName"] == manual_name

    slug = "min-husedderkop"
    species_response = api_client.get(
        f"{BASE_URL}/api/species/{slug}",
        params={"userId": test_user},
        timeout=30,
    )
    assert species_response.status_code == 200
    species_data = species_response.json()
    assert species_data["findings"][0]["id"] == finding_id


def test_category_alias_leddyr_normalizes_to_edderkopper_og_smadyr(api_client, test_user):
    payload = {
        "userId": test_user,
        "imageData": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAAB",
        "latitude": None,
        "longitude": None,
        "municipality": None,
        "userNote": "",
        "aiVerifiedStatus": "AI-vurderet",
        "capturedAt": "2026-01-08T11:24:00Z",
        "analysis": _analysis_payload("Kælderedderkop", "Tegenaria domestica", "Leddyr"),
    }
    create_response = api_client.post(f"{BASE_URL}/api/findings", json=payload, timeout=30)
    assert create_response.status_code == 200
    finding_id = create_response.json()["id"]

    get_response = api_client.get(f"{BASE_URL}/api/findings/{finding_id}", timeout=30)
    assert get_response.status_code == 200
    assert get_response.json()["category"] == "Edderkopper og smådyr"

    filtered_response = api_client.get(
        f"{BASE_URL}/api/findings",
        params={"userId": test_user, "category": "Edderkopper og smådyr"},
        timeout=30,
    )
    assert filtered_response.status_code == 200
    assert any(item["id"] == finding_id for item in filtered_response.json())


def test_patch_location_updates_map_markers_and_alias_filter(api_client, test_user):
    create_response = api_client.post(
        f"{BASE_URL}/api/findings",
        json={
            "userId": test_user,
            "imageData": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAAB",
            "latitude": 56.2,
            "longitude": 9.4,
            "municipality": "Aarhus",
            "userNote": "",
            "aiVerifiedStatus": "AI-vurderet",
            "capturedAt": "2026-01-08T11:25:00Z",
            "analysis": _analysis_payload("Korsedderkop", "Araneus diadematus", "Leddyr"),
        },
        timeout=30,
    )
    assert create_response.status_code == 200
    finding_id = create_response.json()["id"]

    patch_response = api_client.patch(
        f"{BASE_URL}/api/findings/{finding_id}",
        json={"municipality": "Skagen", "latitude": 57.721, "longitude": 10.583},
        timeout=30,
    )
    assert patch_response.status_code == 200
    assert patch_response.json()["municipality"] == "Skagen"

    map_response = api_client.get(
        f"{BASE_URL}/api/map/{test_user}",
        params={"category": "Leddyr"},
        timeout=30,
    )
    assert map_response.status_code == 200
    marker = next((item for item in map_response.json() if item["id"] == finding_id), None)
    assert marker is not None
    assert marker["municipality"] == "Skagen"
