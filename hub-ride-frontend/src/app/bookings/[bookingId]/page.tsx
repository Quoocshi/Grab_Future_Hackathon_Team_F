"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { CalendarClock, CarFront, CheckCircle2, MapPinned } from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { getBooking } from "@/lib/api/booking";
import { formatVnd } from "@/lib/utils/format";

function getParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default function BookingDetailPage() {
  const params = useParams();
  const bookingId = getParam(params.bookingId);

  const { data: booking, isLoading, isError, refetch } = useQuery({
    queryKey: ["bookings", "detail", bookingId],
    enabled: Boolean(bookingId),
    queryFn: () => getBooking(bookingId!),
  });

  return (
    <AppShell>
      <section className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        {isLoading ? (
          <Skeleton className="h-96 rounded-2xl" />
        ) : isError || !booking ? (
          <div className="rounded-2xl border bg-card p-8">
            <h1 className="text-xl font-semibold">Could not load the booking</h1>
            <Button className="mt-4" onClick={() => refetch()}>
              Try again
            </Button>
          </div>
        ) : (
          <div className="rounded-2xl border bg-card p-6 sm:p-8">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <CheckCircle2 className="size-7" aria-hidden="true" />
            </div>
            <Badge className="mt-6">{booking.status}</Badge>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight">Booking confirmed</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              The partner is locked in. Arrive at the hub on time for pickup.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <div className="rounded-xl bg-muted/45 p-4">
                <CarFront className="size-5 text-primary" aria-hidden="true" />
                <p className="mt-3 text-sm text-muted-foreground">Partner</p>
                <p className="font-semibold">{booking.partner}</p>
              </div>
              <div className="rounded-xl bg-muted/45 p-4">
                <MapPinned className="size-5 text-primary" aria-hidden="true" />
                <p className="mt-3 text-sm text-muted-foreground">Price paid</p>
                <p className="font-semibold">{formatVnd(booking.pricePaid)}</p>
              </div>
              <div className="rounded-xl bg-muted/45 p-4">
                <CalendarClock className="size-5 text-primary" aria-hidden="true" />
                <p className="mt-3 text-sm text-muted-foreground">ETA</p>
                <p className="font-semibold">{booking.etaMinutes ?? 0} min</p>
              </div>
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild>
                <Link href="/bookings">View history</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/">Back home</Link>
              </Button>
            </div>
          </div>
        )}
      </section>
    </AppShell>
  );
}
