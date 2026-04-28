import logging
import os
import re
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Dict, List, Optional

from ai import analyze_animal_image
from constants import CATEGORY_OPTIONS, RARE_STATUSES
from dotenv import load_dotenv
from fastapi import APIRouter, FastAPI, HTTPException, Query
from motor.motor_asyncio import AsyncIOMotorClient
from scoring import build_badges, build_dashboard, calculate_award
from schemas import (
    AnalysisResponse,
    AnalyzeRequest,
    BadgeProgress,
    BootstrapRequest,
    DashboardResponse,
    Finding,
    MapMarker,
    SaveFindingRequest,
    SpeciesDetail,
    UpdatePreferencesRequest,
    UserProfile,
)
from starlette.middleware.cors import CORSMiddleware


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

mongo_url = os.environ["MONGO_URL"]
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ["DB_NAME"]]

app = FastAPI(title="NaturFinder API")
api_router = APIRouter(prefix="/api")

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def slugify(value: str) -> str:
    normalized = value.lower().strip()
    normalized = re.sub(r"[^a-z0-9æøå]+", "-", normalized)
    return normalized.strip("-")


def sanitize(document: Optional[Dict]) -> Optional[Dict]:
    if not document:
        return None
    clean = dict(document)
    clean.pop("_id", None)
    return clean


def with_date_labels(captured_at: str) -> Dict[str, str]:
    parsed = datetime.fromisoformat(captured_at.replace("Z", "+00:00"))
    return {
        "dateLabel": parsed.strftime("%d.%m.%Y"),
        "timeLabel": parsed.strftime("%H:%M"),
    }


async def get_profile_or_404(user_id: str) -> Dict:
    profile = await db.profiles.find_one({"userId": user_id}, {"_id": 0})
    if not profile:
        raise HTTPException(status_code=404, detail="Profilen blev ikke fundet")
    return profile


async def fetch_findings(user_id: str) -> List[Dict]:
    return await db.findings.find({"userId": user_id}, {"_id": 0}).sort("capturedAt", 1).to_list(2000)


async def upsert_species(finding: Dict) -> None:
    slug = slugify(str(finding["latinName"]))
    species_payload = {
        "slug": slug,
        "danishName": finding["danishName"],
        "latinName": finding["latinName"],
        "category": finding["category"],
        "subcategory": finding["subcategory"],
        "family": finding.get("family", "Ukendt"),
        "size": finding.get("size", "Ikke angivet"),
        "appearance": finding.get("appearance", "Ikke angivet"),
        "characteristics": finding.get("characteristics", []),
        "habitat": finding.get("habitat", "Ikke angivet"),
        "diet": finding.get("diet", "Ikke angivet"),
        "activePeriod": finding.get("activePeriod", "Ikke angivet"),
        "rarityStatus": finding.get("rarityStatus", "Almindelig"),
        "warning": finding.get("warning", "Ikke farlig for mennesker"),
        "cautionAdvice": finding.get("cautionAdvice", "Hold afstand og tag kun billeder."),
        "confusionSpecies": finding.get("confusionSpecies", []),
        "funFact": finding.get("funFact", "Ikke angivet"),
        "childFriendlyExplanation": finding.get("childFriendlyExplanation", "Ikke angivet"),
        "description": finding.get("description", "Ikke angivet"),
        "commonality": finding.get("commonality", "Almindelig i Danmark"),
        "updatedAt": now_iso(),
    }
    await db.species.update_one(
        {"slug": slug},
        {"$set": species_payload, "$setOnInsert": {"createdAt": now_iso()}},
        upsert=True,
    )


@api_router.get("/")
async def root() -> Dict[str, object]:
    return {
        "app": "NaturFinder API",
        "status": "ok",
        "categories": CATEGORY_OPTIONS,
    }


@api_router.get("/categories")
async def get_categories() -> Dict[str, object]:
    return {"categories": CATEGORY_OPTIONS}


