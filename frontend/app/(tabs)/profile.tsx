import React, { useMemo } from "react";
import { StyleSheet, Switch, Text, TextInput, View } from "react-native";

import { GlassCard, SectionHeading, StatCard } from "../../components/Cards";
import { NatureButton, Screen, theme } from "../../components/Screen";
import { useApp } from "../../context/AppContext";

export default function ProfileTabScreen() {
  const { dashboard, findings, profile, resetAllData, updateUserProfile } = useApp();

  const activeDays = useMemo(
    () => new Set(findings.map((finding) => finding.capturedAt.slice(0, 10))).size,
    [findings]
  );

  return (
    <Screen title="Profil" subtitle="Din egen side i Dyrejagten.">
      <GlassCard>
        <SectionHeading title={profile?.displayName ?? "Naturven"} />
        <View style={styles.statsRow}>
          <StatCard label="Score" value={String(dashboard?.totalPoints ?? 0)} />
          <StatCard label="Fund" value={String(dashboard?.totalFindings ?? 0)} accent="#f5efe1" />
        </View>
        <View style={styles.statsRow}>
          <StatCard label="Arter" value={String(dashboard?.uniqueSpecies ?? 0)} />
          <StatCard label="Aktive dage" value={String(activeDays)} accent="#e4f1e5" />
        </View>
      </GlassCard>

      <GlassCard>
        <SectionHeading title="Indstillinger" />
        <View style={styles.settingRow}>
          <Text style={styles.label}>Lokation</Text>
          <Switch
            onValueChange={(value) => updateUserProfile({ allowLocation: value })}
            trackColor={{ true: theme.primary }}
            value={profile?.allowLocation ?? false}
          />
        </View>
        <TextInput editable={false} style={styles.infoBox} value="Privatliv: Dine fund bliver i din egen dyrebog." />
        <TextInput editable={false} style={styles.infoBox} value="Om Dyrejagten: En enkel app til at finde dyr i Danmark." />
      </GlassCard>

      <NatureButton label="Slet alle data" onPress={resetAllData} variant="ghost" />
    </Screen>
  );
}

const styles = StyleSheet.create({
  statsRow: {
    flexDirection: "row",
    gap: 12,
  },
  settingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  label: {
    fontSize: 18,
    fontWeight: "800",
    color: theme.dark,
  },
  infoBox: {
    minHeight: 52,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: theme.dark,
    backgroundColor: "#fffdf6",
    paddingHorizontal: 16,
    fontSize: 15,
    color: theme.dark,
  },
});