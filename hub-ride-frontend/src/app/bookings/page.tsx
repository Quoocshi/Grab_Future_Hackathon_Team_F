"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { CalendarClock, ReceiptText } from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";
import { UserSwitcher } from "@/components/shared/UserSwitcher";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { getBookings } from "@/lib/api/booking";
import { useUserStore } from "@/lib/store/userStore";
import { formatVnd } from "@/lib/utils/format";

export default function BookingsPage() {
  const currentUser = useUserStore((state) => state.currentUser);
  const { data: bookings = [], isLoading, isError, refetch } = useQuery({
    queryKey: ["bookings", currentUser.id],
    queryFn: () => getBookings(currentUser.id),
  });

  return (
    <AppShell>
      <section className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-4 rounded-2xl border bg-card p-5 sm:flex-row sm:items-center sm:p-6">
          <div>
            <Badge variant="secondary">My bookings</Badge>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight">Lich su booking</h1>
            <p className="mt-2 text-sm text-muted-foreground">Xem cac cuoc xe da dispatch theo demo user.</p>
          </div>
          <UserSwitcher />
        </div>

        <div className="mt-6 grid gap-4">
          {isLoading ? (
            <>
              <Skeleton className="h-28 rounded-2xl" />
              <Skeleton className="h-28 rounded-2xl" />
            </>
          ) : isError ? (
            <div className="rounded-2xl border bg-card p-6">
              <p className="text-sm text-destructive">Khong tai duoc booking.</p>
              <Button className="mt-4" onClick={() => refetch()}>
                Thu lai
              </Button>
            </div>
          ) : bookings.length === 0 ? (
            <div className="rounded-2xl border border-dashed bg-card p-8 text-center">
              <ReceiptText className="mx-auto size-8 text-muted-foreground" aria-hidden="true" />
              <h2 className="mt-3 font-semibold">Chua co booking</h2>
              <p className="mt-1 text-sm text-muted-foreground">Tao hoac join phong, doi countdown ket thuc de co booking.</p>
              <Button asChild className="mt-5">
                <Link href="/rooms/browse">Tim phong</Link>
              </Button>
            </div>
          ) : (
            bookings.map((booking) => (
              <Link
                key={booking.id}
                href={`/bookings/${booking.id}`}
                className="rounded-2xl border bg-card p-5 transition-colors hover:bg-muted/35"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <ReceiptText className="size-4 text-primary" aria-hidden="true" />
                      <h2 className="font-semibold">{booking.partner}</h2>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">Room {booking.roomId.slice(0, 8)}</p>
                  </div>
                  <Badge>{booking.status}</Badge>
                </div>
                <div className="mt-4 flex flex-wrap gap-4 text-sm text-muted-foreground">
                  <span>{formatVnd(booking.pricePaid)}</span>
                  <span className="flex items-center gap-1">
                    <CalendarClock className="size-4" aria-hidden="true" />
                    ETA {booking.etaMinutes ?? 0} phut
                  </span>
                </div>
              </Link>
            ))
          )}
        </div>
      </section>
    </AppShell>
  );
}
