import base64
import os
import uuid
from pathlib import Path

import pytest
import requests


# Core API smoke + CRUD regression for NaturFinder MVP flows
BASE_URL = (
    os.environ.get("EXPO_BACKEND_URL")
    or os.environ.get("EXPO_PUBLIC_BACKEND_URL")
    or ""
).rstrip("/")


@pytest.fixture(scope="session")
def api_client():
    session = requests.Session()
    session.headers.update({"Content-Type": "application/json"})
    return session


@pytest.fixture(scope="session")
def sample_image_base64():
    image_path = Path("/app/frontend/assets/images/app-image.png")
    if not image_path.exists():
        pytest.skip("Mangler testbillede til /api/analyze")
    return base64.b64encode(image_path.read_bytes()).decode("utf-8")


@pytest.fixture(scope="session")
def test_user(api_client):
    if not BASE_URL:
        pytest.skip("EXPO_BACKEND_URL er ikke sat")

    user_id = f"TEST_user_{uuid.uuid4().hex[:10]}"
    payload = {"userId": user_id, "displayName": "TEST_Felix", "allowLocation": False}
    response = api_client.post(f"{BASE_URL}/api/profile/bootstrap", json=payload, timeout=30)
    assert response.status_code == 200
    created = response.json()
    assert created["userId"] == user_id
    yield created
    api_client.delete(f"{BASE_URL}/api/profile/{user_id}", timeout=30)


def test_health_root(api_client):
    if not BASE_URL:
        pytest.skip("EXPO_BACKEND_URL er ikke sat")
    response = api_client.get(f"{BASE_URL}/api/", timeout=30)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"


def test_analyze_returns_structured_json(api_client, sample_image_base64):
    if not BASE_URL:
        pytest.skip("EXPO_BACKEND_URL er ikke sat")

    response = api_client.post(
        f"{BASE_URL}/api/analyze",
        json={"imageBase64": sample_image_base64, "mimeType": "image/png"},
        timeout=90,
    )
    assert response.status_code == 200
    data = response.json()
    assert data["primarySuggestion"]["danishName"]
    assert isinstance(data["alternativeSuggestions"], list)
    assert "aiDisclaimer" in data


def test_reference_image_endpoint_returns_expected_shape(api_client):
    if not BASE_URL:
        pytest.skip("EXPO_BACKEND_URL/EXPO_PUBLIC_BACKEND_URL er ikke sat")

    response = api_client.get(
        f"{BASE_URL}/api/reference-image",
        params={"latinName": "Capreolus capreolus"},
        timeout=30,
    )
    assert response.status_code == 200
    data = response.json()
    assert data["latinName"] == "Capreolus capreolus"
    assert "imageData" in data


