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

  const openCamera = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (permission.status !== "granted") {
      Alert.alert("Kamera kræver tilladelse", "Du kan også vælge et billede fra din kamerarulle.");
      return;
    }
    const result = await ImagePicker.launchCameraAsync({ base64: true, quality: 0.7, mediaTypes: ["images"] });
    if (!result.canceled && result.assets[0].base64) {
      setCurrentCapture({
        uri: result.assets[0].uri,
        base64: result.assets[0].base64,
        mimeType: result.assets[0].mimeType ?? "image/jpeg",
        capturedAt: new Date().toISOString(),
      });
    }
  };

  const openLibrary = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permission.status !== "granted") {
      Alert.alert("Galleri kræver tilladelse", "Tillad adgang for at vælge et billede.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({ base64: true, quality: 0.7, mediaTypes: ["images"] });
    if (!result.canceled && result.assets[0].base64) {
      setCurrentCapture({
        uri: result.assets[0].uri,
        base64: result.assets[0].base64,
        mimeType: result.assets[0].mimeType ?? "image/jpeg",
        capturedAt: new Date().toISOString(),
      });
    }
  };

  return (
    <Screen title="Brug dette billede?" subtitle="Hvis ja, så undersøger Dyrejagten billedet.">
      <GlassCard>
        {currentCapture ? (
          <Image contentFit="cover" source={{ uri: currentCapture.uri }} style={styles.preview} />
        ) : (
          <View style={styles.placeholder}>
            <Ionicons color={theme.primary} name="camera" size={42} />
            <Text style={styles.placeholderTitle}>Intet billede valgt endnu</Text>
            <Text style={styles.placeholderText}>Tag et nyt billede eller vælg et fra biblioteket.</Text>
          </View>
        )}
      </GlassCard>

      <NatureButton label="Brug billede" onPress={() => router.push("/analyze" as never)} disabled={!currentCapture} />
      <NatureButton label="Tag nyt billede" onPress={openCamera} variant="secondary" />
      <NatureButton label="Kig i fotoalbum" onPress={openLibrary} variant="ghost" />
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
});