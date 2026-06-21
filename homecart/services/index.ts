/**
 * services/index.ts
 * 
 * Service layer — orchestrates business logic between repositories.
 * All methods return { data, error } tuples for predictable error handling.
 * Automatically selects Mock or Supabase repositories based on env config.
 */
import { isSupabaseConfigured, supabase } from "@/src/lib/supabase/client";
import {
  MockProfileRepository,
  MockProductRepository,
  MockOrderRepository,
  MockCustomRequestRepository,
  MockDeliverySettingsRepository,
} from "@/repositories/mockImpl";
import {
  SupabaseProfileRepository,
  SupabaseProductRepository,
  SupabaseOrderRepository,
  SupabaseCustomRequestRepository,
  SupabaseDeliverySettingsRepository,
} from "@/repositories/supabaseImpl";
import {
  Product,
  Order,
  OrderItem,
  PaymentMethod,
  OrderStatus,
  CustomRequestStatus,
  DeliverySettings,
  ImageSource,
} from "@/types/domain.types";

// ========================================================
// REPOSITORY FACTORY — picks real or mock implementation
// ========================================================
export const profileRepo = isSupabaseConfigured
  ? new SupabaseProfileRepository()
  : new MockProfileRepository();

export const productRepo = isSupabaseConfigured
  ? new SupabaseProductRepository()
  : new MockProductRepository();

export const orderRepo = isSupabaseConfigured
  ? new SupabaseOrderRepository()
  : new MockOrderRepository();

export const customRequestRepo = isSupabaseConfigured
  ? new SupabaseCustomRequestRepository()
  : new MockCustomRequestRepository();

export const deliveryRepo = isSupabaseConfigured
  ? new SupabaseDeliverySettingsRepository()
  : new MockDeliverySettingsRepository();

// ========================================================
// RESULT TYPE
// ========================================================
export type ServiceResult<T> = { data: T; error: null } | { data: null; error: string };

function ok<T>(data: T): ServiceResult<T> {
  return { data, error: null };
}
function fail<T>(error: unknown): ServiceResult<T> {
  const msg = error instanceof Error ? error.message : String(error);
  return { data: null, error: msg };
}

// ========================================================
// PROFILE SERVICES
// ========================================================
export const ProfileService = {
  async get(id: string) {
    try { return ok(await profileRepo.getProfile(id)); }
    catch (e) { return fail(e); }
  },
  async update(id: string, updates: Record<string, unknown>) {
    try { return ok(await profileRepo.updateProfile(id, updates as any)); }
    catch (e) { return fail(e); }
  },
  async listAll() {
    try { return ok(await profileRepo.getAllProfiles()); }
    catch (e) { return fail(e); }
  },
};

// ========================================================
// PRODUCT & CATEGORY SERVICES
// ========================================================
export const ProductService = {
  async getCategories() {
    try { return ok(await productRepo.getCategories()); }
    catch (e) { return fail(e); }
  },
  async getProducts(categoryId?: string | null) {
    try { return ok(await productRepo.getProducts(categoryId)); }
    catch (e) { return fail(e); }
  },
  async getById(id: string) {
    try { return ok(await productRepo.getProductById(id)); }
    catch (e) { return fail(e); }
  },
  async create(product: Omit<Product, "id" | "createdAt">) {
    try { return ok(await productRepo.createProduct(product)); }
    catch (e) { return fail(e); }
  },
  async update(id: string, updates: Partial<Product>) {
    try { return ok(await productRepo.updateProduct(id, updates)); }
    catch (e) { return fail(e); }
  },
};

// ========================================================
// IMAGE MANAGEMENT SERVICE
// Architecture: supports 3 image sources:
//   1. 'placeholder' → use emoji field as visual stand-in
//   2. 'demo'        → use curated demo imageUrl from seed
//   3. 'uploaded'    → use real imageUrl from Supabase Storage
// ========================================================
export const ImageService = {
  /**
   * Returns the best display image for a product.
   * Falls back gracefully: uploaded → demo → emoji placeholder.
   */
  getDisplayImage(product: Product): { type: "url" | "emoji"; value: string } {
    if (product.imageSource === "uploaded" && product.imageUrl) {
      return { type: "url", value: product.imageUrl };
    }
    if (product.imageSource === "demo" && product.imageUrl) {
      return { type: "url", value: product.imageUrl };
    }
    return { type: "emoji", value: product.emoji };
  },

  /**
   * Determines imageSource type from a given URL or absence of URL.
   */
  resolveImageSource(imageUrl: string | null, isUserUploaded: boolean): ImageSource {
    if (!imageUrl) return "placeholder";
    if (isUserUploaded) return "uploaded";
    return "demo";
  },

  /**
   * Returns a Supabase Storage public URL for an uploaded image.
   * (Stub — replace with real Storage bucket URL when credentials are set)
   */
  getStorageUrl(path: string): string {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    return `${supabaseUrl}/storage/v1/object/public/product-images/${path}`;
  },

  /**
   * Validates an image file for upload.
   * Allowed: JPEG, PNG, WebP. Max size: 2MB.
   */
  validateImageFile(file: File): { valid: boolean; error?: string } {
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    const maxSizeMB = 2;
    if (!allowedTypes.includes(file.type)) {
      return { valid: false, error: "Only JPEG, PNG, and WebP images are allowed." };
    }
    if (file.size > maxSizeMB * 1024 * 1024) {
      return { valid: false, error: `Image must be under ${maxSizeMB}MB.` };
    }
    return { valid: true };
  },

  /**
   * Creates a local object URL for image preview before upload.
   */
  createPreviewUrl(file: File): string {
    return URL.createObjectURL(file);
  },

  /**
   * Revokes a previously created preview URL to free memory.
   */
  revokePreviewUrl(url: string): void {
    URL.revokeObjectURL(url);
  },

  /**
   * Uploads an image file to Supabase storage or simulates it in mock mode.
   */
  async uploadImage(file: File): Promise<ServiceResult<string>> {
    const validation = this.validateImageFile(file);
    if (!validation.valid) {
      return fail(validation.error || "Invalid file");
    }

    if (isSupabaseConfigured) {
      try {
        const fileExt = file.name.split(".").pop();
        const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
        const filePath = `products/${fileName}`;

        const { error } = await supabase.storage
          .from("product-images")
          .upload(filePath, file);

        if (error) {
          return fail(error.message);
        }

        return ok(this.getStorageUrl(filePath));
      } catch (e) {
        return fail(e);
      }
    } else {
      // Mock upload: create a mock local preview URL
      try {
        const mockUrl = this.createPreviewUrl(file);
        return ok(mockUrl);
      } catch (e) {
        return fail(e);
      }
    }
  },
};

