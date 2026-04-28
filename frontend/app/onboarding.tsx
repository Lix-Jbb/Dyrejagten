import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";

import { GlassCard, StatCard } from "../components/Cards";
import { NatureButton, Screen, theme } from "../components/Screen";
import { useApp } from "../context/AppContext";

export default function OnboardingScreen() {
  const router = useRouter();
  const { busy, completeOnboarding } = useApp();
  const [cameraReady, setCameraReady] = useState(false);
  const [locationReady, setLocationReady] = useState(false);

  const askCamera = async () => {
    const result = await ImagePicker.requestCameraPermissionsAsync();
    const granted = result.status === "granted";
    setCameraReady(granted);
    if (!granted) {
      Alert.alert("Kamera blev ikke tilladt", "Du kan stadig vælge et billede fra kamerarullen senere.");
    }
  };

  const askLocation = async () => {
    const result = await Location.requestForegroundPermissionsAsync();
    setLocationReady(result.status === "granted");
  };

  const finish = async () => {
    await completeOnboarding(locationReady);
    router.replace("/(tabs)" as never);
  };

  return (
    <Screen
      title="Velkommen til NaturFinder"
      subtitle="Tag billeder af dyr i Danmark, få et ærligt AI-bud og byg din egen natur-samling."
    >
      <GlassCard>
        <View style={styles.hero}>
          <View style={styles.iconWrap}>
            <Ionicons color="#f7fbf5" name="leaf" size={28} />
          </View>
          <Text style={styles.heroTitle}>En venlig naturdagbog til nysgerrige opdagere</Text>
          <Text style={styles.heroText}>
            AI&apos;en kan tage fejl, især når arter ligner hinanden. Derfor viser appen altid usikkerhed og foreslår et nyt billede, hvis det er nødvendigt.
          </Text>
        </View>
        <View style={styles.statsRow}>
          <StatCard accent="#e8f2e4" label="Fokus" value="Danske dyr" />
          <StatCard accent="#f4eadf" label="Tone" value="Tryg og enkel" />
        </View>
      </GlassCard>

      <GlassCard>
        <View style={styles.permissionRow}>
          <View style={styles.permissionText}>
            <Text style={styles.permissionTitle}>Kamera</Text>
            <Text style={styles.permissionBody}>Brug kameraet til at fotografere dyr direkte i appen.</Text>
          </View>
          <NatureButton label={cameraReady ? "Tilladt" : "Tillad kamera"} onPress={askCamera} variant="secondary" />
        </View>
        <View style={styles.permissionRow}>
          <View style={styles.permissionText}>
            <Text style={styles.permissionTitle}>Lokation er frivillig</Text>
            <Text style={styles.permissionBody}>Vis fund på kort og gem område eller kommune, hvis du vil.</Text>
          </View>
          <NatureButton label={locationReady ? "Tilladt" : "Tillad lokation"} onPress={askLocation} variant="secondary" />
        </View>
      </GlassCard>

      <GlassCard>
        <Text style={styles.smallTitle}>Det får du i første version</Text>
        <View style={styles.bulletList}>
          {[
            "Tag billede eller vælg fra galleri",
            "AI-bud på dansk med alternative forslag",
            "Gem fund med note, tid og valgfri lokation",
            "Samling, badges og personlig progression",
          ].map((item) => (
            <View key={item} style={styles.bulletRow}>
              <Ionicons color={theme.primary} name="checkmark-circle" size={18} />
              <Text style={styles.bulletText}>{item}</Text>
            </View>
          ))}
        </View>
      </GlassCard>

      <NatureButton label="Kom i gang" loading={busy} onPress={finish} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    gap: 12,
  },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: 20,
    backgroundColor: theme.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: theme.dark,
  },
  heroText: {
    fontSize: 15,
    lineHeight: 23,
    color: theme.textMuted,
  },
  statsRow: {
    flexDirection: "row",
    gap: 12,
  },
  permissionRow: {
    gap: 14,
  },
  permissionText: {
    gap: 6,
  },
  permissionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: theme.dark,
  },
  permissionBody: {
    fontSize: 14,
    lineHeight: 21,
    color: theme.textMuted,
  },
  smallTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: theme.dark,
  },
  bulletList: {
    gap: 12,
  },
  bulletRow: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
  },
  bulletText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 21,
    color: theme.dark,
  },
});