@api_router.post("/profile/bootstrap", response_model=UserProfile)
async def bootstrap_profile(payload: BootstrapRequest) -> UserProfile:
    existing = await db.profiles.find_one({"userId": payload.userId}, {"_id": 0})
    if existing:
        return UserProfile(**existing)

    profile = {
        "userId": payload.userId,
        "displayName": payload.displayName,
        "allowLocation": payload.allowLocation,
        "onboardingCompleted": False,
        "createdAt": now_iso(),
    }
    await db.profiles.insert_one(profile.copy())
    return UserProfile(**profile)


@api_router.get("/profile/{user_id}", response_model=UserProfile)
async def get_profile(user_id: str) -> UserProfile:
    profile = await get_profile_or_404(user_id)
    return UserProfile(**profile)


@api_router.patch("/profile/{user_id}", response_model=UserProfile)
async def update_profile(user_id: str, payload: UpdatePreferencesRequest) -> UserProfile:
    await get_profile_or_404(user_id)
    updates = {key: value for key, value in payload.model_dump().items() if value is not None}
    if updates:
        await db.profiles.update_one({"userId": user_id}, {"$set": updates})
    updated = await get_profile_or_404(user_id)
    return UserProfile(**updated)


@api_router.post("/analyze", response_model=AnalysisResponse)
async def analyze_finding(payload: AnalyzeRequest) -> AnalysisResponse:
    try:
        return await analyze_animal_image(payload.imageBase64)
    except ValueError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    except Exception as exc:
        logger.exception("AI-analyse fejlede")
        raise HTTPException(
            status_code=502,
            detail="AI-analysen kunne ikke gennemføres lige nu. Prøv igen om et øjeblik.",
        ) from exc


@api_router.post("/findings", response_model=Finding)
async def save_finding(payload: SaveFindingRequest) -> Finding:
    await get_profile_or_404(payload.userId)
    findings = await fetch_findings(payload.userId)
    primary = payload.analysis.primarySuggestion.model_dump()
    points, is_new_species, is_first_in_category = calculate_award(
        findings,
        {
            **primary,
            "userNote": payload.userNote,
        },
    )
    date_labels = with_date_labels(payload.capturedAt)
    finding = {
        "id": str(uuid.uuid4()),
        "userId": payload.userId,
        "imageUrl": payload.imageData,
        "capturedAt": payload.capturedAt,
        **date_labels,
        "latitude": payload.latitude,
        "longitude": payload.longitude,
        "municipality": payload.municipality,
        "danishName": primary["danishName"],
        "latinName": primary["latinName"],
        "category": primary["category"],
        "subcategory": primary["subcategory"],
        "confidenceScore": primary["confidenceScore"],
        "description": primary["description"],
        "characteristics": primary["characteristics"],
        "habitat": primary["habitat"],
        "rarityStatus": primary["rarityStatus"],
        "aiVerifiedStatus": payload.aiVerifiedStatus,
        "userNote": payload.userNote,
        "alternativeSuggestions": [item.model_dump() for item in payload.analysis.alternativeSuggestions],
        "warning": primary["warning"],
        "cautionAdvice": primary["cautionAdvice"],
        "size": primary["size"],
        "appearance": primary["appearance"],
        "diet": primary["diet"],
        "activePeriod": primary["activePeriod"],
        "confusionSpecies": primary["confusionSpecies"],
        "funFact": primary["funFact"],
        "childFriendlyExplanation": primary["childFriendlyExplanation"],
        "family": primary["family"],
        "commonality": primary["commonality"],
        "awardedPoints": points,
        "isNewSpecies": is_new_species,
        "isFirstInCategory": is_first_in_category,
        "createdAt": now_iso(),
    }
    await db.findings.insert_one(finding.copy())
    await upsert_species(finding)
    return Finding(**sanitize(finding))


@api_router.get("/findings", response_model=List[Finding])
async def get_findings(
    userId: str,
    category: Optional[str] = None,
    search: Optional[str] = None,
    sort: str = Query(default="Nyeste"),
) -> List[Finding]:
    query: Dict[str, object] = {"userId": userId}
    if category and category != "Alle":
        query["category"] = category
    if search:
        query["$or"] = [
            {"danishName": {"$regex": search, "$options": "i"}},
            {"latinName": {"$regex": search, "$options": "i"}},
        ]

    findings = await db.findings.find(query, {"_id": 0}).to_list(2000)
    sort_map = {
        "Nyeste": lambda item: item["capturedAt"],
        "Ældste": lambda item: item["capturedAt"],
        "Kategori": lambda item: f"{item['category']}::{item['danishName']}",
        "Art": lambda item: item["danishName"],
    }
    reverse = sort != "Ældste"
    findings.sort(key=sort_map.get(sort, sort_map["Nyeste"]), reverse=reverse)
    return [Finding(**item) for item in findings]


