import { create } from "zustand";
import { persist } from "zustand/middleware";

/**
 * Client-side session store.
 * Admin and customer sessions are mutually exclusive — logging in as one
 * clears the other. This makes it safe to test both roles in the same
 * browser without session conflicts.
 */

type AdminSession = { role: "admin"; token: string } | null;
type CustomerSession = {
  role: "customer";
  customerId: string;
  accessCode: string;
} | null;

interface AppState {
  admin: AdminSession;
  customer: CustomerSession;
  setAdmin: (s: AdminSession) => void;
  setCustomer: (s: CustomerSession) => void;
  logoutAdmin: () => void;
  logoutCustomer: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      admin: null,
      customer: null,
      // Logging in as admin clears customer session (and vice versa)
      setAdmin: (s) => set({ admin: s, customer: null }),
      setCustomer: (s) => set({ customer: s, admin: null }),
      logoutAdmin: () => set({ admin: null }),
      logoutCustomer: () => set({ customer: null }),
    }),
    { name: "workshop-session" }
  )
);
