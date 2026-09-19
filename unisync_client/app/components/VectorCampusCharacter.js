"use client";

import { motion } from "framer-motion";
import { GraduationCap, BookOpen, Laptop, Sparkles, Award, Campus } from "lucide-react";

export default function VectorCampusCharacter() {
  return (
    <div className="relative w-full max-w-lg mx-auto flex items-center justify-center py-6 select-none">
      {/* Background Glowing Vector Backdrop */}
      <div className="absolute w-72 h-72 bg-emerald-500/15 rounded-full blur-3xl animate-pulse" />

      {/* Main Vector Campus Character SVG Scene */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 w-full flex flex-col items-center"
      >
        {/* Vector Student Illustration Card */}
        <div className="relative glass-card p-8 rounded-3xl border-emerald-500/30 shadow-2xl shadow-emerald-950/50 bg-[#080e0a]/90 space-y-6 text-center max-w-sm">
          {/* Top Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950 border border-emerald-500/30 text-emerald-300 text-xs font-bold shadow-md">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-spin" />
            <span>Varsity Campus Ecosystem</span>
          </div>

          {/* SVG Vector Character Art */}
          <div className="relative w-48 h-48 mx-auto flex items-center justify-center">
            <svg
              viewBox="0 0 200 200"
              className="w-full h-full text-emerald-400 drop-shadow-xl"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Varsity Building Architecture Vector Base */}
              <path
                d="M30 160H170V170H30V160Z"
                fill="#05240d"
                stroke="#10b981"
                strokeWidth="2"
              />
              <path
                d="M40 160V90L100 50L160 90V160H40Z"
                fill="#071d10"
                stroke="#34d399"
                strokeWidth="2.5"
              />
              {/* Pillars */}
              <rect x="60" y="100" width="12" height="60" rx="3" fill="#10b981" opacity="0.8" />
              <rect x="94" y="100" width="12" height="60" rx="3" fill="#10b981" opacity="0.8" />
              <rect x="128" y="100" width="12" height="60" rx="3" fill="#10b981" opacity="0.8" />
              {/* Roof Pediment Crest */}
              <polygon points="100,60 50,92 150,92" fill="#02b81c" opacity="0.4" stroke="#6adb6a" strokeWidth="2" />
              <circle cx="100" cy="80" r="8" fill="#6adb6a" />
            </svg>

            {/* Vector Animated Student Avatar Badge */}
            <motion.div
              animate={{ y: [-4, 4, -4] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -bottom-2 -right-2 glass-panel p-3 rounded-2xl border-emerald-400/40 shadow-xl bg-emerald-950/90 flex items-center gap-2"
            >
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-400 to-green-600 flex items-center justify-center text-white font-bold text-xs shadow">
                🎓
              </div>
              <div className="text-left">
                <span className="text-[11px] font-bold text-white block leading-tight">Student Sync</span>
                <span className="text-[9px] text-emerald-300">Live Campus Active</span>
              </div>
            </motion.div>
          </div>

          <p className="text-xs text-emerald-200/80 leading-relaxed font-medium">
            Intelligent university space management powered by real-time academic schedule synchronization.
          </p>
        </div>

        {/* Orbiting Floating Vector Academic Icons */}
        <motion.div
          animate={{ y: [-6, 6, -6], rotate: [0, 5, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-4 -left-6 glass-card p-3.5 rounded-2xl border-emerald-400/30 text-emerald-300 shadow-xl flex items-center gap-2 bg-[#080d09]"
        >
          <GraduationCap className="w-5 h-5 text-emerald-400" />
          <span className="text-xs font-bold text-white">Smart Academic</span>
        </motion.div>

        <motion.div
          animate={{ y: [6, -6, 6], rotate: [0, -5, 0] }}
          transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
          className="absolute -bottom-4 -left-4 glass-card p-3 rounded-2xl border-emerald-400/30 text-emerald-300 shadow-xl flex items-center gap-2 bg-[#080d09]"
        >
          <BookOpen className="w-4 h-4 text-green-400" />
          <span className="text-xs font-bold text-white">Library & Labs</span>
        </motion.div>

        <motion.div
          animate={{ y: [-8, 8, -8] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute -top-6 -right-6 glass-card p-3 rounded-2xl border-emerald-400/30 text-emerald-300 shadow-xl flex items-center gap-2 bg-[#080d09]"
        >
          <Laptop className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-bold text-white">Digital Hub</span>
        </motion.div>
      </motion.div>
    </div>
  );
}
