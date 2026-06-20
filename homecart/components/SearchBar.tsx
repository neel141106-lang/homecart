import React from "react";
import { SearchIcon } from "./Icons";

interface SearchBarProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  className?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  placeholder = "Search fresh groceries...",
  className = "",
}) => {
  return (
    <div className={`relative w-full ${className}`}>
      {/* Search Input Container */}
      <div className="relative flex items-center w-full">
        <span className="absolute left-4 text-emerald-600 pointer-events-none">
          <SearchIcon size={20} />
        </span>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full h-12 pl-12 pr-10 py-3 bg-[#FAF8F5] border border-stone-200/80 rounded-2xl text-stone-800 placeholder-stone-400 focus:outline-none focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 text-sm font-medium transition-all duration-200 shadow-xs"
        />
        {value && (
          <button
            onClick={() => onChange("")}
            className="absolute right-4 text-stone-400 hover:text-stone-600 transition-colors focus:outline-none"
            aria-label="Clear search query"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              viewBox="0 0 24 24"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};
