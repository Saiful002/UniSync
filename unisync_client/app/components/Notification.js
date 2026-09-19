"use client";

import React, { useState, useEffect, useRef } from "react";
import { Bell, CheckCircle2, AlertTriangle, XCircle, Check, Trash2, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const mockNotifications = [
  { id: 1, type: "success", title: "Booking Confirmed", message: "Room 402 booking confirmed for 12 April at 3:00 PM.", time: "10m ago", read: false },
  { id: 2, type: "warning", title: "Pending Approval", message: "Room 105 booking is pending admin approval for 15 April.", time: "1h ago", read: false },
  { id: 3, type: "error", title: "Booking Rejected", message: "Seminar Hall reservation rejected for 10 April (Maintenance).", time: "1d ago", read: true },
];

export default function Notification() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState(mockNotifications);
  const dropdownRef = useRef(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const deleteNotification = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      {/* Bell Trigger Button */}
      <motion.button
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setOpen(!open)}
        className="relative p-2.5 rounded-full text-emerald-200 hover:text-white hover:bg-emerald-900/40 transition-colors focus:outline-none"
        aria-label="View notifications"
      >
        <Bell className="w-5 h-5 text-emerald-300" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 inline-flex items-center justify-center min-w-5 h-5 px-1 text-[11px] font-extrabold leading-none text-white bg-red-600 border-2 border-[#050806] rounded-full shadow-lg shadow-red-950/60 animate-pulse">
            {unreadCount}
          </span>
        )}
      </motion.button>

      {/* Animated Popover */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            transition={{ type: "spring", stiffness: 400, damping: 28 }}
            className="absolute right-0 z-50 mt-3 w-80 sm:w-96 origin-top-right rounded-2xl glass-panel border border-emerald-500/30 shadow-2xl shadow-black/80 overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 border-b border-emerald-500/15 bg-[#090e0a]/90 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-emerald-400" />
                <h3 className="font-bold text-white text-sm">Notifications</h3>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-500/30 text-emerald-300 text-[10px] font-bold">
                    {unreadCount} New
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1 transition"
                  >
                    <Check className="w-3 h-3" />
                    <span>Mark all read</span>
                  </button>
                )}
                <button
                  onClick={() => setOpen(false)}
                  className="p-1 rounded-lg text-emerald-400/60 hover:text-white hover:bg-emerald-900/40 transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* List Body */}
            <div className="max-h-80 overflow-y-auto divide-y divide-emerald-500/10">
              {notifications.length > 0 ? (
                notifications.map((note) => {
                  let Icon = CheckCircle2;
                  let iconBg = "bg-emerald-950/80 text-emerald-400 border-emerald-500/30";

                  if (note.type === "warning") {
                    Icon = AlertTriangle;
                    iconBg = "bg-amber-950/80 text-amber-400 border-amber-500/30";
                  } else if (note.type === "error") {
                    Icon = XCircle;
                    iconBg = "bg-red-950/80 text-red-400 border-red-500/30";
                  }

                  return (
                    <motion.div
                      key={note.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className={`p-4 flex items-start gap-3 transition-colors group relative ${
                        note.read ? "bg-transparent opacity-80" : "bg-emerald-950/20"
                      } hover:bg-emerald-900/20`}
                    >
                      <div className={`p-2 rounded-xl border flex-shrink-0 mt-0.5 ${iconBg}`}>
                        <Icon className="w-4 h-4" />
                      </div>

                      <div className="flex-1 pr-6 space-y-1">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-bold text-white">{note.title}</h4>
                          <span className="text-[10px] text-emerald-300/60">{note.time}</span>
                        </div>
                        <p className="text-xs text-emerald-100/80 leading-relaxed">
                          {note.message}
                        </p>
                      </div>

                      <button
                        onClick={() => deleteNotification(note.id)}
                        className="absolute right-3 top-3 p-1 rounded-lg text-emerald-400/40 hover:text-red-400 hover:bg-red-950/40 opacity-0 group-hover:opacity-100 transition-all"
                        aria-label="Delete notification"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </motion.div>
                  );
                })
              ) : (
                <div className="p-8 text-center space-y-2 text-emerald-200/60">
                  <Bell className="w-8 h-8 mx-auto text-emerald-500/30" />
                  <p className="text-xs font-semibold text-white">No new notifications</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
