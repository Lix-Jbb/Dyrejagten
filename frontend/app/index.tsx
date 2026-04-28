import { Redirect } from "expo-router";
import React from "react";
import { ActivityIndicator, Text, View } from "react-native";

import { useApp } from "../context/AppContext";
import { theme } from "../components/Screen";

export default function Index() {
  const { ready, profile } = useApp();

  if (!ready) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: theme.background,
          alignItems: "center",
          justifyContent: "center",
          gap: 14,
        }}
      >
        <ActivityIndicator size="large" color={theme.primary} />
        <Text style={{ color: theme.dark, fontSize: 17, fontWeight: "700" }}>
          Åbner din natur-samling...
        </Text>
      </View>
    );
  }

  return <Redirect href={(profile?.onboardingCompleted ? "/(tabs)" : "/onboarding") as never} />;
}
