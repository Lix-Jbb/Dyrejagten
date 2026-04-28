import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";

import { FilterPill, FindingCard, SectionHeading } from "../../components/Cards";
import { NatureButton, Screen, theme } from "../../components/Screen";
import { useApp } from "../../context/AppContext";
import { slugifyLatinName } from "../../lib/api";

const SORT_OPTIONS = ["Nyeste", "Ældste", "Kategori", "Art"];

export default function CollectionScreen() {
  const router = useRouter();
  const { findings, categories, removeFinding } = useApp();
  const [selectedCategory, setSelectedCategory] = useState("Alle");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("Nyeste");

  const filtered = useMemo(() => {
    let next = [...findings];
    if (selectedCategory !== "Alle") {
      next = next.filter((item) => item.category === selectedCategory);
    }
    if (search.trim()) {
      const term = search.trim().toLowerCase();
      next = next.filter(
        (item) =>
          item.danishName.toLowerCase().includes(term) || item.latinName.toLowerCase().includes(term)
      );
    }

    if (sort === "Ældste") {
      next.sort((a, b) => a.capturedAt.localeCompare(b.capturedAt));
    } else if (sort === "Kategori") {
      next.sort((a, b) => `${a.category}${a.danishName}`.localeCompare(`${b.category}${b.danishName}`));
    } else if (sort === "Art") {
      next.sort((a, b) => a.danishName.localeCompare(b.danishName));
    } else {
      next.sort((a, b) => b.capturedAt.localeCompare(a.capturedAt));
    }
    return next;
  }, [findings, search, selectedCategory, sort]);

  const confirmDelete = (id: string) => {
    Alert.alert("Slet fund", "Vil du slette dette fund fra din samling?", [
      { text: "Annuller", style: "cancel" },
      { text: "Slet", style: "destructive", onPress: () => removeFinding(id) },
    ]);
  };

  return (
    <Screen title="Min samling" subtitle="Filtrér, søg og find tilbage til dine dyreoplevelser.">
      <TextInput
        onChangeText={setSearch}
        placeholder="Søg efter art"
        placeholderTextColor="#789080"
        style={styles.search}
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

      <SectionHeading title="Sortering" />
      <View style={styles.pillRow}>
        {SORT_OPTIONS.map((option) => (
          <FilterPill key={option} active={sort === option} label={option} onPress={() => setSort(option)} />
        ))}
      </View>

      {filtered.length ? (
        filtered.map((finding) => (
          <View key={finding.id} style={styles.findingWrap}>
            <FindingCard
              finding={finding}
              onPress={() => router.push(`/species/${slugifyLatinName(finding.latinName)}` as never)}
            />
            <NatureButton label="Slet fund" onPress={() => confirmDelete(finding.id)} variant="ghost" />
          </View>
        ))
      ) : (
        <Text style={styles.helper}>Ingen fund matcher dit filter endnu.</Text>
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
  findingWrap: {
    gap: 10,
  },
  helper: {
    fontSize: 15,
    lineHeight: 22,
    color: theme.textMuted,
  },
});