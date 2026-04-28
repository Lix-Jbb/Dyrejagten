import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from "expo-location";
import { useRouter } from "expo-router";
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

import {
  analyzeImage,
  bootstrapProfile,
  deleteAllData,
  deleteFinding,
  fetchBadges,
  fetchCategories,
  fetchDashboard,
  fetchFindings,
  fetchProfile,
  fetchMapMarkers,
  fetchSpeciesDetail,
  saveFinding,
  updateProfile,
} from "../lib/api";
import {
  AnalysisResponse,
  BadgeProgress,
  CaptureAsset,
  CategoryOption,
  Dashboard,
  Finding,
  MapMarker,
  SaveFindingPayload,
  SpeciesDetail,
  UserProfile,
} from "../lib/types";

type AppContextValue = {
  ready: boolean;
  busy: boolean;
  userId: string;
  profile?: UserProfile | null;
  dashboard?: Dashboard | null;
  findings: Finding[];
  badges: BadgeProgress[];
  categories: CategoryOption[];
  markers: MapMarker[];
  currentCapture?: CaptureAsset | null;
  currentAnalysis?: AnalysisResponse | null;
  speciesPreview?: SpeciesDetail | null;
  error?: string | null;
  refreshData: () => Promise<void>;
  setError: (value: string | null) => void;
  setCurrentCapture: (value: CaptureAsset | null) => void;
  runAnalysis: () => Promise<void>;
  saveCurrentFinding: (payload: SaveFindingPayload) => Promise<Finding>;
  removeFinding: (id: string) => Promise<void>;
  loadSpecies: (slug: string) => Promise<SpeciesDetail | null>;
  loadMapMarkers: (category?: string) => Promise<void>;
  updateUserProfile: (payload: Partial<UserProfile>) => Promise<void>;
  completeOnboarding: (allowLocation: boolean) => Promise<void>;
  resetAllData: () => Promise<void>;
};

const AppContext = createContext<AppContextValue | undefined>(undefined);
const STORAGE_KEY = "naturfinder-user-id";
const DEFAULT_NAME = "Felix";

