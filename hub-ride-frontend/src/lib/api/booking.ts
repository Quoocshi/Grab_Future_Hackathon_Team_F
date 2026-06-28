import { requestJson } from "@/lib/api-client";
import type { Booking } from "@/types/booking";

export function getBookings(userId: string) {
  return requestJson<Booking[]>(`/bookings?userId=${userId}`);
}

export function getBooking(bookingId: string) {
  return requestJson<Booking>(`/bookings/${bookingId}`);
}