def test_save_get_dashboard_species_map_and_delete_finding(api_client, test_user):
    user_id = test_user["userId"]
    analyze_payload = {
        "primarySuggestion": {
            "danishName": "Rådyr",
            "latinName": "Capreolus capreolus",
            "category": "Pattedyr",
            "subcategory": "Hjortedyr",
            "family": "Cervidae",
            "confidenceScore": 0.86,
            "description": "Et almindeligt hjortedyr i Danmark.",
            "characteristics": ["Lille hjort", "Lys bagdel"],
            "habitat": "Skov og mark",
            "rarityStatus": "Almindelig",
            "warning": "Ikke farlig for mennesker",
            "cautionAdvice": "Hold afstand og tag kun billeder.",
            "size": "Mellem",
            "appearance": "Rødbrun pels",
            "diet": "Planter",
            "activePeriod": "Skumring",
            "confusionSpecies": ["Krondyr"],
            "funFact": "Kan springe højt",
            "childFriendlyExplanation": "Et sky skovdyr",
            "commonality": "Almindelig i Danmark",
        },
        "alternativeSuggestions": [
            {
                "danishName": "Dådyr",
                "latinName": "Dama dama",
                "confidenceScore": 0.32,
                "category": "Pattedyr",
                "subcategory": "Hjortedyr",
            }
        ],
        "imageQuality": {"quality": "Middel", "issues": []},
        "shouldAskForNewPhoto": False,
        "aiDisclaimer": "AI-vurderingen kan være usikker, især når arter ligner hinanden.",
        "retryHint": "Prøv et nyt billede tættere på dyret og gerne fra siden eller ovenfra.",
    }

    create_payload = {
        "userId": user_id,
        "imageData": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAAB",
        "latitude": 55.6761,
        "longitude": 12.5683,
        "municipality": "København",
        "userNote": "TEST_notat",
        "aiVerifiedStatus": "AI-vurderet",
        "capturedAt": "2026-01-05T10:00:00Z",
        "analysis": analyze_payload,
    }

    create_response = api_client.post(f"{BASE_URL}/api/findings", json=create_payload, timeout=30)
    assert create_response.status_code == 200
    created = create_response.json()
    assert created["danishName"] == "Rådyr"
    finding_id = created["id"]

    get_response = api_client.get(f"{BASE_URL}/api/findings/{finding_id}", timeout=30)
    assert get_response.status_code == 200
    fetched = get_response.json()
    assert fetched["id"] == finding_id

    list_response = api_client.get(f"{BASE_URL}/api/findings", params={"userId": user_id}, timeout=30)
    assert list_response.status_code == 200
    listed = list_response.json()
    assert any(item["id"] == finding_id for item in listed)

    dashboard_response = api_client.get(f"{BASE_URL}/api/dashboard/{user_id}", timeout=30)
    assert dashboard_response.status_code == 200
    dashboard = dashboard_response.json()
    assert dashboard["totalFindings"] >= 1

    badges_response = api_client.get(f"{BASE_URL}/api/badges/{user_id}", timeout=30)
    assert badges_response.status_code == 200
    assert isinstance(badges_response.json(), list)

    species_slug = "capreolus-capreolus"
    species_response = api_client.get(
        f"{BASE_URL}/api/species/{species_slug}",
        params={"userId": user_id},
        timeout=30,
    )
    assert species_response.status_code == 200
    species_data = species_response.json()
    assert species_data["latinName"] == "Capreolus capreolus"

    map_response = api_client.get(f"{BASE_URL}/api/map/{user_id}", timeout=30)
    assert map_response.status_code == 200
    markers = map_response.json()
    assert any(marker["id"] == finding_id for marker in markers)

    delete_response = api_client.delete(f"{BASE_URL}/api/findings/{finding_id}", timeout=30)
    assert delete_response.status_code == 200

    get_deleted_response = api_client.get(f"{BASE_URL}/api/findings/{finding_id}", timeout=30)
    assert get_deleted_response.status_code == 404


