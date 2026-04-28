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
    <Screen title="TAG ET BILLEDE" subtitle="Kom tæt på, få dyret i fokus, og tag billedet fra siden.">
      <GlassCard>
        {currentCapture ? (
          <Image contentFit="cover" source={{ uri: currentCapture.uri }} style={styles.preview} />
        ) : (
          <View style={styles.placeholder}>
            <Ionicons color={theme.primary} name="camera" size={42} />
            <Text style={styles.placeholderTitle}>Klar til et nyt dyr?</Text>
            <Text style={styles.placeholderText}>{"Tag et tydeligt billede, så kan AI'en bedre gætte dyret."}</Text>
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
      <NatureButton label="Vælg et billede" onPress={openLibrary} variant="secondary" icon={<Ionicons color="#fffdf6" name="images-outline" size={20} />} />
      <NatureButton label="Se hvad det ligner" onPress={() => router.push("/analyze" as never)} disabled={!currentCapture} />
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
    backgroundColor: "#fff1f0",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    gap: 12,
  },
  placeholderTitle: {
    fontSize: 28,
    fontWeight: "900",
    color: theme.dark,
  },
  placeholderText: {
    fontSize: 17,
    lineHeight: 24,
    color: theme.dark,
    textAlign: "center",
  },
  tipRow: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
  },
  tipText: {
    flex: 1,
    fontSize: 16,
    lineHeight: 21,
    color: theme.dark,
    fontWeight: "700",
  },
});