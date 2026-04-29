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
  leftAction?: React.ReactNode;
  centerTitle?: boolean;
  rightAction?: React.ReactNode;
};

export function Screen({
  children,
  title,
  subtitle,
  scroll = true,
  leftAction,
  centerTitle = false,
  rightAction,
}: ScreenProps) {
  const content = (
    <Animated.View entering={FadeInDown.duration(450)} style={styles.inner}>
      {(title || subtitle || rightAction) && (
        <View style={styles.header}>
          <View style={styles.headerSide}>{leftAction}</View>
          <View style={[styles.headerText, centerTitle && styles.headerTextCentered]}>
            {title ? <Text style={[styles.title, centerTitle && styles.titleCentered]}>{title}</Text> : null}
            {subtitle ? <Text style={[styles.subtitle, centerTitle && styles.subtitleCentered]}>{subtitle}</Text> : null}
          </View>
          <View style={styles.headerSide}>{rightAction}</View>
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
  background: "#e8f2e5",
  card: "#fffdf6",
  dark: "#1e3a2f",
  primary: "#4a7c59",
  primarySoft: "#7fa36b",
  accent: "#e8ddc6",
  textMuted: "#475569",
  border: "#1e3a2f",
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
    paddingBottom: 24,
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
  headerTextCentered: {
    alignItems: "center",
  },
  headerSide: {
    width: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 34,
    fontWeight: "900",
    color: theme.dark,
  },
  titleCentered: {
    textAlign: "center",
  },
  subtitle: {
    fontSize: 17,
    lineHeight: 24,
    color: theme.dark,
  },
  subtitleCentered: {
    textAlign: "center",
  },
  button: {
    minHeight: 58,
    borderRadius: 28,
    paddingHorizontal: 22,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 10,
    borderWidth: 3,
    borderColor: theme.dark,
  },
  primary: {
    backgroundColor: theme.primary,
  },
  secondary: {
    backgroundColor: theme.primarySoft,
  },
  ghost: {
    backgroundColor: "#fffdf6",
  },
  buttonText: {
    color: "#fffdf6",
    fontSize: 18,
    fontWeight: "900",
  },
  ghostText: {
    color: theme.dark,
  },
  disabled: {
    opacity: 0.6,
  },
});