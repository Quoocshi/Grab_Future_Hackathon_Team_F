import { requestJson } from "@/lib/api-client";
import type { Address } from "@/types/address";

export function searchAddresses(q = "", limit = 10) {
  const params = new URLSearchParams();
  if (q) params.set("q", q);
  params.set("limit", String(limit));
  return requestJson<Address[]>(`/addresses?${params.toString()}`);
}
