"use client";

import * as React from "react";
import { useEffect, useState } from "react";
import useSWR from "swr";
import { motion } from "framer-motion";
import { 
  Building2, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Send, 
  ArrowLeft,
  Info
} from "lucide-react";
import Link from "next/link";

const fetcher = (url) => fetch(url).then((res) => res.json());

export default function RoomDetailsPage({ params }) {
  const { id } = React.use(params);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [endingTime, setEndingTime] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  useEffect(() => {
    const date = sessionStorage.getItem("selectedDate");
    const time = sessionStorage.getItem("selectedTime");
    if (date) setSelectedDate(date);
    if (time) setSelectedTime(time);
  }, []);

  const { data: room, error, isLoading } = useSWR(
    `http://localhost:5000/api/RoomDetails/${id}`,
    fetcher
  );

  const handleRequestRoom = async () => {
    if (!endingTime) {
      setToastMessage({ type: "error", text: "Please specify an ending time." });
      return;
    }

    setIsSubmitting(true);
    setToastMessage(null);

    try {
      const res = await fetch("http://localhost:5000/api/request-room", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          roomId: room.id,
          roomName: room.name,
          selectedDate: selectedDate,
          startTime: selectedTime,
          endingTime: endingTime,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setToastMessage({ type: "success", text: "Room requested successfully! Pending admin approval." });
      } else {
        setToastMessage({ type: "error", text: data.message || "Failed to request room." });
      }
    } catch (err) {
      console.error("Request error:", err);
      setToastMessage({ type: "error", text: "Server error occurred while requesting room." });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-12 h-12 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-emerald-200 font-semibold">Loading room details...</p>
      </div>
    );
  }

  if (error || !room) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="glass-card p-8 rounded-3xl border-red-500/30 text-red-300 space-y-4">
          <AlertCircle className="w-12 h-12 mx-auto text-red-400" />
          <h2 className="text-xl font-bold">Error Loading Room</h2>
          <p className="text-sm text-red-200/70">
            Could not fetch room details. Please return to the booking page.
          </p>
          <Link href="/RoomBooking">
            <button className="px-6 py-2.5 bg-emerald-600 text-white font-semibold rounded-xl text-sm">
              Back to Room Booking
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 space-y-6">
      {/* Back Link */}
      <Link href="/RoomBooking" className="inline-flex items-center gap-2 text-sm text-emerald-400 hover:text-emerald-300 font-semibold transition-colors">
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Available Rooms</span>
      </Link>

      {/* Main Glass Card */}
      <div className="glass-panel p-6 sm:p-10 rounded-3xl border-emerald-500/20 shadow-2xl space-y-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Title */}
        <div className="border-b border-emerald-500/15 pb-6 flex items-center justify-between">
          <div>
            <span className="text-xs uppercase tracking-widest font-semibold text-emerald-400">
              Room Reservation Overview
            </span>
            <h1 className="text-3xl font-extrabold text-white mt-1">
              {room.name}
            </h1>
          </div>
          <div className="px-4 py-2 rounded-xl bg-emerald-950/70 border border-emerald-500/30 text-emerald-300 font-bold text-sm">
            {room.type || "Classroom"}
          </div>
        </div>

        {/* Information Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Room Specs */}
          <div className="glass-card p-5 rounded-2xl border-emerald-500/20 space-y-3">
            <div className="flex items-center gap-2 text-emerald-300 font-bold text-sm">
              <Building2 className="w-4 h-4 text-emerald-400" />
              <span>Room Information</span>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-emerald-100/80">
                <span className="text-emerald-400/80">Room ID:</span>
                <span className="font-semibold text-white">{room.id}</span>
              </div>
              <div className="flex justify-between text-emerald-100/80">
                <span className="text-emerald-400/80">Annex / Building:</span>
                <span className="font-semibold text-white">{room.annex || "Main Campus"}</span>
              </div>
              <div className="flex justify-between text-emerald-100/80">
                <span className="text-emerald-400/80">Type:</span>
                <span className="font-semibold text-white">{room.type || "Classroom"}</span>
              </div>
            </div>
          </div>

          {/* Booking Specs */}
          <div className="glass-card p-5 rounded-2xl border-emerald-500/20 space-y-3">
            <div className="flex items-center gap-2 text-emerald-300 font-bold text-sm">
              <Calendar className="w-4 h-4 text-emerald-400" />
              <span>Selected Session</span>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-emerald-100/80">
                <span className="text-emerald-400/80">Target Date:</span>
                <span className="font-semibold text-white">{selectedDate || "Not Selected"}</span>
              </div>
              <div className="flex justify-between text-emerald-100/80">
                <span className="text-emerald-400/80">Start Time:</span>
                <span className="font-semibold text-white">{selectedTime || "Not Selected"}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Ending Time Selector */}
        <div className="space-y-3 pt-2">
          <label className="block text-sm font-bold text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-emerald-400" />
            <span>Select Ending Time</span>
          </label>
          <input
            type="time"
            value={endingTime}
            onChange={(e) => setEndingTime(e.target.value)}
            className="w-full sm:w-1/2 glass-input p-3.5 rounded-xl text-sm border-emerald-500/30 text-white"
          />
        </div>

        {/* Toast Feedback */}
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-4 rounded-xl border flex items-center gap-3 text-sm font-semibold ${
              toastMessage.type === "success"
                ? "bg-emerald-950/80 border-emerald-500 text-emerald-300"
                : "bg-red-950/80 border-red-500 text-red-300"
            }`}
          >
            {toastMessage.type === "success" ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
            )}
            <span>{toastMessage.text}</span>
          </motion.div>
        )}

        {/* Action Button */}
        <div className="pt-4 border-t border-emerald-500/15 flex justify-end">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            disabled={isSubmitting}
            onClick={handleRequestRoom}
            className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-[#02B81C] to-emerald-500 hover:from-emerald-500 hover:to-[#02B81C] text-white font-bold rounded-xl shadow-xl shadow-emerald-950/50 flex items-center justify-center gap-3 transition-all duration-300 disabled:opacity-50"
          >
            <Send className="w-5 h-5" />
            <span>{isSubmitting ? "Submitting Request..." : "Submit Room Request"}</span>
          </motion.button>
        </div>
      </div>
    </div>
  );
}
