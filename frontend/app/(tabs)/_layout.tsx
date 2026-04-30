import { Ionicons } from "@expo/vector-icons";
import { BottomTabBarButtonProps } from "@react-navigation/bottom-tabs";
import { Tabs, useRouter } from "expo-router";
import React from "react";
import { Pressable } from "react-native";

import { theme } from "../../components/Screen";

function TabButton({ testID, onPressOverride, ...props }: BottomTabBarButtonProps & { testID: string; onPressOverride?: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={props.accessibilityState}
      onLongPress={props.onLongPress}
      onPress={onPressOverride ?? props.onPress}
      style={props.style}
      testID={testID}
    >
      {props.children}
    </Pressable>
  );
}

export default function TabLayout() {
  const router = useRouter();

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
            map: "map-outline",
            profile: "person-outline",
            camera: "camera-outline",
          };
          return <Ionicons color={color} name={iconMap[route.name] || "ellipse-outline"} size={size} />;
        },
      })}
    >
      <Tabs.Screen name="index" options={{ title: "Hjem", tabBarButton: (props) => <TabButton {...props} testID="tab-home" /> }} />
      <Tabs.Screen name="camera" options={{ href: null }} />
      <Tabs.Screen
        name="collection"
        options={{
          title: "Dyrebog",
          tabBarButton: (props) => <TabButton {...props} onPressOverride={() => router.replace("/(tabs)/collection" as never)} testID="tab-book" />,
        }}
      />
      <Tabs.Screen name="score" options={{ title: "Badges", tabBarButton: (props) => <TabButton {...props} testID="tab-badges" /> }} />
      <Tabs.Screen name="map" options={{ title: "Kort", tabBarButton: (props) => <TabButton {...props} testID="tab-map" /> }} />
      <Tabs.Screen name="profile" options={{ href: null }} />
    </Tabs>
  );
}