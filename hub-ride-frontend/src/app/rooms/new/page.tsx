"use client";

import { useMemo, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { AlertCircle, ArrowRight, CheckCircle2, MapPinned, Route, Send } from "lucide-react";
import { toast } from "sonner";

import { AppShell } from "@/components/layout/app-shell";
import { AddressAutocomplete } from "@/components/search/AddressAutocomplete";
import { UserSwitcher } from "@/components/shared/UserSwitcher";
import { WalletBadge } from "@/components/shared/WalletBadge";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { createRoom } from "@/lib/api/room";
import { useUserStore } from "@/lib/store/userStore";
import { estimateRouteKm } from "@/lib/utils/geo";
import { formatKm } from "@/lib/utils/format";
import type { SelectedPlace } from "@/types/address";

export default function NewRoomPage() {
  const router = useRouter();
  const currentUser = useUserStore((state) => state.currentUser);
  const [origin, setOrigin] = useState<SelectedPlace | null>(null);
  const [dest, setDest] = useState<SelectedPlace | null>(null);

  const distanceKm = useMemo(() => {
    if (!origin || !dest) return null;
    return estimateRouteKm(origin.lat, origin.lng, dest.lat, dest.lng);
  }, [dest, origin]);

  const tooShort = distanceKm != null && distanceKm < 2;

  const mutation = useMutation({
    mutationFn: () => {
      if (!origin || !dest) throw new Error("Choose an origin and destination first.");
      return createRoom({
        hostUserId: currentUser.id,
        originLat: origin.lat,
        originLng: origin.lng,
        originLabel: origin.label,
        destLat: dest.lat,
        destLng: dest.lng,
        destLabel: dest.label,
      });
    },
    onSuccess: (room) => {
      toast.success("Room created.");
      router.push(`/rooms/${room.roomId}`);
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Could not create the room.");
    },
  });

  return (
    <AppShell>
      <section className="mx-auto grid w-full max-w-6xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[1fr_0.8fr] lg:px-8">
        <div className="rounded-2xl border bg-card p-5 sm:p-6">
          {/* <Badge variant="secondary">Host room</Badge> */}
          <h1 className="mt-4 text-3xl font-semibold tracking-tight">Create a new room</h1>
          {/* <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
            Choose pickup and destination hubs. The backend calculates H3 cells, creates the room, and returns the countdown.
          </p> */}

          <div className="mt-6 grid gap-5">
            <div className="flex gap-3 rounded-xl bg-muted/45 p-4 items-center justify-between">
              <div>
                <p className="text-sm font-medium">Room host</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <UserSwitcher />
                <WalletBadge />
              </div>
            </div>

            <AddressAutocomplete
              id="tour-origin-input"
              label="Pickup hub"
              value={origin}
              onChange={setOrigin}
              icon={MapPinned}
              placeholder="Search KTX Khu A, Main Gate, District 1..."
            />
            <AddressAutocomplete
              id="tour-destination-input"
              label="Destination"
              value={dest}
              onChange={setDest}
              icon={Send}
              placeholder="Search District 1, Downtown, Saigon Station..."
            />

            {distanceKm != null ? (
              <div className="flex items-start gap-3 rounded-xl border bg-background p-4">
                {tooShort ? (
                  <AlertCircle className="mt-0.5 size-5 text-destructive" aria-hidden="true" />
                ) : (
                  <CheckCircle2 className="mt-0.5 size-5 text-primary" aria-hidden="true" />
                )}
                <div>
                  <p className="font-medium">Estimated route: {formatKm(distanceKm)}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {tooShort
                      ? "Routes under 2 km are rejected by the backend."
                      : "This route is eligible. Create the room to start the countdown."}
                  </p>
                </div>
              </div>
            ) : null}

            <Button
              size="lg"
              disabled={!origin || !dest || tooShort || mutation.isPending}
              onClick={() => mutation.mutate()}
              className="h-11"
            >
              {mutation.isPending ? "Creating room..." : "Create room"}
              <ArrowRight className="size-4" aria-hidden="true" />
            </Button>
          </div>
        </div>

        <aside className="grid gap-4">
          <div className="rounded-2xl border bg-card p-5">
            <h2 className="text-lg font-semibold">Preview route</h2>
            <div className="mt-4 grid gap-3">
              <div className="flex gap-3 rounded-xl bg-muted/45 p-4">
                <MapPinned className="mt-0.5 size-5 text-primary" aria-hidden="true" />
                <div>
                  <p className="text-sm font-medium">Origin</p>
                  <p className="text-sm text-muted-foreground">{origin?.label ?? "Not selected"}</p>
                </div>
              </div>
              <div className="flex gap-3 rounded-xl bg-muted/45 p-4">
                <Route className="mt-0.5 size-5 text-primary" aria-hidden="true" />
                <div>
                  <p className="text-sm font-medium">Destination</p>
                  <p className="text-sm text-muted-foreground">{dest?.label ?? "Not selected"}</p>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </section>
    </AppShell>
  );
}
