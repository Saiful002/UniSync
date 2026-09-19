"use client";

import { motion } from "framer-motion";
import { Landmark, Sparkles, GraduationCap, Building2 } from "lucide-react";

export default function VectorUniversityBuilding() {
  return (
    <div className="relative w-full max-w-sm mx-auto flex items-center justify-center py-4 select-none">
      {/* Subtle Background Glow */}
      <div className="absolute w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl" />

      {/* Main Vector University Architecture Card */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full glass-card p-6 rounded-3xl border-emerald-500/25 shadow-2xl bg-[#080d09]/90 text-center space-y-4"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950 border border-emerald-500/30 text-emerald-300 text-xs font-bold">
          <Landmark className="w-3.5 h-3.5 text-emerald-400" />
          <span>Campus Architecture</span>
        </div>

        {/* Vector SVG University Campus Artwork */}
        <div className="w-40 h-40 mx-auto relative flex items-center justify-center">
          <svg
            viewBox="0 0 160 160"
            className="w-full h-full text-emerald-400 drop-shadow-md"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Base Steps */}
            <path d="M20 135H140V142H20V135Z" fill="#04180d" stroke="#10b981" strokeWidth="1.5" />
            <path d="M30 128H130V135H30V128Z" fill="#062213" stroke="#10b981" strokeWidth="1.5" />

            {/* Main Columns */}
            <rect x="42" y="75" width="10" height="53" rx="2" fill="#10b981" opacity="0.85" />
            <rect x="65" y="75" width="10" height="53" rx="2" fill="#10b981" opacity="0.85" />
            <rect x="85" y="75" width="10" height="53" rx="2" fill="#10b981" opacity="0.85" />
            <rect x="108" y="75" width="10" height="53" rx="2" fill="#10b981" opacity="0.85" />

            {/* Entrance Door */}
            <path d="M72 128V100C72 96 88 96 88 100V128H72Z" fill="#02b81c" opacity="0.4" stroke="#6adb6a" strokeWidth="1.5" />

            {/* Pediment & Roof */}
            <polygon points="80,45 32,75 128,75" fill="#072b16" stroke="#34d399" strokeWidth="2" />
            <circle cx="80" cy="62" r="6" fill="#6adb6a" />
          </svg>
        </div>

        <div className="space-y-1">
          <h4 className="text-sm font-bold text-white">Central Campus Hub</h4>
          <p className="text-[11px] text-emerald-200/70">
            Subtle vector campus environment for streamlined room reservation
          </p>
        </div>
      </motion.div>
    </div>
  );
}
