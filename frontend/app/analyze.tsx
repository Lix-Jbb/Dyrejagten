import { Image } from "expo-image";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

import { GlassCard } from "../components/Cards";
import { NatureButton, Screen, theme } from "../components/Screen";
import { useApp } from "../context/AppContext";

const LOADING_STEPS = [
  "Dyrejagten undersøger billedet...",
  "Kigger efter poter, vinger og følehorn...",
  "Tæller ben uden at blive rundtosset...",
  "Leder i den danske dyrebog...",
  "Sammenligner med dyr fra skov, have og strand...",
  "Tjekker om det har pels, fjer eller skjold...",
  "Finder små spor i billedet...",
  "Spørger billerne pænt om hjælp...",
  "Kigger efter næb, snude eller snabel...",
  "Bladrer hurtigt i naturens store opslagsbog...",
  "Undersøger om det er et insekt, en fugl eller noget helt tredje...",
  "Sætter lup på de små detaljer...",
  "Næsten færdig... dyret gemmer sig ikke meget længere.",
];

const waitFourSeconds = () => new Promise((resolve) => setTimeout(resolve, 4000));

export default function AnalyzeScreen() {
  const router = useRouter();
  const { busy, currentCapture, error, runAnalysis, setError } = useApp();
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    if (!currentCapture) {
      router.replace("/(tabs)/camera" as never);
      return;
    }

    const stepTimer = setInterval(() => {
      setStepIndex((value) => (value + 1) % LOADING_STEPS.length);
    }, 1500);

    Promise.all([runAnalysis(), waitFourSeconds()])
      .then(() => router.replace("/result" as never))
      .catch(() => null);

    return () => clearInterval(stepTimer);
  }, [currentCapture, router, runAnalysis]);

  const loadingText = useMemo(() => LOADING_STEPS[stepIndex], [stepIndex]);

  return (
    <Screen title="Dyrejagten undersøger billedet..." subtitle="Vi leder efter et dyr i den danske natur.">
      <GlassCard>
        {currentCapture ? <Image contentFit="cover" source={{ uri: currentCapture.uri }} style={styles.image} /> : null}
        <View style={styles.centered}>
          <ActivityIndicator color={theme.primary} size="large" />
          <Text style={styles.loadingTitle}>{loadingText}</Text>
          <Text style={styles.loadingText}>Det tager som regel kun et øjeblik.</Text>
        </View>
      </GlassCard>

      {error ? (
        <GlassCard>
          <Text style={styles.errorTitle}>Analysen kunne ikke gennemføres</Text>
          <Text style={styles.loadingText}>{error}</Text>
          <NatureButton
            label="Prøv igen"
            loading={busy}
            onPress={() => {
              setError(null);
              Promise.all([runAnalysis(), waitFourSeconds()])
                .then(() => router.replace("/result" as never))
                .catch(() => null);
            }}
          />
          <NatureButton
            label="Tilbage til kamera"
            onPress={() => router.replace("/(tabs)/camera" as never)}
            variant="secondary"
          />
        </GlassCard>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  image: {
    width: "100%",
    height: 280,
    borderRadius: 22,
    backgroundColor: "#dbe5d8",
  },
  centered: {
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    paddingVertical: 12,
  },
  loadingTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: theme.dark,
    textAlign: "center",
  },
  loadingText: {
    fontSize: 15,
    lineHeight: 22,
    color: theme.textMuted,
    textAlign: "center",
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: theme.dark,
  },
});