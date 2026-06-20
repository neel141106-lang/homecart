"use client";

import React, { useState } from "react";
import { MobileFrame } from "@/components/MobileFrame";
import { SearchBar } from "@/components/SearchBar";
import { OfferBanner } from "@/components/OfferBanner";
import { CategoryCard } from "@/components/CategoryCard";
import { ProductCard, Product } from "@/components/ProductCard";
import { PaymentOption } from "@/components/PaymentOption";
import { OrderSummary } from "@/components/OrderSummary";
import { BottomNav } from "@/components/BottomNav";
import {
  MapPinIcon,
  ArrowLeftIcon,
  FilterIcon,
  ShieldCheckIcon,
  WalletIcon,
  BanknoteIcon,
  CreditCardIcon,
  SmartphoneIcon,
  ChevronRightIcon,
  CartIcon,
} from "@/components/Icons";

// 1. Dummy Products
const DUMMY_PRODUCTS: Product[] = [
  {
    id: "p1",
    name: "Amul Butter",
    category: "Dairy & Breakfast",
    price: 58,
    isOrganic: false,
    isEssential: true,
    stock: 15,
    emoji: "🧈",
    unit: "100g",
  },
  {
    id: "p2",
    name: "Alphonso Mangoes (Devgad)",
    category: "Fruits & Vegetables",
    price: 299,
    isOrganic: true,
    isEssential: false,
    stock: 5, // Low stock to trigger badge
    emoji: "🥭",
    unit: "6 pcs",
  },
  {
    id: "p3",
    name: "Fresh Coriander Bundle",
    category: "Fruits & Vegetables",
    price: 15,
    isOrganic: true,
    isEssential: true,
    stock: 20,
    emoji: "🌿",
    unit: "1 bundle",
  },
  {
    id: "p4",
    name: "Robusta Bananas",
    category: "Fruits & Vegetables",
    price: 45,
    isOrganic: false,
    isEssential: true,
    stock: 25,
    emoji: "🍌",
    unit: "1 doz",
  },
  {
    id: "p5",
    name: "Royal Gala Apples",
    category: "Fruits & Vegetables",
    price: 120,
    isOrganic: true,
    isEssential: false,
    stock: 8, // Low stock
    emoji: "🍎",
    unit: "4 pcs",
  },
  {
    id: "p6",
    name: "Premium Basmati Rice",
    category: "Atta & Rice",
    price: 149,
    isOrganic: false,
    isEssential: true,
    stock: 30,
    emoji: "🌾",
    unit: "1kg",
  },
  {
    id: "p7",
    name: "Organic Tur Dal",
    category: "Dal & Pulses",
    price: 95,
    isOrganic: true,
    isEssential: true,
    stock: 18,
    emoji: "🥣",
    unit: "500g",
  },
  {
    id: "p8",
    name: "Organic Whole Milk",
    category: "Dairy & Breakfast",
    price: 66,
    isOrganic: false,
    isEssential: true,
    stock: 40,
    emoji: "🥛",
    unit: "1L",
  },
];

// 2. Categories setup
const CATEGORIES = [
  { name: "Atta & Rice", icon: "🌾", color: "bg-amber-50", border: "border-amber-100/60" },
  { name: "Dal & Pulses", icon: "🥣", color: "bg-orange-50", border: "border-orange-100/60" },
  { name: "Dairy & Breakfast", icon: "🥛", color: "bg-blue-50", border: "border-blue-100/60" },
  { name: "Fruits & Vegetables", icon: "🥭", color: "bg-emerald-50", border: "border-emerald-100/60" },
  { name: "Snacks", icon: "🍿", color: "bg-purple-50", border: "border-purple-100/60" },
  { name: "Household", icon: "🧼", color: "bg-teal-50", border: "border-teal-100/60" },
];

interface PlacedOrder {
  orderId: string;
  items: { product: Product; quantity: number }[];
  deliveryAddress: string;
  paymentMethod: string;
  total: number;
  date: string;
  status: "Delivered" | "Preparing" | "Dispatched";
}

