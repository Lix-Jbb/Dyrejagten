import React, { useMemo, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";

import { BadgeCard, FilterPill } from "../components/Cards";
import { Screen } from "../components/Screen";
import { useApp } from "../context/AppContext";

export default function BadgesScreen() {
  const { badges } = useApp();
  const [filter, setFilter] = useState<"alle" | "optjente" | "låste">("alle");

  const visibleBadges = useMemo(() => {
    if (filter === "optjente") {
      return badges.filter((badge) => badge.unlocked);
    }
    if (filter === "låste") {
      return badges.filter((badge) => !badge.unlocked);
    }
    return badges;
  }, [badges, filter]);

  return (
    <Screen title="Badges" subtitle="Se hvad du allerede har opnået, og hvad du er tæt på nu.">
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.filters}>
          <FilterPill active={filter === "alle"} label="Alle badges" onPress={() => setFilter("alle")} />
          <FilterPill active={filter === "optjente"} label="Optjente" onPress={() => setFilter("optjente")} />
          <FilterPill active={filter === "låste"} label="Låste" onPress={() => setFilter("låste")} />
        </View>
      </ScrollView>
      {visibleBadges.map((badge) => (
        <BadgeCard badge={badge} key={badge.id} />
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  filters: {
    flexDirection: "row",
    gap: 10,
  },
});