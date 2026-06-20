import { create } from "zustand";
import { DeliverySettings } from "@/types/domain.types";
import { DeliveryService } from "@/services";

interface DeliveryState {
  settings: DeliverySettings;
  isLoading: boolean;
  error: string | null;
  // Actions
  loadSettings: () => Promise<void>;
  updateSettings: (updates: Partial<DeliverySettings>) => Promise<void>;
  // Computed helpers
  calculateFee: (subtotal: number) => number;
  amountUntilFree: (subtotal: number) => number;
  clearError: () => void;
}

const DEFAULT_SETTINGS: DeliverySettings = {
  id: 1,
  deliveryFee: 30,
  freeDeliveryAbove: 500,
  minimumOrderAmount: 0,
  deliveryTime: "10 mins",
  isDeliveryEnabled: true,
  updatedAt: new Date().toISOString(),
};

export const useDeliveryStore = create<DeliveryState>((set, get) => ({
  settings: DEFAULT_SETTINGS,
  isLoading: false,
  error: null,

  loadSettings: async () => {
    set({ isLoading: true, error: null });
    const result = await DeliveryService.getSettings();
    if (result.error) {
      set({ isLoading: false, error: result.error });
    } else {
      set({ isLoading: false, settings: result.data });
    }
  },

  updateSettings: async (updates) => {
    set({ isLoading: true, error: null });
    const result = await DeliveryService.updateSettings(updates);
    if (result.error) {
      set({ isLoading: false, error: result.error });
    } else {
      set({ isLoading: false, settings: result.data });
    }
  },

  calculateFee: (subtotal) => {
    return DeliveryService.calculateDeliveryFee(subtotal, get().settings);
  },

  amountUntilFree: (subtotal) => {
    return DeliveryService.amountUntilFreeDelivery(subtotal, get().settings);
  },

  clearError: () => set({ error: null }),
}));
