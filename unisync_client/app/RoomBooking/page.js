"use client";

import { useState } from "react";
import DatePicker from "react-datepicker";
import useSWR from "swr";
import "react-datepicker/dist/react-datepicker.css";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Filter, 
  Calendar as CalendarIcon, 
  Clock, 
  Check, 
  SlidersHorizontal, 
  DoorClosed, 
  ArrowRight,
  Tv,
  Monitor,
  Presentation
} from "lucide-react";

const fetcher = (url, body) =>
  fetch(`http://localhost:5000${url}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  }).then((res) => res.json());

const roomTypes = ["Classroom", "Seminar Hall", "Conference Room", "Lab Room"];
const amenities = ["Projector", "PC", "Whiteboard"];

export default function RoomBooking() {
  const [selectedType, setSelectedType] = useState("");
  const [selectedAmenities, setSelectedAmenities] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState("");
  const [filterParams, setFilterParams] = useState(null);
  const [selectedRoomId, setSelectedRoomId] = useState(null);

  const toggleSelect = (id) => {
    setSelectedRoomId((prevId) => (prevId === id ? null : id));
  };

  const toggleAmenity = (amenity) => {
    setSelectedAmenities((prev) =>
      prev.includes(amenity)
        ? prev.filter((a) => a !== amenity)
        : [...prev, amenity]
    );
  };

  const formatDate = (date) => {
    if (!date) return "";
    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, "0");
    const day = `${date.getDate()}`.padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const handleViewDetails = () => {
    if (selectedDate) sessionStorage.setItem("selectedDate", formatDate(selectedDate));
    if (selectedTime) sessionStorage.setItem("selectedTime", selectedTime);
  };

  const handleFilter = () => {
    if (!selectedDate || !selectedTime) return alert("Please select both Date and Time.");

    const formattedDate = formatDate(selectedDate);
    const query = new URLSearchParams({
      type: selectedType,
      amenities: selectedAmenities.join(","),
      date: formattedDate,
      time: selectedTime,
    });

    setFilterParams(query.toString());
  };

  // SWR hook for room search
  const { data: rooms, error, isLoading } = useSWR(
    filterParams
      ? [
          "/api/available-rooms",
          {
            type: selectedType,
            amenities: selectedAmenities,
            date: formatDate(selectedDate),
            time: selectedTime,
          },
        ]
      : null,
    ([url, body]) => fetcher(url, body)
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-950/60 border border-emerald-500/20 text-emerald-300 text-xs font-semibold uppercase tracking-wider">
          <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-400" />
          <span>Real-Time Reservation</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
          Find & Book <span className="bg-gradient-to-r from-[#6ADB6A] to-emerald-400 bg-clip-text text-transparent">Campus Rooms</span>
        </h1>
        <p className="text-emerald-100/70 text-sm sm:text-base">
          Filter available classrooms, seminar halls, and computer labs based on date, time, and requested amenities.
        </p>
      </div>

      {/* Filter Card */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border-emerald-500/20 shadow-2xl space-y-6">
        <div className="flex items-center gap-2 pb-4 border-b border-emerald-500/15">
          <Filter className="w-5 h-5 text-emerald-400" />
          <h2 className="text-lg font-bold text-white">Filter Parameters</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Room Type */}
          <div className="space-y-2">
            <label className="block text-xs uppercase tracking-wider font-semibold text-emerald-300">
              Room Type
            </label>
            <select
              className="w-full glass-input p-3 rounded-xl text-sm border-emerald-500/20 text-white bg-[#041d11]"
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
            >
              <option value="">All Room Types</option>
              {roomTypes.map((type) => (
                <option className="bg-[#05240d] text-white" key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          {/* Amenities */}
          <div className="space-y-2">
            <label className="block text-xs uppercase tracking-wider font-semibold text-emerald-300">
              Amenities
            </label>
            <div className="flex flex-wrap gap-2 pt-1">
              {amenities.map((item) => {
                const isSelected = selectedAmenities.includes(item);
                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => toggleAmenity(item)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 border ${
                      isSelected
                        ? "bg-gradient-to-r from-emerald-600 to-green-500 text-white border-emerald-400 shadow-md shadow-emerald-900/40"
                        : "glass-card text-emerald-200/80 border-emerald-500/20 hover:border-emerald-400/40"
                    }`}
                  >
                    {item}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Date Picker */}
          <div className="space-y-2">
            <label className="block text-xs uppercase tracking-wider font-semibold text-emerald-300 flex items-center gap-1.5">
              <CalendarIcon className="w-3.5 h-3.5 text-emerald-400" />
              <span>Select Date</span>
            </label>
            <DatePicker
              selected={selectedDate}
              onChange={(date) => setSelectedDate(date)}
              className="w-full glass-input p-3 rounded-xl text-sm border-emerald-500/20 text-white placeholder-emerald-400/50"
              placeholderText="Choose Date..."
              dateFormat="MMMM d, yyyy"
            />
          </div>

          {/* Time Input */}
          <div className="space-y-2">
            <label className="block text-xs uppercase tracking-wider font-semibold text-emerald-300 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-emerald-400" />
              <span>Select Start Time</span>
            </label>
            <input
              type="time"
              value={selectedTime}
              onChange={(e) => setSelectedTime(e.target.value)}
              className="w-full glass-input p-3 rounded-xl text-sm border-emerald-500/20 text-white"
            />
          </div>
        </div>

        {/* Filter Action */}
        <div className="pt-4 border-t border-emerald-500/15 flex justify-end">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleFilter}
            className="px-8 py-3.5 bg-gradient-to-r from-[#02B81C] to-emerald-500 hover:from-emerald-500 hover:to-[#02B81C] text-white font-bold rounded-xl shadow-lg shadow-emerald-950/50 flex items-center gap-2 text-sm"
          >
            <span>Apply Filters & Search</span>
            <ArrowRight className="w-4 h-4" />
          </motion.button>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="glass-card p-12 rounded-3xl text-center space-y-3 border-emerald-500/20">
          <div className="w-10 h-10 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-emerald-200 font-semibold text-sm">Searching for available rooms...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="glass-card p-8 rounded-3xl text-center space-y-2 border-red-500/30 text-red-300">
          <p className="font-bold">Failed to load available rooms.</p>
          <p className="text-xs text-red-400/80">Please check your backend connection or try again.</p>
        </div>
      )}

      {/* Room Grid Results */}
      {rooms && rooms.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <DoorClosed className="w-5 h-5 text-emerald-400" />
              <span>Available Rooms ({rooms.length})</span>
            </h2>
            <span className="text-xs text-emerald-300/80">Click a room card to select</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {rooms.map((room) => {
              const isSelected = selectedRoomId === room.id;
              return (
                <motion.div
                  key={room.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => toggleSelect(room.id)}
                  className={`p-4 rounded-2xl cursor-pointer text-center transition-all duration-300 relative border ${
                    isSelected
                      ? "bg-gradient-to-br from-emerald-600 to-green-700 border-emerald-300 text-white shadow-xl shadow-emerald-900/50 glow-emerald"
                      : "glass-card border-emerald-500/20 text-emerald-100 hover:border-emerald-400/50"
                  }`}
                >
                  {isSelected && (
                    <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-white text-emerald-700 flex items-center justify-center font-bold">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  )}

                  <div className="text-base font-bold mb-1">{room.name}</div>
                  <div className="text-xs text-emerald-200/70 font-medium">{room.type || "Classroom"}</div>
                </motion.div>
              );
            })}
          </div>

          {/* View Details Action Button */}
          <AnimatePresence>
            {selectedRoomId && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="pt-6 flex justify-center"
              >
                <Link href={`/RoomDetails/${selectedRoomId}`}>
                  <button
                    onClick={handleViewDetails}
                    className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-xl shadow-blue-950/50 flex items-center gap-3 transition-all duration-300"
                  >
                    <span>Proceed to View Details & Reserve</span>
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </Link>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Empty State */}
      {rooms && rooms.length === 0 && (
        <div className="glass-card p-12 rounded-3xl text-center space-y-3 border-emerald-500/20">
          <DoorClosed className="w-12 h-12 text-emerald-500/40 mx-auto" />
          <h3 className="text-lg font-bold text-white">No Available Rooms Found</h3>
          <p className="text-sm text-emerald-100/60 max-w-md mx-auto">
            Try choosing a different date, time, or amenity selection to view available university rooms.
          </p>
        </div>
      )}
    </div>
  );
}