function createUserId() {
  return `natur-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [userId, setUserId] = useState("");
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [findings, setFindings] = useState<Finding[]>([]);
  const [badges, setBadges] = useState<BadgeProgress[]>([]);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [markers, setMarkers] = useState<MapMarker[]>([]);
  const [currentCapture, setCurrentCapture] = useState<CaptureAsset | null>(null);
  const [currentAnalysis, setCurrentAnalysis] = useState<AnalysisResponse | null>(null);
  const [speciesPreview, setSpeciesPreview] = useState<SpeciesDetail | null>(null);
  const [error, setError] = useState<string | null>(null);

  const hydrate = useCallback(async () => {
    try {
      let storedId = await AsyncStorage.getItem(STORAGE_KEY);
      if (!storedId) {
        storedId = createUserId();
        await AsyncStorage.setItem(STORAGE_KEY, storedId);
      }

      setUserId(storedId);
      const categoryData = await fetchCategories();
      setCategories(categoryData);

      const nextProfile = await bootstrapProfile(storedId, DEFAULT_NAME, false);

      setProfile(nextProfile);
      const [dashboardData, findingsData, badgeData] = await Promise.all([
        fetchDashboard(storedId),
        fetchFindings(storedId),
        fetchBadges(storedId),
      ]);
      setDashboard(dashboardData);
      setFindings(findingsData);
      setBadges(badgeData);
      setMarkers(await fetchMapMarkers(storedId));
    } catch (appError) {
      setError(appError instanceof Error ? appError.message : "Noget gik galt.");
    } finally {
      setReady(true);
    }
  }, []);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  const refreshData = useCallback(async () => {
    if (!userId) {
      return;
    }

    const [nextProfile, dashboardData, findingsData, badgeData, markerData] = await Promise.all([
      fetchProfile(userId),
      fetchDashboard(userId),
      fetchFindings(userId),
      fetchBadges(userId),
      fetchMapMarkers(userId),
    ]);
    setProfile(nextProfile);
    setDashboard(dashboardData);
    setFindings(findingsData);
    setBadges(badgeData);
    setMarkers(markerData);
  }, [userId]);

  const runAnalysis = useCallback(async () => {
    if (!currentCapture) {
      throw new Error("Tag eller vælg først et billede.");
    }

    setBusy(true);
    setError(null);
    try {
      const result = await analyzeImage(currentCapture);
      setCurrentAnalysis(result);
      setSpeciesPreview(null);
    } catch (analysisError) {
      setError(analysisError instanceof Error ? analysisError.message : "AI-analysen fejlede.");
      throw analysisError;
    } finally {
      setBusy(false);
    }
  }, [currentCapture]);

  const saveCurrentFinding = useCallback(
    async (payload: SaveFindingPayload) => {
      if (!currentCapture || !currentAnalysis || !userId) {
        throw new Error("Der mangler billede eller analyse.");
      }

      setBusy(true);
      setError(null);
      try {
        let locationPayload: { latitude?: number; longitude?: number; municipality?: string } = {};
        if (profile?.allowLocation) {
          const permission = await Location.requestForegroundPermissionsAsync();
          if (permission.status === "granted") {
            const position = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
            const places = await Location.reverseGeocodeAsync(position.coords);
            locationPayload = {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              municipality:
                places[0]?.city || places[0]?.subregion || places[0]?.region || undefined,
            };
          }
        }

        const finding = await saveFinding(userId, currentCapture, currentAnalysis, payload, locationPayload);
        await refreshData();
        setCurrentCapture(null);
        setCurrentAnalysis(null);
        router.replace("/(tabs)" as never);
        return finding;
      } finally {
        setBusy(false);
      }
    },
    [currentAnalysis, currentCapture, profile?.allowLocation, refreshData, router, userId]
  );

  const removeFinding = useCallback(
    async (id: string) => {
      await deleteFinding(id);
      await refreshData();
    },
    [refreshData]
  );

  const loadSpecies = useCallback(
    async (slug: string) => {
      try {
        const details = await fetchSpeciesDetail(userId, slug);
        setSpeciesPreview(details);
        return details;
      } catch {
        if (!currentAnalysis) {
          return null;
        }

        const primary = currentAnalysis.primarySuggestion;
        const preview: SpeciesDetail = {
          slug,
          danishName: primary.danishName,
          latinName: primary.latinName,
          category: primary.category,
          subcategory: primary.subcategory,
          family: primary.family,
          size: primary.size,
          appearance: primary.appearance,
          characteristics: primary.characteristics,
          habitat: primary.habitat,
          diet: primary.diet,
          activePeriod: primary.activePeriod,
          rarityStatus: primary.rarityStatus,
          warning: primary.warning,
          cautionAdvice: primary.cautionAdvice,
          confusionSpecies: primary.confusionSpecies,
          funFact: primary.funFact,
          childFriendlyExplanation: primary.childFriendlyExplanation,
          description: primary.description,
          commonality: primary.commonality,
          findings: [],
        };
        setSpeciesPreview(preview);
        return preview;
      }
    },
    [currentAnalysis, userId]
  );

  const loadMapMarkers = useCallback(
    async (category = "Alle") => {
      if (!userId) {
        return;
      }
      setMarkers(await fetchMapMarkers(userId, category));
    },
    [userId]
  );

  const updateUserProfile = useCallback(
    async (payload: Partial<UserProfile>) => {
      if (!userId) {
        return;
      }
      const updated = await updateProfile(userId, payload);
      setProfile(updated);
      await refreshData();
    },
    [refreshData, userId]
  );

  const completeOnboarding = useCallback(
    async (allowLocation: boolean) => {
      await updateUserProfile({ allowLocation, onboardingCompleted: true });
    },
    [updateUserProfile]
  );

  const resetAllData = useCallback(async () => {
    if (!userId) {
      return;
    }
    await deleteAllData(userId);
    await AsyncStorage.removeItem(STORAGE_KEY);
    setReady(false);
    setProfile(null);
    setFindings([]);
    setBadges([]);
    setDashboard(null);
    setMarkers([]);
    setCurrentCapture(null);
    setCurrentAnalysis(null);
    setSpeciesPreview(null);
    await hydrate();
  }, [hydrate, userId]);

  const value = useMemo(
    () => ({
      ready,
      busy,
      userId,
      profile,
      dashboard,
      findings,
      badges,
      categories,
      markers,
      currentCapture,
      currentAnalysis,
      speciesPreview,
      error,
      refreshData,
      setError,
      setCurrentCapture,
      runAnalysis,
      saveCurrentFinding,
      removeFinding,
      loadSpecies,
      loadMapMarkers,
      updateUserProfile,
      completeOnboarding,
      resetAllData,
    }),
    [
      badges,
      busy,
      categories,
      completeOnboarding,
      currentAnalysis,
      currentCapture,
      dashboard,
      error,
      findings,
      loadMapMarkers,
      loadSpecies,
      markers,
      profile,
      ready,
      refreshData,
      removeFinding,
      resetAllData,
      runAnalysis,
      saveCurrentFinding,
      speciesPreview,
      updateUserProfile,
      userId,
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp skal bruges inde i AppProvider.");
  }
  return context;
}