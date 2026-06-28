import Link from "next/link";
import { ArrowRight, Clock3, MapPinned, Route, ShieldCheck, UsersRound } from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const stats = [
  { label: "Countdown demo", value: "30s" },
  { label: "Partner mock", value: "3" },
  { label: "Seed hubs", value: "20" },
];

export default function Home() {
  return (
    <AppShell>
      <section id="tour-hero" className="mx-auto grid min-h-[calc(100dvh-9rem)] w-full max-w-7xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-[1fr_0.9fr] md:items-center lg:px-8">
        <header className="text-center md:col-span-2">
          <h1 className="mx-auto max-w-6xl text-balance text-5xl font-bold leading-[1.05] tracking-[-0.045em] sm:text-6xl lg:text-[5.35rem]">
            Smarter shared rides,
            <br />
            <span className="text-primary">lower costs</span> every trip.
          </h1>
          <p className="mx-auto mt-7 max-w-3xl text-pretty text-lg font-medium leading-8 text-muted-foreground sm:text-2xl sm:leading-10">
            Create a room, match passengers at a Hub, and
            <br className="hidden sm:block" /> dispatch the best ride in 5 minutes.
          </p>
        </header>

        <div>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link href="/rooms/new">
                Create room
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/rooms/browse">Browse rooms</Link>
            </Button>
          </div>
        </div>

        <div className="grid gap-3 rounded-2xl border bg-card p-4 shadow-sm">
          <div className="rounded-xl bg-muted/60 p-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Demo route</p>
                <h2 className="mt-1 text-2xl font-semibold">KTX Khu A to District 1</h2>
              </div>
              <Badge>OPEN</Badge>
            </div>
            <div className="mt-5 grid gap-3">
              {[
                { icon: MapPinned, label: "Origin hub", value: "KTX Khu A" },
                { icon: Route, label: "Destination", value: "District 1" },
                { icon: UsersRound, label: "Room members", value: "Lan, Mai" },
                { icon: Clock3, label: "Dispatch", value: "Best quote after countdown" },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-3 rounded-lg bg-background p-3">
                  <item.icon className="size-4 text-primary" aria-hidden="true" />
                  <div>
                    <p className="text-sm font-medium">{item.label}</p>
                    <p className="text-sm text-muted-foreground">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2 px-1 text-sm text-muted-foreground">
            <ShieldCheck className="size-4 text-primary" aria-hidden="true" />
            Backend API, STOMP room topic, and Neon DB ready for integration.
          </div>
        </div>
      </section>
    </AppShell>
  );
}
