import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { FindingCard, GlassCard, ProgressBar, SectionHeading, StatCard } from "../../components/Cards";
import { NatureButton, Screen, theme } from "../../components/Screen";
import { useApp } from "../../context/AppContext";
import { slugifyLatinName } from "../../lib/api";

export default function HomeScreen() {
  const router = useRouter();
  const { dashboard, categories, profile, refreshData } = useApp();

  useFocusEffect(
    useCallback(() => {
      refreshData().catch(() => null);
    }, [refreshData])
  );

  return (
    <Screen
      title="HVAD HAR DU FUNDET?"
      subtitle={`Hej ${profile?.displayName ?? "Naturven"}! Klar til at finde et nyt dyr?`}
      rightAction={
        <Pressable onPress={() => router.push("/profile" as never)} style={styles.profileButton}>
          <Ionicons color={theme.dark} name="person-outline" size={22} />
        </Pressable>
      }
    >
      <GlassCard delay={100}>
        <Text style={styles.heroKicker}>NYT FUND</Text>
        <Text style={styles.heroTitle}>{"Tag et billede og se, hvad AI'en tror, du har fundet."}</Text>
        <NatureButton
          label="Tag billede"
          icon={<Ionicons color="#f7fbf5" name="camera-outline" size={20} />}
          onPress={() => router.push("/(tabs)/camera" as never)}
        />
      </GlassCard>

      <View style={styles.statsRow}>
        <StatCard label="Fund i alt" value={String(dashboard?.totalFindings ?? 0)} />
        <StatCard label="Unikke arter" value={String(dashboard?.uniqueSpecies ?? 0)} accent="#f4eadf" />
      </View>

      <GlassCard>
        <SectionHeading title="Næste badge" />
        {dashboard?.nextBadge ? (
          <>
            <Text style={styles.badgeTitle}>{dashboard.nextBadge.title}</Text>
            <Text style={styles.helper}>Du er tæt på! {dashboard.nextBadge.description}</Text>
            <ProgressBar
              helper={`${dashboard.nextBadge.progress}/${dashboard.nextBadge.target}`}
              label="Du er godt på vej"
              progress={dashboard.nextBadge.progress / dashboard.nextBadge.target}
            />
          </>
        ) : (
          <Text style={styles.helper}>Du har allerede låst de nuværende badges op. Flot gået!</Text>
        )}
      </GlassCard>

      <GlassCard>
        <SectionHeading title="Hurtige kategorier" />
        <View style={styles.categoryGrid}>
          {categories.slice(0, 6).map((category) => (
            <View key={category.name} style={styles.categoryItem}>
              <Ionicons color={theme.primary} name={category.icon as keyof typeof Ionicons.glyphMap} size={18} />
              <Text style={styles.categoryLabel}>{category.name}</Text>
            </View>
          ))}
        </View>
      </GlassCard>

      <View style={styles.sectionSpacing}>
        <SectionHeading title="Seneste fund" action={<Text style={styles.helper}>{dashboard?.mostPhotographedCategory ?? ""}</Text>} />
      </View>
      {dashboard?.recentFindings?.length ? (
        <FindingCard
          finding={dashboard.recentFindings[0]}
          onPress={() =>
            router.push(`/species/${slugifyLatinName(dashboard.recentFindings[0].latinName)}` as never)
          }
        />
      ) : (
        <GlassCard>
          <Text style={styles.helper}>Du har endnu ingen dyr i din dyrebog. Start med et billede fra haven, skoven eller stranden.</Text>
        </GlassCard>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  profileButton: {
    width: 44,
    height: 44,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.border,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fbfdf8",
  },
  heroKicker: {
    fontSize: 14,
    fontWeight: "900",
    color: "#ff8c42",
  },
  heroTitle: {
    fontSize: 30,
    lineHeight: 36,
    fontWeight: "900",
    color: theme.dark,
  },
  statsRow: {
    flexDirection: "row",
    gap: 12,
  },
  badgeTitle: {
    fontSize: 24,
    fontWeight: "900",
    color: theme.dark,
  },
  helper: {
    fontSize: 15,
    lineHeight: 22,
    color: theme.dark,
    fontWeight: "700",
  },
  categoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  categoryItem: {
    width: "48%",
    backgroundColor: "#fff1f0",
    borderRadius: 18,
    padding: 14,
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
    borderWidth: 2,
    borderColor: theme.dark,
  },
  categoryLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: "700",
    color: theme.dark,
  },
  sectionSpacing: {
    marginTop: 2,
  },
});