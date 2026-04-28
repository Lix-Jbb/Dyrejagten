import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";

import { FilterPill, GlassCard, SectionHeading } from "../components/Cards";
import { NatureButton, Screen, theme } from "../components/Screen";
import { useApp } from "../context/AppContext";
import { AlternativeSuggestion } from "../lib/types";

export default function SaveFindingScreen() {
  const router = useRouter();
  const { busy, currentAnalysis, currentCapture, profile, saveCurrentFinding } = useApp();
  const [chosenSuggestion, setChosenSuggestion] = useState<AlternativeSuggestion | null>(null);

  const options = useMemo(
    () => [currentAnalysis?.primarySuggestion, ...(currentAnalysis?.alternativeSuggestions ?? [])].filter(Boolean),
    [currentAnalysis]
  );

  if (!currentAnalysis || !currentCapture) {
    return (
      <Screen title="Gem fund" subtitle="Der er ikke et aktivt fund klar til at blive gemt.">
        <GlassCard>
          <Text style={styles.helper}>Start i kameraet, få en analyse, og vend derefter tilbage for at gemme fundet.</Text>
          <NatureButton label="Til kamera" onPress={() => router.replace("/(tabs)/camera" as never)} testID="save-fallback-camera-button" />
        </GlassCard>
      </Screen>
    );
  }

  const selectedName = chosenSuggestion?.danishName ?? currentAnalysis.primarySuggestion.danishName;

  const save = async () => {
    try {
      await saveCurrentFinding({ note: "", chosenSuggestion });
      Alert.alert("Fund gemt", `Flot fund! ${selectedName} er nu i din samling.`);
      router.replace("/(tabs)/collection" as never);
    } catch (error) {
      Alert.alert("Kunne ikke gemme", error instanceof Error ? error.message : "Prøv igen.");
    }
  };

  return (
    <Screen title="GEM FUNDET" subtitle="Vil du gemme det her dyr i din dyrebog?">
      <GlassCard>
        <SectionHeading title="Valgt art" />
        <View style={styles.wrap}>
          {options.map((item) => {
            const isPrimary = item?.latinName === currentAnalysis.primarySuggestion.latinName;
            const isActive = (chosenSuggestion?.latinName ?? currentAnalysis.primarySuggestion.latinName) === item?.latinName;
            return item ? (
              <FilterPill
                active={isActive}
                key={item.latinName}
                label={isPrimary ? `${item.danishName} (AI-bud)` : item.danishName}
                onPress={() => setChosenSuggestion(isPrimary ? null : (item as AlternativeSuggestion))}
              />
            ) : null;
          })}
        </View>
      </GlassCard>

      <GlassCard>
        <SectionHeading title="Klar til dyrebogen" />
        <Text style={styles.helper}>Lokation gemmes kun, hvis den er slået til i profilen. Lige nu er den {profile?.allowLocation ? "til" : "fra"}.</Text>
        <Text style={styles.helper}>Fundet bliver gemt med billede, dato og dyrets navn.</Text>
      </GlassCard>

      <NatureButton label="Gem i min dyrebog" loading={busy} onPress={save} testID="save-finding-button" />
      <NatureButton label="Tilbage til resultat" onPress={() => router.back()} testID="back-to-result-button" variant="ghost" />
    </Screen>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  helper: {
    fontSize: 17,
    lineHeight: 24,
    color: theme.dark,
    fontWeight: "700",
  },
});