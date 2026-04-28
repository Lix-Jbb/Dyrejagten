from collections import Counter, defaultdict
from datetime import datetime
from typing import Dict, List, Tuple

from constants import BADGE_CATALOG, CATEGORY_TARGETS, RARE_STATUSES


def normalize_species_key(finding: Dict[str, object]) -> str:
    latin = str(finding.get("latinName") or "").strip().lower()
    danish = str(finding.get("danishName") or "").strip().lower()
    return latin or danish


def get_season(date_string: str) -> str:
    month = datetime.fromisoformat(date_string.replace("Z", "+00:00")).month
    if month in (12, 1, 2):
        return "vinter"
    if month in (3, 4, 5):
        return "forår"
    if month in (6, 7, 8):
        return "sommer"
    return "efterår"


def calculate_award(findings: List[Dict[str, object]], candidate: Dict[str, object]) -> Tuple[int, bool, bool]:
    points = 10
    candidate_key = normalize_species_key(candidate)
    existing_species = {normalize_species_key(finding) for finding in findings}
    existing_categories = {str(finding.get("category") or "") for finding in findings}
    is_new_species = candidate_key not in existing_species
    is_first_in_category = str(candidate.get("category") or "") not in existing_categories

    if is_new_species:
        points += 25
    if is_first_in_category:
        points += 50
    if str(candidate.get("rarityStatus") or "") in RARE_STATUSES:
        points += 20
    if float(candidate.get("confidenceScore") or 0) >= 0.85:
        points += 5
    if str(candidate.get("userNote") or "").strip():
        points += 5

    return points, is_new_species, is_first_in_category


def build_badges(findings: List[Dict[str, object]]) -> Tuple[List[Dict[str, object]], List[Dict[str, object]]]:
    category_counts = Counter(str(f.get("category") or "") for f in findings)
    municipality_count = len({str(f.get("municipality") or "").strip() for f in findings if str(f.get("municipality") or "").strip()})
    total_points = sum(int(f.get("awardedPoints") or 0) for f in findings)
    seasons = {get_season(str(f.get("capturedAt") or datetime.utcnow().isoformat())) for f in findings}
    weekend_findings = sum(
        1
        for f in findings
        if datetime.fromisoformat(str(f.get("capturedAt") or datetime.utcnow().isoformat()).replace("Z", "+00:00")).weekday() >= 5
    )

    category_unique_species: Dict[str, set] = defaultdict(set)
    subcategory_unique_species: Dict[str, set] = defaultdict(set)
    habitat_counts: Counter = Counter()

    for finding in findings:
        species_key = normalize_species_key(finding)
        category = str(finding.get("category") or "")
        subcategory = str(finding.get("subcategory") or "")
        habitat = str(finding.get("habitat") or "").lower()
        if species_key:
            category_unique_species[category].add(species_key)
            subcategory_unique_species[subcategory].add(species_key)
        for keyword in ("skov", "strand", "sø", "have"):
            if keyword in habitat:
                habitat_counts[keyword] += 1

    earned: List[Dict[str, object]] = []
    progress_list: List[Dict[str, object]] = []

    for badge in BADGE_CATALOG:
        badge_type = str(badge["type"])
        progress = 0
        if badge_type == "total_findings":
            progress = len(findings)
        elif badge_type == "category_count":
            progress = category_counts[str(badge.get("category") or "")]
        elif badge_type == "total_points":
            progress = total_points
        elif badge_type == "municipality_count":
            progress = municipality_count
        elif badge_type == "season_count":
            progress = len(seasons)
        elif badge_type == "weekend_findings":
            progress = weekend_findings
        elif badge_type == "category_unique_species":
            progress = len(category_unique_species[str(badge.get("category") or "")])
        elif badge_type == "subcategory_unique_species":
            progress = len(subcategory_unique_species[str(badge.get("subcategory") or "")])
        elif badge_type == "habitat_contains":
            progress = habitat_counts[str(badge.get("keyword") or "")]

        unlocked = progress >= int(badge["target"])
        payload = {
            **badge,
            "progress": progress,
            "unlocked": unlocked,
            "unlockedAt": findings[-1].get("capturedAt") if unlocked and findings else None,
        }
        progress_list.append(payload)
        if unlocked:
            earned.append(payload)

    return earned, progress_list


def build_dashboard(findings: List[Dict[str, object]]) -> Dict[str, object]:
    category_counts = Counter(str(f.get("category") or "") for f in findings)
    category_unique_species: Dict[str, set] = defaultdict(set)
    monthly_counts: Counter = Counter()
    rarity_rank = {"Fredet": 4, "Særlig opmærksomhed": 3, "Sjælden": 2, "Invasiv": 1, "Almindelig": 0}

    for finding in findings:
        category_unique_species[str(finding.get("category") or "")].add(normalize_species_key(finding))
        month_key = str(finding.get("capturedAt") or "")[:7]
        if month_key:
            monthly_counts[month_key] += 1

    earned_badges, all_badges = build_badges(findings)
    locked_badges = [badge for badge in all_badges if not badge["unlocked"]]
    locked_badges.sort(key=lambda item: (item["target"] - item["progress"], item["title"]))

    category_progress = []
    for category, target in CATEGORY_TARGETS.items():
        total = category_counts[category]
        unique_count = len(category_unique_species[category])
        category_progress.append(
            {
                "category": category,
                "totalFindings": total,
                "uniqueSpecies": unique_count,
                "target": target,
                "progress": min(total / target, 1) if target else 0,
            }
        )

    rarest_finding = None
    if findings:
        rarest_finding = sorted(
            findings,
            key=lambda item: (
                -rarity_rank.get(str(item.get("rarityStatus") or "Almindelig"), 0),
                -float(item.get("confidenceScore") or 0),
            ),
        )[0]

    return {
        "totalPoints": sum(int(f.get("awardedPoints") or 0) for f in findings),
        "totalFindings": len(findings),
        "uniqueSpecies": len({normalize_species_key(finding) for finding in findings if normalize_species_key(finding)}),
        "findingsByCategory": category_progress,
        "findingsByMonth": [
            {"month": month, "count": count}
            for month, count in sorted(monthly_counts.items(), reverse=True)
        ],
        "recentFindings": list(reversed(findings[-5:])),
        "rarestFinding": rarest_finding,
        "mostPhotographedCategory": category_counts.most_common(1)[0][0] if category_counts else "Ingen endnu",
        "nextBadge": locked_badges[0] if locked_badges else None,
        "earnedBadges": list(reversed(earned_badges[-6:])),
        "latestBadge": earned_badges[-1] if earned_badges else None,
    }