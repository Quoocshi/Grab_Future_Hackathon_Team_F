export type Partner = "GRAB" | "BE" | "XANH_SM";

export type PartnerQuote = {
  partner: Partner | string;
  totalPrice: number;
  perPersonPrice?: number;
  perPerson?: number;
  etaMinutes: number;
  surgeMultiplier: number;
  vehicleType?: string;
};
