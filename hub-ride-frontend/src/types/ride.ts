export type UserRole = "rider" | "driver" | "operator";

export type RideStatus =
  | "requested"
  | "matching"
  | "accepted"
  | "arriving"
  | "in_progress"
  | "completed"
  | "cancelled";

export type VehicleClass = "bike" | "car" | "premium" | "van";

export type GeoPoint = {
  lat: number;
  lng: number;
  label: string;
};

export type Money = {
  amount: number;
  currency: "VND" | "USD";
};

export type RiderProfile = {
  id: string;
  name: string;
  rating: number;
  savedPlaces: GeoPoint[];
};

export type DriverProfile = {
  id: string;
  name: string;
  rating: number;
  vehicleClass: VehicleClass;
  plateNumber: string;
  etaMinutes: number;
};

export type RideRequest = {
  id: string;
  riderId: string;
  pickup: GeoPoint;
  dropoff: GeoPoint;
  vehicleClass: VehicleClass;
  requestedAt: string;
  status: RideStatus;
  fareEstimate: Money;
  driver?: DriverProfile;
};

export type HubStats = {
  activeRides: number;
  onlineDrivers: number;
  averagePickupMinutes: number;
  completionRate: number;
};

export type HubSnapshot = {
  generatedAt: string;
  rider: RiderProfile;
  rides: RideRequest[];
  stats: HubStats;
};
