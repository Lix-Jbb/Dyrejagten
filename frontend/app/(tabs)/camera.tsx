import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import React from "react";
import { Alert, StyleSheet, Text, View } from "react-native";

import { GlassCard } from "../../components/Cards";
import { NatureButton, Screen, theme } from "../../components/Screen";
import { useApp } from "../../context/AppContext";

export default function CameraScreen() {
  const router = useRouter();
  const { currentCapture, setCurrentCapture } = useApp();

  const handlePickerResult = async (result: ImagePicker.ImagePickerResult) => {
    if (result.canceled) {
      return;
    }

    const asset = result.assets[0];
    if (!asset.base64) {
      Alert.alert("Billedet mangler data", "Prøv igen med et andet billede.");
      return;
    }

    setCurrentCapture({
      uri: asset.uri,
      base64: asset.base64,
      mimeType: asset.mimeType ?? "image/jpeg",
      capturedAt: new Date().toISOString(),
    });
  };

  const openCamera = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (permission.status !== "granted") {
      Alert.alert("Kamera kræver tilladelse", "Du kan også vælge et billede fra din kamerarulle.");
      return;
    }
    await handlePickerResult(
      await ImagePicker.launchCameraAsync({
        base64: true,
        quality: 0.7,
        mediaTypes: ["images"],
      })
    );
  };

  const openLibrary = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permission.status !== "granted") {
      Alert.alert("Galleri kræver tilladelse", "Tillad adgang for at vælge et billede.");
      return;
    }
    await handlePickerResult(
      await ImagePicker.launchImageLibraryAsync({
        base64: true,
        quality: 0.7,
        mediaTypes: ["images"],
      })
    );
  };

  return (
    <Screen title="Kamera" subtitle="Kom tæt på, få dyret i fokus, og tag gerne billedet fra siden eller ovenfra.">
      <GlassCard>
        {currentCapture ? (
          <Image contentFit="cover" source={{ uri: currentCapture.uri }} style={styles.preview} />
        ) : (
          <View style={styles.placeholder}>
            <Ionicons color={theme.primary} name="camera" size={42} />
            <Text style={styles.placeholderTitle}>Klar til næste fund</Text>
            <Text style={styles.placeholderText}>Tag et skarpt billede af dyret eller vælg et foto fra galleriet.</Text>
          </View>
        )}
      </GlassCard>

      <GlassCard>
        <View style={styles.tipRow}>
          <Ionicons color={theme.primary} name="radio-button-on" size={18} />
          <Text style={styles.tipText}>Kom tæt på uden at forstyrre dyret.</Text>
        </View>
        <View style={styles.tipRow}>
          <Ionicons color={theme.primary} name="radio-button-on" size={18} />
          <Text style={styles.tipText}>Sørg for fokus på kroppen og kendetegn.</Text>
        </View>
        <View style={styles.tipRow}>
          <Ionicons color={theme.primary} name="radio-button-on" size={18} />
          <Text style={styles.tipText}>Tag gerne flere vinkler, hvis arten er svær at se.</Text>
        </View>
      </GlassCard>

      <NatureButton label="Tag billede" onPress={openCamera} icon={<Ionicons color="#f7fbf5" name="camera-outline" size={20} />} />
      <NatureButton label="Vælg fra galleri" onPress={openLibrary} variant="secondary" icon={<Ionicons color={theme.dark} name="images-outline" size={20} />} />
      <NatureButton label="Analyser billede" onPress={() => router.push("/analyze" as never)} disabled={!currentCapture} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  preview: {
    width: "100%",
    height: 320,
    borderRadius: 22,
    backgroundColor: "#dbe5d8",
  },
  placeholder: {
    height: 320,
    borderRadius: 22,
    backgroundColor: "#edf4eb",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    gap: 12,
  },
  placeholderTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: theme.dark,
  },
  placeholderText: {
    fontSize: 15,
    lineHeight: 22,
    color: theme.textMuted,
    textAlign: "center",
  },
  tipRow: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 21,
    color: theme.dark,
  },
});