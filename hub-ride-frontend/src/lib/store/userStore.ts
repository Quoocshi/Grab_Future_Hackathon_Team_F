"use client";

import { create } from "zustand";
import type { DemoUser } from "@/types/user";

const fallbackUser: DemoUser = {
  id: "00000000-0000-0000-0000-000000000001",
  fullName: "Lan",
  walletBalance: 500000,
};

type UserState = {
  currentUser: DemoUser;
  setCurrentUser: (user: DemoUser) => void;
};

export const useUserStore = create<UserState>((set) => ({
  currentUser: fallbackUser,
  setCurrentUser: (user) => set({ currentUser: user }),
}));
