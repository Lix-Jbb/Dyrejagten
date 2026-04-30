import React, { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

import { MapMarker } from "../lib/types";
import { theme } from "./Screen";

type ScatterMapProps = {
  markers: MapMarker[];
  testID?: string;
  onMarkerPress?: (marker: MapMarker) => void;
};

export function ScatterMap({ markers, testID, onMarkerPress }: ScatterMapProps) {
  const [LoadedMap, setLoadedMap] = useState<React.ComponentType<ScatterMapProps> | null>(null);

  useEffect(() => {
    let active = true;

    const loadMap = async () => {
      if (typeof window === "undefined") {
        return;
      }

      const module = await import("./ScatterMapLeaflet");
      if (active) {
        setLoadedMap(() => module.ScatterMapLeaflet);
      }
    };

    loadMap().catch(() => null);

    return () => {
      active = false;
    };
  }, []);

  if (!LoadedMap) {
    return (
      <View style={styles.wrap} testID={testID}>
        <View style={styles.loadingCard}>
          <ActivityIndicator color={theme.primary} size="large" />
          <Text style={styles.loadingTitle}>Åbner kortet...</Text>
          <Text style={styles.helper}>Du kan om lidt zoome og trykke på en prik for at se dyret.</Text>
        </View>
      </View>
    );
  }

  return <LoadedMap markers={markers} onMarkerPress={onMarkerPress} testID={testID} />;
}

const styles = StyleSheet.create({
  wrap: {
    gap: 12,
  },
  loadingCard: {
    height: 420,
    borderRadius: 28,
    backgroundColor: "#f7fbf5",
    borderWidth: 1,
    borderColor: theme.border,
    gap: 10,
    padding: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: theme.dark,
  },
  helper: {
    fontSize: 13,
    lineHeight: 18,
    color: theme.textMuted,
    textAlign: "center",
  },
});