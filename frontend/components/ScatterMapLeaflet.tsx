import "leaflet/dist/leaflet.css";

import React, { useEffect, useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { CircleMarker, MapContainer, Popup, TileLayer, useMap } from "react-leaflet";

import { MapMarker } from "../lib/types";
import { theme } from "./Screen";

const DENMARK_CENTER = {
  latitude: 56.2,
  longitude: 10.0,
};

const webMapStyle = {
  width: "100%",
  height: "100%",
};

type Bounds = [[number, number], [number, number]] | null;

const WebMapContainer = MapContainer as unknown as React.ComponentType<any>;
const WebTileLayer = TileLayer as unknown as React.ComponentType<any>;
const WebCircleMarker = CircleMarker as unknown as React.ComponentType<any>;
const WebPopup = Popup as unknown as React.ComponentType<any>;

function buildBounds(markers: MapMarker[]): Bounds {
  if (!markers.length) {
    return null;
  }

  const latitudes = markers.map((marker) => marker.latitude);
  const longitudes = markers.map((marker) => marker.longitude);

  return [
    [Math.min(...latitudes), Math.min(...longitudes)],
    [Math.max(...latitudes), Math.max(...longitudes)],
  ];
}

function FitBounds({ bounds }: { bounds: Bounds }) {
  const map = useMap();

  useEffect(() => {
    if (!bounds) {
      map.setView([DENMARK_CENTER.latitude, DENMARK_CENTER.longitude], 7);
      return;
    }

    map.fitBounds(bounds, { padding: [28, 28] });
  }, [bounds, map]);

  return null;
}

export function ScatterMapLeaflet({
  markers,
  testID,
  onMarkerPress,
}: {
  markers: MapMarker[];
  testID?: string;
  onMarkerPress?: (marker: MapMarker) => void;
}) {
  const bounds = useMemo(() => buildBounds(markers), [markers]);

  return (
    <View style={styles.wrap} testID={testID}>
      <View style={styles.mapFrame}>
        <WebMapContainer center={[DENMARK_CENTER.latitude, DENMARK_CENTER.longitude]} style={webMapStyle} zoom={7} zoomControl>
          <WebTileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <FitBounds bounds={bounds} />
          {markers.map((marker) => (
            <WebCircleMarker
              center={[marker.latitude, marker.longitude]}
              eventHandlers={{ click: () => onMarkerPress?.(marker) }}
              key={marker.id}
              pathOptions={{
                color: "#fffdf6",
                fillColor: marker.isApproximate ? "#d7a86e" : theme.primary,
                fillOpacity: 0.95,
                weight: 2,
              }}
              radius={marker.isApproximate ? 11 : 9}
            >
              <WebPopup>
                <View style={styles.callout}>
                  <Text style={styles.calloutTitle}>{marker.danishName}</Text>
                  <Text style={styles.calloutText}>{marker.municipality}</Text>
                  <Text style={styles.calloutHint}>Tryk på prikken for at åbne dyreprofilen</Text>
                </View>
              </WebPopup>
            </WebCircleMarker>
          ))}
        </WebMapContainer>
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
    gap: 3,
    minWidth: 140,
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
    fontWeight: "700",
    color: theme.textMuted,
  },
  helper: {
    fontSize: 13,
    lineHeight: 18,
    color: theme.textMuted,
  },
});