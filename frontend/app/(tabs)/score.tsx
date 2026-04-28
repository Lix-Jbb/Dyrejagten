import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { BadgeCard, GlassCard, ProgressBar, SectionHeading, StatCard } from "../../components/Cards";
import { NatureButton, Screen, theme } from "../../components/Screen";
import { useApp } from "../../context/AppContext";

export default function ScoreScreen() {
  const router = useRouter();
  const { badges, dashboard } = useApp();

  return (
    <Screen title="Score" subtitle="Venlig motivation til at opdage mere natur — ikke hård konkurrence.">
      <View style={styles.statsRow}>
        <StatCard label="Point" value={String(dashboard?.totalPoints ?? 0)} />
        <StatCard label="Fund" value={String(dashboard?.totalFindings ?? 0)} accent="#f4eadf" />
        <StatCard label="Arter" value={String(dashboard?.uniqueSpecies ?? 0)} />
      </View>

      <GlassCard>
        <SectionHeading title="Kategori-progress" />
        {dashboard?.findingsByCategory.map((item) => (
          <ProgressBar
            key={item.category}
            helper={`${item.totalFindings}/${item.target}`}
            label={item.category}
            progress={item.progress}
          />
        ))}
      </GlassCard>

      <GlassCard>
        <SectionHeading title="Næste mål" />
        <Text style={styles.goalText}>{dashboard?.nextBadge?.title ?? "Fortsæt de gode fund"}</Text>
        <Text style={styles.helper}>{dashboard?.nextBadge?.description ?? "Dit næste badge viser sig her."}</Text>
        <View style={styles.row}>
          <NatureButton label="Se badges" onPress={() => router.push("/badges" as never)} variant="secondary" />
          <NatureButton label="Se kort" onPress={() => router.push("/map" as never)} />
        </View>
      </GlassCard>

      <GlassCard>
        <SectionHeading title="Seneste badges" />
        {badges.slice(0, 4).map((badge) => (
          <BadgeCard badge={badge} key={badge.id} />
        ))}
      </GlassCard>
    </Screen>
  );
}

const styles = StyleSheet.create({
  statsRow: {
    flexDirection: "row",
    gap: 10,
  },
  goalText: {
    fontSize: 22,
    fontWeight: "800",
    color: theme.dark,
  },
  helper: {
    fontSize: 14,
    lineHeight: 21,
    color: theme.textMuted,
  },
  row: {
    flexDirection: "row",
    gap: 12,
  },
});