export default function Home() {
  // Navigation & Screen States
  const [activeTab, setActiveTab] = useState<string>("home"); // 'home' | 'search' | 'cart' | 'orders' | 'profile'
  const [activeScreen, setActiveScreen] = useState<string>("home"); // 'home' | 'products' | 'checkout' | 'success'

  // Cart State (map of ID to quantity)
  const [cart, setCart] = useState<{ [id: string]: number }>({});
  
  // Search & Filtering States
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [filterChips, setFilterChips] = useState<string>("all"); // 'all' | 'organic' | 'essential' | 'price-low'

  // Checkout Form State
  const [address, setAddress] = useState({
    tower: "",
    floor: "",
    flat: "",
  });
  const [addressErrors, setAddressErrors] = useState({
    tower: false,
    floor: false,
    flat: false,
  });
  const [paymentMethod, setPaymentMethod] = useState("upi"); // 'upi' | 'cod' | 'credits' | 'card'

  // Order history
  const [placedOrders, setPlacedOrders] = useState<PlacedOrder[]>([]);
  const [lastPlacedOrderId, setLastPlacedOrderId] = useState<string>("");

  // Helper Cart Computations
  const cartItemsList = Object.keys(cart)
    .filter((id) => cart[id] > 0)
    .map((id) => {
      const product = DUMMY_PRODUCTS.find((p) => p.id === id)!;
      return { product, quantity: cart[id] };
    });

  const cartItemCount = cartItemsList.reduce((sum, item) => sum + item.quantity, 0);

  const cartSubtotal = cartItemsList.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  // Cart modifications
  const handleAddToCart = (productId: string) => {
    const product = DUMMY_PRODUCTS.find((p) => p.id === productId)!;
    setCart((prev) => {
      const currentQty = prev[productId] || 0;
      if (currentQty < product.stock) {
        return { ...prev, [productId]: currentQty + 1 };
      }
      return prev;
    });
  };

  const handleRemoveFromCart = (productId: string) => {
    setCart((prev) => {
      const currentQty = prev[productId] || 0;
      if (currentQty > 1) {
        return { ...prev, [productId]: currentQty - 1 };
      }
      const newCart = { ...prev };
      delete newCart[productId];
      return newCart;
    });
  };

  // Switch tabs & reset intermediate screens
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    if (tab === "home") {
      setActiveScreen("home");
    } else if (tab === "search") {
      setActiveScreen("products");
      setSelectedCategory(null);
      setSearchQuery("");
    } else if (tab === "cart") {
      if (cartItemCount > 0) {
        setActiveScreen("checkout");
      } else {
        // stay on cart empty tab
        setActiveScreen("cart-tab");
      }
    } else if (tab === "orders") {
      setActiveScreen("orders-tab");
    } else if (tab === "profile") {
      setActiveScreen("profile-tab");
    }
  };

  // Navigate to Category listing
  const handleCategoryClick = (categoryName: string) => {
    setSelectedCategory(categoryName);
    setSearchQuery("");
    setActiveTab("search");
    setActiveScreen("products");
  };

  // Filtering products
  const getFilteredProducts = () => {
    let list = [...DUMMY_PRODUCTS];

    if (selectedCategory) {
      list = list.filter((p) => p.category === selectedCategory);
    }

    if (searchQuery.trim()) {
      list = list.filter((p) =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (filterChips === "organic") {
      list = list.filter((p) => p.isOrganic);
    } else if (filterChips === "essential") {
      list = list.filter((p) => p.isEssential);
    } else if (filterChips === "price-low") {
      list = list.sort((a, b) => a.price - b.price);
    }

    return list;
  };

  const filteredProducts = getFilteredProducts();

  // Address validation
  const validateForm = () => {
    const errors = {
      tower: !address.tower.trim(),
      floor: !address.floor.trim(),
      flat: !address.flat.trim(),
    };
    setAddressErrors(errors);
    return !errors.tower && !errors.floor && !errors.flat;
  };

  // Submit checkout
  const handlePlaceOrder = () => {
    if (!validateForm()) return;

    const orderId = "HC-" + Math.floor(100000 + Math.random() * 900000);
    const dateStr = new Date().toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });

    const handlingFee = 15;
    const finalTotal = cartSubtotal + handlingFee;

    const newOrder: PlacedOrder = {
      orderId,
      items: [...cartItemsList],
      deliveryAddress: `Tower ${address.tower.toUpperCase()}, Floor ${address.floor}, Flat ${address.flat}`,
      paymentMethod: paymentMethod.toUpperCase(),
      total: finalTotal,
      date: dateStr,
      status: "Preparing",
    };

    setPlacedOrders((prev) => [newOrder, ...prev]);
    setLastPlacedOrderId(orderId);
    setActiveScreen("success");
    // Clear cart
    setCart({});
  };

  return (
    <MobileFrame>
      {/* Scrollable Container (Dynamic Header / Content View) */}
      <div className="flex-1 flex flex-col bg-[#FDFBF7] overflow-y-auto no-scrollbar pb-16">
        
        {/* ======================================================== */}
        {/* HOME SCREEN */}
        {/* ======================================================== */}
        {activeScreen === "home" && (
          <div className="flex flex-col px-4 py-4 gap-5">
            {/* Header: Namaste Resident & Location */}
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <h1 className="text-xl font-black text-stone-900 tracking-tight flex items-center gap-1.5">
                  Namaste, <span className="text-emerald-700">Resident</span>
                </h1>
                {/* Location indicator */}
                <div className="flex items-center gap-1 text-xs text-stone-500 font-bold mt-1 cursor-pointer hover:text-emerald-600 transition-colors">
                  <MapPinIcon size={14} className="text-emerald-600 animate-pulse" />
                  <span>Tower B • Prestige Golfshire</span>
                  <ChevronRightIcon size={12} className="text-stone-400" />
                </div>
              </div>
              
              {/* Shopping Cart Mini Badge */}
              {cartItemCount > 0 && (
                <button
                  onClick={() => handleTabChange("cart")}
                  className="relative w-10 h-10 bg-emerald-50 rounded-2xl flex items-center justify-center border border-emerald-100 text-emerald-700 shadow-3xs cursor-pointer active:scale-95 transition-all"
                >
                  <CartIcon size={18} />
                  <span className="absolute -top-1 -right-1 bg-emerald-600 text-white text-[9px] font-black h-4 px-1.5 rounded-full flex items-center justify-center border border-white">
                    {cartItemCount}
                  </span>
                </button>
              )}
            </div>

            {/* Search Bar Component */}
            <SearchBar
              value={searchQuery}
              onChange={(val) => {
                setSearchQuery(val);
                setActiveTab("search");
                setActiveScreen("products");
              }}
            />

            {/* Offer Banner */}
            <OfferBanner />

            {/* Category Grid Section */}
            <div className="flex flex-col gap-3">
              <div className="flex justify-between items-center px-0.5">
                <h3 className="text-sm font-extrabold text-stone-850 tracking-tight uppercase">
                  Shop by Category
                </h3>
              </div>
              
              <div className="grid grid-cols-3 gap-y-4 gap-x-3 bg-white border border-stone-150 rounded-3xl p-4 shadow-3xs">
                {CATEGORIES.map((cat) => (
                  <CategoryCard
                    key={cat.name}
                    name={cat.name}
                    icon={cat.icon}
                    color={cat.color}
                    borderColor={cat.border}
                    onClick={() => handleCategoryClick(cat.name)}
                  />
                ))}
              </div>
            </div>

            {/* Popular In Your Building */}
            <div className="flex flex-col gap-3">
              <div className="flex justify-between items-center px-0.5">
                <h3 className="text-sm font-extrabold text-stone-850 tracking-tight uppercase flex items-center gap-1.5">
                  Popular In Your Building
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-600"></span>
                </h3>
                <span 
                  onClick={() => handleCategoryClick("Fruits & Vegetables")}
                  className="text-xs font-bold text-emerald-600 hover:text-emerald-700 cursor-pointer hover:underline"
                >
                  See All
                </span>
              </div>
              
              <div className="flex gap-3.5 overflow-x-auto no-scrollbar py-1">
                {DUMMY_PRODUCTS.slice(0, 4).map((product) => (
                  <div key={product.id} className="w-[156px] shrink-0">
                    <ProductCard
                      product={product}
                      quantity={cart[product.id] || 0}
                      onAdd={() => handleAddToCart(product.id)}
                      onRemove={() => handleRemoveFromCart(product.id)}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Frequently Ordered */}
            <div className="flex flex-col gap-3">
              <div className="flex justify-between items-center px-0.5">
                <h3 className="text-sm font-extrabold text-stone-850 tracking-tight uppercase flex items-center gap-1.5">
                  Frequently Ordered
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-500"></span>
                </h3>
              </div>
              
              <div className="flex gap-3.5 overflow-x-auto no-scrollbar py-1 mb-2">
                {DUMMY_PRODUCTS.slice(4, 8).map((product) => (
                  <div key={product.id} className="w-[156px] shrink-0">
                    <ProductCard
                      product={product}
                      quantity={cart[product.id] || 0}
                      onAdd={() => handleAddToCart(product.id)}
                      onRemove={() => handleRemoveFromCart(product.id)}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* PRODUCT LISTING SCREEN (Search / Category view) */}
        {/* ======================================================== */}
        {activeScreen === "products" && (
          <div className="flex flex-col py-4 gap-4">
            
            {/* Header: Good Morning, Resident & Back link */}
            <div className="flex items-center justify-between px-4">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    setActiveScreen("home");
                    setActiveTab("home");
                  }}
                  className="w-9 h-9 border border-stone-200 rounded-xl flex items-center justify-center text-stone-600 bg-white shadow-3xs cursor-pointer active:scale-95 transition-all"
                >
                  <ArrowLeftIcon size={18} />
                </button>
                <div className="flex flex-col">
                  <h2 className="text-sm font-extrabold text-stone-900 leading-tight">
                    {selectedCategory ? selectedCategory : "Search Results"}
                  </h2>
                  <span className="text-[10px] text-stone-400 font-semibold tracking-tight">
                    Good morning, Resident
                  </span>
                </div>
              </div>

              {cartItemCount > 0 && (
                <button
                  onClick={() => handleTabChange("cart")}
                  className="relative w-9 h-9 bg-emerald-50 rounded-xl flex items-center justify-center border border-emerald-100 text-emerald-700 shadow-3xs cursor-pointer active:scale-95 transition-all"
                >
                  <CartIcon size={16} />
                  <span className="absolute -top-1 -right-1 bg-emerald-600 text-white text-[9px] font-black h-4 px-1 rounded-full flex items-center justify-center border border-white">
                    {cartItemCount}
                  </span>
                </button>
              )}
            </div>

            {/* Search Input on Product Page */}
            <div className="px-4">
              <SearchBar
                value={searchQuery}
                onChange={(val) => {
                  setSearchQuery(val);
                  if (selectedCategory) setSelectedCategory(null);
                }}
                placeholder={selectedCategory ? `Search in ${selectedCategory}...` : "Search fresh groceries..."}
              />
            </div>

            {/* Fresh Daily Picks Banner */}
            <div className="px-4 select-none">
              <div className="bg-gradient-to-r from-emerald-600 to-emerald-800 text-white p-3 rounded-2xl flex items-center justify-between border border-emerald-600 shadow-xs relative overflow-hidden">
                {/* Abstract shape */}
                <div className="absolute right-0 bottom-0 top-0 w-1/4 opacity-10 pointer-events-none">
                  <svg className="w-full h-full text-white" viewBox="0 0 100 100" fill="currentColor">
                    <circle cx="80" cy="50" r="40" />
                  </svg>
                </div>

                <div>
                  <span className="text-[8px] font-extrabold bg-white/20 text-emerald-100 px-2 py-0.5 rounded-full uppercase tracking-wider">
                    Fresh Daily Picks
                  </span>
                  <h4 className="text-xs font-bold mt-1.5 tracking-tight">
                    Prestige Resident Group Deals Active
                  </h4>
                  <p className="text-[9px] text-emerald-100/90 font-medium">
                    Up to 25% off on breakfast essentials
                  </p>
                </div>
                <span className="text-xl filter drop-shadow-sm animate-pulse">🥭</span>
              </div>
            </div>

            {/* Filter Chips Bar */}
            <div className="flex gap-2 items-center overflow-x-auto no-scrollbar px-4 py-1">
              <div className="text-stone-400 text-xs mr-1">
                <FilterIcon size={14} />
              </div>
              {[
                { label: "All", id: "all" },
                { label: "Organic", id: "organic" },
                { label: "Essential", id: "essential" },
                { label: "Price: Low to High", id: "price-low" },
              ].map((chip) => {
                const isSelected = filterChips === chip.id;
                return (
                  <button
                    key={chip.id}
                    onClick={() => setFilterChips(chip.id)}
                    className={`text-xs px-3.5 py-1.5 rounded-full border shrink-0 font-bold transition-all duration-200 cursor-pointer ${
                      isSelected
                        ? "bg-emerald-600 text-white border-emerald-600 shadow-3xs"
                        : "bg-white text-stone-600 border-stone-200 hover:border-stone-300"
                    }`}
                  >
                    {chip.label}
                  </button>
                );
              })}
            </div>

            {/* Product Card 2-Column Grid */}
            <div className="px-4">
              {filteredProducts.length > 0 ? (
                <div className="grid grid-cols-2 gap-3.5 pb-8">
                  {filteredProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      quantity={cart[product.id] || 0}
                      onAdd={() => handleAddToCart(product.id)}
                      onRemove={() => handleRemoveFromCart(product.id)}
                    />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center px-4 bg-white border border-stone-150 rounded-3xl mt-2">
                  <span className="text-4xl mb-3">🔍</span>
                  <h4 className="text-sm font-bold text-stone-800">No products found</h4>
                  <p className="text-xs text-stone-400 mt-1 max-w-[200px]">
                    Try adjusting your filters or search keywords
                  </p>
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      setSelectedCategory(null);
                      setFilterChips("all");
                    }}
                    className="mt-4 px-4 py-2 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-xl border border-emerald-100 hover:bg-emerald-100 cursor-pointer transition-colors"
                  >
                    Reset Filters
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* CHECKOUT SCREEN */}
        {/* ======================================================== */}
        {activeScreen === "checkout" && (
          <div className="flex flex-col py-4 gap-5">
            {/* Header: Checkout & Back */}
            <div className="flex items-center gap-3 px-4">
              <button
                onClick={() => {
                  // If we came from home tab, go back there, otherwise stay in checkout or go to product listing
                  setActiveScreen("home");
                  setActiveTab("home");
                }}
                className="w-9 h-9 border border-stone-200 rounded-xl flex items-center justify-center text-stone-600 bg-white shadow-3xs cursor-pointer active:scale-95 transition-all"
              >
                <ArrowLeftIcon size={18} />
              </button>
              <h2 className="text-sm font-extrabold text-stone-900 uppercase tracking-tight">
                Secure Checkout
              </h2>
            </div>

            {/* Delivery Location Section */}
            <div className="px-4">
              <div className="bg-white border border-stone-150 rounded-3xl p-5 shadow-xs flex flex-col gap-4">
                <div className="flex items-center gap-2 pb-2.5 border-b border-stone-100">
                  <MapPinIcon size={18} className="text-emerald-600" />
                  <h4 className="text-sm font-bold text-stone-850 tracking-tight">
                    Delivery Address (Prestige Golfshire)
                  </h4>
                </div>

                <div className="grid grid-cols-1 gap-3.5">
                  {/* Tower/Wing field */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-stone-500">
                      Tower / Wing
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Tower B, Block A"
                      value={address.tower}
                      onChange={(e) => {
                        setAddress({ ...address, tower: e.target.value });
                        setAddressErrors({ ...addressErrors, tower: false });
                      }}
                      className={`h-11 px-4 bg-stone-50 border rounded-xl text-xs font-medium focus:outline-none transition-all ${
                        addressErrors.tower
                          ? "border-rose-500 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 bg-rose-50/10"
                          : "border-stone-200 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
                      }`}
                    />
                    {addressErrors.tower && (
                      <span className="text-[10px] text-rose-500 font-semibold pl-1">
                        Tower/Wing number is required
                      </span>
                    )}
                  </div>

                  {/* Floor and Flat fields in 2 columns */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-stone-500">
                        Floor Number
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 14"
                        value={address.floor}
                        onChange={(e) => {
                          setAddress({ ...address, floor: e.target.value });
                          setAddressErrors({ ...addressErrors, floor: false });
                        }}
                        className={`h-11 px-4 bg-stone-50 border rounded-xl text-xs font-medium focus:outline-none transition-all ${
                          addressErrors.floor
                            ? "border-rose-500 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 bg-rose-50/10"
                            : "border-stone-200 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
                        }`}
                      />
                      {addressErrors.floor && (
                        <span className="text-[10px] text-rose-500 font-semibold pl-1">
                          Required
                        </span>
                      )}
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-stone-500">
                        Flat / Apartment
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 1405"
                        value={address.flat}
                        onChange={(e) => {
                          setAddress({ ...address, flat: e.target.value });
                          setAddressErrors({ ...addressErrors, flat: false });
                        }}
                        className={`h-11 px-4 bg-stone-50 border rounded-xl text-xs font-medium focus:outline-none transition-all ${
                          addressErrors.flat
                            ? "border-rose-500 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 bg-rose-50/10"
                            : "border-stone-200 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
                        }`}
                      />
                      {addressErrors.flat && (
                        <span className="text-[10px] text-rose-500 font-semibold pl-1">
                          Required
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Methods Section */}
            <div className="px-4">
              <div className="flex flex-col gap-3">
                <h4 className="text-xs font-extrabold text-stone-850 uppercase tracking-tight pl-1">
                  Payment Method
                </h4>
                
                <div className="flex flex-col gap-3">
                  <PaymentOption
                    id="upi"
                    title="UPI"
                    subtitle="Instant via PhonePe, GPay, or Paytm"
                    icon={<SmartphoneIcon size={20} />}
                    selected={paymentMethod === "upi"}
                    onClick={() => setPaymentMethod("upi")}
                  />
                  <PaymentOption
                    id="cod"
                    title="Cash on Delivery"
                    subtitle="Pay in cash or UPI at the doorstep"
                    icon={<BanknoteIcon size={20} />}
                    selected={paymentMethod === "cod"}
                    onClick={() => setPaymentMethod("cod")}
                  />
                  <PaymentOption
                    id="credits"
                    title="Resident Credits"
                    subtitle="₹420 available on your account"
                    icon={<WalletIcon size={20} />}
                    selected={paymentMethod === "credits"}
                    onClick={() => setPaymentMethod("credits")}
                  />
                  <PaymentOption
                    id="card"
                    title="Debit / Credit Card"
                    subtitle="Visa, Mastercard, RuPay cards"
                    icon={<CreditCardIcon size={20} />}
                    selected={paymentMethod === "card"}
                    onClick={() => setPaymentMethod("card")}
                  />
                </div>
              </div>
            </div>

            {/* Order Summary Component */}
            <div className="px-4 pb-8">
              <OrderSummary cartItems={cartItemsList} />
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* SUCCESS STATE SCREEN */}
        {/* ======================================================== */}
        {activeScreen === "success" && (
          <div className="flex flex-col items-center justify-center py-16 px-6 text-center gap-6">
            
            {/* Animated Checkmark Shield */}
            <div className="w-20 h-20 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shadow-md">
              <ShieldCheckIcon size={44} className="animate-soft-bounce" />
            </div>

            {/* Title / Celebration */}
            <div>
              <span className="text-[10px] font-extrabold bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full uppercase tracking-wider border border-emerald-100">
                Order Placed Successfully
              </span>
              <h2 className="text-2xl font-black text-stone-900 mt-4 tracking-tight">
                Delivery in 10 Minutes!
              </h2>
              <p className="text-xs text-stone-500 font-medium mt-1 max-w-[260px] mx-auto leading-relaxed">
                Your order <span className="font-bold text-stone-750">{lastPlacedOrderId}</span> is being packed at your building's micro-warehouse.
              </p>
            </div>

            {/* Quick stats / Delivery details card */}
            <div className="w-full bg-white border border-stone-150 rounded-3xl p-4 text-left shadow-2xs flex flex-col gap-3">
              <div className="flex justify-between items-center text-xs border-b border-stone-100 pb-2.5">
                <span className="text-stone-400 font-semibold">Delivery To</span>
                <span className="font-bold text-stone-800">
                  Tower {address.tower.toUpperCase()}, Flat {address.flat}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs border-b border-stone-100 pb-2.5">
                <span className="text-stone-400 font-semibold">Payment</span>
                <span className="font-bold text-stone-850 uppercase">
                  {paymentMethod}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs pt-0.5">
                <span className="text-stone-400 font-semibold">Delivery Fee Benefit</span>
                <span className="font-bold text-emerald-600">Saved ₹30 (Resident rate)</span>
              </div>
            </div>

            {/* Call to Actions */}
            <div className="flex flex-col w-full gap-3 mt-4">
              <button
                onClick={() => handleTabChange("orders")}
                className="w-full h-12 bg-stone-900 hover:bg-stone-950 text-white font-bold text-sm rounded-2xl cursor-pointer active:scale-98 transition-all flex items-center justify-center"
              >
                Track Order Status
              </button>
              <button
                onClick={() => handleTabChange("home")}
                className="w-full h-12 bg-white hover:bg-stone-50 text-stone-700 font-bold text-sm rounded-2xl border border-stone-200 cursor-pointer active:scale-98 transition-all flex items-center justify-center"
              >
                Order More Groceries
              </button>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* EMPTY CART TAB */}
        {/* ======================================================== */}
        {activeScreen === "cart-tab" && (
          <div className="flex flex-col items-center justify-center py-24 px-6 text-center gap-4">
            <span className="text-6xl filter drop-shadow-md select-none animate-soft-bounce">🛒</span>
            <div>
              <h3 className="text-base font-extrabold text-stone-850 tracking-tight">Your Cart is Empty</h3>
              <p className="text-xs text-stone-400 mt-1 max-w-[200px] mx-auto leading-relaxed">
                Add premium groceries to your cart and they'll be at your doorstep in minutes.
              </p>
            </div>
            <button
              onClick={() => handleTabChange("home")}
              className="mt-4 px-6 py-3 bg-emerald-600 text-white text-xs font-bold rounded-2xl cursor-pointer hover:bg-emerald-700 transition-colors shadow-xs active:scale-95"
            >
              Start Shopping
            </button>
          </div>
        )}

        {/* ======================================================== */}
        {/* ORDERS TAB */}
        {/* ======================================================== */}
        {activeScreen === "orders-tab" && (
          <div className="flex flex-col py-4 px-4 gap-5">
            <h2 className="text-lg font-black text-stone-900 tracking-tight uppercase border-b border-stone-100 pb-2.5">
              Your Orders
            </h2>
            
            {placedOrders.length > 0 ? (
              <div className="flex flex-col gap-4">
                {placedOrders.map((order) => (
                  <div key={order.orderId} className="bg-white border border-stone-150 rounded-3xl p-4 shadow-3xs flex flex-col gap-3.5">
                    {/* Order header */}
                    <div className="flex justify-between items-start">
                      <div className="flex flex-col">
                        <span className="text-xs font-extrabold text-stone-850 tracking-tight">
                          Order {order.orderId}
                        </span>
                        <span className="text-[10px] text-stone-400 font-semibold mt-0.5">
                          {order.date}
                        </span>
                      </div>
                      
                      {/* Status badge */}
                      <span className="text-[9px] font-extrabold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-100 uppercase tracking-wider flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-ping"></span>
                        {order.status}
                      </span>
                    </div>

                    {/* Order Items Preview */}
                    <div className="flex flex-col gap-1.5 border-t border-stone-100 pt-3">
                      {order.items.map((item) => (
                        <div key={item.product.id} className="flex justify-between text-xs text-stone-600 font-medium">
                          <span>
                            {item.product.emoji} {item.product.name}
                            <span className="text-[10px] text-stone-400 font-semibold ml-2">x{item.quantity}</span>
                          </span>
                          <span className="font-bold text-stone-750">₹{item.product.price * item.quantity}</span>
                        </div>
                      ))}
                    </div>

                    {/* Address preview */}
                    <div className="text-[10px] text-stone-400 bg-stone-50 border border-stone-100/50 p-2 rounded-xl mt-1 leading-relaxed">
                      <span className="font-bold text-stone-600 block mb-0.5">Delivery Address</span>
                      {order.deliveryAddress}
                    </div>

                    {/* Total */}
                    <div className="flex justify-between items-center border-t border-dashed border-stone-150 pt-3 text-xs">
                      <span className="font-bold text-stone-500">Paid via {order.paymentMethod}</span>
                      <span className="text-sm font-extrabold text-stone-850">
                        Total Paid: ₹{order.total}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center px-4 bg-white border border-stone-150 rounded-3xl mt-2 gap-4">
                <span className="text-5xl filter drop-shadow-md select-none">📦</span>
                <div>
                  <h4 className="text-sm font-bold text-stone-800">No orders yet</h4>
                  <p className="text-xs text-stone-400 mt-1 max-w-[200px] mx-auto leading-relaxed">
                    Once you place an order, you can track its delivery status here.
                  </p>
                </div>
                <button
                  onClick={() => handleTabChange("home")}
                  className="px-5 py-2.5 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-xl border border-emerald-100 hover:bg-emerald-100 cursor-pointer transition-colors"
                >
                  Browse Groceries
                </button>
              </div>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* PROFILE TAB */}
        {/* ======================================================== */}
        {activeScreen === "profile-tab" && (
          <div className="flex flex-col py-4 px-4 gap-6">
            <h2 className="text-lg font-black text-stone-900 tracking-tight uppercase border-b border-stone-100 pb-2.5">
              Your Profile
            </h2>

            {/* Profile Detail Header */}
            <div className="bg-white border border-stone-150 rounded-3xl p-5 shadow-3xs flex items-center gap-4 relative overflow-hidden">
              <div className="absolute right-0 top-0 bottom-0 w-1/4 bg-emerald-50/20 rounded-l-full pointer-events-none"></div>
              
              <div className="w-14 h-14 bg-emerald-600 text-white font-black text-xl rounded-2xl flex items-center justify-center shadow-md select-none">
                R
              </div>
              <div className="flex flex-col">
                <h3 className="text-base font-black text-stone-850 tracking-tight">
                  Prestige Resident
                </h3>
                <span className="text-[10px] text-emerald-700 font-extrabold bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full w-fit mt-1.5 uppercase tracking-wider">
                  Gold Resident Club
                </span>
              </div>
            </div>

            {/* Stats list */}
            <div className="flex flex-col gap-3">
              <div className="bg-white border border-stone-150 rounded-3xl p-4 shadow-3xs flex flex-col gap-3.5">
                <div className="flex justify-between items-center text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-base">🏢</span>
                    <span className="font-bold text-stone-700">Building Registry</span>
                  </div>
                  <span className="font-bold text-stone-800">Tower B, Prestige Golfshire</span>
                </div>

                <div className="border-t border-stone-100"></div>

                <div className="flex justify-between items-center text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-base">🪙</span>
                    <span className="font-bold text-stone-700">Resident Credits</span>
                  </div>
                  <span className="font-bold text-emerald-600">₹420 Available</span>
                </div>

                <div className="border-t border-stone-100"></div>

                <div className="flex justify-between items-center text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-base">🛵</span>
                    <span className="font-bold text-stone-700">Delivery Charge Tier</span>
                  </div>
                  <span className="font-extrabold text-emerald-600 bg-emerald-50/50 border border-emerald-100/40 px-2 py-0.5 rounded-md uppercase text-[9px] tracking-wide">
                    Free (Infinite)
                  </span>
                </div>
              </div>
            </div>

            {/* Resident Benefits summary */}
            <div className="bg-gradient-to-br from-stone-900 to-stone-950 text-white rounded-3xl p-5 shadow-md flex flex-col gap-2 relative overflow-hidden select-none">
              <div className="absolute right-0 bottom-0 top-0 w-1/3 opacity-5 pointer-events-none">
                <svg className="w-full h-full text-white" viewBox="0 0 100 100" fill="currentColor">
                  <polygon points="50,0 100,100 0,100" />
                </svg>
              </div>

              <span className="text-[9px] font-extrabold text-amber-400 tracking-widest uppercase">
                Member Benefits
              </span>
              <h4 className="text-sm font-bold mt-1">Prestige Resident Privileges</h4>
              <ul className="text-[11px] text-stone-300 font-medium space-y-2 mt-2">
                <li className="flex items-center gap-2">
                  <span className="text-emerald-500">✔</span> Free delivery with no order minimums.
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-emerald-500">✔</span> Group discount rates for seasonal produce.
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-emerald-500">✔</span> Doorstep drop-off or lobby delivery choices.
                </li>
              </ul>
            </div>
          </div>
        )}

      </div>

      {/* ======================================================== */}
      {/* STICKY BOTTOM CHECKOUT BUTTON (ONLY FOR PRODUCTS / HOME IF CART POPULATED) */}
      {/* ======================================================== */}
      {cartItemCount > 0 && (activeScreen === "home" || activeScreen === "products") && (
        <div className="absolute bottom-16 left-0 right-0 px-4 pb-2 pt-1 z-30 select-none pointer-events-none">
          <button
            onClick={() => {
              setActiveScreen("checkout");
              setActiveTab("cart");
            }}
            className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl flex items-center justify-between px-4 shadow-[0_8px_24px_rgba(5,150,105,0.3)] hover:shadow-[0_8px_24px_rgba(5,150,105,0.45)] cursor-pointer active:scale-98 transition-all duration-300 pointer-events-auto"
          >
            <div className="flex items-center gap-2 text-xs font-bold">
              <span className="bg-emerald-700 text-white h-6 px-2.5 rounded-lg flex items-center justify-center font-extrabold text-[10px] border border-emerald-500/30">
                {cartItemCount} item{cartItemCount > 1 ? "s" : ""}
              </span>
              <span className="tracking-tight text-emerald-100 font-medium">|</span>
              <span className="font-extrabold text-sm tracking-tight">₹{cartSubtotal}</span>
            </div>
            <div className="flex items-center gap-1 text-xs font-extrabold tracking-wider uppercase">
              <span>View Cart</span>
              <ArrowLeftIcon size={14} className="rotate-180" />
            </div>
          </button>
        </div>
      )}

      {/* ======================================================== */}
      {/* STICKY "PLACE ORDER" BUTTON FOR CHECKOUT SCREEN */}
      {/* ======================================================== */}
      {activeScreen === "checkout" && (
        <div className="absolute bottom-16 left-0 right-0 px-4 pb-2 pt-1 z-30 select-none">
          <button
            onClick={handlePlaceOrder}
            className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs tracking-widest uppercase rounded-2xl shadow-[0_8px_24px_rgba(5,150,105,0.35)] hover:shadow-[0_8px_24px_rgba(5,150,105,0.5)] cursor-pointer active:scale-98 transition-all duration-300 flex items-center justify-center gap-1.5"
          >
            <span>Place Order</span>
            <span className="font-bold text-[13px] tracking-tight lowercase">for</span>
            <span className="text-sm font-black tracking-tight">₹{cartSubtotal + 15}</span>
          </button>
        </div>
      )}

      {/* Bottom Sticky Tab Navigation */}
      <BottomNav
        activeTab={activeTab}
        onTabChange={handleTabChange}
        cartItemCount={cartItemCount}
      />
    </MobileFrame>
  );
}
