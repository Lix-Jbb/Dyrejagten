from typing import Dict, List, Optional


CATEGORY_TARGETS: Dict[str, int] = {
    "Insekter": 12,
    "Fugle": 10,
    "Pattedyr": 8,
    "Krybdyr og padder": 6,
    "Fisk": 6,
    "Edderkopper og smådyr": 8,
    "Hav- og stranddyr": 8,
    "Andre dyr i Danmark": 6,
}


CATEGORY_OPTIONS: List[Dict[str, object]] = [
    {
        "name": "Insekter",
        "icon": "bug-outline",
        "subcategories": [
            "Biller",
            "Sommerfugle",
            "Bier og hvepse",
            "Fluer og myg",
            "Guldsmede",
            "Græshopper",
            "Tæger",
        ],
    },
    {
        "name": "Fugle",
        "icon": "navigate-outline",
        "subcategories": [
            "Havefugle",
            "Rovfugle",
            "Vandfugle",
            "Skovfugle",
            "Kystfugle",
            "Trækfugle",
        ],
    },
    {
        "name": "Pattedyr",
        "icon": "paw-outline",
        "subcategories": ["Hjorte", "Gnavere", "Rovdyr", "Flagermus", "Husnære dyr"],
    },
    {
        "name": "Krybdyr og padder",
        "icon": "leaf-outline",
        "subcategories": ["Frøer", "Tudser", "Salamandere", "Firben", "Slanger"],
    },
    {
        "name": "Fisk",
        "icon": "fish-outline",
        "subcategories": ["Ferskvandsfisk", "Kystfisk", "Havfisk"],
    },
    {
        "name": "Edderkopper og smådyr",
        "icon": "aperture-outline",
        "subcategories": ["Edderkopper", "Bænkebidere", "Tusindben", "Snegle"],
    },
    {
        "name": "Hav- og stranddyr",
        "icon": "water-outline",
        "subcategories": ["Krabber", "Muslinger", "Snegle", "Vandmænd", "Søstjerner", "Rejer"],
    },
    {
        "name": "Andre dyr i Danmark",
        "icon": "sparkles-outline",
        "subcategories": ["Bydyr", "Havedyr", "Skovdyr", "Vådområder"],
    },
]


CATEGORY_ALIASES: Dict[str, str] = {
    "insekt": "Insekter",
    "insekter": "Insekter",
    "bille": "Insekter",
    "biller": "Insekter",
    "sommerfugl": "Insekter",
    "fugl": "Fugle",
    "fugle": "Fugle",
    "pattedyr": "Pattedyr",
    "krybdyr": "Krybdyr og padder",
    "padde": "Krybdyr og padder",
    "padder": "Krybdyr og padder",
    "krybdyr og padder": "Krybdyr og padder",
    "frø": "Krybdyr og padder",
    "tudse": "Krybdyr og padder",
    "salamander": "Krybdyr og padder",
    "fisk": "Fisk",
    "edderkop": "Edderkopper og smådyr",
    "edderkopper": "Edderkopper og smådyr",
    "edderkopper og smådyr": "Edderkopper og smådyr",
    "leddyr": "Edderkopper og smådyr",
    "smådyr": "Edderkopper og smådyr",
    "havdyr": "Hav- og stranddyr",
    "stranddyr": "Hav- og stranddyr",
    "hav- og stranddyr": "Hav- og stranddyr",
    "hav og stranddyr": "Hav- og stranddyr",
    "andre": "Andre dyr i Danmark",
    "andet": "Andre dyr i Danmark",
    "andre dyr i danmark": "Andre dyr i Danmark",
}


def normalize_category(value: Optional[str]) -> str:
    if not value:
        return "Andre dyr i Danmark"

    normalized = value.strip().lower()
    return CATEGORY_ALIASES.get(normalized, value.strip())


RARE_STATUSES = {"Sjælden", "Fredet", "Særlig opmærksomhed"}


