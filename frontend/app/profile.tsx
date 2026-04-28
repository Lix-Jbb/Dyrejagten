import React, { useMemo, useState } from "react";
import { Alert, StyleSheet, Switch, Text, TextInput, View } from "react-native";

import { GlassCard, SectionHeading } from "../components/Cards";
import { NatureButton, Screen, theme } from "../components/Screen";
import { useApp } from "../context/AppContext";

export default function ProfileScreen() {
  const { profile, resetAllData, updateUserProfile } = useApp();
  const [draftName, setDraftName] = useState<string | null>(null);
  const [draftLocationEnabled, setDraftLocationEnabled] = useState<boolean | null>(null);

  const name = useMemo(() => draftName ?? profile?.displayName ?? "", [draftName, profile?.displayName]);
  const locationEnabled = useMemo(
    () => draftLocationEnabled ?? profile?.allowLocation ?? false,
    [draftLocationEnabled, profile?.allowLocation]
  );

  const saveProfile = async () => {
    await updateUserProfile({ displayName: name.trim() || "Felix", allowLocation: locationEnabled });
    setDraftName(null);
    setDraftLocationEnabled(null);
    Alert.alert("Profil gemt", "Dine indstillinger er opdateret.");
  };

  const confirmReset = () => {
    Alert.alert("Slet mine data", "Dette sletter profil og alle gemte fund.", [
      { text: "Annuller", style: "cancel" },
      { text: "Slet alt", style: "destructive", onPress: () => resetAllData() },
    ]);
  };

  return (
    <Screen title="Profil og indstillinger" subtitle="Alt i appen er på dansk, og lokation er altid frivillig.">
      <GlassCard>
        <SectionHeading title="Navn" />
        <TextInput onChangeText={setDraftName} style={styles.input} value={name} />
      </GlassCard>

      <GlassCard>
        <SectionHeading title="Privatliv" />
        <View style={styles.toggleRow}>
          <View style={styles.toggleText}>
            <Text style={styles.label}>Lokation til/fra</Text>
            <Text style={styles.helper}>Vis fund på kort og gem område, hvis du ønsker det.</Text>
          </View>
          <Switch onValueChange={setDraftLocationEnabled} trackColor={{ true: theme.primary }} value={locationEnabled} />
        </View>
        <View style={styles.toggleText}>
          <Text style={styles.label}>AI-disclaimer</Text>
          <Text style={styles.helper}>AI-identifikation kan være usikker. Rør ikke dyr, der kan stikke, bide eller være giftige.</Text>
        </View>
        <View style={styles.toggleText}>
          <Text style={styles.label}>Sprog</Text>
          <Text style={styles.helper}>Dansk</Text>
        </View>
      </GlassCard>

      <NatureButton label="Gem indstillinger" onPress={saveProfile} />
      <NatureButton label="Slet mine data" onPress={confirmReset} variant="ghost" />
    </Screen>
  );
}

const styles = StyleSheet.create({
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
  toggleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  toggleText: {
    gap: 6,
  },
  label: {
    fontSize: 17,
    fontWeight: "800",
    color: theme.dark,
  },
  helper: {
    fontSize: 14,
    lineHeight: 21,
    color: theme.textMuted,
    maxWidth: 280,
  },
});