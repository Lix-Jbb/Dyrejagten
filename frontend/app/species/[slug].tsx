import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";

import { GlassCard, SectionHeading } from "../../components/Cards";
import { ScatterMap } from "../../components/ScatterMap";
import { NatureButton, Screen, theme } from "../../components/Screen";
import { useApp } from "../../context/AppContext";
import { deleteFinding, deleteSpeciesBySlug } from "../../lib/api";

export default function SpeciesScreen() {
  const router = useRouter();
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { loadSpecies, refreshData, speciesPreview, userId } = useApp();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (slug) {
      loadSpecies(slug).catch(() => null);
    }
  }, [loadSpecies, slug]);

  if (!speciesPreview) {
    return (
      <Screen title="Artsdetalje" scroll={false}>
        <View style={styles.centered}>
          <ActivityIndicator color={theme.primary} size="large" />
          <Text style={styles.helper}>Henter stamdata om dyret...</Text>
        </View>
      </Screen>
    );
  }

  const markers = speciesPreview.findings
    .filter((finding) => finding.latitude && finding.longitude)
    .map((finding) => ({
      id: finding.id,
      category: speciesPreview.category,
      danishName: speciesPreview.danishName,
      municipality: finding.municipality ?? "Ukendt område",
      latitude: finding.latitude ?? 0,
      longitude: finding.longitude ?? 0,
      isApproximate: false,
      rarityStatus: speciesPreview.rarityStatus,
    }));

  const activeFinding = speciesPreview.findings[currentIndex] ?? speciesPreview.findings[0];

  const onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const nextIndex = Math.round(event.nativeEvent.contentOffset.x / event.nativeEvent.layoutMeasurement.width);
    setCurrentIndex(nextIndex);
  };

  const deleteCurrentImage = async () => {
    if (!activeFinding) {
      return;
    }
    await deleteFinding(activeFinding.id);
    await refreshData();
    setMenuOpen(false);
    router.replace("/(tabs)/collection" as never);
  };

  const deleteWholeSpecies = async () => {
    await deleteSpeciesBySlug(userId, String(slug));
    await refreshData();
    setMenuOpen(false);
    router.replace("/(tabs)/collection" as never);
  };

  return (
    <Screen
      title={speciesPreview.danishName}
      subtitle="Dit dyrekort med billeder, korte fakta og steder, hvor du har fundet dyret."
      rightAction={
        <Pressable onPress={() => setMenuOpen(true)} style={styles.menuButton}>
          <Ionicons color={theme.dark} name="ellipsis-horizontal" size={16} />
        </Pressable>
      }
    >
      <GlassCard>
        {speciesPreview.findings.length ? (
          <>
            <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false} onMomentumScrollEnd={onScroll}>
              {speciesPreview.findings.map((finding) => (
                <Image contentFit="cover" key={finding.id} source={{ uri: finding.imageUrl }} style={styles.heroImage} />
              ))}
            </ScrollView>
            <View style={styles.dotsRow}>
              {speciesPreview.findings.map((finding, index) => (
                <View key={finding.id} style={[styles.dot, index === currentIndex && styles.dotActive]} />
              ))}
            </View>
          </>
        ) : null}
        <Text style={styles.sectionTitle}>{speciesPreview.description}</Text>
        <Text style={styles.helper}>{speciesPreview.latinName}</Text>
      </GlassCard>

      <GlassCard>
        <SectionHeading title="Basisoplysninger" />
        <View style={styles.infoGrid}>
          <View style={styles.factCard}><Text style={styles.factLabel}>Gruppe</Text><Text style={styles.factValue}>{speciesPreview.category}</Text></View>
          <View style={styles.factCard}><Text style={styles.factLabel}>Art</Text><Text style={styles.factValue}>{speciesPreview.latinName}</Text></View>
          <View style={styles.factCard}><Text style={styles.factLabel}>Familie</Text><Text style={styles.factValue}>{speciesPreview.family}</Text></View>
          <View style={styles.factCard}><Text style={styles.factLabel}>Størrelse</Text><Text style={styles.factValue}>{speciesPreview.size}</Text></View>
          <View style={styles.factCard}><Text style={styles.factLabel}>Levested</Text><Text style={styles.factValue}>{speciesPreview.habitat}</Text></View>
          <View style={styles.factCard}><Text style={styles.factLabel}>Almindelighed</Text><Text style={styles.factValue}>{speciesPreview.commonality}</Text></View>
        </View>
      </GlassCard>

      <GlassCard>
        <SectionHeading title="3 hurtige" />
        <Text style={styles.info}>• {speciesPreview.characteristics[0] || speciesPreview.appearance}</Text>
        <Text style={styles.info}>• Den bor tit i: {speciesPreview.habitat}</Text>
        <Text style={styles.info}>• Den er mest aktiv: {speciesPreview.activePeriod}</Text>
      </GlassCard>

      <GlassCard>
        <SectionHeading title="Sjovt fakta" />
        <Text style={styles.info}>{speciesPreview.funFact}</Text>
      </GlassCard>

      <GlassCard>
        <SectionHeading title="Hvordan kan man genkende det?" />
        {speciesPreview.characteristics.map((item) => (
          <Text key={item} style={styles.info}>• {item}</Text>
        ))}
        <Text style={styles.info}>• Kig efter hvor dyret blev fundet</Text>
        <Text style={styles.warning}>{speciesPreview.cautionAdvice}</Text>
      </GlassCard>

      <GlassCard>
        <SectionHeading title="Kort over fund" />
        {markers.length ? (
          <ScatterMap markers={markers} />
        ) : (
          <Text style={styles.helper}>Lokation er ikke gemt for dette fund.</Text>
        )}
      </GlassCard>

      <NatureButton label="Tilbage" onPress={() => router.back()} variant="ghost" />

      <Modal animationType="fade" transparent visible={menuOpen}>
        <View style={styles.modalBackdrop}>
          <GlassCard>
            <SectionHeading title="Mere" />
            <NatureButton label="Slet dette billede" onPress={deleteCurrentImage} variant="ghost" />
            <NatureButton label="Slet dyret fra min dyrebog" onPress={deleteWholeSpecies} variant="ghost" />
            <NatureButton label="Annuller" onPress={() => setMenuOpen(false)} />
          </GlassCard>
        </View>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  helper: {
    fontSize: 15,
    lineHeight: 22,
    color: theme.dark,
    textAlign: "center",
    fontWeight: "700",
  },
  sectionTitle: {
    fontSize: 18,
    lineHeight: 26,
    color: theme.dark,
    fontWeight: "800",
  },
  info: {
    fontSize: 15,
    lineHeight: 22,
    color: theme.dark,
    fontWeight: "700",
  },
  warning: {
    fontSize: 15,
    lineHeight: 22,
    color: "#8b5a1f",
    fontWeight: "700",
  },
  menuButton: {
    width: 30,
    height: 30,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: theme.dark,
    backgroundColor: "#fffdf6",
    alignItems: "center",
    justifyContent: "center",
    opacity: 0.68,
  },
  heroImage: {
    width: 320,
    height: 260,
    borderRadius: 24,
    marginRight: 12,
    backgroundColor: "#dbe5d8",
  },
  dotsRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 999,
    backgroundColor: "#cbd5e1",
  },
  dotActive: {
    backgroundColor: theme.primary,
  },
  infoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  factCard: {
    width: "48%",
    backgroundColor: "#e6f4e7",
    borderRadius: 20,
    borderWidth: 2,
    borderColor: theme.dark,
    padding: 12,
    gap: 6,
  },
  factLabel: {
    fontSize: 13,
    fontWeight: "800",
    color: theme.dark,
  },
  factValue: {
    fontSize: 15,
    fontWeight: "700",
    color: theme.dark,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(16,37,61,0.25)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 18,
  },
});