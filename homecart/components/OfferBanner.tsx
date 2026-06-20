"use client";

import React, { useState, useEffect } from "react";

interface BannerData {
  id: number;
  tag: string;
  title: string;
  subtitle: string;
  code: string;
  gradient: string;
  textColor: string;
}

const OFFERS: BannerData[] = [
  {
    id: 1,
    tag: "TOWER EXCLUSIVE",
    title: "15% Off Your First Order",
    subtitle: "Welcome offer exclusive to building residents",
    code: "WELCOME15",
    gradient: "from-emerald-600 to-teal-800",
    textColor: "text-emerald-100",
  },
  {
    id: 2,
    tag: "HAPPY HOUR",
    title: "Free Delivery to All Towers",
    subtitle: "No minimum order between 6 PM - 8 PM today",
    code: "DELIVERFREE",
    gradient: "from-stone-900 via-emerald-950 to-stone-950",
    textColor: "text-emerald-400",
  },
  {
    id: 3,
    tag: "SUNDAY BRUNCH",
    title: "Fresh Mango Special",
    subtitle: "Get Alphonso Mangoes at building group rates",
    code: "MANGO20",
    gradient: "from-[#D97706] to-[#B45309]", // Golden-amber gradient
    textColor: "text-amber-100",
  },
];

export const OfferBanner: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % OFFERS.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative w-full overflow-hidden rounded-3xl shadow-md border border-stone-200/40 select-none">
      {/* Banner Slider Container */}
      <div
        className="flex transition-transform duration-700 ease-out"
        style={{ transform: `translateX(-${activeIndex * 100}%)` }}
      >
        {OFFERS.map((offer) => (
          <div
            key={offer.id}
            className={`w-full shrink-0 bg-gradient-to-br ${offer.gradient} p-5 flex flex-col justify-between text-white relative min-h-[148px]`}
          >
            {/* Abstract Background Shapes */}
            <div className="absolute right-0 bottom-0 top-0 w-1/3 opacity-15 overflow-hidden pointer-events-none">
              <svg className="w-full h-full text-white" viewBox="0 0 100 100" fill="currentColor">
                <circle cx="90" cy="80" r="50" />
                <circle cx="20" cy="20" r="30" />
              </svg>
            </div>

            <div>
              {/* Tag */}
              <span className={`text-[10px] tracking-wider font-extrabold uppercase bg-white/15 px-2.5 py-1 rounded-full w-fit ${offer.textColor}`}>
                {offer.tag}
              </span>

              {/* Title */}
              <h3 className="text-xl font-bold mt-2.5 tracking-tight leading-snug">
                {offer.title}
              </h3>

              {/* Subtitle */}
              <p className="text-xs text-white/80 font-medium mt-1 leading-relaxed max-w-[80%]">
                {offer.subtitle}
              </p>
            </div>

            <div className="flex items-center justify-between mt-3.5 pt-2 border-t border-white/10">
              {/* Promo code badge */}
              <div className="text-[11px] font-semibold bg-white/10 px-2 py-0.5 rounded-md border border-white/10">
                Code: <span className="font-bold tracking-wider">{offer.code}</span>
              </div>
              <span className="text-xs font-bold text-white bg-white/20 hover:bg-white/30 px-3 py-1 rounded-full transition-colors cursor-pointer">
                Claim Offer
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Dots Indicator */}
      <div className="absolute bottom-3 left-6 flex gap-1.5 z-10">
        {OFFERS.map((_, index) => (
          <button
            key={index}
            onClick={() => setActiveIndex(index)}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              activeIndex === index ? "w-4 bg-white" : "w-1.5 bg-white/40"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};
