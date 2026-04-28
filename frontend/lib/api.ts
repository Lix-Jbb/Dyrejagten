import Constants from "expo-constants";
import { Platform } from "react-native";

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
} from "./types";

const nativeBackendUrl =
  process.env.EXPO_PUBLIC_BACKEND_URL || Constants.expoConfig?.extra?.backendUrl || "";

const API_BASE = Platform.OS === "web" ? "/api" : `${nativeBackendUrl.replace(/\/$/, "")}/api`;

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    ...init,
  });

  if (!response.ok) {
    const errorText = await response.text();
    try {
      const parsed = JSON.parse(errorText);
      throw new Error(parsed.detail ?? "Noget gik galt.");
    } catch {
      throw new Error(errorText || "Noget gik galt.");
    }
  }

  return (await response.json()) as T;
}

export function slugifyLatinName(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9æøå]+/g, "-").replace(/^-|-$/g, "");
}

export async function bootstrapProfile(userId: string, displayName: string, allowLocation: boolean) {
  return request<UserProfile>("/profile/bootstrap", {
    method: "POST",
    body: JSON.stringify({ userId, displayName, allowLocation }),
  });
}

export async function fetchProfile(userId: string) {
  return request<UserProfile>(`/profile/${userId}`);
}

export async function updateProfile(userId: string, payload: Partial<UserProfile>) {
  return request<UserProfile>(`/profile/${userId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function fetchDashboard(userId: string) {
  return request<Dashboard>(`/dashboard/${userId}`);
}

export async function fetchBadges(userId: string) {
  return request<BadgeProgress[]>(`/badges/${userId}`);
}

export async function fetchCategories() {
  const result = await request<{ categories: CategoryOption[] }>("/categories");
  return result.categories;
}

export async function fetchFindings(
  userId: string,
  category = "Alle",
  search = "",
  sort = "Nyeste"
) {
  const params = new URLSearchParams({ userId, category, search, sort });
  return request<Finding[]>(`/findings?${params.toString()}`);
}

export async function analyzeImage(asset: CaptureAsset) {
  return request<AnalysisResponse>("/analyze", {
    method: "POST",
    body: JSON.stringify({ imageBase64: asset.base64, mimeType: asset.mimeType }),
  });
}

export async function saveFinding(
  userId: string,
  asset: CaptureAsset,
  analysis: AnalysisResponse,
  payload: SaveFindingPayload,
  location?: { latitude?: number; longitude?: number; municipality?: string }
) {
  const selected = payload.chosenSuggestion;
  const mergedAnalysis: AnalysisResponse = {
    ...analysis,
    primarySuggestion: {
      ...analysis.primarySuggestion,
      danishName:
        payload.customDanishName?.trim() || selected?.danishName || analysis.primarySuggestion.danishName,
      latinName:
        payload.customLatinName?.trim() || selected?.latinName || analysis.primarySuggestion.latinName,
      category: selected?.category || analysis.primarySuggestion.category,
      subcategory: selected?.subcategory || analysis.primarySuggestion.subcategory,
      confidenceScore: selected?.confidenceScore || analysis.primarySuggestion.confidenceScore,
    },
  };

  return request<Finding>("/findings", {
    method: "POST",
    body: JSON.stringify({
      userId,
      imageData: `data:${asset.mimeType};base64,${asset.base64}`,
      latitude: location?.latitude ?? null,
      longitude: location?.longitude ?? null,
      municipality: location?.municipality ?? null,
      userNote: payload.note,
      aiVerifiedStatus: "AI-vurderet",
      capturedAt: asset.capturedAt,
      analysis: mergedAnalysis,
    }),
  });
}

export async function fetchSpeciesDetail(userId: string, slug: string) {
  return request<SpeciesDetail>(`/species/${slug}?userId=${userId}`);
}

export async function fetchMapMarkers(userId: string, category = "Alle") {
  return request<MapMarker[]>(`/map/${userId}?category=${encodeURIComponent(category)}`);
}

export async function fetchReferenceImage(latinName: string) {
  return request<{ latinName: string; imageData: string | null }>(
    `/reference-image?latinName=${encodeURIComponent(latinName)}`
  );
}

export async function deleteFinding(id: string) {
  return request<{ status: string }>(`/findings/${id}`, { method: "DELETE" });
}

export async function deleteSpeciesBySlug(userId: string, slug: string) {
  return request<{ status: string; deletedCount: number }>(
    `/species/${slug}?userId=${encodeURIComponent(userId)}`,
    { method: "DELETE" }
  );
}

export async function deleteAllData(userId: string) {
  return request<{ status: string }>(`/profile/${userId}`, { method: "DELETE" });
}