import { create } from "zustand";
import { UserProfile, UserRole } from "@/types/domain.types";
import { ProfileService } from "@/services";

// Predefined demo profiles for role-switching in demo mode
export const DEMO_PROFILES: Record<UserRole, UserProfile> = {
  customer: {
    id: "usr-resident",
    fullName: "Namaste Resident",
    phone: "+91 98765 43210",
    role: "customer",
    tower: "Tower B",
    floor: 14,
    flatNumber: "1405",
    createdAt: new Date().toISOString(),
  },
  shopkeeper: {
    id: "usr-shopkeeper",
    fullName: "Prestige Mart (Store)",
    phone: "+91 99999 11111",
    role: "shopkeeper",
    tower: "Lobby Block",
    floor: 0,
    flatNumber: "Store 1",
    createdAt: new Date().toISOString(),
  },
  admin: {
    id: "usr-admin",
    fullName: "HomeCart Admin",
    phone: "+91 90000 00000",
    role: "admin",
    tower: "HQ",
    floor: 3,
    flatNumber: "Office 302",
    createdAt: new Date().toISOString(),
  },
};

interface AuthState {
  profile: UserProfile | null;
  isLoading: boolean;
  error: string | null;
  // Actions
  setDemoRole: (role: UserRole) => void;
  loadProfile: (id: string) => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  profile: DEMO_PROFILES.customer, // default to customer in demo mode
  isLoading: false,
  error: null,

  setDemoRole: (role) => {
    set({ profile: DEMO_PROFILES[role], error: null });
  },

  loadProfile: async (id) => {
    set({ isLoading: true, error: null });
    const result = await ProfileService.get(id);
    if (result.error) {
      set({ isLoading: false, error: result.error });
    } else {
      set({ isLoading: false, profile: result.data });
    }
  },

  updateProfile: async (updates) => {
    const { profile } = get();
    if (!profile) return;
    set({ isLoading: true, error: null });
    const result = await ProfileService.update(profile.id, updates);
    if (result.error) {
      set({ isLoading: false, error: result.error });
    } else {
      set({ isLoading: false, profile: result.data });
    }
  },

  clearError: () => set({ error: null }),
}));
