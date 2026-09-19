"use client";

import { useState } from "react";
import useSWR, { mutate } from "swr";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, 
  Calendar, 
  Clock, 
  DoorClosed, 
  CheckCircle2, 
  Clock3, 
  XCircle, 
  Trash2,
  BookmarkCheck
} from "lucide-react";

const fetcher = (url) => fetch(url, { credentials: "include" }).then((res) => res.json());

const statusBadges = {
  Approved: {
    bg: "bg-emerald-950/80 text-emerald-300 border-emerald-500/40 glow-emerald",
    icon: CheckCircle2,
  },
  Pending: {
    bg: "bg-amber-950/80 text-amber-300 border-amber-500/40",
    icon: Clock3,
  },
  Rejected: {
    bg: "bg-red-950/80 text-red-300 border-red-500/40",
    icon: XCircle,
  },
};

export default function MyBookings() {
  const { data: bookingsData, error } = useSWR("http://localhost:5000/api/my-bookings", fetcher);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");

  const filteredBookings = (bookingsData || []).filter((booking) => {
    const matchesStatus = filter === "All" || booking.status === filter;
    const roomName = booking.room ? booking.room.toLowerCase() : "";
    const bookingDate = booking.date || "";
    const matchesSearch = roomName.includes(search.toLowerCase()) || bookingDate.includes(search);
    return matchesStatus && matchesSearch;
  });

  const handleCancelBooking = async (id) => {
    const confirmed = confirm("Are you sure you want to cancel this booking request?");
    if (!confirmed) return;

    try {
      const res = await fetch(`http://localhost:5000/api/room-requests/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (res.ok) {
        mutate("http://localhost:5000/api/my-bookings");
      } else {
        alert("Failed to cancel request.");
      }
    } catch (err) {
      console.error(err);
      alert("Server error.");
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Page Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-950/60 border border-emerald-500/20 text-emerald-300 text-xs font-semibold uppercase tracking-wider">
          <BookmarkCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Personal Reservation History</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
          My Room <span className="bg-gradient-to-r from-[#6ADB6A] to-emerald-400 bg-clip-text text-transparent">Bookings</span>
        </h1>
        <p className="text-emerald-100/70 text-sm sm:text-base">
          Track real-time approval status, check assigned schedules, or cancel pending requests.
        </p>
      </div>

      {/* Control Bar: Search & Filter Tabs */}
      <div className="glass-panel p-4 sm:p-6 rounded-2xl border-emerald-500/20 flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-emerald-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            placeholder="Search by room or date..."
            className="w-full glass-input pl-10 pr-4 py-2.5 rounded-xl text-sm border-emerald-500/20 text-white placeholder-emerald-400/50"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Status Filter Tabs */}
        <div className="flex gap-2 flex-wrap w-full md:w-auto">
          {["All", "Approved", "Pending"].map((status) => {
            const isActive = filter === status;
            return (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-5 py-2 rounded-xl text-xs font-bold transition-all duration-200 border ${
                  isActive
                    ? "bg-gradient-to-r from-emerald-600 to-green-500 text-white border-emerald-400 shadow-md shadow-emerald-900/40"
                    : "glass-card text-emerald-200/80 border-emerald-500/20 hover:border-emerald-400/40"
                }`}
              >
                {status}
              </button>
            );
          })}
        </div>
      </div>

      {/* Bookings List */}
      <div className="space-y-4">
        {filteredBookings.map((booking) => {
          const badgeConfig = statusBadges[booking.status] || statusBadges.Pending;
          const BadgeIcon = badgeConfig.icon;

          return (
            <motion.div
              key={booking.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card p-5 sm:p-6 rounded-2xl border-emerald-500/20 hover:border-emerald-400/40 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-all duration-300"
            >
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <DoorClosed className="w-5 h-5 text-emerald-400" />
                  <h3 className="font-bold text-lg text-white">{booking.room}</h3>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-xs text-emerald-200/70 font-medium">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{booking.date}</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{booking.start_time} - {booking.end_time}</span>
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 pt-3 sm:pt-0 border-emerald-500/10">
                <div className={`px-3.5 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 ${badgeConfig.bg}`}>
                  <BadgeIcon className="w-3.5 h-3.5" />
                  <span>{booking.status}</span>
                </div>

                {booking.status === "Pending" && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-4 py-2 bg-red-600/80 hover:bg-red-600 text-white rounded-xl text-xs font-bold shadow-md shadow-red-950/40 flex items-center gap-1.5 transition-all"
                    onClick={() => handleCancelBooking(booking.id)}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Cancel Request</span>
                  </motion.button>
                )}
              </div>
            </motion.div>
          );
        })}

        {/* Empty State */}
        {bookingsData && filteredBookings.length === 0 && (
          <div className="glass-card p-12 rounded-3xl text-center space-y-3 border-emerald-500/20">
            <BookmarkCheck className="w-12 h-12 text-emerald-500/40 mx-auto" />
            <h3 className="text-lg font-bold text-white">No Bookings Found</h3>
            <p className="text-sm text-emerald-100/60 max-w-md mx-auto">
              You haven&apos;t requested any room bookings matching your current filter settings.
            </p>
          </div>
        )}

        {/* Loading */}
        {!bookingsData && !error && (
          <div className="glass-card p-12 text-center space-y-3 border-emerald-500/20">
            <div className="w-8 h-8 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-emerald-200 text-sm font-semibold">Loading your bookings...</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="glass-card p-8 rounded-3xl text-center border-red-500/30 text-red-300">
            <p className="font-bold">Failed to load booking history.</p>
          </div>
        )}
      </div>
    </div>
  );
}
