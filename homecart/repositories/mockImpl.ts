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
import {
  IProfileRepository,
  IProductRepository,
  IOrderRepository,
  ICustomRequestRepository,
  IDeliverySettingsRepository,
} from "./interfaces";

// Utility for simulated network latency
const SIMULATED_LATENCY = 800;
const delay = (ms: number = SIMULATED_LATENCY) =>
  new Promise((resolve) => setTimeout(resolve, ms));

// ========================================================
// MOCK DATA STORAGE (LOCALSTORAGE ROUTER)
// ========================================================
const getStorageItem = <T>(key: string, defaultValue: T): T => {
  if (typeof window === "undefined") return defaultValue;
  const item = localStorage.getItem(key);
  return item ? JSON.parse(item) : defaultValue;
};

const setStorageItem = <T>(key: string, value: T): void => {
  if (typeof window !== "undefined") {
    localStorage.setItem(key, JSON.stringify(value));
  }
};

// Seeding Initial Data
const SEED_PROFILES: UserProfile[] = [
  {
    id: "usr-resident",
    fullName: "Namaste Resident",
    phone: "+91 98765 43210",
    role: "customer",
    tower: "Tower B",
    floor: 14,
    flatNumber: "1405",
    createdAt: new Date().toISOString(),
  },
  {
    id: "usr-shopkeeper",
    fullName: "Prestige Mart (Store)",
    phone: "+91 99999 11111",
    role: "shopkeeper",
    tower: "Lobby Block",
    floor: 0,
    flatNumber: "Store 1",
    createdAt: new Date().toISOString(),
  },
  {
    id: "usr-admin",
    fullName: "HomeCart Admin Manager",
    phone: "+91 90000 00000",
    role: "admin",
    tower: "HQ",
    floor: 3,
    flatNumber: "Office 302",
    createdAt: new Date().toISOString(),
  },
];

const SEED_CATEGORIES: Category[] = [
  { id: "cat-1", name: "Atta & Rice", icon: "🌾", createdAt: new Date().toISOString() },
  { id: "cat-2", name: "Dal & Pulses", icon: "🥣", createdAt: new Date().toISOString() },
  { id: "cat-3", name: "Dairy & Breakfast", icon: "🥛", createdAt: new Date().toISOString() },
  { id: "cat-4", name: "Fruits & Vegetables", icon: "🥭", createdAt: new Date().toISOString() },
  { id: "cat-5", name: "Snacks", icon: "🍿", createdAt: new Date().toISOString() },
  { id: "cat-6", name: "Household", icon: "🧼", createdAt: new Date().toISOString() },
];

const SEED_PRODUCTS: Product[] = [
  {
    id: "p1",
    name: "Amul Butter",
    description: "Pasteurised butter made from fresh cream. Essential for breakfast toasts.",
    price: 58,
    stock: 15,
    categoryId: "cat-3",
    imageUrl: null,
    imageSource: "placeholder",
    productType: "essential",
    unit: "100g",
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "p2",
    name: "Alphonso Mangoes (Devgad)",
    description: "Sweet, juicy, and naturally ripened hand-picked premium Devgad Alphonso mangoes.",
    price: 299,
    stock: 5,
    categoryId: "cat-4",
    imageUrl: null,
    imageSource: "demo",
    productType: "organic",
    unit: "6 pcs",
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "p3",
    name: "Fresh Coriander Bundle",
    description: "Finely harvested aromatic fresh green coriander leaves directly from local organic farms.",
    price: 15,
    stock: 20,
    categoryId: "cat-4",
    imageUrl: null,
    imageSource: "placeholder",
    productType: "organic",
    unit: "1 bundle",
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "p4",
    name: "Robusta Bananas",
    description: "Fresh and energetic bananas packed with nutrients. Ideal daily snack.",
    price: 45,
    stock: 25,
    categoryId: "cat-4",
    imageUrl: null,
    imageSource: "placeholder",
    productType: "essential",
    unit: "1 doz",
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "p5",
    name: "Royal Gala Apples",
    description: "Sweet and crunchy imported premium apples. Highly nutritious and fresh.",
    price: 120,
    stock: 8,
    categoryId: "cat-4",
    imageUrl: null,
    imageSource: "placeholder",
    productType: "organic",
    unit: "4 pcs",
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "p6",
    name: "Premium Basmati Rice",
    description: "Long-grain aromatic basmati rice. Aged perfectly for royal recipes.",
    price: 149,
    stock: 30,
    categoryId: "cat-1",
    imageUrl: null,
    imageSource: "placeholder",
    productType: "essential",
    unit: "1kg",
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "p7",
    name: "Organic Tur Dal",
    description: "Unpolished organic pigeon peas. Loaded with high protein and essential minerals.",
    price: 95,
    stock: 18,
    categoryId: "cat-2",
    imageUrl: null,
    imageSource: "placeholder",
    productType: "organic",
    unit: "500g",
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "p8",
    name: "Organic Whole Milk",
    description: "Pasteurised whole milk containing high calcium and cream. Direct farm sourcing.",
    price: 66,
    stock: 40,
    categoryId: "cat-3",
    imageUrl: null,
    imageSource: "placeholder",
    productType: "essential",
    unit: "1L",
    isActive: true,
    createdAt: new Date().toISOString(),
  },
];

