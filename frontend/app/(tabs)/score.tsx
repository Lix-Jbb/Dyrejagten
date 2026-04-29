import { useRouter } from "expo-router";
import React, { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";

import { BadgeCard, GlassCard, ProgressBar, SectionHeading, StatCard } from "../../components/Cards";
import { Screen, theme } from "../../components/Screen";
import { useApp } from "../../context/AppContext";
import { normalizeCategory } from "../../lib/categoryUtils";

const CATEGORY_TARGETS: Record<string, number> = {
  Insekter: 12,
  Fugle: 10,
  Pattedyr: 8,
  "Krybdyr og padder": 6,
  Fisk: 6,
  "Edderkopper og smådyr": 8,
  "Hav- og stranddyr": 8,
  Andre: 6,
};

function daysBetween(reference: Date, value: string) {
  const current = new Date(reference.getFullYear(), reference.getMonth(), reference.getDate()).getTime();
  const targetDate = new Date(value).getTime();
  return Math.floor((current - targetDate) / (1000 * 60 * 60 * 24));
}

export default function ScoreScreen() {
  const router = useRouter();
  const { badges, dashboard, findings } = useApp();

  const periodStats = useMemo(() => {
    const now = new Date();
    const counts = {
      iDag: 0,
      iGår: 0,
      iForgårs: 0,
      seneste7: 0,
      seneste30: 0,
      seneste365: 0,
    };

    findings.forEach((finding) => {
      const diff = daysBetween(now, finding.capturedAt);
      if (diff === 0) counts.iDag += 1;
      if (diff === 1) counts.iGår += 1;
      if (diff === 2) counts.iForgårs += 1;
      if (diff <= 6) counts.seneste7 += 1;
      if (diff <= 29) counts.seneste30 += 1;
      if (diff <= 364) counts.seneste365 += 1;
    });

    return counts;
  }, [findings]);

  const categoryProgress = useMemo(() => {
    return Object.entries(CATEGORY_TARGETS).map(([category, target]) => {
      const total = findings.filter((finding) => normalizeCategory(finding.category) === category).length;
      return {
        category,
        total,
        target,
        progress: target ? total / target : 0,
      };
    });
  }, [findings]);

  return (
    <Screen title="BADGES" subtitle="Her kan du se dine badges og din fremgang.">
      <View style={styles.statsRow}>
        <StatCard label="Point" value={String(dashboard?.totalPoints ?? 0)} />
        <StatCard label="Fund" value={String(dashboard?.totalFindings ?? 0)} accent="#f4eadf" />
        <StatCard label="Arter" value={String(dashboard?.uniqueSpecies ?? 0)} />
      </View>

      <GlassCard>
        <SectionHeading title="Fund i perioder" />
        <Text style={styles.helper}>I dag: {periodStats.iDag}</Text>
        <Text style={styles.helper}>I går: {periodStats.iGår}</Text>
        <Text style={styles.helper}>I forgårs: {periodStats.iForgårs}</Text>
        <Text style={styles.helper}>Seneste 7 dage: {periodStats.seneste7}</Text>
        <Text style={styles.helper}>Seneste 30 dage: {periodStats.seneste30}</Text>
        <Text style={styles.helper}>Seneste 365 dage: {periodStats.seneste365}</Text>
      </GlassCard>

      <GlassCard>
        <SectionHeading title="Kategori-fremgang" />
        {categoryProgress.map((item) => (
          <ProgressBar
            key={item.category}
            helper={`${item.total}/${item.target}`}
            label={item.category}
            progress={item.progress}
            onPress={() => router.push({ pathname: "/(tabs)/collection", params: { category: item.category } } as never)}
          />
        ))}
      </GlassCard>

      <GlassCard>
        <SectionHeading title="Seneste badges" />
        {badges.slice(0, 8).map((badge) => (
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
  helper: {
    fontSize: 16,
    lineHeight: 22,
    color: theme.dark,
    fontWeight: "700",
  },
});