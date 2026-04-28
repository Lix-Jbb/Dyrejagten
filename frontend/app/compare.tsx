import { Image } from "expo-image";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

import { GlassCard, SectionHeading } from "../components/Cards";
import { NatureButton, Screen, theme } from "../components/Screen";
import { useApp } from "../context/AppContext";
import { fetchReferenceImage } from "../lib/api";

export default function CompareScreen() {
  const router = useRouter();
  const { currentAnalysis, currentCapture } = useApp();
  const [referenceImage, setReferenceImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentAnalysis) {
      setLoading(false);
      return;
    }

    fetchReferenceImage(currentAnalysis.primarySuggestion.latinName)
      .then((response) => setReferenceImage(response.imageData))
      .finally(() => setLoading(false));
  }, [currentAnalysis]);

  if (!currentAnalysis || !currentCapture) {
    return (
      <Screen title="Sammenlign" subtitle="Tag først et billede, så kan vi sammenligne det her.">
        <GlassCard>
          <NatureButton label="Gå til kamera" onPress={() => router.replace("/(tabs)/camera" as never)} />
        </GlassCard>
      </Screen>
    );
  }

  const suggestion = currentAnalysis.primarySuggestion;

  return (
    <Screen title="SAMMENLIGN" subtitle="Se dit billede ved siden af et referencebillede og kig efter de tydelige tegn.">
      <View style={styles.grid}>
        <GlassCard>
          <Text style={styles.cardTitle}>Dit billede</Text>
          <Image contentFit="cover" source={{ uri: currentCapture.uri }} style={styles.image} />
        </GlassCard>
        <GlassCard>
          <Text style={styles.cardTitle}>Reference</Text>
          {loading ? (
            <View style={styles.placeholder}>
              <ActivityIndicator color={theme.primary} />
              <Text style={styles.helper}>Henter reference...</Text>
            </View>
          ) : referenceImage ? (
            <Image contentFit="cover" source={{ uri: referenceImage }} style={styles.image} />
          ) : (
            <View style={styles.placeholderAlt}>
              <Text style={styles.bigName}>{suggestion.danishName}</Text>
              <Text style={styles.helper}>Vi fandt ikke et referencefoto lige nu, men du kan stadig kigge efter tegnene nedenfor.</Text>
            </View>
          )}
        </GlassCard>
      </View>

      <GlassCard>
        <SectionHeading title="Kig efter" />
        {suggestion.characteristics.slice(0, 5).map((item) => (
          <View key={item} style={styles.factRow}>
            <View style={styles.dot} />
            <Text style={styles.factText}>{item}</Text>
          </View>
        ))}
      </GlassCard>

      <NatureButton label="Tilbage til dyret" onPress={() => router.back()} variant="secondary" />
    </Screen>
  );
}

const styles = StyleSheet.create({
  grid: {
    gap: 14,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: theme.dark,
  },
  image: {
    width: "100%",
    height: 220,
    borderRadius: 24,
    backgroundColor: "#fff5d7",
  },
  placeholder: {
    minHeight: 220,
    borderRadius: 24,
    backgroundColor: "#fff5d7",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    padding: 20,
  },
  placeholderAlt: {
    minHeight: 220,
    borderRadius: 24,
    backgroundColor: "#5ec9c5",
    alignItems: "center",
    justifyContent: "center",
    gap: 14,
    padding: 20,
  },
  bigName: {
    fontSize: 28,
    fontWeight: "900",
    color: "#10253d",
    textAlign: "center",
  },
  helper: {
    fontSize: 14,
    lineHeight: 21,
    color: theme.dark,
    textAlign: "center",
  },
  factRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  dot: {
    width: 14,
    height: 14,
    borderRadius: 999,
    backgroundColor: "#f25f4c",
  },
  factText: {
    flex: 1,
    fontSize: 17,
    lineHeight: 24,
    color: theme.dark,
    fontWeight: "700",
  },
});