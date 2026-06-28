"use client";

import { useCallback, useMemo, useRef } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowRight, CarFront, Loader2, MapPinned, Route } from "lucide-react";
import { toast } from "sonner";

import { AppShell } from "@/components/layout/app-shell";
import { CountdownTimer } from "@/components/room/CountdownTimer";
import { MemberList } from "@/components/room/MemberList";
import { PriceCompare } from "@/components/room/PriceCompare";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cancelRoom, dispatchRoom, getRoom, joinRoom, leaveRoom } from "@/lib/api/room";
import { getBookings } from "@/lib/api/booking";
import { useUserStore } from "@/lib/store/userStore";
import { formatKm } from "@/lib/utils/format";
import { useRoomSubscription } from "@/lib/ws/useRoomSubscription";
import type { DispatchResult, RoomDetail, RoomEvent } from "@/types/room";

function getParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function isRoomDetailPayload(payload: unknown, roomId: string | undefined): payload is RoomDetail {
  if (!payload || typeof payload !== "object") return false;
  const maybeRoom = payload as Partial<RoomDetail>;
  return maybeRoom.roomId === roomId && Array.isArray(maybeRoom.members);
}

export default function RoomDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const roomId = getParam(params.roomId);
  const currentUser = useUserStore((state) => state.currentUser);
  const dispatchingRef = useRef(false);

  const roomQuery = useQuery({
    queryKey: ["rooms", "detail", roomId],
    enabled: Boolean(roomId),
    queryFn: () => getRoom(roomId!),
  });

  const room = roomQuery.data;
  const members = useMemo(() => room?.members ?? [], [room?.members]);
  const isMember = members.some((member) => member.userId === currentUser.id);
  const isHost = room?.host?.userId === currentUser.id;

  const memberSafeRoom = useMemo(() => {
    if (!room) return null;
    if (members.some((member) => member.userId === room.host.userId)) return room;
    return { ...room, members: [room.host, ...members] };
  }, [members, room]);

  const redirectToCurrentBooking = useCallback(
    async (targetRoomId: string) => {
      const bookings = await queryClient.fetchQuery({
        queryKey: ["bookings", currentUser.id],
        queryFn: () => getBookings(currentUser.id),
      });
      const booking = bookings.find((item) => item.roomId === targetRoomId);
      if (booking) {
        router.push(`/bookings/${booking.id ?? booking.bookingId}`);
      }
    },
    [currentUser.id, queryClient, router],
  );

  const dispatchMutation = useMutation({
    mutationFn: () => dispatchRoom(roomId!),
    onSuccess: async (result: DispatchResult) => {
      queryClient.setQueryData(["rooms", "detail", roomId], (current: typeof room) =>
        current
          ? {
              ...current,
              status: "DISPATCHED",
              bestQuote: result.bestQuote,
              allQuotes: result.allQuotes,
            }
          : current,
      );
      toast.success("Best partner dispatched.");
      await redirectToCurrentBooking(result.roomId);
    },
    onError: async (error) => {
      dispatchingRef.current = false;
      toast.error(error instanceof Error ? error.message : "Dispatch failed.");
      await roomQuery.refetch();
    },
  });

  const joinMutation = useMutation({
    mutationFn: () => joinRoom(roomId!, currentUser.id),
    onSuccess: async () => {
      toast.success("Joined the room.");
      await roomQuery.refetch();
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Could not join the room."),
  });

  const leaveMutation = useMutation({
    mutationFn: () => leaveRoom(roomId!, currentUser.id),
    onSuccess: async () => {
      toast.success("Left the room.");
      await roomQuery.refetch();
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Could not leave the room."),
  });

  const cancelMutation = useMutation({
    mutationFn: () => cancelRoom(roomId!, currentUser.id),
    onSuccess: () => {
      toast.success("Room cancelled.");
      router.push("/rooms/browse");
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Could not cancel the room."),
  });

  const onRoomEvent = useCallback(
    async (event: RoomEvent) => {
      if (event.event === "DISPATCHED") {
        const result = event.payload as DispatchResult;
        queryClient.setQueryData(["rooms", "detail", roomId], (current: typeof room) =>
          current
            ? {
                ...current,
                status: "DISPATCHED",
                bestQuote: result.bestQuote,
                allQuotes: result.allQuotes,
              }
            : current,
        );
        await redirectToCurrentBooking(result.roomId);
        return;
      }
      if (isRoomDetailPayload(event.payload, roomId)) {
        queryClient.setQueryData(["rooms", "detail", roomId], event.payload);
        return;
      }
      await roomQuery.refetch();
    },
    [queryClient, redirectToCurrentBooking, roomId, roomQuery],
  );

  useRoomSubscription(roomId, onRoomEvent);

  const handleCountdownComplete = useCallback(() => {
    if (!roomId || dispatchingRef.current || room?.status !== "OPEN") return;
    dispatchingRef.current = true;
    dispatchMutation.mutate();
  }, [dispatchMutation, room?.status, roomId]);

  return (
    <AppShell>
      <section className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {roomQuery.isLoading ? (
          <div className="grid gap-4 lg:grid-cols-[1fr_0.7fr]">
            <Skeleton className="h-96 rounded-2xl" />
            <Skeleton className="h-96 rounded-2xl" />
          </div>
        ) : roomQuery.isError || !memberSafeRoom ? (
          <div className="rounded-2xl border bg-card p-8">
            <h1 className="text-xl font-semibold">Could not load the room</h1>
            <Button className="mt-4" onClick={() => roomQuery.refetch()}>
              Try again
            </Button>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[1fr_0.72fr]">
            <div className="grid gap-6">
              <div className="rounded-2xl border bg-card p-5 sm:p-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <Badge variant={memberSafeRoom.status === "OPEN" ? "secondary" : "default"}>
                      {memberSafeRoom.status}
                    </Badge>
                    <h1 className="mt-4 text-3xl font-semibold tracking-tight">Shared ride room</h1>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Hosted by {memberSafeRoom.host.fullName}, with {memberSafeRoom.members.length} members in the room.
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {!isMember && memberSafeRoom.status === "OPEN" ? (
                      <Button disabled={joinMutation.isPending} onClick={() => joinMutation.mutate()}>
                        Join room
                      </Button>
                    ) : null}
                    {isMember && !isHost && memberSafeRoom.status === "OPEN" ? (
                      <Button variant="outline" disabled={leaveMutation.isPending} onClick={() => leaveMutation.mutate()}>
                        Leave room
                      </Button>
                    ) : null}
                    {isHost && memberSafeRoom.status === "OPEN" ? (
                      <Button variant="destructive" disabled={cancelMutation.isPending} onClick={() => cancelMutation.mutate()}>
                        Cancel room
                      </Button>
                    ) : null}
                  </div>
                </div>

                <div className="mt-6 grid gap-3 md:grid-cols-2">
                  <div className="flex gap-3 rounded-xl bg-muted/45 p-4">
                    <MapPinned className="mt-0.5 size-5 text-primary" aria-hidden="true" />
                    <div>
                      <p className="text-sm font-medium">Pickup hub</p>
                      <p className="text-sm text-muted-foreground">{memberSafeRoom.origin.label}</p>
                    </div>
                  </div>
                  <div className="flex gap-3 rounded-xl bg-muted/45 p-4">
                    <Route className="mt-0.5 size-5 text-primary" aria-hidden="true" />
                    <div>
                      <p className="text-sm font-medium">Destination</p>
                      <p className="text-sm text-muted-foreground">{memberSafeRoom.dest.label}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap gap-2 text-sm text-muted-foreground">
                  <Badge variant="outline">{formatKm(memberSafeRoom.distanceKm)}</Badge>
                  <Badge variant="outline">ETA {memberSafeRoom.etaMinutes ?? 0} min</Badge>
                  <Badge variant="outline">Room {memberSafeRoom.roomId.slice(0, 8)}</Badge>
                </div>
              </div>

              <PriceCompare quotes={memberSafeRoom.allQuotes} bestQuote={memberSafeRoom.bestQuote} />
            </div>

            <aside className="grid content-start gap-6">
              {memberSafeRoom.status === "OPEN" ? (
                <CountdownTimer
                  initialSeconds={memberSafeRoom.countdownSec}
                  active={!dispatchMutation.isPending}
                  onComplete={handleCountdownComplete}
                />
              ) : (
                <div className="rounded-xl border bg-card p-5">
                  <div className="flex items-center gap-3">
                    <CarFront className="size-5 text-primary" aria-hidden="true" />
                    <h2 className="font-semibold">Room dispatched</h2>
                  </div>
                  <Button asChild className="mt-5">
                    <Link href="/bookings">
                      View bookings
                      <ArrowRight className="size-4" aria-hidden="true" />
                    </Link>
                  </Button>
                </div>
              )}
              {dispatchMutation.isPending ? (
                <div className="flex items-center gap-3 rounded-xl border bg-card p-4 text-sm">
                  <Loader2 className="size-4 animate-spin text-primary" aria-hidden="true" />
                  Dispatching partner...
                </div>
              ) : null}
              <MemberList members={memberSafeRoom.members} />
            </aside>
          </div>
        )}
      </section>
    </AppShell>
  );
}
