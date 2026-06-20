"use client";

import React, { useState, useEffect } from "react";

interface MobileFrameProps {
  children: React.ReactNode;
}

export const MobileFrame: React.FC<MobileFrameProps> = ({ children }) => {
  const [time, setTime] = useState("19:02");

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      let hours = now.getHours();
      const minutes = String(now.getMinutes()).padStart(2, "0");
      const ampm = hours >= 12 ? "PM" : "AM";
      hours = hours % 12;
      hours = hours ? hours : 12; // the hour '0' should be '12'
      setTime(`${hours}:${minutes} ${ampm}`);
    };

    updateClock();
    const interval = setInterval(updateClock, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen w-full bg-[#EAE8E4] flex items-center justify-center py-0 sm:py-8 px-0 sm:px-4 font-sans selection:bg-emerald-200">
      {/* Phone Mockup Frame */}
      <div className="relative w-full max-w-[430px] h-screen sm:h-[860px] bg-[#FDFBF7] sm:rounded-[40px] sm:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.3)] sm:border-[10px] sm:border-stone-900 overflow-hidden flex flex-col transition-all duration-300">
        
        {/* Phone Speaker & Camera Notch (Dynamic Island Style) */}
        <div className="hidden sm:flex absolute top-2 left-1/2 -translate-x-1/2 w-32 h-6 bg-stone-950 rounded-full z-50 items-center justify-between px-3 shadow-inner">
          {/* Camera lens highlight */}
          <div className="w-2.5 h-2.5 rounded-full bg-stone-850 border border-stone-800 flex items-center justify-center">
            <div className="w-1 h-1 rounded-full bg-blue-900/60"></div>
          </div>
          {/* Speaker grill */}
          <div className="w-12 h-1 bg-stone-800 rounded-full"></div>
          {/* Sensor */}
          <div className="w-1.5 h-1.5 rounded-full bg-stone-900"></div>
        </div>

        {/* Mobile Status Bar */}
        <div className="w-full h-11 bg-white/60 backdrop-blur-md flex items-center justify-between px-6 pt-1 select-none z-45 text-stone-700 text-xs font-semibold shrink-0">
          <div>{time}</div>
          <div className="flex items-center gap-1.5">
            {/* Signal Strength Icon */}
            <svg className="w-4 h-4 text-stone-700" fill="currentColor" viewBox="0 0 24 24">
              <path d="M2 22h20V2z" className="opacity-30" />
              <path d="M2 22h15V7z" />
            </svg>
            {/* WiFi Icon */}
            <svg className="w-4 h-4 text-stone-700" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <path d="M5 12.55a11 11 0 0 1 14.08 0" />
              <path d="M1.42 9a16 16 0 0 1 21.16 0" />
              <path d="M8.58 16.14a5 5 0 0 1 6.84 0" />
              <line x1="12" y1="20" x2="12.01" y2="20" strokeWidth="3" />
            </svg>
            {/* Battery Icon */}
            <div className="flex items-center gap-0.5 border-1.5 border-stone-700 rounded-sm p-0.5 w-6 h-3.5">
              <div className="bg-emerald-600 h-full w-[80%] rounded-2xs"></div>
              <div className="w-[1.5px] h-1.5 bg-stone-700 rounded-r-xs -mr-1"></div>
            </div>
          </div>
        </div>

        {/* Safe Scroll Area (Dynamic viewport) */}
        <div className="flex-1 flex flex-col overflow-y-auto no-scrollbar relative">
          {children}
        </div>

        {/* Safe Area bottom bar (iOS style home indicator) */}
        <div className="w-full h-5 bg-white/70 backdrop-blur-md flex items-center justify-center pb-1 shrink-0">
          <div className="w-32 h-1 bg-stone-300 rounded-full"></div>
        </div>
      </div>
    </div>
  );
};
