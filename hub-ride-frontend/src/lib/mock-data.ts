import type { HubSnapshot } from "@/types/ride";

export const mockHubSnapshot: HubSnapshot = {
  generatedAt: "2026-06-28T00:00:00+07:00",
  rider: {
    id: "rider-linh-tran",
    name: "Linh Tran",
    rating: 4.86,
    savedPlaces: [
      {
        label: "Home, Thao Dien",
        lat: 10.8023,
        lng: 106.7315,
      },
      {
        label: "Ben Thanh Market",
        lat: 10.7721,
        lng: 106.6981,
      },
    ],
  },
  rides: [
    {
      id: "ride-82741",
      riderId: "rider-linh-tran",
      pickup: {
        label: "District 1, Nguyen Hue",
        lat: 10.7738,
        lng: 106.703,
      },
      dropoff: {
        label: "Thu Duc City, Sala",
        lat: 10.7703,
        lng: 106.7464,
      },
      vehicleClass: "car",
      requestedAt: "2026-06-28T00:09:00+07:00",
      status: "accepted",
      fareEstimate: {
        amount: 128000,
        currency: "VND",
      },
      driver: {
        id: "driver-minh-vo",
        name: "Minh Vo",
        rating: 4.92,
        vehicleClass: "car",
        plateNumber: "51G-482.17",
        etaMinutes: 4,
      },
    },
    {
      id: "ride-82735",
      riderId: "rider-linh-tran",
      pickup: {
        label: "Tan Son Nhat Airport",
        lat: 10.8188,
        lng: 106.652,
      },
      dropoff: {
        label: "District 3, Turtle Lake",
        lat: 10.7829,
        lng: 106.6967,
      },
      vehicleClass: "premium",
      requestedAt: "2026-06-27T21:42:00+07:00",
      status: "completed",
      fareEstimate: {
        amount: 182000,
        currency: "VND",
      },
    },
  ],
  stats: {
    activeRides: 18,
    onlineDrivers: 284,
    averagePickupMinutes: 5.4,
    completionRate: 97.6,
  },
};
