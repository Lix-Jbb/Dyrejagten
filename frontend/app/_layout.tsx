import { Stack } from "expo-router";
import React from "react";
import { StatusBar } from "expo-status-bar";

import { AppProvider } from "../context/AppContext";

export default function RootLayout() {
  return (
    <AppProvider>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="analyze" />
        <Stack.Screen name="result" />
        <Stack.Screen name="save-finding" />
        <Stack.Screen name="species/[slug]" />
        <Stack.Screen name="badges" />
        <Stack.Screen name="map" />
        <Stack.Screen name="profile" />
      </Stack>
    </AppProvider>
  );
}