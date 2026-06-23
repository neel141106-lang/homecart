import { create } from "zustand";
import { UserProfile, UserRole } from "@/types/domain.types";
import { ProfileService } from "@/services";
import { supabase, isSupabaseConfigured } from "@/src/lib/supabase/client";

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
  otpSent: boolean;
  pendingPhone: string | null;
  // Actions
  setDemoRole: (role: UserRole) => void;
  loadProfile: (id: string) => Promise<UserProfile | null>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  signInWithPhone: (phone: string) => Promise<boolean>;
  verifyOtp: (otp: string) => Promise<boolean>;
  signOut: () => Promise<void>;
  initAuth: () => () => void; // Returns unsubscribe function
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  profile: null, // Start with null for session verification
  isLoading: true, // Loading during initial session check
  error: null,
  otpSent: false,
  pendingPhone: null,

  setDemoRole: (role) => {
    // Only allow demo switcher if Supabase is NOT configured
    if (!isSupabaseConfigured) {
      const demoProfile = DEMO_PROFILES[role];
      if (typeof window !== "undefined") {
        localStorage.setItem("hc_active_profile", JSON.stringify(demoProfile));
      }
      set({ profile: demoProfile, error: null });
    }
  },

  loadProfile: async (id) => {
    const result = await ProfileService.get(id);
    if (result.error) {
      // In case trigger latency, try creating profile or fallback
      return null;
    }
    return result.data;
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

  signInWithPhone: async (phone) => {
    set({ isLoading: true, error: null });
    if (isSupabaseConfigured) {
      const { error } = await supabase.auth.signInWithOtp({ phone });
      if (error) {
        set({ isLoading: false, error: error.message });
        return false;
      }
      set({ isLoading: false, otpSent: true, pendingPhone: phone });
      return true;
    } else {
      // Simulate sending OTP (delay 800ms)
      await new Promise((resolve) => setTimeout(resolve, 800));
      set({ isLoading: false, otpSent: true, pendingPhone: phone });
      return true;
    }
  },

  verifyOtp: async (otp) => {
    const { pendingPhone } = get();
    if (!pendingPhone) {
      set({ error: "No pending phone number found" });
      return false;
    }
    set({ isLoading: true, error: null });

    if (isSupabaseConfigured) {
      const { data, error } = await supabase.auth.verifyOtp({
        phone: pendingPhone,
        token: otp,
        type: "sms",
      });

      if (error || !data.user) {
        set({ isLoading: false, error: error?.message || "Verification failed" });
        return false;
      }

      // Profile will be loaded via onAuthStateChange listener
      set({ otpSent: false, pendingPhone: null });
      return true;
    } else {
      // Simulate OTP Verification (accepts 123456)
      await new Promise((resolve) => setTimeout(resolve, 800));
      if (otp !== "123456") {
        set({ isLoading: false, error: "Invalid OTP code. Try 123456" });
        return false;
      }

      // Check if phone matches a demo role
      let matchedProfile: UserProfile | null = null;
      if (pendingPhone === DEMO_PROFILES.customer.phone || pendingPhone === "9876543210") {
        matchedProfile = DEMO_PROFILES.customer;
      } else if (pendingPhone === DEMO_PROFILES.shopkeeper.phone || pendingPhone === "9999911111") {
        matchedProfile = DEMO_PROFILES.shopkeeper;
      } else if (pendingPhone === DEMO_PROFILES.admin.phone || pendingPhone === "9000000000") {
        matchedProfile = DEMO_PROFILES.admin;
      } else {
        // Create custom mock profile
        matchedProfile = {
          id: "usr-" + Math.floor(1000 + Math.random() * 9000),
          fullName: "Resident (" + pendingPhone.slice(-4) + ")",
          phone: pendingPhone,
          role: "customer",
          tower: "Tower B",
          floor: 1,
          flatNumber: "101",
          createdAt: new Date().toISOString(),
        };
      }

      if (typeof window !== "undefined") {
        localStorage.setItem("hc_active_profile", JSON.stringify(matchedProfile));
      }

      set({ isLoading: false, profile: matchedProfile, otpSent: false, pendingPhone: null });
      return true;
    }
  },

  signOut: async () => {
    set({ isLoading: true, error: null });
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
      set({ profile: null, isLoading: false });
    } else {
      if (typeof window !== "undefined") {
        localStorage.removeItem("hc_active_profile");
      }
      set({ profile: null, isLoading: false });
    }
  },

  initAuth: () => {
    if (isSupabaseConfigured) {
      set({ isLoading: true });

      // Check initial session
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          const userId = session.user.id;
          get().loadProfile(userId).then((profile) => {
            if (profile) {
              set({ profile, isLoading: false });
            } else {
              // Wait for trigger or handle fallback profile
              set({
                profile: {
                  id: userId,
                  fullName: session.user.phone ? `Resident (${session.user.phone.slice(-4)})` : "Resident",
                  phone: session.user.phone || null,
                  role: "customer",
                  tower: "Tower B",
                  floor: 1,
                  flatNumber: "101",
                  createdAt: new Date().toISOString(),
                },
                isLoading: false,
              });
            }
          });
        } else {
          set({ profile: null, isLoading: false });
        }
      });

      // Set up auth state change listener
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (session?.user) {
          set({ isLoading: true });
          const profile = await get().loadProfile(session.user.id);
          if (profile) {
            set({ profile, isLoading: false });
          } else {
            set({
              profile: {
                id: session.user.id,
                fullName: session.user.phone ? `Resident (${session.user.phone.slice(-4)})` : "Resident",
                phone: session.user.phone || null,
                role: "customer",
                tower: "Tower B",
                floor: 1,
                flatNumber: "101",
                createdAt: new Date().toISOString(),
              },
              isLoading: false,
            });
          }
        } else {
          set({ profile: null, isLoading: false });
        }
      });

      return () => {
        subscription.unsubscribe();
      };
    } else {
      // Mock initialization from localStorage
      set({ isLoading: true });
      if (typeof window !== "undefined") {
        const storedProfile = localStorage.getItem("hc_active_profile");
        if (storedProfile) {
          set({ profile: JSON.parse(storedProfile), isLoading: false });
        } else {
          // If no active profile, default to customer to make the demo work right away,
          // but allow signing out to test the Phone OTP Login flow.
          set({ profile: DEMO_PROFILES.customer, isLoading: false });
        }
      } else {
        set({ profile: null, isLoading: false });
      }
      return () => {};
    }
  },

  clearError: () => set({ error: null }),
}));
