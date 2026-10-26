"use client";

import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import useSWR, { mutate } from "swr";
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Check,
  Trash2,
  X,
  Info,
  Calendar,
  Clock,
  Sparkles,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getApiUrl } from "../utils/apiUrl";

const authFetcher = (url) => {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const headers = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  return fetch(url, {
    headers,
    credentials: "include",
  }).then((res) => {
    if (!res.ok) return [];
    return res.json();
  });
};

export default function Notification() {
  const [open, setOpen] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [userEmail, setUserEmail] = useState("");
  const [mounted, setMounted] = useState(false);
  const dropdownRef = useRef(null);

  // Retrieve user email from localStorage and sync with /api/me
  useEffect(() => {
    setMounted(true);
    const savedEmail = typeof window !== "undefined" ? localStorage.getItem("userEmail") : null;
    if (savedEmail) {
      setUserEmail(savedEmail);
    }

    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    const apiUrl = getApiUrl();
    fetch(`${apiUrl}/api/me`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      credentials: "include",
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.email) {
          setUserEmail(data.email);
          if (typeof window !== "undefined") {
            localStorage.setItem("userEmail", data.email);
          }
        }
      })
      .catch(() => {});
  }, []);

  const apiUrl = getApiUrl();
  const notificationsUrl = userEmail
    ? `${apiUrl}/api/notifications?email=${encodeURIComponent(userEmail)}`
    : `${apiUrl}/api/notifications`;

  // Real-time polling every 3 seconds for user notifications
  const { data: notifications = [] } = useSWR(
    notificationsUrl,
    authFetcher,
    {
      refreshInterval: 3000,
      revalidateOnFocus: true,
      fallbackData: [],
    }
  );

  const safeNotifications = Array.isArray(notifications) ? notifications : [];
  const unreadCount = safeNotifications.filter((n) => !n.is_read && !n.read).length;

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const markAllAsRead = async () => {
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const headers = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      await fetch(`${getApiUrl()}/api/notifications/read-all`, {
        method: "PUT",
        headers,
        credentials: "include",
        body: JSON.stringify({ email: userEmail }),
      });
      mutate(notificationsUrl);
    } catch (err) {
      console.error("Failed to mark all as read:", err);
    }
  };

  const deleteNotification = async (id, e) => {
    if (e) e.stopPropagation();
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const headers = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;

      await fetch(`${getApiUrl()}/api/notifications/${id}`, {
        method: "DELETE",
        headers,
        credentials: "include",
      });
      if (selectedNotification?.id === id) {
        setSelectedNotification(null);
      }
      mutate(notificationsUrl);
    } catch (err) {
      console.error("Failed to delete notification:", err);
    }
  };

  const getNotificationIconDetails = (type) => {
    switch (type) {
      case "success":
        return {
          Icon: CheckCircle2,
          iconBg: "bg-emerald-950/80 text-emerald-400 border-emerald-500/40",
          badgeBg: "bg-emerald-900/60 text-emerald-300 border-emerald-500/30",
          label: "Confirmed",
        };
      case "warning":
        return {
          Icon: AlertTriangle,
          iconBg: "bg-amber-950/80 text-amber-400 border-amber-500/40",
          badgeBg: "bg-amber-900/60 text-amber-300 border-amber-500/30",
          label: "Pending",
        };
      case "error":
        return {
          Icon: XCircle,
          iconBg: "bg-red-950/80 text-red-400 border-red-500/40",
          badgeBg: "bg-red-900/60 text-red-300 border-red-500/30",
          label: "Cancelled / Declined",
        };
      default:
        return {
          Icon: Info,
          iconBg: "bg-cyan-950/80 text-cyan-400 border-cyan-500/40",
          badgeBg: "bg-cyan-900/60 text-cyan-300 border-cyan-500/30",
          label: "Notice",
        };
    }
  };

  return (
    <>
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

        {/* Animated Dropdown Menu */}
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 10 }}
              transition={{ type: "spring", stiffness: 400, damping: 28 }}
              className="absolute right-0 z-50 mt-3 w-80 sm:w-96 origin-top-right rounded-2xl glass-panel border border-emerald-500/30 shadow-2xl shadow-black/80 overflow-hidden bg-[#070d09]"
            >
              {/* Header */}
              <div className="p-4 border-b border-emerald-500/15 bg-[#090e0a]/95 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-emerald-400" />
                  <h3 className="font-bold text-white text-sm">Notifications</h3>
                  {unreadCount > 0 ? (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-500/30 text-emerald-300 text-[10px] font-bold">
                      {unreadCount} New
                    </span>
                  ) : (
                    <span className="text-[11px] text-emerald-400/60 font-medium">All caught up</span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1 transition"
                      title="Mark all as read"
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

              {/* Notification List Body */}
              <div className="max-h-80 overflow-y-auto divide-y divide-emerald-500/10">
                {safeNotifications.length > 0 ? (
                  safeNotifications.map((note) => {
                    const { Icon, iconBg } = getNotificationIconDetails(note.type);
                    const isRead = note.is_read || note.read;

                    return (
                      <motion.div
                        key={note.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setSelectedNotification(note)}
                        className={`p-4 flex items-start gap-3 transition-colors group relative cursor-pointer ${
                          isRead ? "bg-transparent opacity-75 hover:opacity-100" : "bg-emerald-950/30"
                        } hover:bg-emerald-900/30`}
                      >
                        <div className={`p-2 rounded-xl border flex-shrink-0 mt-0.5 ${iconBg}`}>
                          <Icon className="w-4 h-4" />
                        </div>

                        <div className="flex-1 pr-6 space-y-1">
                          <div className="flex items-center justify-between">
                            <h4 className="text-xs font-bold text-white group-hover:text-emerald-300 transition-colors">
                              {note.title}
                            </h4>
                            <span className="text-[10px] text-emerald-300/60">
                              {note.time || "Recent"}
                            </span>
                          </div>
                          <p className="text-xs text-emerald-100/80 leading-relaxed line-clamp-2">
                            {note.message}
                          </p>
                          <div className="pt-1 flex items-center gap-2">
                            <span className="text-[10px] text-emerald-400/80 hover:text-emerald-300 font-medium underline flex items-center gap-1">
                              View full message &rarr;
                            </span>
                          </div>
                        </div>

                        <button
                          onClick={(e) => deleteNotification(note.id, e)}
                          className="absolute right-3 top-3 p-1.5 rounded-lg text-emerald-400/40 hover:text-red-400 hover:bg-red-950/40 opacity-0 group-hover:opacity-100 transition-all"
                          aria-label="Delete notification"
                          title="Delete notification"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </motion.div>
                    );
                  })
                ) : (
                  <div className="p-8 text-center space-y-2 text-emerald-200/60">
                    <Bell className="w-8 h-8 mx-auto text-emerald-500/30" />
                    <p className="text-xs font-semibold text-white">No notifications yet</p>
                    <p className="text-[11px] text-emerald-300/50">
                      Notifications for room approvals, confirmations, or cancellations will appear here in real time.
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Full Message Popup Modal rendered directly into document.body as a true fullscreen lightbox */}
      {mounted && typeof document !== "undefined" && createPortal(
        <AnimatePresence>
          {selectedNotification && (
            <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
              {/* Fullscreen Backdrop / Lightbox Blur */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedNotification(null)}
                className="fixed inset-0 bg-black/85 backdrop-blur-md"
              />

              {/* Modal Dialog perfectly centered in viewport */}
              <motion.div
                initial={{ opacity: 0, scale: 0.92, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.92, y: 15 }}
                transition={{ type: "spring", stiffness: 350, damping: 26 }}
                className="relative w-full max-w-lg bg-[#08100a] border border-emerald-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black overflow-hidden z-10 m-auto"
              >
                {/* Ambient Glow */}
                <div className="absolute -top-16 -right-16 w-44 h-44 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

                {/* Modal Header */}
                <div className="flex items-start justify-between gap-4 pb-4 border-b border-emerald-500/20">
                  <div className="flex items-center gap-3">
                    {(() => {
                      const { Icon, iconBg, badgeBg, label } = getNotificationIconDetails(
                        selectedNotification.type
                      );
                      return (
                        <>
                          <div className={`p-3 rounded-2xl border ${iconBg}`}>
                            <Icon className="w-6 h-6" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="text-lg font-bold text-white">
                                {selectedNotification.title}
                              </h3>
                              <span
                                className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${badgeBg}`}
                              >
                                {label}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-emerald-300/60 mt-0.5">
                              <Clock className="w-3.5 h-3.5" />
                              <span>{selectedNotification.time || "Recent"}</span>
                            </div>
                          </div>
                        </>
                      );
                    })()}
                  </div>

                  <button
                    onClick={() => setSelectedNotification(null)}
                    className="p-2 rounded-xl text-emerald-400/60 hover:text-white hover:bg-emerald-900/40 transition"
                    aria-label="Close modal"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Full Content Body */}
                <div className="py-5 space-y-4">
                  <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/20 text-emerald-100 text-sm leading-relaxed whitespace-pre-wrap">
                    {selectedNotification.message}
                  </div>

                  {selectedNotification.user_email && (
                    <div className="flex items-center justify-between text-xs text-emerald-300/60 px-1">
                      <span>Account Recipient:</span>
                      <span className="font-semibold text-emerald-200">
                        {selectedNotification.user_email}
                      </span>
                    </div>
                  )}
                </div>

                {/* Modal Footer */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-emerald-500/20">
                  <button
                    onClick={() => deleteNotification(selectedNotification.id)}
                    className="px-4 py-2 text-xs font-semibold text-red-400 hover:text-red-300 hover:bg-red-950/40 rounded-xl transition flex items-center gap-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                  <button
                    onClick={() => setSelectedNotification(null)}
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-950/50 transition"
                  >
                    Close
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
}
