import { create } from "zustand";
import { CustomRequest, CustomRequestStatus } from "@/types/domain.types";
import { CustomRequestService } from "@/services";

interface CustomRequestState {
  requests: CustomRequest[];
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;
  // Actions
  loadMine: (customerId: string) => Promise<void>;
  loadAll: () => Promise<void>;
  submit: (customerId: string, text: string) => Promise<CustomRequest | null>;
  updateStatus: (id: string, status: CustomRequestStatus, estimatedPrice?: number | null) => Promise<void>;
  clearError: () => void;
}

export const useCustomRequestStore = create<CustomRequestState>((set) => ({
  requests: [],
  isLoading: false,
  isSubmitting: false,
  error: null,

  loadMine: async (customerId) => {
    set({ isLoading: true, error: null });
    const result = await CustomRequestService.getMine(customerId);
    if (result.error) {
      set({ isLoading: false, error: result.error });
    } else {
      set({ isLoading: false, requests: result.data });
    }
  },

  loadAll: async () => {
    set({ isLoading: true, error: null });
    const result = await CustomRequestService.listAll();
    if (result.error) {
      set({ isLoading: false, error: result.error });
    } else {
      set({ isLoading: false, requests: result.data });
    }
  },

  submit: async (customerId, text) => {
    set({ isSubmitting: true, error: null });
    const result = await CustomRequestService.submit(customerId, text);
    if (result.error) {
      set({ isSubmitting: false, error: result.error });
      return null;
    }
    set((state) => ({
      isSubmitting: false,
      requests: [result.data, ...state.requests],
    }));
    return result.data;
  },

  updateStatus: async (id, status, estimatedPrice) => {
    const result = await CustomRequestService.updateStatus(id, status, estimatedPrice);
    if (result.error) {
      set({ error: result.error });
    } else {
      set((state) => ({
        requests: state.requests.map((r) => (r.id === id ? result.data : r)),
      }));
    }
  },

  clearError: () => set({ error: null }),
}));
