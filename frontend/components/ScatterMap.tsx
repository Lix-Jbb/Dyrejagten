import React, { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import MapView, { Callout, Marker, Region } from "react-native-maps";

import { MapMarker } from "../lib/types";
import { theme } from "./Screen";

const DENMARK_REGION: Region = {
  latitude: 56.2,
  longitude: 10.0,
  latitudeDelta: 2.7,
  longitudeDelta: 2.7,
};

function buildRegion(markers: MapMarker[]): Region {
  if (!markers.length) {
    return DENMARK_REGION;
  }

  const latitudes = markers.map((marker) => marker.latitude);
  const longitudes = markers.map((marker) => marker.longitude);
  const minLat = Math.min(...latitudes);
  const maxLat = Math.max(...latitudes);
  const minLon = Math.min(...longitudes);
  const maxLon = Math.max(...longitudes);

  return {
    latitude: (minLat + maxLat) / 2,
    longitude: (minLon + maxLon) / 2,
    latitudeDelta: Math.max((maxLat - minLat) * 1.9, 0.12),
    longitudeDelta: Math.max((maxLon - minLon) * 1.9, 0.12),
  };
}

export function ScatterMap({
  markers,
  testID,
  onMarkerPress,
}: {
  markers: MapMarker[];
  testID?: string;
  onMarkerPress?: (marker: MapMarker) => void;
}) {
  const initialRegion = useMemo(() => buildRegion(markers), [markers]);
  const mapKey = useMemo(() => markers.map((marker) => marker.id).sort().join("-") || "empty-map", [markers]);

  return (
    <View style={styles.wrap} testID={testID}>
      <View style={styles.mapFrame}>
        <MapView initialRegion={initialRegion} key={mapKey} style={styles.map} testID={testID ? `${testID}-interactive` : undefined}>
          {markers.map((marker) => {
            return (
              <Marker
                coordinate={{ latitude: marker.latitude, longitude: marker.longitude }}
                key={marker.id}
                onPress={() => onMarkerPress?.(marker)}
                pinColor={marker.isApproximate ? "#d7a86e" : theme.primary}
                testID={`${testID ?? "map"}-marker-${marker.id}`}
              >
                <Callout onPress={() => onMarkerPress?.(marker)}>
                  <View style={styles.callout}>
                    <Text style={styles.calloutTitle}>{marker.danishName}</Text>
                    <Text style={styles.calloutText}>{marker.municipality}</Text>
                    <Text style={styles.calloutHint}>Tryk for at åbne dyreprofilen</Text>
                  </View>
                </Callout>
              </Marker>
            );
          })}
        </MapView>
        <View style={styles.overlayLabel}>
          <Text style={styles.labelTitle}>Danmarkskort</Text>
          <Text style={styles.labelText}>Zoom og tryk på en prik for at se dyret</Text>
        </View>
      </View>
      <Text style={styles.helper} testID={`${testID ?? "scatter-map"}-helper`}>
        Sjældne fund vises kun omtrentligt for at beskytte dyret og stedet.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 12,
  },
  mapFrame: {
    height: 420,
    borderRadius: 28,
    overflow: "hidden",
    backgroundColor: "#f7fbf5",
    borderWidth: 1,
    borderColor: theme.border,
    justifyContent: "center",
    alignItems: "center",
  },
  map: {
    width: "100%",
    height: "100%",
  },
  overlayLabel: {
    position: "absolute",
    bottom: 18,
    left: 18,
    right: 18,
    backgroundColor: "rgba(248,252,247,0.92)",
    borderRadius: 18,
    padding: 14,
    gap: 4,
    pointerEvents: "none",
  },
  labelTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: theme.dark,
  },
  labelText: {
    fontSize: 13,
    lineHeight: 18,
    color: theme.textMuted,
  },
  callout: {
    minWidth: 150,
    maxWidth: 220,
    gap: 3,
    paddingVertical: 4,
  },
  calloutTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: theme.dark,
  },
  calloutText: {
    fontSize: 13,
    color: theme.dark,
  },
  calloutHint: {
    fontSize: 12,
    color: theme.textMuted,
    fontWeight: "700",
  },
  helper: {
    fontSize: 13,
    lineHeight: 18,
    color: theme.textMuted,
  },
});