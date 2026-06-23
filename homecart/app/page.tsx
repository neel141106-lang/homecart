"use client";

import React, { useState, useEffect } from "react";
import { MobileFrame } from "@/components/MobileFrame";
import { SearchBar } from "@/components/SearchBar";
import { OfferBanner } from "@/components/OfferBanner";
import { CategoryCard } from "@/components/CategoryCard";
import { ProductCard } from "@/components/ProductCard";
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

// Zustand Stores
import { useAuthStore, DEMO_PROFILES } from "@/store/useAuthStore";
import { useProductStore } from "@/store/useProductStore";
import { useCartStore } from "@/store/useCartStore";
import { useOrderStore } from "@/store/useOrderStore";
import { useDeliveryStore } from "@/store/useDeliveryStore";
import { PaymentMethod, UserRole, UserProfile, OrderStatus } from "@/types/domain.types";
import { ProfileService } from "@/services";
import { isSupabaseConfigured } from "@/src/lib/supabase/client";

// Category display metadata (colours keyed by category name)
const CATEGORY_META: Record<string, { color: string; border: string }> = {
  "Atta & Rice":           { color: "bg-amber-50",   border: "border-amber-100/60" },
  "Dal & Pulses":          { color: "bg-orange-50",  border: "border-orange-100/60" },
  "Dairy & Breakfast":     { color: "bg-blue-50",    border: "border-blue-100/60" },
  "Fruits & Vegetables":   { color: "bg-emerald-50", border: "border-emerald-100/60" },
  "Snacks":                { color: "bg-purple-50",  border: "border-purple-100/60" },
  "Household":             { color: "bg-teal-50",    border: "border-teal-100/60" },
};

