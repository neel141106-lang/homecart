export type UserRole = "customer" | "shopkeeper" | "admin";

export type ImageSource = "uploaded" | "demo" | "placeholder";

export type ProductType = "organic" | "essential" | "standard";

export type OrderStatus =
  | "pending"
  | "accepted"
  | "preparing"
  | "dispatched"
  | "delivered"
  | "cancelled";

export type CustomRequestStatus =
  | "pending"
  | "reviewed"
  | "procuring"
  | "delivered"
  | "cancelled";

export type PaymentMethod = "upi" | "cod" | "credits" | "card";

export interface UserProfile {
  id: string;
  fullName: string;
  phone: string | null;
  role: UserRole;
  tower: string | null;
  floor: number | null;
  flatNumber: string | null;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string; // emoji or icon key
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  stock: number;
  categoryId: string | null;
  imageUrl: string | null;
  imageSource: ImageSource;
  productType: ProductType;
  unit: string;
  isActive: boolean;
  createdAt: string;
}

export interface Order {
  id: string;
  customerId: string;
  totalAmount: number;
  deliveryFee: number;
  paymentMethod: PaymentMethod;
  status: OrderStatus;
  createdAt: string;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string | null;
  quantity: number;
  price: number;
  // Included nested details for UI convenience
  productName?: string;
  productEmoji?: string;
  productUnit?: string;
}

export interface CustomRequest {
  id: string;
  customerId: string;
  requestText: string;
  estimatedPrice: number | null;
  status: CustomRequestStatus;
  createdAt: string;
}

export interface DeliverySettings {
  id: number;
  deliveryFee: number;
  freeDeliveryAbove: number;
  minimumOrderAmount: number;
  deliveryTime: string;
  isDeliveryEnabled: boolean;
  updatedAt: string;
}

// Utility mapper functions to convert between DB types and Domain types
export function mapProfileToDomain(db: any): UserProfile {
  return {
    id: db.id,
    fullName: db.full_name,
    phone: db.phone,
    role: db.role,
    tower: db.tower,
    floor: db.floor,
    flatNumber: db.flat_number,
    createdAt: db.created_at,
  };
}

export function mapCategoryToDomain(db: any): Category {
  return {
    id: db.id,
    name: db.name,
    icon: db.icon,
    createdAt: db.created_at,
  };
}

export function mapProductToDomain(db: any): Product {
  return {
    id: db.id,
    name: db.name,
    description: db.description,
    price: Number(db.price),
    stock: Number(db.stock),
    categoryId: db.category_id,
    imageUrl: db.image_url,
    imageSource: db.image_source,
    productType: db.product_type,
    unit: db.unit,
    isActive: db.is_active,
    createdAt: db.created_at,
  };
}

export function mapOrderToDomain(db: any): Order {
  return {
    id: db.id,
    customerId: db.customer_id,
    totalAmount: Number(db.total_amount),
    deliveryFee: Number(db.delivery_fee),
    paymentMethod: db.payment_method,
    status: db.status,
    createdAt: db.created_at,
  };
}

export function mapOrderItemToDomain(db: any): OrderItem {
  return {
    id: db.id,
    orderId: db.order_id,
    productId: db.product_id,
    quantity: Number(db.quantity),
    price: Number(db.price),
  };
}

export function mapCustomRequestToDomain(db: any): CustomRequest {
  return {
    id: db.id,
    customerId: db.customer_id,
    requestText: db.request_text,
    estimatedPrice: db.estimated_price ? Number(db.estimated_price) : null,
    status: db.status,
    createdAt: db.created_at,
  };
}

export function mapDeliverySettingsToDomain(db: any): DeliverySettings {
  return {
    id: db.id,
    deliveryFee: Number(db.delivery_fee),
    freeDeliveryAbove: Number(db.free_delivery_above),
    minimumOrderAmount: Number(db.minimum_order_amount),
    deliveryTime: db.delivery_time,
    isDeliveryEnabled: db.is_delivery_enabled,
    updatedAt: db.updated_at,
  };
}
