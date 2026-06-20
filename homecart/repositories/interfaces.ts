import {
  UserProfile,
  Category,
  Product,
  Order,
  OrderItem,
  CustomRequest,
  DeliverySettings,
  OrderStatus,
  CustomRequestStatus,
} from "@/types/domain.types";

export interface IProfileRepository {
  getProfile(id: string): Promise<UserProfile | null>;
  updateProfile(id: string, profile: Partial<UserProfile>): Promise<UserProfile>;
  getAllProfiles(): Promise<UserProfile[]>;
}

export interface IProductRepository {
  getCategories(): Promise<Category[]>;
  getProducts(categoryId?: string | null): Promise<Product[]>;
  getProductById(id: string): Promise<Product | null>;
  createProduct(product: Omit<Product, "id" | "createdAt">): Promise<Product>;
  updateProduct(id: string, product: Partial<Product>): Promise<Product>;
}

export interface IOrderRepository {
  createOrder(
    order: Omit<Order, "id" | "createdAt" | "status">,
    items: Omit<OrderItem, "id" | "orderId">[]
  ): Promise<Order>;
  getOrdersByCustomerId(customerId: string): Promise<Order[]>;
  getOrderDetails(orderId: string): Promise<{ order: Order; items: OrderItem[] } | null>;
  getAllOrders(): Promise<Order[]>;
  updateOrderStatus(orderId: string, status: OrderStatus): Promise<Order>;
}

export interface ICustomRequestRepository {
  createRequest(customerId: string, requestText: string): Promise<CustomRequest>;
  getRequestsByCustomerId(customerId: string): Promise<CustomRequest[]>;
  getAllRequests(): Promise<CustomRequest[]>;
  updateRequestStatus(
    requestId: string,
    status: CustomRequestStatus,
    estimatedPrice?: number | null
  ): Promise<CustomRequest>;
}

export interface IDeliverySettingsRepository {
  getSettings(): Promise<DeliverySettings>;
  updateSettings(settings: Partial<DeliverySettings>): Promise<DeliverySettings>;
}
