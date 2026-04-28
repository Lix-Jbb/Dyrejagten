export type AlternativeSuggestion = {
  danishName: string;
  latinName: string;
  confidenceScore: number;
  category: string;
  subcategory: string;
};

export type PrimarySuggestion = {
  danishName: string;
  latinName: string;
  category: string;
  subcategory: string;
  family: string;
  confidenceScore: number;
  description: string;
  characteristics: string[];
  habitat: string;
  rarityStatus: string;
  warning: string;
  cautionAdvice: string;
  size: string;
  appearance: string;
  diet: string;
  activePeriod: string;
  confusionSpecies: string[];
  funFact: string;
  childFriendlyExplanation: string;
  commonality: string;
};

export type AnalysisResponse = {
  primarySuggestion: PrimarySuggestion;
  alternativeSuggestions: AlternativeSuggestion[];
  imageQuality: {
    quality: string;
    issues: string[];
  };
  shouldAskForNewPhoto: boolean;
  aiDisclaimer: string;
  retryHint: string;
};

export type Finding = {
  id: string;
  userId: string;
  imageUrl: string;
  capturedAt: string;
  dateLabel: string;
  timeLabel: string;
  latitude?: number | null;
  longitude?: number | null;
  municipality?: string | null;
  danishName: string;
  latinName: string;
  category: string;
  subcategory: string;
  confidenceScore: number;
  description: string;
  characteristics: string[];
  habitat: string;
  rarityStatus: string;
  aiVerifiedStatus: string;
  userNote: string;
  alternativeSuggestions: AlternativeSuggestion[];
  warning: string;
  cautionAdvice: string;
  size: string;
  appearance: string;
  diet: string;
  activePeriod: string;
  confusionSpecies: string[];
  funFact: string;
  childFriendlyExplanation: string;
  family: string;
  commonality: string;
  awardedPoints: number;
  isNewSpecies: boolean;
  isFirstInCategory: boolean;
};

export type CategoryProgress = {
  category: string;
  totalFindings: number;
  uniqueSpecies: number;
  target: number;
  progress: number;
};

export type BadgeProgress = {
  id: string;
  title: string;
  description: string;
  icon: string;
  progress: number;
  target: number;
  unlocked: boolean;
  unlockedAt?: string | null;
  points: number;
};

export type Dashboard = {
  totalPoints: number;
  totalFindings: number;
  uniqueSpecies: number;
  findingsByCategory: CategoryProgress[];
  findingsByMonth: { month: string; count: number }[];
  recentFindings: Finding[];
  rarestFinding?: Finding | null;
  mostPhotographedCategory: string;
  nextBadge?: BadgeProgress | null;
  earnedBadges: BadgeProgress[];
  latestBadge?: BadgeProgress | null;
};

export type SpeciesDetail = {
  slug: string;
  danishName: string;
  latinName: string;
  category: string;
  subcategory: string;
  family: string;
  size: string;
  appearance: string;
  characteristics: string[];
  habitat: string;
  diet: string;
  activePeriod: string;
  rarityStatus: string;
  warning: string;
  cautionAdvice: string;
  confusionSpecies: string[];
  funFact: string;
  childFriendlyExplanation: string;
  description: string;
  commonality: string;
  findings: Finding[];
};

export type UserProfile = {
  userId: string;
  displayName: string;
  allowLocation: boolean;
  onboardingCompleted: boolean;
  createdAt: string;
};

export type MapMarker = {
  id: string;
  category: string;
  danishName: string;
  municipality: string;
  latitude: number;
  longitude: number;
  isApproximate: boolean;
  rarityStatus: string;
};

export type CategoryOption = {
  name: string;
  icon: string;
  subcategories: string[];
};

export type CaptureAsset = {
  uri: string;
  base64: string;
  mimeType: string;
  capturedAt: string;
};

export type SaveFindingPayload = {
  note: string;
  chosenSuggestion?: AlternativeSuggestion | null;
  customDanishName?: string;
  customLatinName?: string;
};