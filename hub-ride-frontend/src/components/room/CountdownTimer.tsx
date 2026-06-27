"use client";

import { useEffect, useRef, useState } from "react";
import { Clock3 } from "lucide-react";
import { formatCountdown } from "@/lib/utils/format";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

type Props = {
  initialSeconds: number;
  active?: boolean;
  onComplete?: () => void;
};

export function CountdownTimer({ initialSeconds, active = true, onComplete }: Props) {
  const [remaining, setRemaining] = useState(initialSeconds);
  const firedRef = useRef(false);
  const total = Math.max(initialSeconds, 1);
  const urgent = remaining <= 10;

  useEffect(() => {
    if (!active || remaining <= 0) return;
    const timer = window.setInterval(() => {
      setRemaining((current) => Math.max(0, current - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [active, remaining]);

  useEffect(() => {
    if (remaining === 0 && !firedRef.current) {
      firedRef.current = true;
      onComplete?.();
    }
  }, [onComplete, remaining]);

  return (
    <div className="rounded-xl border bg-card p-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Countdown</p>
          <p className={cn("mt-1 text-4xl font-semibold tabular-nums", urgent && "text-destructive")}>
            {formatCountdown(remaining)}
          </p>
        </div>
        <div className="flex size-14 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Clock3 className="size-6" aria-hidden="true" />
        </div>
      </div>
      <Progress className="mt-5 h-2" value={(remaining / total) * 100} />
      <p className="mt-3 text-sm text-muted-foreground">
        Het gio, phong se chot danh sach va goi partner re nhat.
      </p>
    </div>
  );
}
