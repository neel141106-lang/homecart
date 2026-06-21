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
  mapProfileToDomain,
  mapCategoryToDomain,
  mapProductToDomain,
  mapOrderToDomain,
  mapOrderItemToDomain,
  mapCustomRequestToDomain,
  mapDeliverySettingsToDomain,
} from "@/types/domain.types";
import {
  IProfileRepository,
  IProductRepository,
  IOrderRepository,
  ICustomRequestRepository,
  IDeliverySettingsRepository,
} from "./interfaces";
import { supabase } from "@/src/lib/supabase/client";

// ========================================================
// SUPABASE PROFILE REPOSITORY
// ========================================================
export class SupabaseProfileRepository implements IProfileRepository {
  async getProfile(id: string): Promise<UserProfile | null> {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", id)
      .single();
    if (error || !data) return null;
    return mapProfileToDomain(data);
  }

  async updateProfile(id: string, profile: Partial<UserProfile>): Promise<UserProfile> {
    const dbPayload: Record<string, unknown> = {};
    if (profile.fullName !== undefined) dbPayload.full_name = profile.fullName;
    if (profile.phone !== undefined) dbPayload.phone = profile.phone;
    if (profile.role !== undefined) dbPayload.role = profile.role;
    if (profile.tower !== undefined) dbPayload.tower = profile.tower;
    if (profile.floor !== undefined) dbPayload.floor = profile.floor;
    if (profile.flatNumber !== undefined) dbPayload.flat_number = profile.flatNumber;

    const { data, error } = await supabase
      .from("profiles")
      .update(dbPayload)
      .eq("id", id)
      .select()
      .single();
    if (error || !data) throw new Error(error?.message || "Failed to update profile");
    return mapProfileToDomain(data);
  }

  async getAllProfiles(): Promise<UserProfile[]> {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });
    if (error || !data) return [];
    return data.map(mapProfileToDomain);
  }
}

// ========================================================
// SUPABASE PRODUCT REPOSITORY
// ========================================================
export class SupabaseProductRepository implements IProductRepository {
  async getCategories(): Promise<Category[]> {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("name", { ascending: true });
    if (error || !data) return [];
    return data.map(mapCategoryToDomain);
  }

  async getProducts(categoryId?: string | null): Promise<Product[]> {
    let query = supabase
      .from("products")
      .select("*")
      .eq("is_active", true);

    if (categoryId) {
      query = query.eq("category_id", categoryId);
    }

    const { data, error } = await query.order("name", { ascending: true });
    if (error || !data) return [];
    return data.map(mapProductToDomain);
  }

  async getProductById(id: string): Promise<Product | null> {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("id", id)
      .single();
    if (error || !data) return null;
    return mapProductToDomain(data);
  }

  async createProduct(productData: Omit<Product, "id" | "createdAt">): Promise<Product> {
    const dbPayload = {
      name: productData.name,
      description: productData.description,
      price: productData.price,
      stock: productData.stock,
      category_id: productData.categoryId,
      image_url: productData.imageUrl,
      image_source: productData.imageSource,
      product_type: productData.productType,
      unit: productData.unit,
      is_active: productData.isActive,
      emoji: productData.emoji,
    };

    const { data, error } = await supabase
      .from("products")
      .insert(dbPayload)
      .select()
      .single();
    if (error || !data) throw new Error(error?.message || "Failed to create product");
    return mapProductToDomain(data);
  }

  async updateProduct(id: string, productUpdates: Partial<Product>): Promise<Product> {
    const dbPayload: Record<string, unknown> = {};
    if (productUpdates.name !== undefined) dbPayload.name = productUpdates.name;
    if (productUpdates.description !== undefined) dbPayload.description = productUpdates.description;
    if (productUpdates.price !== undefined) dbPayload.price = productUpdates.price;
    if (productUpdates.stock !== undefined) dbPayload.stock = productUpdates.stock;
    if (productUpdates.categoryId !== undefined) dbPayload.category_id = productUpdates.categoryId;
    if (productUpdates.imageUrl !== undefined) dbPayload.image_url = productUpdates.imageUrl;
    if (productUpdates.imageSource !== undefined) dbPayload.image_source = productUpdates.imageSource;
    if (productUpdates.productType !== undefined) dbPayload.product_type = productUpdates.productType;
    if (productUpdates.unit !== undefined) dbPayload.unit = productUpdates.unit;
    if (productUpdates.isActive !== undefined) dbPayload.is_active = productUpdates.isActive;
    if (productUpdates.emoji !== undefined) dbPayload.emoji = productUpdates.emoji;

    const { data, error } = await supabase
      .from("products")
      .update(dbPayload)
      .eq("id", id)
      .select()
      .single();
    if (error || !data) throw new Error(error?.message || "Failed to update product");
    return mapProductToDomain(data);
  }
}

