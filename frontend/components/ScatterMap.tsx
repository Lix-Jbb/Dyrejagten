import React from "react";
import { StyleSheet, Text, View } from "react-native";
import Svg, { Circle, Line, Rect } from "react-native-svg";

import { MapMarker } from "../lib/types";
import { theme } from "./Screen";

const BOUNDS = {
  minLat: 54.5,
  maxLat: 57.8,
  minLon: 8.0,
  maxLon: 12.9,
};

function project(latitude: number, longitude: number) {
  const width = 300;
  const height = 400;
  const x = ((longitude - BOUNDS.minLon) / (BOUNDS.maxLon - BOUNDS.minLon)) * width;
  const y = height - ((latitude - BOUNDS.minLat) / (BOUNDS.maxLat - BOUNDS.minLat)) * height;
  return { x: Math.max(18, Math.min(width - 18, x)), y: Math.max(20, Math.min(height - 20, y)) };
}

export function ScatterMap({ markers }: { markers: MapMarker[] }) {
  return (
    <View style={styles.wrap}>
      <View style={styles.mapFrame}>
        <Svg width="100%" height="100%" viewBox="0 0 300 400">
          <Rect x={14} y={14} width={272} height={372} rx={34} fill="#e2efe2" />
          <Line x1={150} y1={16} x2={150} y2={384} stroke="#c2d9c5" strokeDasharray="6 8" />
          <Line x1={20} y1={200} x2={280} y2={200} stroke="#c2d9c5" strokeDasharray="6 8" />
          {markers.map((marker) => {
            const { x, y } = project(marker.latitude, marker.longitude);
            return (
              <Circle
                key={marker.id}
                cx={x}
                cy={y}
                r={marker.isApproximate ? 8 : 6}
                fill={marker.isApproximate ? "#d7a86e" : "#4a7c59"}
                opacity={0.92}
              />
            );
          })}
        </Svg>
        <View pointerEvents="none" style={styles.overlayLabel}>
          <Text style={styles.labelTitle}>Danmark</Text>
          <Text style={styles.labelText}>Simple fund-markører med privatlivsbeskyttelse</Text>
        </View>
      </View>
      <Text style={styles.helper}>
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
  overlayLabel: {
    position: "absolute",
    top: 18,
    left: 18,
    right: 18,
    backgroundColor: "rgba(248,252,247,0.92)",
    borderRadius: 18,
    padding: 14,
    gap: 4,
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
  helper: {
    fontSize: 13,
    lineHeight: 18,
    color: theme.textMuted,
  },
});