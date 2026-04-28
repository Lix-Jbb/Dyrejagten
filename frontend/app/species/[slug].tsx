import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

import { FindingCard, GlassCard, SectionHeading } from "../../components/Cards";
import { NatureButton, Screen, theme } from "../../components/Screen";
import { useApp } from "../../context/AppContext";

export default function SpeciesScreen() {
  const router = useRouter();
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { loadSpecies, speciesPreview } = useApp();

  useEffect(() => {
    if (slug) {
      loadSpecies(slug).catch(() => null);
    }
  }, [loadSpecies, slug]);

  if (!speciesPreview) {
    return (
      <Screen title="Artsdetalje" scroll={false}>
        <View style={styles.centered}>
          <ActivityIndicator color={theme.primary} size="large" />
          <Text style={styles.helper}>Henter stamdata om dyret...</Text>
        </View>
      </Screen>
    );
  }

  return (
    <Screen title={speciesPreview.danishName} subtitle="Dit dyrekort med hurtige fakta og gode tegn at kigge efter.">
      <GlassCard>
        <Text style={styles.sectionTitle}>{speciesPreview.description}</Text>
        <Text style={styles.helper}>Kategori: {speciesPreview.category} · {speciesPreview.subcategory}</Text>
        <NatureButton label="Sammenlign billeder" onPress={() => router.push("/compare" as never)} variant="secondary" />
      </GlassCard>

      <GlassCard>
        <SectionHeading title="3 hurtige fakta" />
        <Text style={styles.info}>• {speciesPreview.characteristics[0] || speciesPreview.appearance}</Text>
        <Text style={styles.info}>• Den bor tit i: {speciesPreview.habitat}</Text>
        <Text style={styles.info}>• Den spiser: {speciesPreview.diet}</Text>
      </GlassCard>

      <GlassCard>
        <SectionHeading title="Kig efter" />
        <Text style={styles.info}>{speciesPreview.characteristics.join(", ")}</Text>
        <Text style={styles.info}>Forveksles med: {speciesPreview.confusionSpecies.join(", ") || "Ingen angivet"}</Text>
        <Text style={styles.info}>Sjov fakta: {speciesPreview.funFact}</Text>
        <Text style={styles.warning}>{speciesPreview.cautionAdvice}</Text>
      </GlassCard>

      <GlassCard>
        <SectionHeading title="Dine fund af samme art" />
        {speciesPreview.findings.length ? (
          speciesPreview.findings.map((finding) => <FindingCard finding={finding} key={finding.id} />)
        ) : (
          <Text style={styles.helper}>Du ser forhåndsviden her. Gem fundet for at få arten ind i samlingen.</Text>
        )}
      </GlassCard>

      <NatureButton label="Tilbage" onPress={() => router.back()} variant="ghost" />
    </Screen>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  helper: {
    fontSize: 15,
    lineHeight: 22,
    color: theme.textMuted,
    textAlign: "center",
  },
  sectionTitle: {
    fontSize: 18,
    lineHeight: 26,
    color: theme.dark,
    fontWeight: "700",
  },
  info: {
    fontSize: 15,
    lineHeight: 22,
    color: theme.dark,
  },
  warning: {
    fontSize: 15,
    lineHeight: 22,
    color: "#8b5a1f",
    fontWeight: "700",
  },
});