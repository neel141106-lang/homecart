import React from "react";

interface PaymentOptionProps {
  id: string;
  title: string;
  subtitle?: string;
  icon: React.ReactNode;
  selected: boolean;
  onClick: () => void;
}

export const PaymentOption: React.FC<PaymentOptionProps> = ({
  id,
  title,
  subtitle,
  icon,
  selected,
  onClick,
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full flex items-center justify-between p-4 rounded-2xl border text-left transition-all duration-200 cursor-pointer select-none ${
        selected
          ? "border-emerald-600 bg-emerald-50/40 ring-4 ring-emerald-500/10 shadow-xs"
          : "border-stone-200 bg-white hover:bg-stone-50/50 hover:border-stone-300"
      }`}
    >
      {/* Icon and Details */}
      <div className="flex items-center gap-3.5">
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
            selected
              ? "bg-emerald-600 text-white"
              : "bg-stone-100 text-stone-600"
          }`}
        >
          {icon}
        </div>
        <div>
          <h5 className="text-sm font-bold text-stone-850 tracking-tight">
            {title}
          </h5>
          {subtitle && (
            <p className={`text-xs mt-0.5 font-medium ${selected ? "text-emerald-700/80" : "text-stone-400"}`}>
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {/* Custom Radio Indicator */}
      <div
        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
          selected
            ? "border-emerald-600 bg-emerald-600"
            : "border-stone-300 bg-white"
        }`}
      >
        {selected && (
          <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></div>
        )}
      </div>
    </button>
  );
};
