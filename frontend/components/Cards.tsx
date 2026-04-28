import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Image, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

import { BadgeProgress, Finding } from "../lib/types";
import { theme } from "./Screen";

export function GlassCard({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <Animated.View entering={FadeInDown.delay(delay).duration(400)} style={styles.card}>
      {children}
    </Animated.View>
  );
}

export function StatCard({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <View style={[styles.statCard, accent ? { backgroundColor: accent } : null]}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

export function SectionHeading({ title, action }: { title: string; action?: React.ReactNode }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {action}
    </View>
  );
}

export function ProgressBar({ label, progress, helper }: { label: string; progress: number; helper: string }) {
  return (
    <View style={styles.progressBlock}>
      <View style={styles.rowBetween}>
        <Text style={styles.progressLabel}>{label}</Text>
        <Text style={styles.helper}>{helper}</Text>
      </View>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${Math.max(progress * 100, 6)}%` }]} />
      </View>
    </View>
  );
}

export function FindingCard({ finding, onPress }: { finding: Finding; onPress?: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      testID={`finding-${finding.id}`}
      style={({ pressed }) => [styles.findingCard, pressed && styles.pressed]}
    >
      <Image source={{ uri: finding.imageUrl }} style={styles.findingImage} />
      <View style={styles.findingBody}>
        <View style={styles.rowBetween}>
          <Text style={styles.findingName}>{finding.danishName}</Text>
          <Text style={styles.confidence}>{Math.round(finding.confidenceScore * 100)}%</Text>
        </View>
        <Text style={styles.findingMeta}>{finding.latinName}</Text>
        <Text style={styles.findingMeta}>
          {finding.category} · {finding.dateLabel}
        </Text>
        <Text numberOfLines={2} style={styles.findingDescription}>
          {finding.description}
        </Text>
      </View>
    </Pressable>
  );
}

export function BadgeCard({ badge }: { badge: BadgeProgress }) {
  return (
    <View style={[styles.badgeCard, !badge.unlocked && styles.badgeLocked]}>
      <View style={styles.badgeIconWrap}>
        <Ionicons name={badge.unlocked ? "ribbon" : "lock-closed"} size={20} color="#f7f9f4" />
      </View>
      <View style={{ flex: 1, gap: 6 }}>
        <Text style={styles.findingName}>{badge.title}</Text>
        <Text style={styles.helper}>{badge.description}</Text>
        <View style={styles.track}>
          <View style={[styles.fill, { width: `${Math.max((badge.progress / badge.target) * 100, 8)}%` }]} />
        </View>
        <Text style={styles.helper}>
          {badge.progress}/{badge.target} · {badge.points} bonuspoint
        </Text>
      </View>
    </View>
  );
}

export function FilterPill({
  label,
  active,
  onPress,
  testID,
}: {
  label: string;
  active?: boolean;
  onPress: () => void;
  testID?: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      testID={testID ?? `pill-${label.toLowerCase().replace(/[^a-z0-9æøå]+/g, "-")}`}
      style={[styles.pill, active && styles.pillActive]}
    >
      <Text style={[styles.pillText, active && styles.pillTextActive]}>{label}</Text>
    </Pressable>
  );
}

export function NoteInput(props: React.ComponentProps<typeof TextInput>) {
  return (
    <TextInput
      multiline
      placeholderTextColor="#789080"
      style={styles.input}
      testID={props.testID ?? "input-note"}
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.card,
    borderRadius: 26,
    padding: 18,
    borderWidth: 1,
    borderColor: theme.border,
    gap: 14,
    shadowColor: "#14331f",
    shadowOpacity: 0.07,
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 22,
    elevation: 4,
  },
  statCard: {
    flex: 1,
    minHeight: 104,
    backgroundColor: "#eef5ea",
    borderRadius: 22,
    padding: 16,
    justifyContent: "space-between",
  },
  statValue: {
    fontSize: 28,
    fontWeight: "800",
    color: theme.dark,
  },
  statLabel: {
    color: theme.textMuted,
    fontSize: 13,
    lineHeight: 18,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: theme.dark,
  },
  progressBlock: {
    gap: 10,
  },
  rowBetween: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  progressLabel: {
    fontSize: 15,
    fontWeight: "700",
    color: theme.dark,
    flex: 1,
  },
  helper: {
    fontSize: 13,
    color: theme.textMuted,
  },
  track: {
    height: 10,
    borderRadius: 999,
    backgroundColor: "#e5efe3",
    overflow: "hidden",
  },
  fill: {
    height: 10,
    borderRadius: 999,
    backgroundColor: theme.primary,
  },
  findingCard: {
    flexDirection: "row",
    gap: 14,
    padding: 14,
    borderRadius: 22,
    backgroundColor: theme.card,
    borderWidth: 1,
    borderColor: theme.border,
  },
  findingImage: {
    width: 96,
    height: 96,
    borderRadius: 18,
    backgroundColor: "#dbe5d8",
  },
  findingBody: {
    flex: 1,
    gap: 6,
  },
  findingName: {
    fontSize: 18,
    fontWeight: "800",
    color: theme.dark,
  },
  findingMeta: {
    fontSize: 13,
    color: theme.textMuted,
  },
  confidence: {
    fontSize: 14,
    fontWeight: "700",
    color: theme.primary,
  },
  findingDescription: {
    fontSize: 14,
    lineHeight: 20,
    color: theme.dark,
  },
  badgeCard: {
    flexDirection: "row",
    gap: 14,
    alignItems: "flex-start",
    backgroundColor: "#eef4ea",
    padding: 16,
    borderRadius: 22,
  },
  badgeLocked: {
    opacity: 0.72,
  },
  badgeIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: theme.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: "#edf4eb",
    borderWidth: 1,
    borderColor: theme.border,
  },
  pillActive: {
    backgroundColor: theme.primary,
    borderColor: theme.primary,
  },
  pillText: {
    color: theme.dark,
    fontWeight: "700",
    fontSize: 13,
  },
  pillTextActive: {
    color: "#f9fcf7",
  },
  input: {
    minHeight: 128,
    borderRadius: 22,
    padding: 16,
    textAlignVertical: "top",
    fontSize: 16,
    color: theme.dark,
    backgroundColor: "#f8fbf6",
    borderWidth: 1,
    borderColor: theme.border,
  },
  pressed: {
    opacity: 0.92,
  },
});