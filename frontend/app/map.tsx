import React, { useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";

import { FilterPill, GlassCard, SectionHeading } from "../components/Cards";
import { NatureButton } from "../components/Screen";
import { ScatterMap } from "../components/ScatterMap";
import { Screen, theme } from "../components/Screen";
import { useApp } from "../context/AppContext";

export default function MapScreen() {
  const router = useRouter();
  const { categories, findings, loadMapMarkers, markers } = useApp();
  const [selectedCategory, setSelectedCategory] = useState("Alle");

  const latestMarkers = useMemo(() => markers.slice(0, 6), [markers]);

  return (
    <Screen
      title="Kort"
      subtitle="Et roligt overblik over dine fund i Danmark. Sjældne arter vises kun omtrentligt."
      bottomAction={
        <View style={styles.footerWrap}>
          <NatureButton label="Tilbage" onPress={() => router.back()} size="compact" testID="map-back-button" variant="ghost" />
        </View>
      }
    >
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.filters}>
          <FilterPill active={selectedCategory === "Alle"} label="Alle" onPress={() => { setSelectedCategory("Alle"); loadMapMarkers("Alle").catch(() => null); }} />
          {categories.map((category) => (
            <FilterPill
              key={category.name}
              active={selectedCategory === category.name}
              label={category.name}
              onPress={() => {
                setSelectedCategory(category.name);
                loadMapMarkers(category.name).catch(() => null);
              }}
            />
          ))}
        </View>
      </ScrollView>

      <GlassCard>
        <ScatterMap markers={markers} testID="all-findings-map" />
      </GlassCard>

      <GlassCard>
        <SectionHeading title="Seneste fundpunkter" action={<Text style={styles.helper}>{findings.length} fund i alt</Text>} />
        {latestMarkers.length ? (
          latestMarkers.map((marker) => (
            <View key={marker.id} style={styles.row}>
              <View>
                <Text style={styles.name}>{marker.danishName}</Text>
                <Text style={styles.helper}>{marker.municipality}</Text>
              </View>
              <Text style={styles.helper}>{marker.isApproximate ? "Omtrentligt" : marker.category}</Text>
            </View>
          ))
        ) : (
          <Text style={styles.helper}>Tillad lokation og gem et fund for at se markører her.</Text>
        )}
      </GlassCard>
    </Screen>
  );
}

const styles = StyleSheet.create({
  footerWrap: {
    alignItems: "center",
  },
  filters: {
    flexDirection: "row",
    gap: 10,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  name: {
    fontSize: 16,
    fontWeight: "800",
    color: theme.dark,
  },
  helper: {
    fontSize: 14,
    color: theme.textMuted,
  },
});