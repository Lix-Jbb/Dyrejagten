import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import { Alert, StyleSheet, Text, TextInput, View } from "react-native";

import { FilterPill, GlassCard, NoteInput, SectionHeading } from "../components/Cards";
import { NatureButton, Screen, theme } from "../components/Screen";
import { useApp } from "../context/AppContext";
import { AlternativeSuggestion } from "../lib/types";

export default function SaveFindingScreen() {
  const router = useRouter();
  const { busy, currentAnalysis, currentCapture, profile, saveCurrentFinding } = useApp();
  const [note, setNote] = useState("");
  const [chosenSuggestion, setChosenSuggestion] = useState<AlternativeSuggestion | null>(null);
  const [customDanishName, setCustomDanishName] = useState(currentAnalysis?.primarySuggestion.danishName ?? "");
  const [customLatinName, setCustomLatinName] = useState(currentAnalysis?.primarySuggestion.latinName ?? "");

  const options = useMemo(
    () => [currentAnalysis?.primarySuggestion, ...(currentAnalysis?.alternativeSuggestions ?? [])].filter(Boolean),
    [currentAnalysis]
  );

  if (!currentAnalysis || !currentCapture) {
    router.replace("/(tabs)/camera" as never);
    return null;
  }

  const selectedName = chosenSuggestion?.danishName ?? currentAnalysis.primarySuggestion.danishName;

  const save = async () => {
    try {
      await saveCurrentFinding({ note, chosenSuggestion, customDanishName, customLatinName });
      Alert.alert("Fund gemt", `Flot fund! ${selectedName} er nu i din samling.`);
    } catch (error) {
      Alert.alert("Kunne ikke gemme", error instanceof Error ? error.message : "Prøv igen.");
    }
  };

  return (
    <Screen title="Gem fund" subtitle="Tilføj note, justér art om nødvendigt, og gem det i din samling.">
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
                onPress={() => {
                  setChosenSuggestion(isPrimary ? null : (item as AlternativeSuggestion));
                  setCustomDanishName(item.danishName);
                  setCustomLatinName(item.latinName);
                }}
              />
            ) : null;
          })}
        </View>
      </GlassCard>

      <GlassCard>
        <SectionHeading title="Ret art manuelt" />
        <TextInput onChangeText={setCustomDanishName} style={styles.input} value={customDanishName} />
        <TextInput onChangeText={setCustomLatinName} style={styles.input} value={customLatinName} />
        <Text style={styles.helper}>Lokation gemmes kun, hvis du har valgt det i profilen. Lige nu: {profile?.allowLocation ? "til" : "fra"}.</Text>
      </GlassCard>

      <GlassCard>
        <SectionHeading title="Din note" />
        <NoteInput onChangeText={setNote} placeholder="Skriv fx hvor du så dyret, eller hvad der gjorde fundet særligt." value={note} />
      </GlassCard>

      <NatureButton label="Gem fund" loading={busy} onPress={save} />
      <NatureButton label="Tilbage til resultat" onPress={() => router.back()} variant="ghost" />
    </Screen>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  input: {
    minHeight: 52,
    borderRadius: 18,
    backgroundColor: "#fbfdf8",
    borderWidth: 1,
    borderColor: theme.border,
    paddingHorizontal: 16,
    fontSize: 16,
    color: theme.dark,
  },
  helper: {
    fontSize: 14,
    lineHeight: 21,
    color: theme.textMuted,
  },
});