@api_router.get("/findings/{finding_id}", response_model=Finding)
async def get_finding(finding_id: str) -> Finding:
    finding = await db.findings.find_one({"id": finding_id}, {"_id": 0})
    if not finding:
        raise HTTPException(status_code=404, detail="Fundet blev ikke fundet")
    return Finding(**finding)


@api_router.delete("/findings/{finding_id}")
async def delete_finding(finding_id: str) -> Dict[str, str]:
    finding = await db.findings.find_one({"id": finding_id}, {"_id": 0})
    if not finding:
        raise HTTPException(status_code=404, detail="Fundet blev ikke fundet")
    await db.findings.delete_one({"id": finding_id})
    return {"status": "deleted"}


@api_router.get("/dashboard/{user_id}", response_model=DashboardResponse)
async def get_dashboard(user_id: str) -> DashboardResponse:
    await get_profile_or_404(user_id)
    findings = await fetch_findings(user_id)
    payload = build_dashboard(findings)
    return DashboardResponse(**payload)


@api_router.get("/badges/{user_id}", response_model=List[BadgeProgress])
async def get_badges(user_id: str) -> List[BadgeProgress]:
    await get_profile_or_404(user_id)
    findings = await fetch_findings(user_id)
    _, badge_list = build_badges(findings)
    badge_list.sort(key=lambda item: (item["unlocked"], item["progress"]), reverse=True)
    return [BadgeProgress(**item) for item in badge_list]


@api_router.get("/species/{slug}", response_model=SpeciesDetail)
async def get_species_detail(slug: str, userId: str) -> SpeciesDetail:
    species = await db.species.find_one({"slug": slug}, {"_id": 0})
    if not species:
        raise HTTPException(status_code=404, detail="Arten blev ikke fundet")

    findings = await db.findings.find(
        {"userId": userId, "latinName": species["latinName"]},
        {"_id": 0},
    ).sort("capturedAt", -1).to_list(100)
    return SpeciesDetail(**{**species, "findings": findings})


@api_router.get("/map/{user_id}", response_model=List[MapMarker])
async def get_map_markers(user_id: str, category: Optional[str] = None) -> List[MapMarker]:
    await get_profile_or_404(user_id)
    query: Dict[str, object] = {
        "userId": user_id,
        "latitude": {"$ne": None},
        "longitude": {"$ne": None},
    }
    if category and category != "Alle":
        query["category"] = category
    findings = await db.findings.find(query, {"_id": 0}).sort("capturedAt", -1).to_list(500)
    markers: List[MapMarker] = []
    for finding in findings:
        approximate = str(finding.get("rarityStatus") or "") in RARE_STATUSES
        latitude = round(float(finding["latitude"]), 1) if approximate else float(finding["latitude"])
        longitude = round(float(finding["longitude"]), 1) if approximate else float(finding["longitude"])
        markers.append(
            MapMarker(
                id=finding["id"],
                category=finding["category"],
                danishName=finding["danishName"],
                municipality=finding.get("municipality") or "Ukendt område",
                latitude=latitude,
                longitude=longitude,
                isApproximate=approximate,
                rarityStatus=finding.get("rarityStatus") or "Almindelig",
            )
        )
    return markers


@api_router.delete("/profile/{user_id}")
async def delete_profile_data(user_id: str) -> Dict[str, str]:
    await db.findings.delete_many({"userId": user_id})
    await db.profiles.delete_one({"userId": user_id})
    return {"status": "deleted"}


@app.on_event("startup")
async def startup() -> None:
    await db.findings.create_index("userId")
    await db.findings.create_index("id", unique=True)
    await db.profiles.create_index("userId", unique=True)
    await db.species.create_index("slug", unique=True)


@app.on_event("shutdown")
async def shutdown_db_client() -> None:
    client.close()


app.include_router(api_router)
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)
