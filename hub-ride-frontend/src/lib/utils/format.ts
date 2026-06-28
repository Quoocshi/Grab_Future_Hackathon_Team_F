export function formatVnd(value?: number | string | null) {
  const amount = Number(value ?? 0);
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(Number.isFinite(amount) ? amount : 0);
}

export function formatKm(value?: number | null) {
  if (value == null || Number.isNaN(value)) return "0 km";
  return `${value.toFixed(value < 10 ? 1 : 0)} km`;
}

export function formatCountdown(seconds: number) {
  const safe = Math.max(0, Math.floor(seconds));
  const minutes = Math.floor(safe / 60);
  const rest = safe % 60;
  return `${minutes}:${rest.toString().padStart(2, "0")}`;
}
