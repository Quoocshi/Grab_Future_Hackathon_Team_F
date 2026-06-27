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
      <section className="mx-auto grid min-h-[calc(100dvh-9rem)] w-full max-w-7xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-[1fr_0.9fr] md:items-center lg:px-8">
        <div>
          <Badge variant="secondary" className="mb-5">
            Hub-Ride MVP
          </Badge>
          <h1 className="max-w-3xl text-4xl font-semibold leading-tight tracking-tight text-balance sm:text-5xl lg:text-6xl">
            Di o to chung tu hub, gia duoc chia theo phong.
          </h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">
            Tao phong, cho nguoi cung tuyen join, het countdown thi Hub-Ride dispatch partner re nhat.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link href="/rooms/new">
                Tao phong
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/rooms/browse">Tim phong</Link>
            </Button>
          </div>
          <div className="mt-8 grid max-w-lg grid-cols-3 gap-3">
            {stats.map((item) => (
              <div key={item.label} className="rounded-xl border bg-card p-3">
                <p className="text-xl font-semibold">{item.value}</p>
                <p className="mt-1 text-xs text-muted-foreground">{item.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-3 rounded-2xl border bg-card p-4 shadow-sm">
          <div className="rounded-xl bg-muted/60 p-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Demo route</p>
                <h2 className="mt-1 text-2xl font-semibold">KTX Khu A to Quan 1</h2>
              </div>
              <Badge>OPEN</Badge>
            </div>
            <div className="mt-5 grid gap-3">
              {[
                { icon: MapPinned, label: "Origin hub", value: "KTX Khu A" },
                { icon: Route, label: "Destination", value: "Quan 1" },
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
