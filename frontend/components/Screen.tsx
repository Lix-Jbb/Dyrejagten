import React from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

type ScreenProps = {
  children?: React.ReactNode;
  title?: string;
  subtitle?: string;
  scroll?: boolean;
  rightAction?: React.ReactNode;
};

export function Screen({ children, title, subtitle, scroll = true, rightAction }: ScreenProps) {
  const content = (
    <Animated.View entering={FadeInDown.duration(450)} style={styles.inner}>
      {(title || subtitle || rightAction) && (
        <View style={styles.header}>
          <View style={styles.headerText}>
            {title ? <Text style={styles.title}>{title}</Text> : null}
            {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
          </View>
          {rightAction}
        </View>
      )}
      {children}
    </Animated.View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.flex}
      >
        {scroll ? (
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {content}
          </ScrollView>
        ) : (
          content
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

type ButtonProps = {
  label: string;
  onPress: () => void;
  icon?: React.ReactNode;
  variant?: "primary" | "secondary" | "ghost";
  loading?: boolean;
  disabled?: boolean;
  testID?: string;
};

function toTestId(value: string) {
  return `btn-${value.toLowerCase().replace(/[^a-z0-9æøå]+/g, "-").replace(/^-|-$/g, "")}`;
}

export function NatureButton({
  label,
  onPress,
  icon,
  variant = "primary",
  loading,
  disabled,
  testID,
}: ButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled || loading}
      onPress={onPress}
      testID={testID ?? toTestId(label)}
      style={({ pressed }) => [
        styles.button,
        styles[variant],
        pressed && !disabled && { transform: [{ scale: 0.985 }], opacity: 0.92 },
        disabled && styles.disabled,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={variant === "ghost" ? "#214b31" : "#f8faf7"} />
      ) : (
        <>
          {icon}
          <Text style={[styles.buttonText, variant === "ghost" && styles.ghostText]}>{label}</Text>
        </>
      )}
    </Pressable>
  );
}

export const theme = {
  background: "#f4f6f1",
  card: "#fbfdf8",
  dark: "#173222",
  primary: "#4a7c59",
  primarySoft: "#dcebdc",
  accent: "#d7a86e",
  textMuted: "#587163",
  border: "#dbe5d8",
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.background,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 18,
    paddingBottom: 18,
  },
  inner: {
    paddingHorizontal: 18,
    gap: 18,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
  },
  headerText: {
    flex: 1,
    gap: 6,
  },
  title: {
    fontSize: 30,
    fontWeight: "800",
    color: theme.dark,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    color: theme.textMuted,
  },
  button: {
    minHeight: 52,
    borderRadius: 20,
    paddingHorizontal: 18,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 10,
  },
  primary: {
    backgroundColor: theme.primary,
  },
  secondary: {
    backgroundColor: theme.primarySoft,
    borderWidth: 1,
    borderColor: theme.border,
  },
  ghost: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: theme.border,
  },
  buttonText: {
    color: "#f8faf7",
    fontSize: 16,
    fontWeight: "700",
  },
  ghostText: {
    color: theme.dark,
  },
  disabled: {
    opacity: 0.6,
  },
});