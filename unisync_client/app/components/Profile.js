"use client";

import React, { useState, useRef, useEffect } from "react";
import { UserIcon, ArrowLeftOnRectangleIcon, Cog6ToothIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

export default function Profile() {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);
  const router = useRouter();

  const handleToggle = () => setOpen(!open);

  const handleSignOut = () => {
    localStorage.removeItem("token");
    // Clear cookie
    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    router.push("/Login");
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleToggle}
        className="flex items-center justify-center w-10 h-10 rounded-full bg-emerald-950/80 border border-emerald-500/30 text-emerald-300 hover:text-white hover:border-emerald-400 transition-all shadow-md"
      >
        <UserIcon className="w-5 h-5" />
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 8 }}
            transition={{ type: "spring", stiffness: 400, damping: 28 }}
            className="absolute right-0 z-50 mt-3 w-52 origin-top-right rounded-2xl glass-panel border border-emerald-500/30 shadow-2xl shadow-black/80 overflow-hidden bg-[#080d09]"
          >
            <div className="p-1.5 space-y-1">
              <Link
                href="/Profile"
                onClick={() => setOpen(false)}
                className="flex items-center w-full px-4 py-2.5 text-xs font-bold text-white rounded-xl hover:bg-emerald-900/40 transition"
              >
                <UserIcon className="w-4 h-4 mr-2 text-emerald-400" />
                <span>My Profile</span>
              </Link>

              <button
                onClick={handleSignOut}
                className="flex items-center w-full px-4 py-2.5 text-xs font-bold text-red-400 rounded-xl hover:bg-red-950/40 transition"
              >
                <ArrowLeftOnRectangleIcon className="w-4 h-4 mr-2 text-red-400" />
                <span>Sign Out</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
