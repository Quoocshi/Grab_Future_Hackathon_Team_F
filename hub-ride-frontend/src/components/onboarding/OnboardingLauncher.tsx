"use client";

import { useEffect } from "react";
import { HelpCircle } from "lucide-react";
import { useNextStep } from "nextstepjs";

import { Button } from "@/components/ui/button";
import { MAIN_TOUR, ONBOARDING_STORAGE_KEY } from "@/components/onboarding/tour-steps";

type Props = {
  compact?: boolean;
};

export function OnboardingLauncher({ compact = false }: Props) {
  const { startNextStep } = useNextStep();

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.localStorage.getItem(ONBOARDING_STORAGE_KEY)) return;

    const timer = window.setTimeout(() => {
      window.localStorage.setItem(ONBOARDING_STORAGE_KEY, "seen");
      startNextStep(MAIN_TOUR);
    }, 900);

    return () => window.clearTimeout(timer);
  }, [startNextStep]);

  return (
    <Button
      type="button"
      variant="outline"
      size={compact ? "icon-lg" : "lg"}
      aria-label="Start guided tour"
      onClick={() => startNextStep(MAIN_TOUR)}
    >
      <HelpCircle className="size-4" aria-hidden="true" />
      {compact ? null : "Guide"}
    </Button>
  );
}