def test_map_rounds_coordinates_for_rare_species(api_client, test_user):
    user_id = test_user["userId"]
    rare_payload = {
        "primarySuggestion": {
            "danishName": "Odder",
            "latinName": "Lutra lutra",
            "category": "Pattedyr",
            "subcategory": "Rovdyr",
            "family": "Mustelidae",
            "confidenceScore": 0.91,
            "description": "Halvakvatisk pattedyr.",
            "characteristics": ["Lang krop"],
            "habitat": "Vandløb og søer",
            "rarityStatus": "Sjælden",
            "warning": "Ikke farlig for mennesker",
            "cautionAdvice": "Hold afstand og tag kun billeder.",
            "size": "Mellem",
            "appearance": "Brun pels",
            "diet": "Fisk",
            "activePeriod": "Nat",
            "confusionSpecies": [],
            "funFact": "Kan svømme hurtigt",
            "childFriendlyExplanation": "Et vanddyr i Danmark",
            "commonality": "Sjælden i Danmark",
        },
        "alternativeSuggestions": [],
        "imageQuality": {"quality": "Middel", "issues": []},
        "shouldAskForNewPhoto": False,
        "aiDisclaimer": "AI-vurderingen kan være usikker, især når arter ligner hinanden.",
        "retryHint": "Prøv et nyt billede tættere på dyret og gerne fra siden eller ovenfra.",
    }

    create_response = api_client.post(
        f"{BASE_URL}/api/findings",
        json={
            "userId": user_id,
            "imageData": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAAB",
            "latitude": 55.67891,
            "longitude": 12.54321,
            "municipality": "TEST_Kommune",
            "userNote": "TEST_rare",
            "aiVerifiedStatus": "AI-vurderet",
            "capturedAt": "2026-01-06T11:00:00Z",
            "analysis": rare_payload,
        },
        timeout=30,
    )
    assert create_response.status_code == 200
    created = create_response.json()
    finding_id = created["id"]

    map_response = api_client.get(f"{BASE_URL}/api/map/{user_id}", timeout=30)
    assert map_response.status_code == 200
    marker = next((item for item in map_response.json() if item["id"] == finding_id), None)
    assert marker is not None
    assert marker["isApproximate"] is True
    assert marker["latitude"] == round(55.67891, 1)
    assert marker["longitude"] == round(12.54321, 1)

    api_client.delete(f"{BASE_URL}/api/findings/{finding_id}", timeout=30)


def test_species_delete_route_removes_user_findings(api_client, test_user):
    user_id = test_user["userId"]
    latin_name = "Testudo hermanni"
    slug = "testudo-hermanni"

    analysis_payload = {
        "primarySuggestion": {
            "danishName": "Skildpadde",
            "latinName": latin_name,
            "category": "Krybdyr",
            "subcategory": "Skildpadder",
            "family": "Testudinidae",
            "confidenceScore": 0.8,
            "description": "Test-art til species delete route.",
            "characteristics": ["Skjold"],
            "habitat": "Have",
            "rarityStatus": "Almindelig",
            "warning": "Ikke farlig for mennesker",
            "cautionAdvice": "Hold afstand og tag kun billeder.",
            "size": "Mellem",
            "appearance": "Skjold",
            "diet": "Planter",
            "activePeriod": "Dag",
            "confusionSpecies": [],
            "funFact": "Kan blive gammel",
            "childFriendlyExplanation": "Et dyr med hus på ryggen",
            "commonality": "Sjælden i Danmark",
        },
        "alternativeSuggestions": [],
        "imageQuality": {"quality": "Middel", "issues": []},
        "shouldAskForNewPhoto": False,
        "aiDisclaimer": "AI-vurderingen kan være usikker, især når arter ligner hinanden.",
        "retryHint": "Prøv et nyt billede tættere på dyret og gerne fra siden eller ovenfra.",
    }

    create_response = api_client.post(
        f"{BASE_URL}/api/findings",
        json={
            "userId": user_id,
            "imageData": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAAB",
            "latitude": None,
            "longitude": None,
            "municipality": None,
            "userNote": "TEST_species_delete",
            "aiVerifiedStatus": "AI-vurderet",
            "capturedAt": "2026-01-07T11:00:00Z",
            "analysis": analysis_payload,
        },
        timeout=30,
    )
    assert create_response.status_code == 200

    species_response = api_client.get(
        f"{BASE_URL}/api/species/{slug}",
        params={"userId": user_id},
        timeout=30,
    )
    assert species_response.status_code == 200

    delete_response = api_client.delete(
        f"{BASE_URL}/api/species/{slug}",
        params={"userId": user_id},
        timeout=30,
    )
    assert delete_response.status_code == 200
    deleted_payload = delete_response.json()
    assert deleted_payload["status"] == "deleted"
    assert deleted_payload["deletedCount"] >= 1

    list_response = api_client.get(f"{BASE_URL}/api/findings", params={"userId": user_id}, timeout=30)
    assert list_response.status_code == 200
    findings = list_response.json()
    assert all(item["latinName"] != latin_name for item in findings)