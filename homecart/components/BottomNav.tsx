import React from "react";
import {
  HomeIcon,
  SearchIcon,
  CartIcon,
  OrdersIcon,
  ProfileIcon,
} from "./Icons";

interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  cartItemCount: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onTabChange,
  cartItemCount,
}) => {
  const navItems = [
    { id: "home", label: "Home", icon: <HomeIcon size={20} /> },
    { id: "search", label: "Search", icon: <SearchIcon size={20} /> },
    {
      id: "cart",
      label: "Cart",
      icon: <CartIcon size={20} />,
      badge: cartItemCount > 0 ? cartItemCount : undefined,
    },
    { id: "orders", label: "Orders", icon: <OrdersIcon size={20} /> },
    { id: "profile", label: "Profile", icon: <ProfileIcon size={20} /> },
  ];

  return (
    <div className="w-full bg-white/95 backdrop-blur-md border-t border-stone-200/60 shadow-[0_-8px_24px_rgba(0,0,0,0.03)] px-3 py-1 flex items-center justify-around shrink-0 select-none z-40 relative">
      {navItems.map((item) => {
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className="flex flex-col items-center justify-center py-2 px-3 relative group focus:outline-none cursor-pointer"
          >
            {/* Icon container with badge */}
            <div
              className={`relative transition-all duration-300 transform group-active:scale-90 ${
                isActive
                  ? "text-emerald-600 scale-105"
                  : "text-stone-400 group-hover:text-stone-600"
              }`}
            >
              {item.icon}

              {/* Badge */}
              {item.badge !== undefined && (
                <span className="absolute -top-1.5 -right-2.5 bg-rose-500 text-white text-[9px] font-extrabold h-4 px-1.5 min-w-4 rounded-full flex items-center justify-center border border-white animate-pulse">
                  {item.badge}
                </span>
              )}
            </div>

            {/* Label */}
            <span
              className={`text-[9px] font-bold mt-1 tracking-wider transition-colors duration-200 uppercase ${
                isActive ? "text-emerald-700 font-extrabold" : "text-stone-400"
              }`}
            >
              {item.label}
            </span>

            {/* Premium Active Dot Indicator */}
            {isActive && (
              <span className="absolute bottom-0 w-1 h-1 bg-emerald-600 rounded-full animate-fade-in"></span>
            )}
          </button>
        );
      })}
    </div>
  );
};
