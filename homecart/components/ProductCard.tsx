import React from "react";
import { PlusIcon, MinusIcon } from "./Icons";
import { Product } from "@/types/domain.types";

export type { Product };


interface ProductCardProps {
  product: Product;
  quantity: number;
  onAdd: () => void;
  onRemove: () => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  quantity,
  onAdd,
  onRemove,
}) => {
  const isLowStock = product.stock <= 10;

  return (
    <div className="flex flex-col bg-white border border-stone-150 rounded-3xl p-3 shadow-xs hover:shadow-md hover:border-stone-200 transition-all duration-300 relative group h-full justify-between">
      {/* Badges Container */}
      <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
        {product.isOrganic && (
          <span className="text-[9px] font-extrabold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-100 shadow-3xs uppercase tracking-wider">
            Organic
          </span>
        )}
        {product.isEssential && (
          <span className="text-[9px] font-extrabold bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full border border-amber-100 shadow-3xs uppercase tracking-wider">
            Essential
          </span>
        )}
      </div>

      {/* Stock warning badge */}
      <div className="absolute top-2 right-2 z-10">
        {isLowStock ? (
          <span className="text-[8px] font-bold bg-rose-50 text-rose-600 px-2 py-0.5 rounded-full border border-rose-100/60 tracking-tight">
            Only {product.stock} left
          </span>
        ) : (
          <span className="text-[8px] font-semibold bg-emerald-50/50 text-emerald-600 px-2 py-0.5 rounded-full border border-emerald-100/20 tracking-tight">
            Fresh
          </span>
        )}
      </div>

      {/* Product Image (Emoji container) */}
      <div className="h-32 bg-stone-50 rounded-2xl flex items-center justify-center relative overflow-hidden mb-3 border border-stone-100/50 transition-colors group-hover:bg-stone-100/60 select-none">
        <span className="text-5xl filter drop-shadow-md transform transition-transform duration-300 group-hover:scale-110">
          {product.emoji}
        </span>
      </div>

      {/* Product Info */}
      <div className="px-1 flex-1 flex flex-col justify-between">
        <div>
          {/* Unit / Weight */}
          <span className="text-[10px] font-semibold text-stone-400 block mb-0.5">
            {product.unit}
          </span>
          {/* Name */}
          <h4 className="text-sm font-bold text-stone-850 leading-tight line-clamp-2 tracking-tight min-h-[36px]">
            {product.name}
          </h4>
        </div>

        {/* Pricing and Action Area */}
        <div className="flex items-center justify-between mt-3 pt-2 border-t border-stone-100">
          {/* Price */}
          <div className="flex flex-col">
            <span className="text-sm font-extrabold text-stone-850 tracking-tight">
              ₹{product.price}
            </span>
          </div>

          {/* Add to Cart Actions */}
          <div className="w-20 h-8 flex items-center justify-center">
            {quantity === 0 ? (
              <button
                onClick={onAdd}
                className="w-full h-full bg-emerald-50 hover:bg-emerald-600 border border-emerald-200 hover:border-emerald-600 text-emerald-700 hover:text-white text-xs font-bold rounded-xl transition-all duration-300 shadow-xs active:scale-95 cursor-pointer flex items-center justify-center gap-1 select-none"
              >
                <PlusIcon size={12} />
                <span>ADD</span>
              </button>
            ) : (
              <div className="w-full h-full bg-emerald-600 text-white rounded-xl flex items-center justify-between border border-emerald-600 shadow-xs overflow-hidden select-none">
                <button
                  onClick={onRemove}
                  className="w-7 h-full flex items-center justify-center hover:bg-emerald-700 transition-colors focus:outline-none cursor-pointer"
                  aria-label="Decrease quantity"
                >
                  <MinusIcon size={12} />
                </button>
                <span className="text-xs font-extrabold tabular-nums select-none">
                  {quantity}
                </span>
                <button
                  onClick={onAdd}
                  className="w-7 h-full flex items-center justify-center hover:bg-emerald-700 transition-colors focus:outline-none cursor-pointer"
                  aria-label="Increase quantity"
                  disabled={quantity >= product.stock}
                >
                  <PlusIcon size={12} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
