import { mockHubSnapshot } from "@/lib/mock-data";
import type { HubSnapshot } from "@/types/ride";

type RequestOptions = {
  fallback?: "mock" | "throw";
  init?: RequestInit;
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

class ApiError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function requestJson<T>(
  path: string,
  { fallback = "mock", init }: RequestOptions = {},
  mockValue: T,
): Promise<T> {
  if (!API_BASE_URL) {
    if (fallback === "mock") return mockValue;
    throw new ApiError("NEXT_PUBLIC_API_BASE_URL is not configured.");
  }

  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        ...init?.headers,
      },
      next: {
        revalidate: 30,
        ...init?.next,
      },
    });

    if (!response.ok) {
      throw new ApiError(`Request failed with status ${response.status}.`, response.status);
    }

    return (await response.json()) as T;
  } catch (error) {
    if (fallback === "mock") return mockValue;
    throw error;
  }
}

export const hubRideApi = {
  getSnapshot(options?: RequestOptions): Promise<HubSnapshot> {
    return requestJson<HubSnapshot>("/hub/snapshot", options, mockHubSnapshot);
  },
};

export { ApiError };