export default function Home() {
  // ── Auth Store ───────────────────────────────────────────
  const {
    profile,
    setDemoRole,
    initAuth,
    signInWithPhone,
    verifyOtp,
    signOut,
    otpSent,
    pendingPhone,
    isLoading: isAuthLoading,
    error: authError,
  } = useAuthStore();

  // ── Product Store ────────────────────────────────────────
  const {
    categories,
    isLoadingProducts,
    isLoadingCategories,
    error: productError,
    loadCategories,
    loadProducts,
    setSelectedCategory: storeSetCategory,
    setSearchQuery: storeSetSearch,
    setFilterChip,
    getFilteredProducts,
    selectedCategoryId,
    searchQuery,
    filterChip,
  } = useProductStore();

  // ── Cart Store ───────────────────────────────────────────
  const {
    items: cartItems,
    addItem,
    removeItem,
    clearCart,
    getQuantity,
    totalItems,
    subtotal,
  } = useCartStore();

  // ── Order Store ──────────────────────────────────────────
  const {
    orders,
    lastPlacedOrder,
    isPlacing,
    loadOrders,
    loadAllOrders,
    updateStatus: updateOrderStatus,
    placeOrder,
    error: orderError,
  } = useOrderStore();

  // ── Delivery Store ───────────────────────────────────────
  const {
    settings: deliverySettings,
    loadSettings,
    updateSettings: updateDeliverySettings,
    calculateFee,
  } = useDeliveryStore();

  // ── Local UI State (navigation & auth form inputs) ────────────────────
  const [activeTab, setActiveTab] = useState<string>("home");
  const [activeScreen, setActiveScreen] = useState<string>("home");
  const [address, setAddress] = useState({ tower: "", floor: "", flat: "" });
  const [addressErrors, setAddressErrors] = useState({ tower: false, floor: false, flat: false });
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("upi");

  // Auth screen inputs
  const [phoneInput, setPhoneInput] = useState("");
  const [otpInput, setOtpInput] = useState("");

  // Profiles cache (for mapping customer names on Admin/Shopkeeper dashboards)
  const [allProfiles, setAllProfiles] = useState<UserProfile[]>([]);

  // Delivery Settings Local Editing state
  const [editFee, setEditFee] = useState<string>("");
  const [editFreeAbove, setEditFreeAbove] = useState<string>("");
  const [editTime, setEditTime] = useState<string>("");
  const [editEnabled, setEditEnabled] = useState<boolean>(true);

  // ── Bootstrap on Mount ───────────────────────────────────
  useEffect(() => {
    const unsubscribe = initAuth();
    loadCategories();
    loadProducts();
    loadSettings();
    return () => unsubscribe();
  }, []);

  // Fetch all profiles for administrative lookup
  useEffect(() => {
    if (profile?.role === "admin" || profile?.role === "shopkeeper") {
      ProfileService.listAll().then((res) => {
        if (res.data) setAllProfiles(res.data);
      });
    }
  }, [profile?.id, profile?.role]);

  // Load orders when profile is available & manage role tabs
  useEffect(() => {
    if (profile) {
      if (profile.role === "customer") {
        loadOrders(profile.id);
      } else {
        loadAllOrders();
      }

      // Check route protection constraints
      if (profile.role === "shopkeeper") {
        if (activeTab !== "orders" && activeTab !== "profile") {
          setActiveTab("orders");
          setActiveScreen("orders-tab");
        }
      } else if (profile.role === "admin") {
        if (activeTab !== "orders" && activeTab !== "settings" && activeTab !== "profile") {
          setActiveTab("orders");
          setActiveScreen("orders-tab");
        }
      }
    }
  }, [profile?.id, profile?.role]);

  // Sync delivery settings updates to local form state
  useEffect(() => {
    if (deliverySettings) {
      setEditFee(deliverySettings.deliveryFee.toString());
      setEditFreeAbove(deliverySettings.freeDeliveryAbove.toString());
      setEditTime(deliverySettings.deliveryTime);
      setEditEnabled(deliverySettings.isDeliveryEnabled);
    }
  }, [deliverySettings]);

  // ── Derived values ───────────────────────────────────────
  const filteredProducts = getFilteredProducts();
  const cartItemCount = totalItems();
  const cartSubtotal = subtotal();
  const deliveryFee = calculateFee(cartSubtotal);
  const cartItemsList = cartItems;

  // ── Handlers ─────────────────────────────────────────────
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    if (tab === "home") {
      setActiveScreen("home");
    } else if (tab === "search") {
      setActiveScreen("products");
      storeSetCategory(null);
      storeSetSearch("");
    } else if (tab === "cart") {
      setActiveScreen(cartItemCount > 0 ? "checkout" : "cart-tab");
    } else if (tab === "orders") {
      setActiveScreen("orders-tab");
    } else if (tab === "settings") {
      setActiveScreen("admin-settings");
    } else if (tab === "profile") {
      setActiveScreen("profile-tab");
    }
  };

  const handleCategoryClick = (categoryName: string) => {
    // Find matching category id
    const cat = categories.find((c) => c.name === categoryName);
    storeSetCategory(cat?.id ?? null);
    loadProducts(cat?.id ?? null);
    setActiveTab("search");
    setActiveScreen("products");
  };

  const validateForm = () => {
    const errors = {
      tower: !address.tower.trim(),
      floor: !address.floor.trim(),
      flat: !address.flat.trim(),
    };
    setAddressErrors(errors);
    return !errors.tower && !errors.floor && !errors.flat;
  };

  const handlePlaceOrder = async () => {
    if (!validateForm() || !profile) return;
    const order = await placeOrder({
      customerId: profile.id,
      cartItems,
      paymentMethod,
      deliveryAddress: address,
      settings: deliverySettings,
    });
    if (order) {
      clearCart();
      setActiveScreen("success");
    }
  };

  // ── Loading Skeleton ─────────────────────────────────────
  const ProductSkeleton = () => (
    <div className="grid grid-cols-2 gap-3.5">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="bg-white border border-stone-100 rounded-3xl p-3 h-52 animate-pulse">
          <div className="h-28 bg-stone-100 rounded-2xl mb-3" />
          <div className="h-3 bg-stone-100 rounded-full w-1/2 mb-2" />
          <div className="h-4 bg-stone-100 rounded-full w-3/4" />
        </div>
      ))}
    </div>
  );

  const CategorySkeleton = () => (
    <div className="grid grid-cols-3 gap-y-4 gap-x-3 p-4">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="flex flex-col items-center gap-2 animate-pulse">
          <div className="w-16 h-16 rounded-2xl bg-stone-100" />
          <div className="h-2.5 w-12 bg-stone-100 rounded-full" />
        </div>
      ))}
    </div>
  );

  // ── Error Banner ─────────────────────────────────────────
  const ErrorBanner = ({ message, onRetry }: { message: string; onRetry?: () => void }) => (
    <div className="mx-4 my-2 bg-rose-50 border border-rose-200 rounded-2xl p-3 flex items-center justify-between gap-2">
  // ── Auth Loading Screen ──────────────────────────────────
  if (isAuthLoading && !profile) {
    return (
      <MobileFrame>
        <div className="flex-1 flex flex-col items-center justify-center bg-[#FDFBF7] p-6 text-center">
          <div className="w-10 h-10 border-4 border-emerald-600/30 border-t-emerald-600 rounded-full animate-spin mb-4" />
          <p className="text-xs font-bold text-stone-500">Checking your resident session...</p>
        </div>
      </MobileFrame>
    );
  }

  // ── Login Screen ─────────────────────────────────────────
  if (!profile) {
    return (
      <MobileFrame>
        <div className="flex-1 flex flex-col bg-[#FDFBF7] p-6 justify-between select-none">
          <div className="flex flex-col gap-6 mt-8">
            {/* Logo & Header */}
            <div className="text-center flex flex-col items-center">
              <span className="text-5xl filter drop-shadow-md mb-4 select-none animate-soft-bounce">🏡🛒</span>
              <h2 className="text-2xl font-black text-stone-900 tracking-tight">HomeCart Authentication</h2>
              <p className="text-xs text-stone-500 font-semibold mt-1">Exclusive micro-delivery for Prestige Residents</p>
            </div>

            {authError && <ErrorBanner message={authError} />}

            {!otpSent ? (
              /* Phone Input Screen */
              <div className="bg-white border border-stone-150 rounded-3xl p-5 shadow-xs flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-stone-500">Enter Phone Number</label>
                  <div className="relative flex items-center">
                    <span className="absolute left-4 text-xs font-bold text-stone-400">+91</span>
                    <input
                      type="tel"
                      maxLength={10}
                      placeholder="98765 43210"
                      value={phoneInput}
                      onChange={(e) => setPhoneInput(e.target.value.replace(/\D/g, ""))}
                      className="w-full h-11 pl-12 pr-4 bg-stone-50 border border-stone-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 transition-all"
                    />
                  </div>
                  <p className="text-[10px] text-stone-400 font-semibold mt-1 leading-relaxed">
                    We will send a one-time OTP code to verify your resident flat association.
                  </p>
                </div>

                <button
                  onClick={async () => {
                    if (phoneInput.length < 10) {
                      useAuthStore.setState({ error: "Please enter a valid 10-digit phone number" });
                      return;
                    }
                    await signInWithPhone(`+91${phoneInput}`);
                  }}
                  className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs tracking-wider uppercase rounded-xl shadow-3xs cursor-pointer active:scale-98 transition-all flex items-center justify-center"
                >
                  Send Verification Code
                </button>
              </div>
            ) : (
              /* OTP Verification Screen */
              <div className="bg-white border border-stone-150 rounded-3xl p-5 shadow-xs flex flex-col gap-4">
                <div className="flex flex-col gap-1.5 text-center">
                  <h4 className="text-xs font-bold text-stone-600">Verification Code Sent</h4>
                  <p className="text-xs text-stone-400 font-semibold">
                    Sent to +91 {pendingPhone?.replace("+91", "")}
                  </p>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-stone-500">Enter 6-Digit OTP</label>
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="123456"
                    value={otpInput}
                    onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ""))}
                    className="w-full h-11 text-center bg-stone-50 border border-stone-200 rounded-xl text-sm font-extrabold tracking-widest focus:outline-none focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 transition-all"
                  />
                  {!isSupabaseConfigured && (
                    <span className="text-[10px] text-amber-600 font-bold text-center mt-1">
                      Demo mode active. Use code <span className="font-extrabold">123456</span> to log in.
                    </span>
                  )}
                </div>

                <button
                  onClick={async () => {
                    if (otpInput.length < 6) {
                      useAuthStore.setState({ error: "Please enter a 6-digit OTP code" });
                      return;
                    }
                    const success = await verifyOtp(otpInput);
                    if (success) {
                      setOtpInput("");
                    }
                  }}
                  className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs tracking-wider uppercase rounded-xl shadow-3xs cursor-pointer active:scale-98 transition-all flex items-center justify-center"
                >
                  Verify & Log In
                </button>

                <button
                  onClick={() => {
                    useAuthStore.setState({ otpSent: false, pendingPhone: null, error: null });
                    setOtpInput("");
                  }}
                  className="text-stone-400 hover:text-stone-600 text-[10px] font-bold text-center underline cursor-pointer"
                >
                  Change Phone Number
                </button>
              </div>
            )}
          </div>

          {/* Quick Demo Login Credentials (if Supabase is not configured) */}
          {!isSupabaseConfigured && (
            <div className="bg-amber-50/60 border border-amber-100/60 rounded-2xl p-3.5 flex flex-col gap-2">
              <span className="text-[10px] font-extrabold text-amber-800 uppercase tracking-wider">Demo Credentials:</span>
              <div className="flex flex-col gap-1 text-[10px] font-bold text-amber-700">
                <div className="flex justify-between">
                  <span>Resident (Customer):</span>
                  <span>98765 43210</span>
                </div>
                <div className="flex justify-between">
                  <span>Store (Shopkeeper):</span>
                  <span>99999 11111</span>
                </div>
                <div className="flex justify-between">
                  <span>HQ (Admin):</span>
                  <span>90000 00000</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </MobileFrame>
    );
  }

  return (
    <MobileFrame>
      <div className="flex-1 flex flex-col bg-[#FDFBF7] overflow-y-auto no-scrollbar pb-16">
        {/* Demo Role Switcher */}
        {!isSupabaseConfigured && <RoleSwitcher />}

        {/* ======================================================== */}
        {/* HOME SCREEN                                               */}
        {/* ======================================================== */}
        {activeScreen === "home" && profile.role === "customer" && (
          <div className="flex flex-col px-4 py-4 gap-5">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <h1 className="text-xl font-black text-stone-900 tracking-tight flex items-center gap-1.5">
                  Namaste, <span className="text-emerald-700">{profile?.fullName?.split(" ")[0] ?? "Resident"}</span>
                </h1>
                <div className="flex items-center gap-1 text-xs text-stone-500 font-bold mt-1 cursor-pointer hover:text-emerald-600 transition-colors">
                  <MapPinIcon size={14} className="text-emerald-600 animate-pulse" />
                  <span>{profile?.tower ?? "Tower B"} • Prestige Golfshire</span>
                  <ChevronRightIcon size={12} className="text-stone-400" />
                </div>
              </div>
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

            <SearchBar
              value={searchQuery}
              onChange={(val) => {
                storeSetSearch(val);
                loadProducts();
                setActiveTab("search");
                setActiveScreen("products");
              }}
            />

            <OfferBanner />

            {/* Category Grid */}
            <div className="flex flex-col gap-3">
              <h3 className="text-sm font-extrabold text-stone-850 tracking-tight uppercase px-0.5">Shop by Category</h3>
              <div className="bg-white border border-stone-150 rounded-3xl shadow-3xs">
                {isLoadingCategories ? (
                  <CategorySkeleton />
                ) : (
                  <div className="grid grid-cols-3 gap-y-4 gap-x-3 p-4">
                    {categories.map((cat) => {
                      const meta = CATEGORY_META[cat.name] ?? { color: "bg-stone-50", border: "border-stone-100" };
                      return (
                        <CategoryCard
                          key={cat.id}
                          name={cat.name}
                          icon={cat.icon}
                          color={meta.color}
                          borderColor={meta.border}
                          onClick={() => handleCategoryClick(cat.name)}
                        />
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {productError && <ErrorBanner message={productError} onRetry={() => loadProducts()} />}

            {/* Popular in Your Building */}
            <div className="flex flex-col gap-3">
              <div className="flex justify-between items-center px-0.5">
                <h3 className="text-sm font-extrabold text-stone-850 tracking-tight uppercase flex items-center gap-1.5">
                  Popular In Your Building
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-600"></span>
                </h3>
                <span onClick={() => handleCategoryClick("Fruits & Vegetables")} className="text-xs font-bold text-emerald-600 cursor-pointer hover:underline">See All</span>
              </div>
              {isLoadingProducts ? (
                <div className="flex gap-3.5 overflow-x-auto no-scrollbar py-1">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="w-[156px] shrink-0 h-52 bg-white border border-stone-100 rounded-3xl animate-pulse" />
                  ))}
                </div>
              ) : (
                <div className="flex gap-3.5 overflow-x-auto no-scrollbar py-1">
                  {filteredProducts.slice(0, 4).map((product) => (
                    <div key={product.id} className="w-[156px] shrink-0">
                      <ProductCard
                        product={product}
                        quantity={getQuantity(product.id)}
                        onAdd={() => addItem(product)}
                        onRemove={() => removeItem(product.id)}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Frequently Ordered */}
            <div className="flex flex-col gap-3">
              <h3 className="text-sm font-extrabold text-stone-850 tracking-tight uppercase px-0.5 flex items-center gap-1.5">
                Frequently Ordered
                <span className="h-1.5 w-1.5 rounded-full bg-amber-500"></span>
              </h3>
              <div className="flex gap-3.5 overflow-x-auto no-scrollbar py-1 mb-2">
                {filteredProducts.slice(4, 8).map((product) => (
                  <div key={product.id} className="w-[156px] shrink-0">
                    <ProductCard
                      product={product}
                      quantity={getQuantity(product.id)}
                      onAdd={() => addItem(product)}
                      onRemove={() => removeItem(product.id)}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* PRODUCT LISTING SCREEN                                    */}
        {/* ======================================================== */}
        {activeScreen === "products" && profile.role === "customer" && (
          <div className="flex flex-col py-4 gap-4">
            <div className="flex items-center justify-between px-4">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => { setActiveScreen("home"); setActiveTab("home"); }}
                  className="w-9 h-9 border border-stone-200 rounded-xl flex items-center justify-center text-stone-600 bg-white shadow-3xs cursor-pointer active:scale-95 transition-all"
                >
                  <ArrowLeftIcon size={18} />
                </button>
                <div className="flex flex-col">
                  <h2 className="text-sm font-extrabold text-stone-900 leading-tight">
                    {selectedCategoryId
                      ? (categories.find((c) => c.id === selectedCategoryId)?.name ?? "Products")
                      : "Search Results"}
                  </h2>
                  <span className="text-[10px] text-stone-400 font-semibold tracking-tight">Good morning, {profile?.fullName?.split(" ")[0] ?? "Resident"}</span>
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

            <div className="px-4">
              <SearchBar
                value={searchQuery}
                onChange={(val) => { storeSetSearch(val); if (selectedCategoryId) storeSetCategory(null); loadProducts(); }}
                placeholder={selectedCategoryId ? `Search in ${categories.find(c => c.id === selectedCategoryId)?.name ?? ""}...` : "Search fresh groceries..."}
              />
            </div>

            {/* Fresh Daily Picks Banner */}
            <div className="px-4 select-none">
              <div className="bg-gradient-to-r from-emerald-600 to-emerald-800 text-white p-3 rounded-2xl flex items-center justify-between border border-emerald-600 shadow-xs relative overflow-hidden">
                <div className="absolute right-0 bottom-0 top-0 w-1/4 opacity-10 pointer-events-none">
                  <svg className="w-full h-full text-white" viewBox="0 0 100 100" fill="currentColor"><circle cx="80" cy="50" r="40" /></svg>
                </div>
                <div>
                  <span className="text-[8px] font-extrabold bg-white/20 text-emerald-100 px-2 py-0.5 rounded-full uppercase tracking-wider">Fresh Daily Picks</span>
                  <h4 className="text-xs font-bold mt-1.5 tracking-tight">Prestige Resident Group Deals Active</h4>
                  <p className="text-[9px] text-emerald-100/90 font-medium">Up to 25% off on breakfast essentials</p>
                </div>
                <span className="text-xl filter drop-shadow-sm animate-pulse">🥭</span>
              </div>
            </div>

            {/* Filter Chips */}
            <div className="flex gap-2 items-center overflow-x-auto no-scrollbar px-4 py-1">
              <div className="text-stone-400 text-xs mr-1"><FilterIcon size={14} /></div>
              {([
                { label: "All", id: "all" },
                { label: "Organic", id: "organic" },
                { label: "Essential", id: "essential" },
                { label: "Price: Low to High", id: "price-low" },
              ] as const).map((chip) => (
                <button
                  key={chip.id}
                  onClick={() => setFilterChip(chip.id as any)}
                  className={`text-xs px-3.5 py-1.5 rounded-full border shrink-0 font-bold transition-all duration-200 cursor-pointer ${
                    filterChip === chip.id
                      ? "bg-emerald-600 text-white border-emerald-600 shadow-3xs"
                      : "bg-white text-stone-600 border-stone-200 hover:border-stone-300"
                  }`}
                >
                  {chip.label}
                </button>
              ))}
            </div>

            {productError && <ErrorBanner message={productError} onRetry={() => loadProducts(selectedCategoryId)} />}

            {/* Product Grid */}
            <div className="px-4">
              {isLoadingProducts ? (
                <ProductSkeleton />
              ) : filteredProducts.length > 0 ? (
                <div className="grid grid-cols-2 gap-3.5 pb-8">
                  {filteredProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      quantity={getQuantity(product.id)}
                      onAdd={() => addItem(product)}
                      onRemove={() => removeItem(product.id)}
                    />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center px-4 bg-white border border-stone-150 rounded-3xl mt-2">
                  <span className="text-4xl mb-3">🔍</span>
                  <h4 className="text-sm font-bold text-stone-800">No products found</h4>
                  <p className="text-xs text-stone-400 mt-1 max-w-[200px]">Try adjusting your filters or search keywords</p>
                  <button
                    onClick={() => { storeSetSearch(""); storeSetCategory(null); setFilterChip("all"); loadProducts(); }}
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
        {/* CHECKOUT SCREEN                                           */}
        {/* ======================================================== */}
        {activeScreen === "checkout" && profile.role === "customer" && (
          <div className="flex flex-col py-4 gap-5">
            <div className="flex items-center gap-3 px-4">
              <button
                onClick={() => { setActiveScreen("home"); setActiveTab("home"); }}
                className="w-9 h-9 border border-stone-200 rounded-xl flex items-center justify-center text-stone-600 bg-white shadow-3xs cursor-pointer active:scale-95 transition-all"
              >
                <ArrowLeftIcon size={18} />
              </button>
              <h2 className="text-sm font-extrabold text-stone-900 uppercase tracking-tight">Secure Checkout</h2>
            </div>

            {/* Delivery form */}
            <div className="px-4">
              <div className="bg-white border border-stone-150 rounded-3xl p-5 shadow-xs flex flex-col gap-4">
                <div className="flex items-center gap-2 pb-2.5 border-b border-stone-100">
                  <MapPinIcon size={18} className="text-emerald-600" />
                  <h4 className="text-sm font-bold text-stone-850 tracking-tight">
                    Delivery Address (Prestige Golfshire)
                  </h4>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-stone-500">Tower / Wing</label>
                  <input
                    type="text"
                    placeholder="e.g. Tower B, Block A"
                    value={address.tower}
                    onChange={(e) => { setAddress({ ...address, tower: e.target.value }); setAddressErrors({ ...addressErrors, tower: false }); }}
                    className={`h-11 px-4 bg-stone-50 border rounded-xl text-xs font-medium focus:outline-none transition-all ${addressErrors.tower ? "border-rose-500 focus:ring-4 focus:ring-rose-500/10 bg-rose-50/10" : "border-stone-200 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"}`}
                  />
                  {addressErrors.tower && <span className="text-[10px] text-rose-500 font-semibold pl-1">Tower/Wing is required</span>}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-stone-500">Floor Number</label>
                    <input
                      type="text"
                      placeholder="e.g. 14"
                      value={address.floor}
                      onChange={(e) => { setAddress({ ...address, floor: e.target.value }); setAddressErrors({ ...addressErrors, floor: false }); }}
                      className={`h-11 px-4 bg-stone-50 border rounded-xl text-xs font-medium focus:outline-none transition-all ${addressErrors.floor ? "border-rose-500" : "border-stone-200 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"}`}
                    />
                    {addressErrors.floor && <span className="text-[10px] text-rose-500 font-semibold pl-1">Required</span>}
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-stone-500">Flat / Apartment</label>
                    <input
                      type="text"
                      placeholder="e.g. 1405"
                      value={address.flat}
                      onChange={(e) => { setAddress({ ...address, flat: e.target.value }); setAddressErrors({ ...addressErrors, flat: false }); }}
                      className={`h-11 px-4 bg-stone-50 border rounded-xl text-xs font-medium focus:outline-none transition-all ${addressErrors.flat ? "border-rose-500" : "border-stone-200 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"}`}
                    />
                    {addressErrors.flat && <span className="text-[10px] text-rose-500 font-semibold pl-1">Required</span>}
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Methods */}
            <div className="px-4 flex flex-col gap-3">
              <h4 className="text-xs font-extrabold text-stone-850 uppercase tracking-tight pl-1">Payment Method</h4>
              <PaymentOption id="upi" title="UPI" subtitle="Instant via PhonePe, GPay, or Paytm" icon={<SmartphoneIcon size={20} />} selected={paymentMethod === "upi"} onClick={() => setPaymentMethod("upi")} />
              <PaymentOption id="cod" title="Cash on Delivery" subtitle="Pay in cash or UPI at the doorstep" icon={<BanknoteIcon size={20} />} selected={paymentMethod === "cod"} onClick={() => setPaymentMethod("cod")} />
              <PaymentOption id="credits" title="Resident Credits" subtitle="₹420 available on your account" icon={<WalletIcon size={20} />} selected={paymentMethod === "credits"} onClick={() => setPaymentMethod("credits")} />
              <PaymentOption id="card" title="Debit / Credit Card" subtitle="Visa, Mastercard, RuPay cards" icon={<CreditCardIcon size={20} />} selected={paymentMethod === "card"} onClick={() => setPaymentMethod("card")} />
            </div>

            {orderError && <ErrorBanner message={orderError} />}

            {/* Order Summary */}
            <div className="px-4 pb-8">
              <OrderSummary cartItems={cartItemsList} />
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* SUCCESS SCREEN                                            */}
        {/* ======================================================== */}
        {activeScreen === "success" && profile.role === "customer" && (
          <div className="flex flex-col items-center justify-center py-16 px-6 text-center gap-6">
            <div className="w-20 h-20 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shadow-md">
              <ShieldCheckIcon size={44} className="animate-soft-bounce" />
            </div>
            <div>
              <span className="text-[10px] font-extrabold bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full uppercase tracking-wider border border-emerald-100">Order Placed Successfully</span>
              <h2 className="text-2xl font-black text-stone-900 mt-4 tracking-tight">Delivery in {deliverySettings.deliveryTime}!</h2>
              <p className="text-xs text-stone-500 font-medium mt-1 max-w-[260px] mx-auto leading-relaxed">
                Your order <span className="font-bold text-stone-750">{lastPlacedOrder?.id ?? ""}</span> is being packed at your building's micro-warehouse.
              </p>
            </div>
            <div className="w-full bg-white border border-stone-150 rounded-3xl p-4 text-left shadow-2xs flex flex-col gap-3">
              <div className="flex justify-between items-center text-xs border-b border-stone-100 pb-2.5">
                <span className="text-stone-400 font-semibold">Delivery To</span>
                <span className="font-bold text-stone-800">Tower {address.tower.toUpperCase()}, Flat {address.flat}</span>
              </div>
              <div className="flex justify-between items-center text-xs border-b border-stone-100 pb-2.5">
                <span className="text-stone-400 font-semibold">Payment</span>
                <span className="font-bold text-stone-850 uppercase">{paymentMethod}</span>
              </div>
              <div className="flex justify-between items-center text-xs pt-0.5">
                <span className="text-stone-400 font-semibold">Delivery Fee</span>
                <span className="font-bold text-emerald-600">
                  {deliveryFee === 0 ? "FREE (Resident rate)" : `₹${deliveryFee}`}
                </span>
              </div>
            </div>
            <div className="flex flex-col w-full gap-3 mt-4">
              <button onClick={() => handleTabChange("orders")} className="w-full h-12 bg-stone-900 hover:bg-stone-950 text-white font-bold text-sm rounded-2xl cursor-pointer active:scale-98 transition-all flex items-center justify-center">Track Order Status</button>
              <button onClick={() => handleTabChange("home")} className="w-full h-12 bg-white hover:bg-stone-50 text-stone-700 font-bold text-sm rounded-2xl border border-stone-200 cursor-pointer active:scale-98 transition-all flex items-center justify-center">Order More Groceries</button>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* EMPTY CART TAB                                            */}
        {/* ======================================================== */}
        {activeScreen === "cart-tab" && profile.role === "customer" && (
          <div className="flex flex-col items-center justify-center py-24 px-6 text-center gap-4">
            <span className="text-6xl filter drop-shadow-md select-none animate-soft-bounce">🛒</span>
            <div>
              <h3 className="text-base font-extrabold text-stone-850 tracking-tight">Your Cart is Empty</h3>
              <p className="text-xs text-stone-400 mt-1 max-w-[200px] mx-auto leading-relaxed">Add premium groceries to your cart and they'll be at your doorstep in minutes.</p>
            </div>
            <button onClick={() => handleTabChange("home")} className="mt-4 px-6 py-3 bg-emerald-600 text-white text-xs font-bold rounded-2xl cursor-pointer hover:bg-emerald-700 transition-colors shadow-xs active:scale-95">Start Shopping</button>
          </div>
        )}

        {/* ======================================================== */}
        {/* ORDERS TAB                                                */}
        {/* ======================================================== */}
        {activeScreen === "orders-tab" && (
          <div className="flex flex-col py-4 px-4 gap-5">
            {profile.role === "customer" ? (
              /* Original Customer Orders List */
              <>
                <h2 className="text-lg font-black text-stone-900 tracking-tight uppercase border-b border-stone-100 pb-2.5">Your Orders</h2>
                {orders.length > 0 ? (
                  <div className="flex flex-col gap-4">
                    {orders.map((order) => {
                      return (
                        <div key={order.id} className="bg-white border border-stone-150 rounded-3xl p-4 shadow-3xs flex flex-col gap-3.5">
                          <div className="flex justify-between items-start">
                            <div className="flex flex-col">
                              <span className="text-xs font-extrabold text-stone-850 tracking-tight">Order {order.id}</span>
                              <span className="text-[10px] text-stone-400 font-semibold mt-0.5">{new Date(order.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}</span>
                            </div>
                            <span className="text-[9px] font-extrabold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-100 uppercase tracking-wider flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-ping"></span>
                              {order.status}
                            </span>
                          </div>
                          <div className="flex justify-between items-center border-t border-dashed border-stone-150 pt-3 text-xs">
                            <span className="font-bold text-stone-500">via {order.paymentMethod.toUpperCase()}</span>
                            <span className="text-sm font-extrabold text-stone-850">₹{order.totalAmount}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-20 text-center px-4 bg-white border border-stone-150 rounded-3xl mt-2 gap-4">
                    <span className="text-5xl filter drop-shadow-md select-none">📦</span>
                    <div>
                      <h4 className="text-sm font-bold text-stone-800">No orders yet</h4>
                      <p className="text-xs text-stone-400 mt-1 max-w-[200px] mx-auto leading-relaxed">Once you place an order, you can track its delivery status here.</p>
                    </div>
                    <button onClick={() => handleTabChange("home")} className="px-5 py-2.5 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-xl border border-emerald-100 hover:bg-emerald-100 cursor-pointer transition-colors">Browse Groceries</button>
                  </div>
                )}
              </>
            ) : (
              /* Admin & Shopkeeper Operations Dashboard */
              <>
                <div className="flex justify-between items-center border-b border-stone-100 pb-2.5">
                  <h2 className="text-lg font-black text-stone-900 tracking-tight uppercase">
                    {profile.role === "admin" ? "HQ Operations" : "Lobby Fulfillment"}
                  </h2>
                  <span className="text-[10px] font-extrabold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-100 uppercase tracking-wider capitalize">
                    {profile.role}
                  </span>
                </div>

                {orders.length > 0 ? (
                  <div className="flex flex-col gap-4">
                    {orders.map((order) => {
                      const cust = allProfiles.find((p) => p.id === order.customerId);
                      const custName = cust?.fullName || "Resident";
                      const custAddress = cust
                        ? `${cust.tower} • Floor ${cust.floor} • Flat ${cust.flatNumber}`
                        : "Prestige Golfshire";

                      return (
                        <div key={order.id} className="bg-white border border-stone-150 rounded-3xl p-4 shadow-3xs flex flex-col gap-3.5">
                          <div className="flex justify-between items-start">
                            <div className="flex flex-col">
                              <span className="text-xs font-extrabold text-stone-850 tracking-tight">Order {order.id.slice(0, 8)}...</span>
                              <span className="text-[10px] text-stone-400 font-semibold mt-0.5">
                                {new Date(order.createdAt).toLocaleDateString("en-IN", {
                                  day: "2-digit",
                                  month: "short",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </span>
                            </div>
                            <span className="text-[9px] font-extrabold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-100 uppercase tracking-wider capitalize flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-ping"></span>
                              {order.status}
                            </span>
                          </div>

                          {/* Customer info */}
                          <div className="bg-stone-50 rounded-2xl p-3 border border-stone-100 flex flex-col gap-1">
                            <span className="text-xs font-bold text-stone-800">{custName}</span>
                            <span className="text-[10px] font-semibold text-stone-500">{custAddress}</span>
                            {cust?.phone && (
                              <span className="text-[9px] font-bold text-emerald-700 mt-0.5">{cust.phone}</span>
                            )}
                          </div>

                          {/* Status Management Buttons */}
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {(["preparing", "dispatched", "delivered", "cancelled"] as OrderStatus[]).map((st) => (
                              <button
                                key={st}
                                onClick={() => updateOrderStatus(order.id, st)}
                                className={`text-[9px] font-bold px-2 py-1 rounded-full border transition-all cursor-pointer capitalize ${
                                  order.status === st
                                    ? "bg-emerald-600 text-white border-emerald-600 shadow-3xs"
                                    : "bg-white text-stone-600 border-stone-200 hover:bg-stone-50"
                                }`}
                              >
                                {st}
                              </button>
                            ))}
                          </div>

                          <div className="flex justify-between items-center border-t border-dashed border-stone-150 pt-3 text-xs">
                            <span className="font-bold text-stone-500">via {order.paymentMethod.toUpperCase()}</span>
                            <span className="text-sm font-extrabold text-stone-850">₹{order.totalAmount}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-20 text-center px-4 bg-white border border-stone-150 rounded-3xl mt-2 gap-4">
                    <span className="text-5xl">📦</span>
                    <div>
                      <h4 className="text-sm font-bold text-stone-850">No orders placed</h4>
                      <p className="text-xs text-stone-400 mt-1 max-w-[200px] mx-auto leading-relaxed">
                        When residents place orders, they will show up here for you to fulfill.
                      </p>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* ADMIN SETTINGS SCREEN                                    */}
        {/* ======================================================== */}
        {activeScreen === "admin-settings" && profile?.role === "admin" && (
          <div className="flex flex-col py-4 px-4 gap-5">
            <div className="flex justify-between items-center border-b border-stone-100 pb-2.5">
              <h2 className="text-lg font-black text-stone-900 tracking-tight uppercase">HQ Settings</h2>
              <span className="text-[10px] font-extrabold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-100 uppercase tracking-wider">
                Admin
              </span>
            </div>

            <div className="bg-white border border-stone-150 rounded-3xl p-5 shadow-xs flex flex-col gap-4">
              <div className="flex items-center justify-between pb-2.5 border-b border-stone-100">
                <span className="text-xs font-bold text-stone-700">Enable micro-delivery service</span>
                <input
                  type="checkbox"
                  checked={editEnabled}
                  onChange={(e) => setEditEnabled(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 bg-stone-100 border-stone-300 rounded focus:ring-emerald-500 focus:ring-2 cursor-pointer"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-stone-500">Delivery Fee (₹)</label>
                <input
                  type="number"
                  placeholder="30"
                  value={editFee}
                  onChange={(e) => setEditFee(e.target.value)}
                  className="h-11 px-4 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium focus:outline-none focus:border-emerald-500 focus:bg-white transition-all"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-stone-500">Free Delivery Above (₹)</label>
                <input
                  type="number"
                  placeholder="500"
                  value={editFreeAbove}
                  onChange={(e) => setEditFreeAbove(e.target.value)}
                  className="h-11 px-4 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium focus:outline-none focus:border-emerald-500 focus:bg-white transition-all"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-stone-500">Estimated Delivery Time</label>
                <input
                  type="text"
                  placeholder="10 mins"
                  value={editTime}
                  onChange={(e) => setEditTime(e.target.value)}
                  className="h-11 px-4 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium focus:outline-none focus:border-emerald-500 focus:bg-white transition-all"
                />
              </div>

              <button
                onClick={async () => {
                  await updateDeliverySettings({
                    deliveryFee: Number(editFee),
                    freeDeliveryAbove: Number(editFreeAbove),
                    deliveryTime: editTime,
                    isDeliveryEnabled: editEnabled,
                  });
                  alert("Delivery Settings updated successfully!");
                }}
                className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs tracking-wider uppercase rounded-xl shadow-3xs cursor-pointer active:scale-98 transition-all flex items-center justify-center font-bold"
              >
                Save Settings
              </button>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* PROFILE TAB                                               */}
        {/* ======================================================== */}
        {activeScreen === "profile-tab" && (
          <div className="flex flex-col py-4 px-4 gap-6">
            <h2 className="text-lg font-black text-stone-900 tracking-tight uppercase border-b border-stone-100 pb-2.5">Your Profile</h2>
            <div className="bg-white border border-stone-150 rounded-3xl p-5 shadow-3xs flex items-center gap-4 relative overflow-hidden">
              <div className="w-14 h-14 bg-emerald-600 text-white font-black text-xl rounded-2xl flex items-center justify-center shadow-md select-none">
                {profile?.fullName?.[0] ?? "R"}
              </div>
              <div className="flex flex-col">
                <h3 className="text-base font-black text-stone-850 tracking-tight">{profile?.fullName ?? "Resident"}</h3>
                <span className="text-[10px] text-emerald-700 font-extrabold bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full w-fit mt-1.5 uppercase tracking-wider capitalize">{profile?.role ?? "customer"}</span>
              </div>
            </div>

            <div className="bg-white border border-stone-150 rounded-3xl p-4 shadow-3xs flex flex-col gap-3.5">
              {[
                { icon: "🏢", label: "Building", value: `${profile?.tower ?? "Tower B"}, Prestige Golfshire` },
                { icon: "🪙", label: "Resident Credits", value: "₹420 Available" },
                { icon: "🛵", label: "Delivery Charge", value: deliverySettings.freeDeliveryAbove > 0 ? `Free above ₹${deliverySettings.freeDeliveryAbove}` : "Free (Resident)" },
                { icon: "⏱", label: "Avg Delivery Time", value: deliverySettings.deliveryTime },
              ].map(({ icon, label, value }) => (
                <React.Fragment key={label}>
                  <div className="flex justify-between items-center text-xs">
                    <div className="flex items-center gap-2">
                      <span className="text-base">{icon}</span>
                      <span className="font-bold text-stone-700">{label}</span>
                    </div>
                    <span className="font-bold text-stone-800">{value}</span>
                  </div>
                  <div className="border-t border-stone-100 last:hidden" />
                </React.Fragment>
              ))}
            </div>

            <div className="bg-gradient-to-br from-stone-900 to-stone-950 text-white rounded-3xl p-5 shadow-md flex flex-col gap-2 relative overflow-hidden select-none">
              <span className="text-[9px] font-extrabold text-amber-400 tracking-widest uppercase">Member Benefits</span>
              <h4 className="text-sm font-bold mt-1">Prestige Resident Privileges</h4>
              <ul className="text-[11px] text-stone-300 font-medium space-y-2 mt-2">
                <li className="flex items-center gap-2"><span className="text-emerald-500">✔</span> Free delivery with no order minimums.</li>
                <li className="flex items-center gap-2"><span className="text-emerald-500">✔</span> Group discount rates for seasonal produce.</li>
                <li className="flex items-center gap-2"><span className="text-emerald-500">✔</span> Doorstep drop-off or lobby delivery choices.</li>
              </ul>
            </div>

            <button
              onClick={() => signOut()}
              className="mt-2 w-full h-12 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 font-bold text-sm rounded-2xl flex items-center justify-center cursor-pointer transition-colors"
            >
              Sign Out from Account
            </button>
          </div>
        )}
      </div>

      {/* Sticky Cart Button */}
      {cartItemCount > 0 && profile?.role === "customer" && (activeScreen === "home" || activeScreen === "products") && (
        <div className="absolute bottom-16 left-0 right-0 px-4 pb-2 pt-1 z-30 select-none pointer-events-none">
          <button
            onClick={() => { setActiveScreen("checkout"); setActiveTab("cart"); }}
            className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl flex items-center justify-between px-4 shadow-[0_8px_24px_rgba(5,150,105,0.3)] cursor-pointer active:scale-98 transition-all duration-300 pointer-events-auto"
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

      {/* Sticky Place Order Button */}
      {activeScreen === "checkout" && profile?.role === "customer" && (
        <div className="absolute bottom-16 left-0 right-0 px-4 pb-2 pt-1 z-30 select-none">
          <button
            onClick={handlePlaceOrder}
            disabled={isPlacing}
            className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-extrabold text-xs tracking-widest uppercase rounded-2xl shadow-[0_8px_24px_rgba(5,150,105,0.35)] cursor-pointer active:scale-98 transition-all duration-300 flex items-center justify-center gap-1.5"
          >
            {isPlacing ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                Placing Order…
              </span>
            ) : (
              <>
                <span>Place Order</span>
                <span className="font-bold text-[13px] tracking-tight lowercase">for</span>
                <span className="text-sm font-black tracking-tight">₹{cartSubtotal + deliveryFee + (cartItemCount > 0 ? 15 : 0)}</span>
              </>
            )}
          </button>
        </div>
      )}

      <BottomNav activeTab={activeTab} onTabChange={handleTabChange} cartItemCount={cartItemCount} role={profile?.role} />
    </MobileFrame>
  );
}