BADGE_CATALOG: List[Dict[str, object]] = [
    {
        "id": "first_find",
        "title": "Første fund",
        "description": "Gem dit første fund.",
        "icon": "leaf",
        "points": 40,
        "type": "total_findings",
        "target": 1,
    },
    {
        "id": "ten_findings",
        "title": "10 dyr fundet",
        "description": "Gem 10 fund i samlingen.",
        "icon": "albums",
        "points": 80,
        "type": "total_findings",
        "target": 10,
    },
    {
        "id": "fifty_findings",
        "title": "50 dyr fundet",
        "description": "Gem 50 fund i samlingen.",
        "icon": "trophy",
        "points": 120,
        "type": "total_findings",
        "target": 50,
    },
    {
        "id": "first_insect",
        "title": "Første insekt",
        "description": "Gem dit første insekt.",
        "icon": "bug",
        "type": "category_count",
        "category": "Insekter",
        "target": 1,
        "points": 50,
    },
    {
        "id": "first_bird",
        "title": "Første fugl",
        "description": "Gem din første fugl.",
        "icon": "navigate",
        "type": "category_count",
        "category": "Fugle",
        "target": 1,
        "points": 50,
    },
    {
        "id": "first_mammal",
        "title": "Første pattedyr",
        "description": "Gem dit første pattedyr.",
        "icon": "paw",
        "type": "category_count",
        "category": "Pattedyr",
        "target": 1,
        "points": 50,
    },
    {
        "id": "beetle_hunter",
        "title": "Billejæger",
        "description": "Find 3 forskellige biller.",
        "icon": "shield-checkmark",
        "type": "subcategory_unique_species",
        "subcategory": "Biller",
        "target": 3,
        "points": 70,
    },
    {
        "id": "bird_watcher",
        "title": "Fuglekigger",
        "description": "Find 5 forskellige fuglearter.",
        "icon": "eye",
        "type": "category_unique_species",
        "category": "Fugle",
        "target": 5,
        "points": 80,
    },
    {
        "id": "forest_researcher",
        "title": "Skovforsker",
        "description": "Gem 3 fund fra skov og skovkanter.",
        "icon": "leaf",
        "type": "habitat_contains",
        "keyword": "skov",
        "target": 3,
        "points": 80,
    },
    {
        "id": "beach_finder",
        "title": "Strandfinder",
        "description": "Gem 3 hav- og stranddyr.",
        "icon": "water",
        "type": "category_count",
        "category": "Hav- og stranddyr",
        "target": 3,
        "points": 75,
    },
    {
        "id": "nature_nerd",
        "title": "Naturnørd",
        "description": "Optjen 250 point.",
        "icon": "sparkles",
        "type": "total_points",
        "target": 250,
        "points": 60,
    },
    {
        "id": "weekend_explorer",
        "title": "Weekend-opdager",
        "description": "Gem 3 weekendfund.",
        "icon": "sunny",
        "type": "weekend_findings",
        "target": 3,
        "points": 65,
    },
    {
        "id": "denmark_collector",
        "title": "Danmarkssamler",
        "description": "Find dyr i 5 forskellige kommuner eller områder.",
        "icon": "map",
        "type": "municipality_count",
        "target": 5,
        "points": 90,
    },
    {
        "id": "ten_unique_insects",
        "title": "10 forskellige insekter",
        "description": "Find 10 forskellige insektarter.",
        "icon": "bug",
        "type": "category_unique_species",
        "category": "Insekter",
        "target": 10,
        "points": 110,
    },
    {
        "id": "ten_unique_birds",
        "title": "10 forskellige fugle",
        "description": "Find 10 forskellige fuglearter.",
        "icon": "navigate-circle",
        "type": "category_unique_species",
        "category": "Fugle",
        "target": 10,
        "points": 110,
    },
    {
        "id": "all_seasons",
        "title": "Fund i alle årstider",
        "description": "Gem mindst ét fund i hver årstid.",
        "icon": "partly-sunny",
        "type": "season_count",
        "target": 4,
        "points": 100,
    },
]