// ========================================================
// ORDER SERVICES
// ========================================================
export interface PlaceOrderInput {
  customerId: string;
  items: { product: Product; quantity: number }[];
  paymentMethod: PaymentMethod;
  deliveryAddress: { tower: string; floor: string; flat: string };
  settings: DeliverySettings;
}

export const OrderService = {
  async place(input: PlaceOrderInput): Promise<ServiceResult<Order>> {
    try {
      const { customerId, items, paymentMethod, settings } = input;

      const subtotal = items.reduce((s, i) => s + i.product.price * i.quantity, 0);
      const deliveryFee =
        settings.isDeliveryEnabled &&
        settings.freeDeliveryAbove > 0 &&
        subtotal >= settings.freeDeliveryAbove
          ? 0
          : settings.isDeliveryEnabled
          ? settings.deliveryFee
          : 0;

      const orderItems: Omit<OrderItem, "id" | "orderId">[] = items.map((i) => ({
        productId: i.product.id,
        quantity: i.quantity,
        price: i.product.price,
      }));

      const order = await orderRepo.createOrder(
        {
          customerId,
          totalAmount: subtotal + deliveryFee,
          deliveryFee,
          paymentMethod,
        },
        orderItems
      );
      return ok(order);
    } catch (e) {
      return fail(e);
    }
  },

  async getHistory(customerId: string) {
    try { return ok(await orderRepo.getOrdersByCustomerId(customerId)); }
    catch (e) { return fail(e); }
  },

  async getDetails(orderId: string) {
    try { return ok(await orderRepo.getOrderDetails(orderId)); }
    catch (e) { return fail(e); }
  },

  async listAll() {
    try { return ok(await orderRepo.getAllOrders()); }
    catch (e) { return fail(e); }
  },

  async updateStatus(orderId: string, status: OrderStatus) {
    try { return ok(await orderRepo.updateOrderStatus(orderId, status)); }
    catch (e) { return fail(e); }
  },
};

// ========================================================
// CUSTOM REQUEST SERVICES
// ========================================================
export const CustomRequestService = {
  async submit(customerId: string, text: string) {
    try { return ok(await customRequestRepo.createRequest(customerId, text)); }
    catch (e) { return fail(e); }
  },
  async getMine(customerId: string) {
    try { return ok(await customRequestRepo.getRequestsByCustomerId(customerId)); }
    catch (e) { return fail(e); }
  },
  async listAll() {
    try { return ok(await customRequestRepo.getAllRequests()); }
    catch (e) { return fail(e); }
  },
  async updateStatus(id: string, status: CustomRequestStatus, estimatedPrice?: number | null) {
    try { return ok(await customRequestRepo.updateRequestStatus(id, status, estimatedPrice)); }
    catch (e) { return fail(e); }
  },
};

// ========================================================
// DELIVERY SETTINGS SERVICES
// ========================================================
export const DeliveryService = {
  async getSettings() {
    try { return ok(await deliveryRepo.getSettings()); }
    catch (e) { return fail(e); }
  },
  async updateSettings(updates: Partial<DeliverySettings>) {
    try { return ok(await deliveryRepo.updateSettings(updates)); }
    catch (e) { return fail(e); }
  },

  /**
   * Calculates delivery fee for a given cart subtotal.
   */
  calculateDeliveryFee(subtotal: number, settings: DeliverySettings): number {
    if (!settings.isDeliveryEnabled) return 0;
    if (settings.freeDeliveryAbove > 0 && subtotal >= settings.freeDeliveryAbove) return 0;
    return settings.deliveryFee;
  },

  /**
   * Returns how much more spend is needed for free delivery.
   */
  amountUntilFreeDelivery(subtotal: number, settings: DeliverySettings): number {
    if (!settings.isDeliveryEnabled) return 0;
    if (settings.freeDeliveryAbove <= 0) return 0;
    return Math.max(0, settings.freeDeliveryAbove - subtotal);
  },
};