const SEED_SETTINGS: DeliverySettings = {
  id: 1,
  deliveryFee: 30,
  freeDeliveryAbove: 500,
  minimumOrderAmount: 0,
  deliveryTime: "10 mins",
  isDeliveryEnabled: true,
  updatedAt: new Date().toISOString(),
};

// ========================================================
// REPOSITORY IMPLEMENTATIONS
// ========================================================

export class MockProfileRepository implements IProfileRepository {
  private getProfiles(): UserProfile[] {
    return getStorageItem("hc_profiles", SEED_PROFILES);
  }

  async getProfile(id: string): Promise<UserProfile | null> {
    await delay();
    const profiles = this.getProfiles();
    return profiles.find((p) => p.id === id) || null;
  }

  async updateProfile(id: string, profileUpdates: Partial<UserProfile>): Promise<UserProfile> {
    await delay();
    const profiles = this.getProfiles();
    const index = profiles.findIndex((p) => p.id === id);
    if (index === -1) throw new Error("Profile not found");

    const updatedProfile = { ...profiles[index], ...profileUpdates };
    profiles[index] = updatedProfile;
    setStorageItem("hc_profiles", profiles);
    return updatedProfile;
  }

  async getAllProfiles(): Promise<UserProfile[]> {
    await delay();
    return this.getProfiles();
  }
}

export class MockProductRepository implements IProductRepository {
  async getCategories(): Promise<Category[]> {
    await delay(300);
    return getStorageItem("hc_categories", SEED_CATEGORIES);
  }

  async getProducts(categoryId?: string | null): Promise<Product[]> {
    await delay();
    const products = getStorageItem("hc_products", SEED_PRODUCTS);
    if (categoryId) {
      return products.filter((p) => p.categoryId === categoryId && p.isActive);
    }
    return products.filter((p) => p.isActive);
  }

  async getProductById(id: string): Promise<Product | null> {
    await delay(200);
    const products = getStorageItem<Product[]>("hc_products", SEED_PRODUCTS);
    return products.find((p) => p.id === id) || null;
  }

  async createProduct(productData: Omit<Product, "id" | "createdAt">): Promise<Product> {
    await delay();
    const products = getStorageItem<Product[]>("hc_products", SEED_PRODUCTS);
    const newProduct: Product = {
      ...productData,
      id: "p-" + Math.floor(1000 + Math.random() * 9000),
      createdAt: new Date().toISOString(),
    };
    products.push(newProduct);
    setStorageItem("hc_products", products);
    return newProduct;
  }

  async updateProduct(id: string, productUpdates: Partial<Product>): Promise<Product> {
    await delay();
    const products = getStorageItem<Product[]>("hc_products", SEED_PRODUCTS);
    const index = products.findIndex((p) => p.id === id);
    if (index === -1) throw new Error("Product not found");

    const updatedProduct = { ...products[index], ...productUpdates };
    products[index] = updatedProduct;
    setStorageItem("hc_products", products);
    return updatedProduct;
  }
}

export class MockOrderRepository implements IOrderRepository {
  private getOrders(): Order[] {
    return getStorageItem<Order[]>("hc_orders", []);
  }

  private getOrderItems(): OrderItem[] {
    return getStorageItem<OrderItem[]>("hc_order_items", []);
  }

