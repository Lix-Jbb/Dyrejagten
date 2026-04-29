from typing import List, Literal, Optional

from pydantic import BaseModel, Field


RarityStatus = Literal[
    "Almindelig",
    "Sjælden",
    "Invasiv",
    "Fredet",
    "Særlig opmærksomhed",
]


class AlternativeSuggestion(BaseModel):
    danishName: str
    latinName: str
    confidenceScore: float
    category: str = "Andre dyr i Danmark"
    subcategory: str = "Andet"


class ImageQuality(BaseModel):
    quality: str = "Ukendt"
    issues: List[str] = Field(default_factory=list)


class PrimarySuggestion(BaseModel):
    danishName: str
    latinName: str
    category: str
    subcategory: str
    family: str = "Ukendt"
    confidenceScore: float
    description: str
    characteristics: List[str] = Field(default_factory=list)
    habitat: str
    rarityStatus: RarityStatus = "Almindelig"
    warning: str = "Ikke farlig for mennesker"
    cautionAdvice: str = "Hold afstand og tag kun billeder."
    size: str = "Ikke angivet"
    appearance: str = "Ikke angivet"
    diet: str = "Ikke angivet"
    activePeriod: str = "Ikke angivet"
    confusionSpecies: List[str] = Field(default_factory=list)
    funFact: str = "Ikke angivet"
    childFriendlyExplanation: str = "Ikke angivet"
    commonality: str = "Almindelig i Danmark"


class AnalysisResponse(BaseModel):
    primarySuggestion: PrimarySuggestion
    alternativeSuggestions: List[AlternativeSuggestion] = Field(default_factory=list)
    imageQuality: ImageQuality = Field(default_factory=ImageQuality)
    shouldAskForNewPhoto: bool = False
    aiDisclaimer: str = "AI-vurderingen kan være usikker, især når arter ligner hinanden."
    retryHint: str = "Prøv et nyt billede tættere på dyret og gerne fra siden eller ovenfra."


class AnalyzeRequest(BaseModel):
    imageBase64: str
    mimeType: str = "image/jpeg"


class BootstrapRequest(BaseModel):
    userId: str
    displayName: str
    allowLocation: bool = False


class UpdatePreferencesRequest(BaseModel):
    displayName: Optional[str] = None
    allowLocation: Optional[bool] = None
    onboardingCompleted: Optional[bool] = None


class SaveFindingRequest(BaseModel):
    userId: str
    imageData: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    municipality: Optional[str] = None
    userNote: str = ""
    aiVerifiedStatus: str = "AI-vurderet"
    capturedAt: str
    analysis: AnalysisResponse


class UpdateFindingRequest(BaseModel):
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    municipality: Optional[str] = None


class Finding(BaseModel):
    id: str
    userId: str
    imageUrl: str
    capturedAt: str
    dateLabel: str
    timeLabel: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    municipality: Optional[str] = None
    danishName: str
    latinName: str
    category: str
    subcategory: str
    confidenceScore: float
    description: str
    characteristics: List[str] = Field(default_factory=list)
    habitat: str
    rarityStatus: str
    aiVerifiedStatus: str
    userNote: str = ""
    alternativeSuggestions: List[AlternativeSuggestion] = Field(default_factory=list)
    warning: str = "Ikke farlig for mennesker"
    cautionAdvice: str = "Hold afstand og tag kun billeder."
    size: str = "Ikke angivet"
    appearance: str = "Ikke angivet"
    diet: str = "Ikke angivet"
    activePeriod: str = "Ikke angivet"
    confusionSpecies: List[str] = Field(default_factory=list)
    funFact: str = "Ikke angivet"
    childFriendlyExplanation: str = "Ikke angivet"
    family: str = "Ukendt"
    commonality: str = "Almindelig i Danmark"
    awardedPoints: int = 0
    isNewSpecies: bool = False
    isFirstInCategory: bool = False


class MapMarker(BaseModel):
    id: str
    category: str
    danishName: str
    municipality: str
    latitude: float
    longitude: float
    isApproximate: bool = False
    rarityStatus: str = "Almindelig"


class UserProfile(BaseModel):
    userId: str
    displayName: str
    allowLocation: bool = False
    onboardingCompleted: bool = False
    createdAt: str


class BadgeProgress(BaseModel):
    id: str
    title: str
    description: str
    icon: str
    progress: int
    target: int
    unlocked: bool
    unlockedAt: Optional[str] = None
    points: int = 0


class CategoryProgress(BaseModel):
    category: str
    totalFindings: int
    uniqueSpecies: int
    target: int
    progress: float


class DashboardResponse(BaseModel):
    totalPoints: int
    totalFindings: int
    uniqueSpecies: int
    findingsByCategory: List[CategoryProgress]
    findingsByMonth: List[dict] = Field(default_factory=list)
    recentFindings: List[Finding] = Field(default_factory=list)
    rarestFinding: Optional[Finding] = None
    mostPhotographedCategory: str = "Ingen endnu"
    nextBadge: Optional[BadgeProgress] = None
    earnedBadges: List[BadgeProgress] = Field(default_factory=list)
    latestBadge: Optional[BadgeProgress] = None


class SpeciesDetail(BaseModel):
    slug: str
    danishName: str
    latinName: str
    category: str
    subcategory: str
    family: str = "Ukendt"
    size: str = "Ikke angivet"
    appearance: str = "Ikke angivet"
    characteristics: List[str] = Field(default_factory=list)
    habitat: str = "Ikke angivet"
    diet: str = "Ikke angivet"
    activePeriod: str = "Ikke angivet"
    rarityStatus: str = "Almindelig"
    warning: str = "Ikke farlig for mennesker"
    cautionAdvice: str = "Hold afstand og tag kun billeder."
    confusionSpecies: List[str] = Field(default_factory=list)
    funFact: str = "Ikke angivet"
    childFriendlyExplanation: str = "Ikke angivet"
    description: str = "Ikke angivet"
    commonality: str = "Almindelig i Danmark"
    findings: List[Finding] = Field(default_factory=list)
