import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { FilterPill, GlassCard, SectionHeading } from "../components/Cards";
import { NatureButton, Screen, theme } from "../components/Screen";
import { useApp } from "../context/AppContext";
import { slugifyLatinName } from "../lib/api";

export default function ResultScreen() {
  const router = useRouter();
  const { currentAnalysis, currentCapture, loadSpecies } = useApp();

  if (!currentAnalysis || !currentCapture) {
    router.replace("/(tabs)/camera" as never);
    return null;
  }

  const suggestion = currentAnalysis.primarySuggestion;

  return (
    <Screen title="Resultat" subtitle="Flot fund! Her er det mest sandsynlige bud ud fra dit billede.">
      <GlassCard>
        <Image contentFit="cover" source={{ uri: currentCapture.uri }} style={styles.image} />
        <View style={styles.badgeRow}>
          <View style={styles.topBadge}>
            <Ionicons color={theme.primary} name="leaf-outline" size={18} />
            <Text style={styles.topBadgeText}>{suggestion.category}</Text>
          </View>
          <Text style={styles.confidence}>{Math.round(suggestion.confidenceScore * 100)}% sikkerhed</Text>
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
        <SectionHeading title="Alternative forslag" />
        {currentAnalysis.alternativeSuggestions.length ? (
          currentAnalysis.alternativeSuggestions.map((item) => (
            <View key={`${item.latinName}-${item.danishName}`} style={styles.alternativeRow}>
              <Text style={styles.altName}>{item.danishName}</Text>
              <Text style={styles.helper}>{Math.round(item.confidenceScore * 100)}%</Text>
            </View>
          ))
        ) : (
          <Text style={styles.helper}>Ingen stærke alternative bud denne gang.</Text>
        )}
      </GlassCard>

      <NatureButton label="Gem fund" onPress={() => router.push("/save-finding" as never)} />
      <NatureButton label="Vælg andet forslag" onPress={() => router.push("/save-finding" as never)} variant="secondary" />
      <NatureButton
        label="Se mere om dyret"
        onPress={async () => {
          await loadSpecies(slugifyLatinName(suggestion.latinName));
          router.push(`/species/${slugifyLatinName(suggestion.latinName)}` as never);
        }}
        variant="ghost"
      />
      <NatureButton label="Prøv igen" onPress={() => router.replace("/(tabs)/camera" as never)} variant="ghost" />
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
    fontSize: 14,
    fontWeight: "700",
    color: theme.primary,
  },
  title: {
    fontSize: 30,
    fontWeight: "800",
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
    fontSize: 14,
    lineHeight: 21,
    color: theme.textMuted,
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