  async createOrder(
    orderData: Omit<Order, "id" | "createdAt" | "status">,
    itemsData: Omit<OrderItem, "id" | "orderId">[]
  ): Promise<Order> {
    await delay();
    const orders = this.getOrders();
    const orderItems = this.getOrderItems();

    const orderId = "ord-" + Math.floor(100000 + Math.random() * 900000);
    const newOrder: Order = {
      ...orderData,
      id: orderId,
      status: "preparing",
      createdAt: new Date().toISOString(),
    };

    const newItems: OrderItem[] = itemsData.map((item) => {
      // Find corresponding product for convenience details
      const products = getStorageItem<Product[]>("hc_products", SEED_PRODUCTS);
      const prodDetails = products.find((p) => p.id === item.productId);

      return {
        id: "item-" + Math.floor(1000 + Math.random() * 9000),
        orderId,
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,
        productName: prodDetails?.name,
        productEmoji: prodDetails?.emoji,
        productUnit: prodDetails?.unit,
      };
    });

    // Deduct stock
    const products = getStorageItem<Product[]>("hc_products", SEED_PRODUCTS);
    itemsData.forEach((item) => {
      const idx = products.findIndex((p) => p.id === item.productId);
      if (idx !== -1) {
        products[idx].stock = Math.max(0, products[idx].stock - item.quantity);
      }
    });
    setStorageItem("hc_products", products);

    orders.push(newOrder);
    orderItems.push(...newItems);

    setStorageItem("hc_orders", orders);
    setStorageItem("hc_order_items", orderItems);

    return newOrder;
  }

  async getOrdersByCustomerId(customerId: string): Promise<Order[]> {
    await delay();
    const orders = this.getOrders();
    return orders
      .filter((o) => o.customerId === customerId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getOrderDetails(orderId: string): Promise<{ order: Order; items: OrderItem[] } | null> {
    await delay(300);
    const orders = this.getOrders();
    const items = this.getOrderItems();

    const order = orders.find((o) => o.id === orderId);
    if (!order) return null;

    const filteredItems = items.filter((item) => item.orderId === orderId);
    return { order, items: filteredItems };
  }

  async getAllOrders(): Promise<Order[]> {
    await delay();
    return this.getOrders().sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async updateOrderStatus(orderId: string, status: OrderStatus): Promise<Order> {
    await delay();
    const orders = this.getOrders();
    const index = orders.findIndex((o) => o.id === orderId);
    if (index === -1) throw new Error("Order not found");

    orders[index].status = status;
    setStorageItem("hc_orders", orders);
    return orders[index];
  }
}

export class MockCustomRequestRepository implements ICustomRequestRepository {
  private getRequests(): CustomRequest[] {
    return getStorageItem<CustomRequest[]>("hc_custom_requests", []);
  }

  async createRequest(customerId: string, requestText: string): Promise<CustomRequest> {
    await delay();
    const requests = this.getRequests();
    const newRequest: CustomRequest = {
      id: "req-" + Math.floor(1000 + Math.random() * 9000),
      customerId,
      requestText,
      estimatedPrice: null,
      status: "pending",
      createdAt: new Date().toISOString(),
    };
    requests.push(newRequest);
    setStorageItem("hc_custom_requests", requests);
    return newRequest;
  }

  async getRequestsByCustomerId(customerId: string): Promise<CustomRequest[]> {
    await delay();
    const requests = this.getRequests();
    return requests
      .filter((r) => r.customerId === customerId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getAllRequests(): Promise<CustomRequest[]> {
    await delay();
    return this.getRequests().sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async updateRequestStatus(
    requestId: string,
    status: CustomRequestStatus,
    estimatedPrice?: number | null
  ): Promise<CustomRequest> {
    await delay();
    const requests = this.getRequests();
    const index = requests.findIndex((r) => r.id === requestId);
    if (index === -1) throw new Error("Request not found");

    requests[index].status = status;
    if (estimatedPrice !== undefined) {
      requests[index].estimatedPrice = estimatedPrice;
    }

    setStorageItem("hc_custom_requests", requests);
    return requests[index];
  }
}

export class MockDeliverySettingsRepository implements IDeliverySettingsRepository {
  async getSettings(): Promise<DeliverySettings> {
    await delay(200);
    return getStorageItem("hc_delivery_settings", SEED_SETTINGS);
  }

  async updateSettings(settingsUpdates: Partial<DeliverySettings>): Promise<DeliverySettings> {
    await delay();
    const current = getStorageItem("hc_delivery_settings", SEED_SETTINGS);
    const updated = {
      ...current,
      ...settingsUpdates,
      updatedAt: new Date().toISOString(),
    };
    setStorageItem("hc_delivery_settings", updated);
    return updated;
  }
}
