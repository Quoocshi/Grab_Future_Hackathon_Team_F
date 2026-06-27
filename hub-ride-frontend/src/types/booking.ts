export type BookingStatus = "CONFIRMED" | "COMPLETED" | "CANCELLED";

export type Booking = {
  id: string;
  bookingId?: string;
  roomId: string;
  userId?: string;
  partner: string;
  pricePaid: number;
  vehicleType?: string;
  etaMinutes?: number;
  status: BookingStatus | string;
  createdAt?: string;
};
