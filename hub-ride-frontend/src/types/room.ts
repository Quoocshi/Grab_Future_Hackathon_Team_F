import type { Booking } from "@/types/booking";
import type { PartnerQuote } from "@/types/partner";

export type RoomStatus = "OPEN" | "DISPATCHED" | "CANCELLED" | "EXPIRED";

export type RoomAddress = {
  label: string;
  lat: number;
  lng: number;
  h3Index?: string;
};

export type RoomMember = {
  userId: string;
  fullName: string;
  role: "HOST" | "JOINER" | string;
  amountHeld?: number;
};

export type RoomListItem = {
  roomId: string;
  hostName: string;
  originLabel: string;
  destLabel: string;
  distanceKm: number;
  memberCount: number;
  countdownSec: number;
};

export type RoomDetail = {
  roomId: string;
  status: RoomStatus;
  host: RoomMember;
  members: RoomMember[];
  origin: RoomAddress;
  dest: RoomAddress;
  countdownSec: number;
  distanceKm?: number;
  etaMinutes?: number;
  bestQuote?: PartnerQuote;
  allQuotes?: PartnerQuote[];
};

export type CreateRoomRequest = {
  hostUserId: string;
  originLat: number;
  originLng: number;
  originLabel: string;
  destLat: number;
  destLng: number;
  destLabel: string;
};

export type CreateRoomResponse = {
  roomId: string;
  countdownSec: number;
  origin: RoomAddress;
  dest: RoomAddress;
  distanceKm: number;
  etaMinutes: number;
  hostName: string;
};

export type JoinRoomResponse = {
  memberCount: number;
  totalHeld: number;
};

export type RefundResponse = {
  refundedAmount: number;
};

export type DispatchBooking = {
  bookingId: string;
  partner: string;
  pricePaid: number;
  etaMinutes?: number;
  status: string;
};

export type DispatchResult = {
  roomId: string;
  bestQuote: PartnerQuote;
  allQuotes: PartnerQuote[];
  bookings: DispatchBooking[];
};

export type RoomEvent = {
  event: "JOIN" | "LEAVE" | "DISPATCHED" | "CANCELLED" | "EXPIRED" | string;
  payload?: unknown;
};

export type BookingLookup = Booking | DispatchBooking;
