import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";

import { GlassCard } from "../../components/Cards";
import { NatureButton, Screen, theme } from "../../components/Screen";
import { useApp } from "../../context/AppContext";

export default function HomeScreen() {
  const router = useRouter();
  const { dashboard, refreshData, setCurrentCapture } = useApp();

  useFocusEffect(
    useCallback(() => {
      refreshData().catch(() => null);
    }, [refreshData])
  );

  const handlePickedImage = (asset: ImagePicker.ImagePickerAsset) => {
    if (!asset.base64) {
      Alert.alert("Billedet kunne ikke bruges", "Prøv et andet billede.");
      return;
    }
    setCurrentCapture({
      uri: asset.uri,
      base64: asset.base64,
      mimeType: asset.mimeType ?? "image/jpeg",
      capturedAt: new Date().toISOString(),
    });
    router.push("/(tabs)/camera" as never);
  };

  const openCamera = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (permission.status !== "granted") {
      Alert.alert("Kamera kræver tilladelse", "Tillad kameraet for at tage et billede af dyret.");
      return;
    }
    const result = await ImagePicker.launchCameraAsync({ base64: true, quality: 0.7, mediaTypes: ["images"] });
    if (!result.canceled) {
      handlePickedImage(result.assets[0]);
    }
  };

  const openLibrary = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permission.status !== "granted") {
      Alert.alert("Billedbibliotek kræver tilladelse", "Tillad billeder for at vælge et dyr fra biblioteket.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({ base64: true, quality: 0.7, mediaTypes: ["images"] });
    if (!result.canceled) {
      handlePickedImage(result.assets[0]);
    }
  };

  return (
    <Screen
      title="Dyrejagten"
      subtitle="Tag et billede af et dyr, og gem det i din egen dyrebog."
      rightAction={
        <Pressable onPress={() => router.push("/(tabs)/profile" as never)} style={styles.profileButton}>
          <Ionicons color={theme.dark} name="person-outline" size={22} />
        </Pressable>
      }
    >
      <GlassCard>
        <Text style={styles.statusLine}>Du har fundet {dashboard?.totalFindings ?? 0} dyr</Text>
        <Text style={styles.statusLine}>{dashboard?.uniqueSpecies ?? 0} unikke arter</Text>
      </GlassCard>

      <GlassCard delay={100}>
        <Text style={styles.heroKicker}>FIND ET DYR</Text>
        <View style={styles.heroCircle}>
          <Ionicons color="#fffdf6" name="camera" size={54} />
        </View>
        <Text style={styles.heroTitle}>Find et dyr</Text>
        <NatureButton
          label="Tag billede"
          icon={<Ionicons color="#f7fbf5" name="camera-outline" size={20} />}
          onPress={openCamera}
        />
        <NatureButton
          label="Kig i fotoalbum"
          icon={<Ionicons color="#fffdf6" name="images-outline" size={20} />}
          onPress={openLibrary}
          variant="secondary"
        />
      </GlassCard>
    </Screen>
  );
}

const styles = StyleSheet.create({
  profileButton: {
    width: 44,
    height: 44,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.border,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fbfdf8",
  },
  heroKicker: {
    fontSize: 15,
    fontWeight: "900",
    color: theme.primary,
  },
  heroCircle: {
    width: 110,
    height: 110,
    borderRadius: 999,
    backgroundColor: theme.primary,
    borderWidth: 3,
    borderColor: theme.dark,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
  },
  heroTitle: {
    fontSize: 32,
    lineHeight: 38,
    fontWeight: "900",
    color: theme.dark,
    textAlign: "center",
  },
  statusLine: {
    fontSize: 20,
    fontWeight: "800",
    color: theme.dark,
  },
});