"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function BrandLogo({ size = "md" }) {
  const iconSizes = {
    sm: "w-7 h-7",
    md: "w-9 h-9",
    lg: "w-12 h-12",
  };

  const textSizes = {
    sm: "text-lg",
    md: "text-2xl",
    lg: "text-3xl",
  };

  return (
    <Link href="/" className="group flex items-center gap-3 select-none">
      <motion.div
        whileHover={{ scale: 1.08, rotate: 5 }}
        whileTap={{ scale: 0.95 }}
        className={`relative ${iconSizes[size]} flex items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 via-green-500 to-emerald-900 p-0.5 shadow-lg shadow-emerald-900/40`}
      >
        <div className="w-full h-full bg-[#041c10] rounded-[10px] flex items-center justify-center overflow-hidden relative">
          {/* Subtle glowing core */}
          <div className="absolute inset-0 bg-emerald-500/20 blur-sm group-hover:bg-emerald-400/40 transition-all duration-300" />
          
          {/* UniSync SVG Icon */}
          <svg
            className="w-3/5 h-3/5 text-emerald-400 group-hover:text-green-300 transition-colors relative z-10"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {/* Sync loop with academic graduation/sync nodes */}
            <path d="M21.5 2v6h-6" />
            <path d="M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
            <circle cx="12" cy="12" r="3" fill="currentColor" className="text-green-400" />
          </svg>
        </div>
      </motion.div>

      <div className="flex flex-col">
        <span className={`font-extrabold tracking-tight ${textSizes[size]} bg-gradient-to-r from-white via-emerald-200 to-[#6ADB6A] bg-clip-text text-transparent group-hover:from-emerald-200 group-hover:to-emerald-400 transition-all duration-300`}>
          Uni<span className="text-[#6ADB6A]">Sync</span>
        </span>
        {size === "lg" && (
          <span className="text-[10px] uppercase tracking-widest text-emerald-400 font-semibold -mt-1">
            Campus Ecosystem
          </span>
        )}
      </div>
    </Link>
  );
}
