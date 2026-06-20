import { create } from "zustand";
import { Product, Category } from "@/types/domain.types";
import { ProductService } from "@/services";

interface ProductState {
  products: Product[];
  categories: Category[];
  selectedCategoryId: string | null;
  searchQuery: string;
  filterChip: "all" | "organic" | "essential" | "price-low";
  isLoadingProducts: boolean;
  isLoadingCategories: boolean;
  error: string | null;
  // Actions
  loadCategories: () => Promise<void>;
  loadProducts: (categoryId?: string | null) => Promise<void>;
  setSelectedCategory: (categoryId: string | null) => void;
  setSearchQuery: (query: string) => void;
  setFilterChip: (chip: "all" | "organic" | "essential" | "price-low") => void;
  getFilteredProducts: () => Product[];
  clearError: () => void;
}

export const useProductStore = create<ProductState>((set, get) => ({
  products: [],
  categories: [],
  selectedCategoryId: null,
  searchQuery: "",
  filterChip: "all",
  isLoadingProducts: false,
  isLoadingCategories: false,
  error: null,

  loadCategories: async () => {
    set({ isLoadingCategories: true, error: null });
    const result = await ProductService.getCategories();
    if (result.error) {
      set({ isLoadingCategories: false, error: result.error });
    } else {
      set({ isLoadingCategories: false, categories: result.data });
    }
  },

  loadProducts: async (categoryId) => {
    set({ isLoadingProducts: true, error: null });
    const result = await ProductService.getProducts(categoryId ?? get().selectedCategoryId);
    if (result.error) {
      set({ isLoadingProducts: false, error: result.error });
    } else {
      set({ isLoadingProducts: false, products: result.data });
    }
  },

  setSelectedCategory: (categoryId) => {
    set({ selectedCategoryId: categoryId, searchQuery: "" });
  },

  setSearchQuery: (query) => {
    set({ searchQuery: query, selectedCategoryId: null });
  },

  setFilterChip: (chip) => {
    set({ filterChip: chip });
  },

  getFilteredProducts: () => {
    const { products, selectedCategoryId, searchQuery, filterChip } = get();
    let list = [...products];

    if (selectedCategoryId) {
      list = list.filter((p) => p.categoryId === selectedCategoryId);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.description?.toLowerCase().includes(q) ?? false)
      );
    }
    if (filterChip === "organic") {
      list = list.filter((p) => p.isOrganic);
    } else if (filterChip === "essential") {
      list = list.filter((p) => p.isEssential);
    } else if (filterChip === "price-low") {
      list = [...list].sort((a, b) => a.price - b.price);
    }

    return list;
  },

  clearError: () => set({ error: null }),
}));
