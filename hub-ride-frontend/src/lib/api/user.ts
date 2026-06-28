import { requestJson } from "@/lib/api-client";
import type { DemoUser } from "@/types/user";

export function getUsers() {
  return requestJson<DemoUser[]>("/users");
}
