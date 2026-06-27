"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Clock3, MapPinned, Route, UsersRound } from "lucide-react";
import { toast } from "sonner";

import { AppShell } from "@/components/layout/app-shell";
import { AddressAutocomplete } from "@/components/search/AddressAutocomplete";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { joinRoom, searchRooms } from "@/lib/api/room";
import { useUserStore } from "@/lib/store/userStore";
import { formatCountdown, formatKm } from "@/lib/utils/format";
import type { SelectedPlace } from "@/types/address";
import type { RoomListItem } from "@/types/room";

function RoomCard({ room, onJoin, joining }: { room: RoomListItem; onJoin: () => void; joining: boolean }) {
  return (
    <div className="rounded-2xl border bg-card p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-muted-foreground">Host</p>
          <h2 className="mt-1 text-xl font-semibold">{room.hostName}</h2>
        </div>
        <Badge variant="secondary">{formatCountdown(room.countdownSec)}</Badge>
      </div>
      <div className="mt-5 grid gap-3 text-sm">
        <div className="flex gap-3">
          <MapPinned className="mt-0.5 size-4 text-primary" aria-hidden="true" />
          <span>{room.originLabel}</span>
        </div>
        <div className="flex gap-3">
          <Route className="mt-0.5 size-4 text-primary" aria-hidden="true" />
          <span>{room.destLabel}</span>
        </div>
        <div className="flex gap-3 text-muted-foreground">
          <UsersRound className="mt-0.5 size-4" aria-hidden="true" />
          <span>{room.memberCount} thanh vien</span>
        </div>
      </div>
      <div className="mt-5 flex items-center justify-between gap-3">
        <span className="text-sm text-muted-foreground">Cach ban {formatKm(room.distanceKm)}</span>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href={`/rooms/${room.roomId}`}>Chi tiet</Link>
          </Button>
          <Button disabled={joining} onClick={onJoin}>
            {joining ? "Dang join..." : "Join"}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function BrowseRoomsPage() {
  const queryClient = useQueryClient();
  const currentUser = useUserStore((state) => state.currentUser);
  const [origin, setOrigin] = useState<SelectedPlace | null>(null);
  const [dest, setDest] = useState<SelectedPlace | null>(null);

  const canSearch = Boolean(origin && dest);
  const queryKey = useMemo(
    () => ["rooms", "browse", origin?.lat, origin?.lng, dest?.lat, dest?.lng, currentUser.id],
    [currentUser.id, dest?.lat, dest?.lng, origin?.lat, origin?.lng],
  );

  const { data: rooms = [], isFetching, isError, refetch } = useQuery({
    queryKey,
    enabled: canSearch,
    queryFn: () =>
      searchRooms({
        originLat: origin!.lat,
        originLng: origin!.lng,
        destLat: dest!.lat,
        destLng: dest!.lng,
        excludeUserId: currentUser.id,
      }),
  });

  const joinMutation = useMutation({
    mutationFn: (roomId: string) => joinRoom(roomId, currentUser.id).then(() => roomId),
    onSuccess: (roomId) => {
      toast.success("Da join phong.");
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
      window.location.href = `/rooms/${roomId}`;
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Khong join duoc phong."),
  });

  return (
    <AppShell>
      <section className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="rounded-2xl border bg-card p-5 sm:p-6">
          <Badge variant="secondary">Join room</Badge>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight">Tim phong dang mo</h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Chon cung tuyen duong de backend tim room gan bang H3 k-ring.
          </p>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <AddressAutocomplete id="browse-origin" label="Ban dang o dau" value={origin} onChange={setOrigin} placeholder="Chon diem don" />
            <AddressAutocomplete id="browse-dest" label="Muon di dau" value={dest} onChange={setDest} placeholder="Chon diem den" />
          </div>
        </div>

        <div className="mt-6">
          {!canSearch ? (
            <div className="rounded-2xl border border-dashed bg-card p-8 text-center text-sm text-muted-foreground">
              Chon origin va destination de bat dau tim phong.
            </div>
          ) : isFetching ? (
            <div className="grid gap-4 md:grid-cols-2">
              <Skeleton className="h-56 rounded-2xl" />
              <Skeleton className="h-56 rounded-2xl" />
            </div>
          ) : isError ? (
            <div className="rounded-2xl border bg-card p-6">
              <p className="text-sm text-destructive">Khong tai duoc danh sach phong.</p>
              <Button className="mt-4" onClick={() => refetch()}>
                Thu lai
              </Button>
            </div>
          ) : rooms.length === 0 ? (
            <div className="rounded-2xl border bg-card p-8 text-center">
              <Clock3 className="mx-auto size-8 text-muted-foreground" aria-hidden="true" />
              <h2 className="mt-3 font-semibold">Chua co phong phu hop</h2>
              <p className="mt-1 text-sm text-muted-foreground">Hay tao phong moi de nguoi khac join cung tuyen.</p>
              <Button asChild className="mt-5">
                <Link href="/rooms/new">Tao phong</Link>
              </Button>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {rooms.map((room) => (
                <RoomCard
                  key={room.roomId}
                  room={room}
                  joining={joinMutation.isPending}
                  onJoin={() => joinMutation.mutate(room.roomId)}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </AppShell>
  );
}
