"use client";

import { NextStep, NextStepProvider } from "nextstepjs";
import type { ReactNode } from "react";

import { ResponsiveTourCard } from "@/components/onboarding/ResponsiveTourCard";
import { mainTour, ONBOARDING_STORAGE_KEY } from "@/components/onboarding/tour-steps";

export function OnboardingRoot({ children }: { children: ReactNode }) {
  const markSeen = () => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(ONBOARDING_STORAGE_KEY, "seen");
    }
  };

  return (
    <NextStepProvider>
      <NextStep
        steps={mainTour}
        shadowRgb="15, 23, 42"
        shadowOpacity="0.35"
        overlayZIndex={80}
        cardComponent={ResponsiveTourCard}
        onComplete={markSeen}
        onSkip={markSeen}
        disableConsoleLogs
      >
        {children}
      </NextStep>
    </NextStepProvider>
  );
}
