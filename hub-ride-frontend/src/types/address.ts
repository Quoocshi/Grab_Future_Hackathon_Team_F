export type AddressKind = "HUB" | "POPULAR" | "CUSTOM";

export type Address = {
  id: string;
  label: string;
  fullAddress: string;
  latitude: number;
  longitude: number;
  h3Index: string;
  kind: AddressKind | string;
};

export type SelectedPlace = {
  label: string;
  fullAddress?: string;
  lat: number;
  lng: number;
  h3Index?: string;
  kind?: string;
};
