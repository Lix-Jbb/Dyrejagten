import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import React from "react";
import { Alert, StyleSheet, Text, View } from "react-native";

import { FilterPill, GlassCard, SectionHeading } from "../components/Cards";
import { NatureButton, Screen, theme } from "../components/Screen";
import { useApp } from "../context/AppContext";
import { slugifyLatinName } from "../lib/api";

export default function ResultScreen() {
  const router = useRouter();
  const { busy, currentAnalysis, currentCapture, loadSpecies, saveCurrentFinding } = useApp();

  if (!currentAnalysis || !currentCapture) {
    return (
      <Screen title="Resultat" subtitle="Der er ikke et aktivt fund at vise endnu.">
        <GlassCard>
          <Text style={styles.helper}>Tag eller vælg først et billede, så kan vi vise analysen her.</Text>
          <NatureButton label="Gå til kamera" onPress={() => router.replace("/(tabs)/camera" as never)} testID="result-fallback-camera-button" />
        </GlassCard>
      </Screen>
    );
  }

  const suggestion = currentAnalysis.primarySuggestion;
  const certaintyLabel =
    suggestion.confidenceScore >= 0.8
      ? "AI'en er ret sikker"
      : suggestion.confidenceScore >= 0.55
        ? "AI'en tror, det er den her"
        : "AI'en er lidt i tvivl";

  const saveToDiary = async () => {
    try {
      await saveCurrentFinding({ note: "" });
      Alert.alert("Flot fund!", `${suggestion.danishName} er nu i din dyrebog.`);
      router.replace("/(tabs)/collection" as never);
    } catch (error) {
      Alert.alert("Ups", error instanceof Error ? error.message : "Prøv igen om lidt.");
    }
  };

  return (
    <Screen title="DET LIGNER..." subtitle="Flot fund! Her er dyret, som AI'en bedst kan genkende.">
      <GlassCard>
        <Image contentFit="cover" source={{ uri: currentCapture.uri }} style={styles.image} />
        <View style={styles.badgeRow}>
          <View style={styles.topBadge}>
            <Ionicons color={theme.primary} name="leaf-outline" size={18} />
            <Text style={styles.topBadgeText}>{suggestion.category}</Text>
          </View>
          <Text style={styles.confidence}>{certaintyLabel}</Text>
        </View>
        <Text style={styles.title}>{suggestion.danishName}</Text>
        <Text style={styles.subtitle}>{suggestion.latinName}</Text>
        <Text style={styles.body}>{suggestion.description}</Text>
        <Text style={styles.helper}>{currentAnalysis.aiDisclaimer}</Text>
        {currentAnalysis.shouldAskForNewPhoto ? <Text style={styles.warning}>{currentAnalysis.retryHint}</Text> : null}
      </GlassCard>

      <GlassCard>
        <SectionHeading title="Kendetegn" />
        <View style={styles.wrap}>
          {suggestion.characteristics.map((item) => (
            <FilterPill active key={item} label={item} onPress={() => null} />
          ))}
        </View>
        <Text style={styles.infoLabel}>Levested</Text>
        <Text style={styles.body}>{suggestion.habitat}</Text>
        <Text style={styles.infoLabel}>Vær opmærksom</Text>
        <Text style={styles.body}>{suggestion.cautionAdvice}</Text>
      </GlassCard>

      <GlassCard>
        <SectionHeading title="Måske også" />
        {currentAnalysis.alternativeSuggestions.length ? (
          currentAnalysis.alternativeSuggestions.map((item) => (
            <View key={`${item.latinName}-${item.danishName}`} style={styles.alternativeRow}>
              <Text style={styles.altName}>{item.danishName}</Text>
              <Text style={styles.helper}>Ligner også lidt</Text>
            </View>
          ))
        ) : (
          <Text style={styles.helper}>{"AI'en har ikke andre stærke bud lige nu."}</Text>
        )}
      </GlassCard>

      <NatureButton label="Gem i min dyrebog" loading={busy} onPress={saveToDiary} testID="result-save-button" />
      <NatureButton
        label="Sammenlign billeder"
        onPress={() => router.push("/compare" as never)}
        testID="result-alternative-button"
        variant="secondary"
      />
      <NatureButton
        label="Se mere om dyret"
        onPress={async () => {
          await loadSpecies(slugifyLatinName(suggestion.latinName));
          router.push(`/species/${slugifyLatinName(suggestion.latinName)}` as never);
        }}
        testID="result-species-button"
        variant="ghost"
      />
      <NatureButton
        label="Prøv igen"
        onPress={() => router.replace("/(tabs)/camera" as never)}
        testID="result-retry-button"
        variant="ghost"
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  image: {
    width: "100%",
    height: 260,
    borderRadius: 22,
  },
  badgeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  topBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "#eef4ea",
  },
  topBadgeText: {
    color: theme.dark,
    fontSize: 13,
    fontWeight: "700",
  },
  confidence: {
    flex: 1,
    textAlign: "right",
    fontSize: 15,
    fontWeight: "900",
    color: theme.dark,
  },
  title: {
    fontSize: 34,
    fontWeight: "900",
    color: theme.dark,
  },
  subtitle: {
    fontSize: 16,
    color: theme.textMuted,
    fontStyle: "italic",
  },
  body: {
    fontSize: 15,
    lineHeight: 22,
    color: theme.dark,
  },
  helper: {
    fontSize: 15,
    lineHeight: 22,
    color: theme.dark,
    fontWeight: "700",
  },
  warning: {
    fontSize: 14,
    lineHeight: 21,
    color: "#8b5a1f",
    fontWeight: "700",
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: "800",
    color: theme.dark,
  },
  wrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  alternativeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  altName: {
    fontSize: 15,
    fontWeight: "700",
    color: theme.dark,
  },
});