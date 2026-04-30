import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { Image, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";

import { FilterPill, GlassCard, SectionHeading } from "../../components/Cards";
import { Screen, theme } from "../../components/Screen";
import { useApp } from "../../context/AppContext";
import { normalizeCategory } from "../../lib/categoryUtils";
import { slugifyLatinName } from "../../lib/api";

export default function CollectionScreen() {
  const router = useRouter();
  const { category: routeCategory } = useLocalSearchParams<{ category?: string }>();
  const { findings, categories } = useApp();
  const [selectedCategory, setSelectedCategory] = useState("Alle");
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (routeCategory) {
      setSelectedCategory(normalizeCategory(String(routeCategory)));
      return;
    }
    setSelectedCategory("Alle");
  }, [routeCategory]);

  const grouped = useMemo(() => {
    const groupedMap = new Map<string, (typeof findings)[number][]>();
    findings.forEach((finding) => {
      const key = finding.latinName;
      const list = groupedMap.get(key) ?? [];
      list.push(finding);
      groupedMap.set(key, list);
    });

    return Array.from(groupedMap.entries()).map(([, items]) => {
      const sorted = [...items].sort((a, b) => b.capturedAt.localeCompare(a.capturedAt));
      return {
        latest: { ...sorted[0], category: normalizeCategory(sorted[0].category) },
        count: sorted.length,
      };
    });
  }, [findings]);

  const filtered = useMemo(() => {
    let next = [...grouped];
    if (selectedCategory !== "Alle") {
      next = next.filter((item) => item.latest.category === selectedCategory);
    }
    if (search.trim()) {
      const term = search.trim().toLowerCase();
      next = next.filter(
        (item) =>
          item.latest.danishName.toLowerCase().includes(term) ||
          item.latest.latinName.toLowerCase().includes(term)
      );
    }
    next.sort((a, b) => b.latest.capturedAt.localeCompare(a.latest.capturedAt));
    return next;
  }, [grouped, search, selectedCategory]);

  return (
    <Screen title="Min dyrebog" subtitle="Her bor alle de dyr, du selv har fundet.">
      <TextInput
        onChangeText={setSearch}
        placeholder="Søg efter art"
        placeholderTextColor="#789080"
        style={styles.search}
        testID="collection-search-input"
        value={search}
      />
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.pillRow}>
          <FilterPill active={selectedCategory === "Alle"} label="Alle" onPress={() => setSelectedCategory("Alle")} />
          {categories.map((category) => (
            <FilterPill
              key={category.name}
              active={selectedCategory === category.name}
              label={category.name}
              onPress={() => setSelectedCategory(category.name)}
            />
          ))}
        </View>
      </ScrollView>
      <SectionHeading title="Mine dyr" />

      {filtered.length ? (
        filtered.map((entry) => (
          <GlassCard key={entry.latest.id}>
            <View style={styles.cardRow}>
              <Image source={{ uri: entry.latest.imageUrl }} style={styles.image} />
              <View style={styles.cardBody}>
                <Text style={styles.name}>{entry.latest.danishName}</Text>
                <Text style={styles.meta}>{entry.latest.category}</Text>
                <Text style={styles.meta}>Fundet {entry.count} gange</Text>
                <Text style={styles.meta}>Senest fundet {entry.latest.dateLabel}</Text>
                {entry.latest.municipality ? <Text style={styles.meta}>By: {entry.latest.municipality}</Text> : null}
                <FilterPill
                  active
                  label="Se dyret"
                  onPress={() => router.push(`/species/${slugifyLatinName(entry.latest.latinName)}` as never)}
                />
              </View>
            </View>
          </GlassCard>
        ))
      ) : (
          <Text style={styles.helper}>Der er ingen dyr her endnu. Tag et billede og fyld din dyrebog!</Text>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  search: {
    minHeight: 52,
    borderRadius: 18,
    backgroundColor: "#fbfdf8",
    borderWidth: 1,
    borderColor: theme.border,
    paddingHorizontal: 16,
    fontSize: 16,
    color: theme.dark,
  },
  pillRow: {
    flexDirection: "row",
    gap: 10,
  },
  cardRow: {
    flexDirection: "row",
    gap: 14,
    alignItems: "center",
  },
  image: {
    width: 104,
    height: 104,
    borderRadius: 24,
    backgroundColor: "#dbe5d8",
    borderWidth: 2,
    borderColor: theme.dark,
  },
  cardBody: {
    flex: 1,
    gap: 8,
  },
  name: {
    fontSize: 22,
    fontWeight: "900",
    color: theme.dark,
  },
  meta: {
    fontSize: 15,
    fontWeight: "700",
    color: theme.dark,
  },
  helper: {
    fontSize: 15,
    lineHeight: 22,
    color: theme.dark,
    fontWeight: "700",
  },
});