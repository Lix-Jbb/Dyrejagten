import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Alert, StyleSheet, Text, TextInput, View } from "react-native";

import { GlassCard } from "../components/Cards";
import { NatureButton, Screen, theme } from "../components/Screen";
import { useApp } from "../context/AppContext";
import { slugifyLatinName } from "../lib/api";

export default function ResultScreen() {
  const router = useRouter();
  const { busy, currentAnalysis, currentCapture, loadSpecies, saveCurrentFinding } = useApp();
  const [manualName, setManualName] = useState("");

  const suggestion = currentAnalysis?.primarySuggestion;
  const trimmedManualName = manualName.trim();
  const resultSubtitle = !suggestion
    ? "Der er ikke et aktivt fund at vise endnu."
    : trimmedManualName
      ? `Vi gemmer navnet som ${trimmedManualName}.`
      : `Det ligner en ${suggestion.danishName.toLowerCase()}.`;

  useEffect(() => {
    setManualName("");
  }, [currentCapture?.capturedAt, suggestion?.latinName]);

  if (!currentAnalysis || !currentCapture || !suggestion) {
    return (
      <Screen title="Resultat" subtitle="Der er ikke et aktivt fund at vise endnu.">
        <GlassCard>
          <Text style={styles.helper}>Tag eller vælg først et billede, så kan vi vise analysen her.</Text>
          <NatureButton label="Gå til kamera" onPress={() => router.replace("/(tabs)/camera" as never)} testID="result-fallback-camera-button" />
        </GlassCard>
      </Screen>
    );
  }

  const isUnknown = currentAnalysis.shouldAskForNewPhoto && suggestion.confidenceScore < 0.45;
  const certaintyLabel =
    suggestion.confidenceScore >= 0.8
      ? "Vi tror meget på det her bud"
      : suggestion.confidenceScore >= 0.55
        ? "Vi tror, det er den her"
        : "Vi er lidt i tvivl, men det her er vores bedste bud";

  const saveToDiary = async () => {
    try {
      const finding = await saveCurrentFinding({
        note: "",
        customDanishName: trimmedManualName || undefined,
        customLatinName: trimmedManualName || undefined,
      });
      const slug = slugifyLatinName(finding.latinName);
      await loadSpecies(slug);
      router.replace(`/species/${slug}` as never);
    } catch (error) {
      Alert.alert("Ups", error instanceof Error ? error.message : "Prøv igen om lidt.");
    }
  };

  if (isUnknown) {
    return (
      <Screen
        title="Vi kunne ikke finde dyret sikkert"
        subtitle="Prøv igen med et andet billede."
        bottomAction={
          <View style={styles.bottomActions}>
            <NatureButton label="Tag nyt billede" onPress={() => router.replace("/(tabs)/camera" as never)} testID="result-unknown-retry-button" />
            <NatureButton label="Tilbage" onPress={() => router.replace("/(tabs)" as never)} testID="result-unknown-back-button" variant="ghost" />
          </View>
        }
      >
        <GlassCard>
          <Image contentFit="cover" source={{ uri: currentCapture.uri }} style={styles.image} />
        </GlassCard>
      </Screen>
    );
  }

  return (
    <Screen
      title="Vi tror, det er den her"
      subtitle={resultSubtitle}
      bottomAction={
        <View style={styles.bottomActions}>
          <NatureButton label="Gem i min dyrebog" loading={busy} onPress={saveToDiary} testID="result-save-button" />
          <NatureButton label="Tilbage" onPress={() => router.replace("/(tabs)/camera" as never)} testID="result-back-button" variant="ghost" />
        </View>
      }
    >
      <GlassCard>
        <Image contentFit="cover" source={{ uri: currentCapture.uri }} style={styles.image} />
        <View style={styles.badgeRow}>
          <View style={styles.topBadge}>
            <Ionicons color={theme.primary} name="leaf-outline" size={18} />
            <Text style={styles.topBadgeText}>{suggestion.category}</Text>
          </View>
          <Text style={styles.confidence}>{certaintyLabel}</Text>
        </View>
        <Text style={styles.title} testID="result-animal-name">{trimmedManualName || suggestion.danishName}</Text>
        <Text style={styles.subtitle}>{suggestion.latinName}</Text>
        <Text style={styles.body}>{certaintyLabel}</Text>
        <View style={styles.manualCard} testID="result-manual-name-card">
          <Text style={styles.manualTitle}>Er navnet forkert?</Text>
          <Text style={styles.manualText}>Skriv selv dyrets navn her. Når du gemmer, går vi direkte ind på "Se dyret".</Text>
          <TextInput
            onChangeText={setManualName}
            placeholder="Skriv dyrets navn"
            placeholderTextColor="#789080"
            style={styles.input}
            testID="result-manual-name-input"
            value={manualName}
          />
          <Text style={styles.helper} testID="result-manual-name-helper">
            {trimmedManualName ? `Vi gemmer: ${trimmedManualName}` : "Ellers gemmer vi vores bedste bud."}
          </Text>
        </View>
        {currentAnalysis.shouldAskForNewPhoto ? <Text style={styles.warning}>{currentAnalysis.retryHint}</Text> : null}
      </GlassCard>
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
    fontSize: 19,
    lineHeight: 26,
    color: theme.dark,
    fontWeight: "800",
  },
  manualCard: {
    gap: 10,
    backgroundColor: "#eef4ea",
    borderRadius: 22,
    padding: 14,
    borderWidth: 1,
    borderColor: "#bfd2be",
  },
  manualTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: theme.dark,
  },
  manualText: {
    fontSize: 15,
    lineHeight: 22,
    color: theme.dark,
    fontWeight: "700",
  },
  input: {
    minHeight: 54,
    borderRadius: 18,
    backgroundColor: "#fffdf6",
    borderWidth: 2,
    borderColor: theme.dark,
    paddingHorizontal: 16,
    fontSize: 16,
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
  bottomActions: {
    gap: 10,
  },
});