import React from "react";

interface CategoryCardProps {
  name: string;
  icon: string; // emoji or custom SVG key
  color: string; // Tailwind background color (e.g., "bg-orange-50")
  borderColor: string; // Tailwind border color (e.g., "border-orange-100/80")
  onClick: () => void;
}

export const CategoryCard: React.FC<CategoryCardProps> = ({
  name,
  icon,
  color,
  borderColor,
  onClick,
}) => {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-2 group focus:outline-none w-full"
    >
      {/* Circle Icon Wrapper */}
      <div
        className={`w-16 h-16 rounded-2xl ${color} border ${borderColor} flex items-center justify-center shadow-xs transition-all duration-300 group-hover:scale-105 group-hover:-translate-y-0.5 group-active:scale-95 group-hover:shadow-md cursor-pointer`}
      >
        <span className="text-3xl filter drop-shadow-sm select-none animate-soft-bounce group-hover:animate-none">
          {icon}
        </span>
      </div>

      {/* Label */}
      <span className="text-[11px] font-bold text-stone-700 text-center tracking-tight leading-tight group-hover:text-emerald-700 transition-colors w-full px-1">
        {name}
      </span>
    </button>
  );
};
