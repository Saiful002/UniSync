"use client";

import { useState } from "react";
import useSWR from "swr";
import { motion } from "framer-motion";
import { 
  User, 
  Mail, 
  ShieldCheck, 
  KeyRound, 
  CalendarCheck, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Lock,
  Sparkles
} from "lucide-react";

const fetcher = (url) => fetch(url, { credentials: "include" }).then((res) => res.json());

export default function ProfilePage() {
  const { data: user, error, isLoading } = useSWR("/api/me", fetcher);
  const { data: bookings } = useSWR("http://localhost:5000/api/my-bookings", fetcher);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [toast, setToast] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const totalBookings = bookings?.length || 0;
  const pendingBookings = bookings?.filter((b) => b.status === "Pending").length || 0;
  const approvedBookings = bookings?.filter((b) => b.status === "Approved").length || 0;

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setToast({ type: "error", text: "New password and confirmation do not match." });
      return;
    }

    setIsUpdating(true);
    setToast(null);

    try {
      const res = await fetch("http://localhost:5000/api/user/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await res.json();

      if (res.ok) {
        setToast({ type: "success", text: "Password changed successfully!" });
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        setToast({ type: "error", text: data.message || "Failed to update password." });
      }
    } catch (err) {
      setToast({ type: "error", text: "Server error occurred while updating password." });
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-10 h-10 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-emerald-200 font-semibold text-sm">Loading user profile...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="text-center max-w-xl mx-auto space-y-2">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-950/60 border border-emerald-500/20 text-emerald-300 text-xs font-semibold uppercase tracking-wider">
          <User className="w-3.5 h-3.5 text-emerald-400" />
          <span>User Account Dashboard</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white">
          My Account <span className="bg-gradient-to-r from-[#6ADB6A] to-emerald-400 bg-clip-text text-transparent">Profile</span>
        </h1>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Profile Summary Card */}
        <div className="lg:col-span-1 glass-panel p-6 sm:p-8 rounded-3xl border-emerald-500/20 shadow-2xl space-y-6 text-center relative overflow-hidden bg-[#080d09]/90">
          <div className="absolute top-0 right-0 w-36 h-36 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-br from-emerald-500 to-green-600 border-2 border-emerald-400/40 flex items-center justify-center text-white shadow-xl shadow-emerald-950/60">
            <User className="w-10 h-10" />
          </div>

          <div className="space-y-1">
            <h2 className="text-lg font-bold text-white break-all">{user?.email || "Student Account"}</h2>
            <p className="text-xs text-emerald-400 font-semibold">User ID: #{user?.id || "N/A"}</p>
          </div>

          <div className="pt-2">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-950/80 border border-emerald-500/30 text-emerald-300 text-xs font-bold">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>{user?.email?.includes("admin") ? "Administrator" : "Verified Student"}</span>
            </span>
          </div>

          <div className="pt-4 border-t border-emerald-500/15 space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="text-emerald-200/70">Account Status:</span>
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Active
              </span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-emerald-200/70">Access Role:</span>
              <span className="text-white font-semibold">{user?.email?.includes("admin") ? "Admin Panel Access" : "Room Reservation"}</span>
            </div>
          </div>
        </div>

        {/* Right Column: Stats & Security Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Reservation KPI Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="glass-card p-5 rounded-2xl border-emerald-500/20 text-center space-y-1">
              <span className="text-xs font-semibold text-emerald-300/80 uppercase tracking-wider">Total Requests</span>
              <div className="text-2xl font-extrabold text-white">{totalBookings}</div>
            </div>

            <div className="glass-card p-5 rounded-2xl border-emerald-500/20 text-center space-y-1">
              <span className="text-xs font-semibold text-amber-300/80 uppercase tracking-wider">Pending</span>
              <div className="text-2xl font-extrabold text-amber-400">{pendingBookings}</div>
            </div>

            <div className="glass-card p-5 rounded-2xl border-emerald-500/20 text-center space-y-1">
              <span className="text-xs font-semibold text-emerald-400/80 uppercase tracking-wider">Approved</span>
              <div className="text-2xl font-extrabold text-[#6ADB6A]">{approvedBookings}</div>
            </div>
          </div>

          {/* Security & Change Password Card */}
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border-emerald-500/20 shadow-2xl space-y-6 bg-[#080d09]/90">
            <div className="flex items-center gap-2 pb-4 border-b border-emerald-500/15">
              <KeyRound className="w-5 h-5 text-emerald-400" />
              <h3 className="text-lg font-bold text-white">Security & Password</h3>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs uppercase tracking-wider font-semibold text-emerald-300 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Current Password</span>
                </label>
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                  className="w-full glass-input p-3.5 rounded-xl text-sm border-emerald-500/20 text-white"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs uppercase tracking-wider font-semibold text-emerald-300">
                    New Password
                  </label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    className="w-full glass-input p-3.5 rounded-xl text-sm border-emerald-500/20 text-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs uppercase tracking-wider font-semibold text-emerald-300">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    className="w-full glass-input p-3.5 rounded-xl text-sm border-emerald-500/20 text-white"
                  />
                </div>
              </div>

              {toast && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-3.5 rounded-xl border text-xs font-semibold flex items-center gap-2 ${
                    toast.type === "success"
                      ? "bg-emerald-950/90 border-emerald-500 text-emerald-300"
                      : "bg-red-950/90 border-red-500 text-red-300"
                  }`}
                >
                  {toast.type === "success" ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                  )}
                  <span>{toast.text}</span>
                </motion.div>
              )}

              <div className="pt-2 flex justify-end">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  disabled={isUpdating}
                  type="submit"
                  className="px-6 py-3.5 bg-gradient-to-r from-[#02B81C] to-emerald-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-950/60 text-xs transition"
                >
                  {isUpdating ? "Updating Password..." : "Update Password"}
                </motion.button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