// ========================================================
// SUPABASE ORDER REPOSITORY
// ========================================================
export class SupabaseOrderRepository implements IOrderRepository {
  async createOrder(
    orderData: Omit<Order, "id" | "createdAt" | "status">,
    items: Omit<OrderItem, "id" | "orderId">[]
  ): Promise<Order> {
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        customer_id: orderData.customerId,
        total_amount: orderData.totalAmount,
        delivery_fee: orderData.deliveryFee,
        payment_method: orderData.paymentMethod,
        status: "preparing",
      })
      .select()
      .single();

    if (orderError || !order) throw new Error(orderError?.message || "Failed to create order");

    const itemPayloads = items.map((item) => ({
      order_id: order.id,
      product_id: item.productId,
      quantity: item.quantity,
      price: item.price,
    }));

    const { error: itemsError } = await supabase.from("order_items").insert(itemPayloads);
    if (itemsError) throw new Error(itemsError.message);

    return mapOrderToDomain(order);
  }

  async getOrdersByCustomerId(customerId: string): Promise<Order[]> {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("customer_id", customerId)
      .order("created_at", { ascending: false });
    if (error || !data) return [];
    return data.map(mapOrderToDomain);
  }

  async getOrderDetails(orderId: string): Promise<{ order: Order; items: OrderItem[] } | null> {
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .single();
    if (orderError || !order) return null;

    const { data: items, error: itemsError } = await supabase
      .from("order_items")
      .select("*")
      .eq("order_id", orderId);
    if (itemsError) return null;

    return {
      order: mapOrderToDomain(order),
      items: (items || []).map(mapOrderItemToDomain),
    };
  }

  async getAllOrders(): Promise<Order[]> {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });
    if (error || !data) return [];
    return data.map(mapOrderToDomain);
  }

  async updateOrderStatus(orderId: string, status: OrderStatus): Promise<Order> {
    const { data, error } = await supabase
      .from("orders")
      .update({ status })
      .eq("id", orderId)
      .select()
      .single();
    if (error || !data) throw new Error(error?.message || "Failed to update order status");
    return mapOrderToDomain(data);
  }
}

// ========================================================
// SUPABASE CUSTOM REQUEST REPOSITORY
// ========================================================
export class SupabaseCustomRequestRepository implements ICustomRequestRepository {
  async createRequest(customerId: string, requestText: string): Promise<CustomRequest> {
    const { data, error } = await supabase
      .from("custom_requests")
      .insert({ customer_id: customerId, request_text: requestText })
      .select()
      .single();
    if (error || !data) throw new Error(error?.message || "Failed to create request");
    return mapCustomRequestToDomain(data);
  }

  async getRequestsByCustomerId(customerId: string): Promise<CustomRequest[]> {
    const { data, error } = await supabase
      .from("custom_requests")
      .select("*")
      .eq("customer_id", customerId)
      .order("created_at", { ascending: false });
    if (error || !data) return [];
    return data.map(mapCustomRequestToDomain);
  }

  async getAllRequests(): Promise<CustomRequest[]> {
    const { data, error } = await supabase
      .from("custom_requests")
      .select("*")
      .order("created_at", { ascending: false });
    if (error || !data) return [];
    return data.map(mapCustomRequestToDomain);
  }

  async updateRequestStatus(
    requestId: string,
    status: CustomRequestStatus,
    estimatedPrice?: number | null
  ): Promise<CustomRequest> {
    const payload: Record<string, unknown> = { status };
    if (estimatedPrice !== undefined) payload.estimated_price = estimatedPrice;

    const { data, error } = await supabase
      .from("custom_requests")
      .update(payload)
      .eq("id", requestId)
      .select()
      .single();
    if (error || !data) throw new Error(error?.message || "Failed to update request");
    return mapCustomRequestToDomain(data);
  }
}

// ========================================================
// SUPABASE DELIVERY SETTINGS REPOSITORY
// ========================================================
export class SupabaseDeliverySettingsRepository implements IDeliverySettingsRepository {
  async getSettings(): Promise<DeliverySettings> {
    const { data, error } = await supabase
      .from("delivery_settings")
      .select("*")
      .eq("id", 1)
      .single();
    if (error || !data) {
      // Return safe defaults if not seeded
      return {
        id: 1,
        deliveryFee: 30,
        freeDeliveryAbove: 500,
        minimumOrderAmount: 0,
        deliveryTime: "10 mins",
        isDeliveryEnabled: true,
        updatedAt: new Date().toISOString(),
      };
    }
    return mapDeliverySettingsToDomain(data);
  }

  async updateSettings(settingsUpdates: Partial<DeliverySettings>): Promise<DeliverySettings> {
    const dbPayload: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (settingsUpdates.deliveryFee !== undefined) dbPayload.delivery_fee = settingsUpdates.deliveryFee;
    if (settingsUpdates.freeDeliveryAbove !== undefined) dbPayload.free_delivery_above = settingsUpdates.freeDeliveryAbove;
    if (settingsUpdates.minimumOrderAmount !== undefined) dbPayload.minimum_order_amount = settingsUpdates.minimumOrderAmount;
    if (settingsUpdates.deliveryTime !== undefined) dbPayload.delivery_time = settingsUpdates.deliveryTime;
    if (settingsUpdates.isDeliveryEnabled !== undefined) dbPayload.is_delivery_enabled = settingsUpdates.isDeliveryEnabled;

    const { data, error } = await supabase
      .from("delivery_settings")
      .update(dbPayload)
      .eq("id", 1)
      .select()
      .single();
    if (error || !data) throw new Error(error?.message || "Failed to update delivery settings");
    return mapDeliverySettingsToDomain(data);
  }
}
