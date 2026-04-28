import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import React from "react";

import { theme } from "../../components/Screen";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: "#789080",
        tabBarStyle: {
          height: 78,
          paddingTop: 8,
          paddingBottom: 10,
          backgroundColor: "#fbfdf8",
          borderTopColor: theme.border,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "700",
        },
        tabBarIcon: ({ color, size }) => {
          const iconMap: Record<string, keyof typeof Ionicons.glyphMap> = {
            index: "leaf-outline",
            collection: "book-outline",
            score: "ribbon-outline",
            profile: "person-outline",
            camera: "camera-outline",
          };
          return <Ionicons color={color} name={iconMap[route.name] || "ellipse-outline"} size={size} />;
        },
      })}
    >
      <Tabs.Screen name="index" options={{ title: "Hjem" }} />
      <Tabs.Screen name="camera" options={{ href: null }} />
      <Tabs.Screen name="collection" options={{ title: "Dyrebog" }} />
      <Tabs.Screen name="score" options={{ title: "Badges" }} />
      <Tabs.Screen name="profile" options={{ title: "Profil" }} />
    </Tabs>
  );
}