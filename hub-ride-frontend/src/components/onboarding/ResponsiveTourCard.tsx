"use client";

import type { CardComponentProps } from "nextstepjs";

import { Button } from "@/components/ui/button";

export function ResponsiveTourCard({
  step,
  currentStep,
  totalSteps,
  nextStep,
  prevStep,
  skipTour,
  arrow,
}: CardComponentProps) {
  const progress = ((currentStep + 1) / totalSteps) * 100;
  const isLastStep = currentStep === totalSteps - 1;

  return (
    <div className="w-[min(20rem,calc(100vw-2rem))] rounded-xl border bg-popover p-4 text-popover-foreground shadow-xl sm:w-[22rem]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium text-muted-foreground">
            Step {currentStep + 1} of {totalSteps}
          </p>
          <h2 className="mt-1 text-base font-semibold leading-snug">{step.title}</h2>
        </div>
        {step.icon ? <span className="shrink-0 text-xl">{step.icon}</span> : null}
      </div>

      <div className="mt-3 text-sm leading-6 text-muted-foreground">{step.content}</div>

      <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-muted">
        <div className="h-full rounded-full bg-primary" style={{ width: `${progress}%` }} />
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
        {step.showControls ? (
          <Button type="button" variant="outline" size="sm" onClick={prevStep} disabled={currentStep === 0}>
            Previous
          </Button>
        ) : (
          <span />
        )}

        <div className="flex items-center gap-2">
          {skipTour && step.showSkip && !isLastStep ? (
            <Button type="button" variant="ghost" size="sm" onClick={skipTour}>
              Skip
            </Button>
          ) : null}
          {step.showControls ? (
            <Button type="button" size="sm" onClick={nextStep}>
              {isLastStep ? "Finish" : "Next"}
            </Button>
          ) : null}
        </div>
      </div>

      <div className="hidden sm:block">{arrow}</div>
    </div>
  );
}
