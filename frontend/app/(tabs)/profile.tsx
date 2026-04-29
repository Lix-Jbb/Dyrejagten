import React, { useMemo } from "react";
import { Alert, Pressable, StyleSheet, Switch, Text, View } from "react-native";

import { GlassCard, SectionHeading, StatCard } from "../../components/Cards";
import { Screen, theme } from "../../components/Screen";
import { useApp } from "../../context/AppContext";

export default function ProfileTabScreen() {
  const { dashboard, findings, profile, resetAllData, updateUserProfile } = useApp();

  const activeDays = useMemo(
    () => new Set(findings.map((finding) => finding.capturedAt.slice(0, 10))).size,
    [findings]
  );

  const confirmDeleteAllData = () => {
    Alert.alert(
      "Slet alle data?",
      "Er du sikker på, at du vil slette al data og starte forfra?",
      [
        { text: "Nej", style: "cancel" },
        { text: "Ja", style: "destructive", onPress: () => resetAllData() },
      ]
    );
  };

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
        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>Privatliv</Text>
          <Text style={styles.infoText}>Dine fund bliver i din egen dyrebog.</Text>
        </View>
        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>Om Dyrejagten</Text>
          <Text style={styles.infoText}>En enkel app til at finde dyr i Danmark.</Text>
        </View>
      </GlassCard>

      <Pressable onPress={confirmDeleteAllData} style={styles.deleteLink}>
        <Text style={styles.deleteText}>Slet alle data</Text>
      </Pressable>
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
    borderRadius: 20,
    borderWidth: 2,
    borderColor: theme.dark,
    backgroundColor: "#fffdf6",
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 6,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: theme.dark,
  },
  infoText: {
    fontSize: 15,
    lineHeight: 21,
    color: theme.dark,
  },
  deleteLink: {
    alignSelf: "center",
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  deleteText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#8b3a2b",
    textDecorationLine: "underline",
  },
});