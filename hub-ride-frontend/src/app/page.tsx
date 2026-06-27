import { Clock3, Navigation, RadioTower, Route } from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { hubRideApi } from "@/lib/api-client";
import type { RideStatus } from "@/types/ride";

const statusLabels: Record<RideStatus, string> = {
  requested: "Requested",
  matching: "Matching",
  accepted: "Accepted",
  arriving: "Arriving",
  in_progress: "In progress",
  completed: "Completed",
  cancelled: "Cancelled",
};

export default async function Home() {
  const snapshot = await hubRideApi.getSnapshot();
  const activeRide = snapshot.rides[0];

  return (
    <AppShell>
      <section className="mx-auto grid w-full max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-[1.1fr_0.9fr] md:py-16 lg:px-8">
        <div className="flex flex-col justify-center">
          <Badge variant="secondary" className="w-fit">
            Foundation ready
          </Badge>
          <h1 className="mt-5 max-w-3xl text-4xl font-semibold leading-tight tracking-tight text-balance sm:text-5xl lg:text-6xl">
            Ride hailing basics, wired for real data.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
            Shared types, API access, mock fallback, and a polished shell are in place.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button size="lg">Start booking</Button>
            <Button variant="outline" size="lg">
              View active ride
            </Button>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <div className="rounded-lg bg-muted/60 p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Current trip</p>
                <h2 className="mt-2 text-xl font-semibold tracking-tight">{activeRide.dropoff.label}</h2>
              </div>
              <Badge>{statusLabels[activeRide.status]}</Badge>
            </div>

            <div className="mt-6 grid gap-3">
              <div className="flex gap-3 rounded-lg bg-background p-3">
                <Navigation className="mt-0.5 size-4 text-primary" strokeWidth={1.8} aria-hidden="true" />
                <div>
                  <p className="text-sm font-medium">Pickup</p>
                  <p className="text-sm text-muted-foreground">{activeRide.pickup.label}</p>
                </div>
              </div>
              <div className="flex gap-3 rounded-lg bg-background p-3">
                <Route className="mt-0.5 size-4 text-primary" strokeWidth={1.8} aria-hidden="true" />
                <div>
                  <p className="text-sm font-medium">Dropoff</p>
                  <p className="text-sm text-muted-foreground">{activeRide.dropoff.label}</p>
                </div>
              </div>
            </div>

            <dl className="mt-5 grid grid-cols-3 gap-3">
              <div className="rounded-lg bg-background p-3">
                <dt className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock3 className="size-3.5" strokeWidth={1.8} aria-hidden="true" />
                  Pickup
                </dt>
                <dd className="mt-2 text-lg font-semibold">{snapshot.stats.averagePickupMinutes} min</dd>
              </div>
              <div className="rounded-lg bg-background p-3">
                <dt className="flex items-center gap-2 text-xs text-muted-foreground">
                  <RadioTower className="size-3.5" strokeWidth={1.8} aria-hidden="true" />
                  Drivers
                </dt>
                <dd className="mt-2 text-lg font-semibold">{snapshot.stats.onlineDrivers}</dd>
              </div>
              <div className="rounded-lg bg-background p-3">
                <dt className="text-xs text-muted-foreground">Rides</dt>
                <dd className="mt-2 text-lg font-semibold">{snapshot.stats.activeRides}</dd>
              </div>
            </dl>
          </div>
        </div>
      </section>
    </AppShell>
  );
}
