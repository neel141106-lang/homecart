import React from "react";
import { Product } from "./ProductCard";

interface CartItem {
  product: Product;
  quantity: number;
}

interface OrderSummaryProps {
  cartItems: CartItem[];
  discountAmount?: number;
}

export const OrderSummary: React.FC<OrderSummaryProps> = ({
  cartItems,
  discountAmount = 0,
}) => {
  const subtotal = cartItems.reduce(
    (total, item) => total + item.product.price * item.quantity,
    0
  );
  
  const deliveryFee = 30; // standard fee
  const isResidentFreeDelivery = true; // Resident benefit
  const handlingCharge = cartItems.length > 0 ? 15 : 0;
  
  const grandTotal = Math.max(
    0,
    subtotal + (isResidentFreeDelivery ? 0 : deliveryFee) + handlingCharge - discountAmount
  );

  return (
    <div className="bg-white border border-stone-150 rounded-3xl p-5 shadow-xs">
      <h4 className="text-sm font-bold text-stone-850 mb-3.5 tracking-tight">
        Bill Details
      </h4>

      {/* Cart Items List */}
      <div className="space-y-3 mb-4 max-h-[160px] overflow-y-auto pr-1 no-scrollbar">
        {cartItems.map((item) => (
          <div key={item.product.id} className="flex justify-between items-center text-xs text-stone-600">
            <div className="flex items-center gap-2">
              <span className="text-base select-none">{item.product.emoji}</span>
              <span className="font-bold text-stone-800">{item.product.name}</span>
              <span className="text-[10px] text-stone-400 font-semibold bg-stone-100 px-1.5 py-0.5 rounded-sm">
                x{item.quantity}
              </span>
            </div>
            <span className="font-semibold text-stone-800">
              ₹{item.product.price * item.quantity}
            </span>
          </div>
        ))}
      </div>

      <div className="border-t border-dashed border-stone-200 my-4"></div>

      {/* Price breakdown details */}
      <div className="space-y-2.5 text-xs text-stone-500">
        {/* Item Total */}
        <div className="flex justify-between">
          <span className="font-medium">Item Total</span>
          <span className="font-semibold text-stone-750">₹{subtotal}</span>
        </div>

        {/* Handling Charge */}
        <div className="flex justify-between">
          <span className="font-medium">Handling & Packaging</span>
          <span className="font-semibold text-stone-750">₹{handlingCharge}</span>
        </div>

        {/* Delivery Fee */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-1.5">
            <span className="font-medium">Delivery Partner Fee</span>
            <span className="text-[9px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-100 px-1.5 py-0.5 rounded-xs uppercase tracking-wide">
              Resident
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            {isResidentFreeDelivery ? (
              <>
                <span className="line-through text-[11px] text-stone-300">₹{deliveryFee}</span>
                <span className="font-bold text-emerald-600">FREE</span>
              </>
            ) : (
              <span className="font-semibold text-stone-750">₹{deliveryFee}</span>
            )}
          </div>
        </div>

        {/* Resident Discount */}
        {discountAmount > 0 && (
          <div className="flex justify-between text-emerald-600">
            <span className="font-semibold">Building Promo Discount</span>
            <span className="font-bold">-₹{discountAmount}</span>
          </div>
        )}
      </div>

      <div className="border-t border-dashed border-stone-200 my-4"></div>

      {/* Grand Total */}
      <div className="flex justify-between items-center">
        <div>
          <span className="text-xs font-bold text-stone-700 tracking-tight block">To Pay</span>
          <span className="text-[10px] font-semibold text-stone-400">Inclusive of all taxes</span>
        </div>
        <span className="text-lg font-extrabold text-stone-850 tracking-tight">
          ₹{grandTotal}
        </span>
      </div>
    </div>
  );
};
