import { create } from "zustand";
import { Order, OrderItem, OrderStatus, PaymentMethod, DeliverySettings } from "@/types/domain.types";
import { OrderService, PlaceOrderInput } from "@/services";
import { CartItem } from "./useCartStore";

export interface PlacedOrderDetails {
  order: Order;
  items: OrderItem[];
}

interface OrderState {
  orders: Order[];
  lastPlacedOrder: Order | null;
  isPlacing: boolean;
  isLoading: boolean;
  error: string | null;
  // Actions
  placeOrder: (input: {
    customerId: string;
    cartItems: CartItem[];
    paymentMethod: PaymentMethod;
    deliveryAddress: { tower: string; floor: string; flat: string };
    settings: DeliverySettings;
  }) => Promise<Order | null>;
  loadOrders: (customerId: string) => Promise<void>;
  loadAllOrders: () => Promise<void>;
  updateStatus: (orderId: string, status: OrderStatus) => Promise<void>;
  clearError: () => void;
}

export const useOrderStore = create<OrderState>((set, get) => ({
  orders: [],
  lastPlacedOrder: null,
  isPlacing: false,
  isLoading: false,
  error: null,

  placeOrder: async ({ customerId, cartItems, paymentMethod, deliveryAddress, settings }) => {
    set({ isPlacing: true, error: null });
    const result = await OrderService.place({
      customerId,
      items: cartItems,
      paymentMethod,
      deliveryAddress,
      settings,
    });
    if (result.error) {
      set({ isPlacing: false, error: result.error });
      return null;
    }
    set((state) => ({
      isPlacing: false,
      lastPlacedOrder: result.data,
      orders: [result.data, ...state.orders],
    }));
    return result.data;
  },

  loadOrders: async (customerId) => {
    set({ isLoading: true, error: null });
    const result = await OrderService.getHistory(customerId);
    if (result.error) {
      set({ isLoading: false, error: result.error });
    } else {
      set({ isLoading: false, orders: result.data });
    }
  },

  loadAllOrders: async () => {
    set({ isLoading: true, error: null });
    const result = await OrderService.listAll();
    if (result.error) {
      set({ isLoading: false, error: result.error });
    } else {
      set({ isLoading: false, orders: result.data });
    }
  },

  updateStatus: async (orderId, status) => {
    const result = await OrderService.updateStatus(orderId, status);
    if (result.error) {
      set({ error: result.error });
    } else {
      set((state) => ({
        orders: state.orders.map((o) => (o.id === orderId ? result.data : o)),
      }));
    }
  },

  clearError: () => set({ error: null }),
}));
