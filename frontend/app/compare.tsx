import { useRouter } from "expo-router";
import React from "react";

import { GlassCard } from "../components/Cards";
import { NatureButton, Screen } from "../components/Screen";

export default function CompareScreen() {
  const router = useRouter();
  return (
    <Screen title="Dyrejagten" subtitle="Sammenligning er fjernet fra hovedflowet i denne version.">
      <GlassCard>
        <NatureButton label="Tilbage til hjem" onPress={() => router.replace("/(tabs)" as never)} />
      </GlassCard>
    </Screen>
  );
}