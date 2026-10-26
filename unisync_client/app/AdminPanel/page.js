"use client";

import React, { useState } from "react";
import useSWR, { mutate } from "swr";
import {
  ChartBarIcon,
  UserGroupIcon,
  HomeModernIcon,
  Cog8ToothIcon,
  PlusCircleIcon,
  TrashIcon,
  PencilSquareIcon,
  CheckCircleIcon,
  XCircleIcon,
  CalendarDaysIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import { motion } from "framer-motion";
import { getApiUrl } from "../utils/apiUrl";

const authFetcher = (url) => {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const headers = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const apiUrl = getApiUrl();

  return fetch(`${apiUrl}${url}`, {
    headers,
    credentials: "include",
  }).then((res) => {
    if (!res.ok) return [];
    return res.json();
  });
};

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const API_URL = getApiUrl();

  // Dashboard & Rooms & Users Data
  const { data: requests = [], mutate: mutateRequests } = useSWR("/api/room-requests", authFetcher);
  const { data: rooms = [], mutate: mutateRooms } = useSWR("/api/rooms", authFetcher);
  const { data: users = [], mutate: mutateUsers } = useSWR("/api/users", authFetcher);

  // Room Form States
  const [newRoom, setNewRoom] = useState({ name: "", annex: "", type_id: "" });
  const [editRoom, setEditRoom] = useState(null);

  // Date-wise Reservations Filter (defaults to empty to show ALL bookings)
  const todayStr = new Date().toISOString().split("T")[0];
  const [filterDate, setFilterDate] = useState("");

  const bookingsQueryUrl = filterDate ? `/api/admin/bookings?date=${filterDate}` : `/api/admin/bookings`;
  const { data: bookings = [], mutate: mutateBookings } = useSWR(bookingsQueryUrl, authFetcher);

  const safeRequests = Array.isArray(requests) ? requests : [];
  const safeRooms = Array.isArray(rooms) ? rooms : [];
  const safeUsers = Array.isArray(users) ? users : [];
  const safeBookings = Array.isArray(bookings) ? bookings : [];

  const handleDeleteUser = async (id) => {
    if (!confirm("Are you sure you want to delete this user?")) return;

    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const res = await fetch(`${API_URL}/api/users/${id}`, {
        method: "DELETE",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        credentials: "include",
      });
      const result = await res.json();
      alert(result.message || "User deleted");
      mutateUsers();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDecision = async (id, decision) => {
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const res = await fetch(`${API_URL}/api/room-requests/${id}/${decision}`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        credentials: "include",
      });
      const result = await res.json();
      alert(result.message || `Request ${decision}ed successfully! Notification sent to user.`);
      mutateRequests();
      mutateBookings();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCancelBooking = async (id) => {
    if (
      !confirm(
        "Are you sure you want to cancel this room reservation? This will delete the booking from the database and automatically notify the user."
      )
    ) {
      return;
    }

    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const res = await fetch(`${API_URL}/api/admin/bookings/${id}`, {
        method: "DELETE",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        credentials: "include",
      });
      const result = await res.json();
      alert(result.message || "Reservation cancelled and deleted from database.");
      mutateBookings();
    } catch (err) {
      console.error(err);
      alert("Failed to cancel reservation.");
    }
  };

  const handleCreateRoom = async () => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    await fetch(`${API_URL}/api/rooms`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      credentials: "include",
      body: JSON.stringify(newRoom),
    });
    setNewRoom({ name: "", annex: "", type_id: "" });
    mutateRooms();
  };

  const handleUpdateRoom = async () => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    await fetch(`${API_URL}/api/rooms/${editRoom.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      credentials: "include",
      body: JSON.stringify(editRoom),
    });
    setEditRoom(null);
    mutateRooms();
  };

  const handleDeleteRoom = async (id) => {
    if (!confirm("Are you sure you want to delete this room?")) return;
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    await fetch(`${API_URL}/api/rooms/${id}`, {
      method: "DELETE",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      credentials: "include",
    });
    mutateRooms();
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "dashboard":
        return (
          <div className="space-y-6">
            {/* Quick Metrics Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="glass-panel p-4 rounded-2xl border border-emerald-500/20">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase tracking-wider text-emerald-300 font-semibold">
                    Pending Requests
                  </span>
                  <div className="p-2 rounded-xl bg-amber-950/60 text-amber-400 border border-amber-500/30">
                    <ChartBarIcon className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-2 text-3xl font-extrabold text-white">{safeRequests.length}</div>
                <span className="text-[11px] text-emerald-400/70">Awaiting your approval</span>
              </div>

              <div className="glass-panel p-4 rounded-2xl border border-emerald-500/20">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase tracking-wider text-emerald-300 font-semibold">
                    Total Bookings
                  </span>
                  <div className="p-2 rounded-xl bg-emerald-950/80 text-emerald-400 border border-emerald-500/30">
                    <CalendarDaysIcon className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-2 text-3xl font-extrabold text-[#6ADB6A]">
                  {safeBookings.length}
                </div>
                <span className="text-[11px] text-emerald-400/70">Confirmed in database</span>
              </div>

              <div className="glass-panel p-4 rounded-2xl border border-emerald-500/20">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase tracking-wider text-emerald-300 font-semibold">
                    Total Rooms
                  </span>
                  <div className="p-2 rounded-xl bg-emerald-950/60 text-emerald-400 border border-emerald-500/30">
                    <HomeModernIcon className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-2 text-3xl font-extrabold text-white">{safeRooms.length}</div>
                <span className="text-[11px] text-emerald-400/70">Managed campus spaces</span>
              </div>

              <div className="glass-panel p-4 rounded-2xl border border-emerald-500/20">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase tracking-wider text-emerald-300 font-semibold">
                    Total Users
                  </span>
                  <div className="p-2 rounded-xl bg-emerald-950/60 text-emerald-400 border border-emerald-500/30">
                    <UserGroupIcon className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-2 text-3xl font-extrabold text-white">{safeUsers.length}</div>
                <span className="text-[11px] text-emerald-400/70">Registered accounts</span>
              </div>
            </div>

            {/* Pending Requests Table (With Room ID & Room Name) */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold text-white">Pending Room Requests</h2>
                  <p className="text-xs text-emerald-200/60 mt-0.5">
                    Review and approve room reservation requests submitted by students and faculty
                  </p>
                </div>
                <span className="bg-emerald-950 text-emerald-300 border border-emerald-500/30 px-3 py-1 rounded-full text-xs font-semibold">
                  {safeRequests.length} Pending
                </span>
              </div>

              {safeRequests.length > 0 ? (
                <div className="glass-card rounded-2xl overflow-hidden border border-emerald-500/20 shadow-xl">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-emerald-100/90 min-w-[750px]">
                      <thead className="bg-[#05240d] text-emerald-300 text-xs uppercase tracking-wider font-semibold">
                        <tr>
                          <th className="px-6 py-4 whitespace-nowrap">User Email</th>
                          <th className="px-6 py-4 whitespace-nowrap">Room Details</th>
                          <th className="px-6 py-4 whitespace-nowrap">Date</th>
                          <th className="px-6 py-4 whitespace-nowrap">Time Slot</th>
                          <th className="px-6 py-4 whitespace-nowrap">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-emerald-500/10">
                        {safeRequests.map((req) => (
                          <tr key={req.id} className="hover:bg-emerald-900/20 transition-colors">
                            <td className="px-6 py-4 font-semibold text-white whitespace-nowrap">
                              {req.user_email}
                            </td>
                            {/* Room Name & ID Prominently Displayed */}
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-2 whitespace-nowrap">
                                <span className="font-bold text-white text-sm whitespace-nowrap">
                                  {req.room_name || `Room ${req.room_id}`}
                                </span>
                                <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500/30 text-[11px] font-semibold whitespace-nowrap">
                                  ID: #{req.room_id}
                                </span>
                              </div>
                              {req.annex && (
                                <div className="text-xs text-emerald-400/70 mt-0.5 whitespace-nowrap">
                                  {req.annex}
                                </div>
                              )}
                            </td>
                            <td className="px-6 py-4 font-mono text-emerald-200 whitespace-nowrap">
                              {req.selected_date}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="px-2.5 py-1 rounded-lg bg-emerald-950/60 border border-emerald-500/20 text-xs font-medium whitespace-nowrap inline-flex items-center">
                                {req.start_time} - {req.end_time}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-2 whitespace-nowrap">
                                <button
                                  onClick={() => handleDecision(req.id, "accept")}
                                  className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition shadow whitespace-nowrap"
                                >
                                  <CheckCircleIcon className="w-4 h-4" /> Accept
                                </button>
                                <button
                                  onClick={() => handleDecision(req.id, "reject")}
                                  className="px-3.5 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition shadow whitespace-nowrap"
                                >
                                  <XCircleIcon className="w-4 h-4" /> Reject
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="glass-card p-12 text-center rounded-2xl border-emerald-500/20 text-emerald-200">
                  <ChartBarIcon className="w-12 h-12 text-emerald-400 mx-auto mb-3 opacity-60" />
                  <h3 className="text-lg font-bold text-white">No Pending Requests</h3>
                  <p className="text-sm text-emerald-100/60 mt-1">
                    All room reservation requests have been processed.
                  </p>
                </div>
              )}
            </div>
          </div>
        );

      case "reservations":
        return (
          <div className="space-y-6">
            {/* Filter Controls Header - Date Wise Only */}
            <div className="glass-panel p-5 rounded-2xl border border-emerald-500/20 space-y-4">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <CalendarDaysIcon className="w-5 h-5 text-emerald-400" />
                    <span>Booked Rooms & Reservations Directory</span>
                  </h2>
                  <p className="text-xs text-emerald-200/60 mt-0.5">
                    Filter booked rooms by date and manage/cancel reservations directly in the database
                  </p>
                </div>
                <button
                  onClick={() => mutateBookings()}
                  className="px-3.5 py-2 glass-card border-emerald-500/30 text-emerald-300 hover:text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 w-fit transition"
                >
                  <ArrowPathIcon className="w-3.5 h-3.5" /> Refresh List
                </button>
              </div>

              {/* Date Filter & Fast Action Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-3 pt-2">
                <div className="flex-1 max-w-xs">
                  <label className="block text-xs font-semibold text-emerald-300 mb-1">
                    Filter by Date
                  </label>
                  <input
                    type="date"
                    value={filterDate}
                    onChange={(e) => setFilterDate(e.target.value)}
                    className="w-full glass-input px-3.5 py-2.5 rounded-xl text-sm border-emerald-500/30 text-white bg-emerald-950/40"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setFilterDate("")}
                    className={`px-4 py-2.5 rounded-xl text-xs font-bold transition border ${
                      filterDate === ""
                        ? "bg-emerald-600 text-white border-emerald-400 shadow-lg shadow-emerald-950/60"
                        : "glass-card text-emerald-200 hover:text-white border-emerald-500/30"
                    }`}
                  >
                    All Bookings ({safeBookings.length})
                  </button>

                  <button
                    onClick={() => setFilterDate(todayStr)}
                    className={`px-4 py-2.5 rounded-xl text-xs font-bold transition border ${
                      filterDate === todayStr
                        ? "bg-emerald-600 text-white border-emerald-400 shadow-lg shadow-emerald-950/60"
                        : "glass-card text-emerald-200 hover:text-white border-emerald-500/30"
                    }`}
                  >
                    Today
                  </button>

                  {filterDate && (
                    <button
                      onClick={() => setFilterDate("")}
                      className="px-3 py-2.5 text-xs text-red-400 hover:text-red-300 hover:bg-red-950/30 rounded-xl transition font-semibold"
                    >
                      Clear Date Filter
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Reservations Table */}
            <div className="glass-card rounded-2xl overflow-hidden border border-emerald-500/20 shadow-xl">
              <div className="p-4 border-b border-emerald-500/15 flex justify-between items-center bg-[#090e0b]/90">
                <div className="flex items-center gap-2">
                  <CalendarDaysIcon className="w-4 h-4 text-emerald-400" />
                  <span className="text-sm font-bold text-white">
                    {filterDate ? `Booked Rooms for ${filterDate}` : "All Active & Recorded Bookings"}
                  </span>
                </div>
                <span className="text-xs font-semibold text-emerald-300 bg-emerald-950 px-3 py-1 rounded-full border border-emerald-500/30">
                  {safeBookings.length} {safeBookings.length === 1 ? "Booking" : "Bookings"}
                </span>
              </div>

              {safeBookings.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-emerald-100/90 min-w-[850px]">
                    <thead className="bg-[#05240d] text-emerald-300 text-xs uppercase tracking-wider font-semibold">
                      <tr>
                        <th className="px-6 py-4 whitespace-nowrap">Room Details</th>
                        <th className="px-6 py-4 whitespace-nowrap">Reserved By</th>
                        <th className="px-6 py-4 whitespace-nowrap">Booking Date</th>
                        <th className="px-6 py-4 whitespace-nowrap">Time Slot</th>
                        <th className="px-6 py-4 whitespace-nowrap">Status</th>
                        <th className="px-6 py-4 whitespace-nowrap">Manage</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-emerald-500/10">
                      {safeBookings.map((booking) => (
                        <tr key={booking.id} className="hover:bg-emerald-900/20 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2 whitespace-nowrap">
                              <span className="font-bold text-white text-sm whitespace-nowrap">
                                {booking.room_name || `Room ${booking.room_id}`}
                              </span>
                              <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500/30 text-[11px] font-semibold whitespace-nowrap">
                                ID: #{booking.room_id}
                              </span>
                            </div>
                            {booking.annex && (
                              <div className="text-xs text-emerald-400/70 mt-0.5 whitespace-nowrap">
                                {booking.annex}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 font-semibold text-white whitespace-nowrap">
                            {booking.user_email}
                          </td>
                          <td className="px-6 py-4 font-mono text-emerald-200 whitespace-nowrap">
                            {booking.booking_date}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2.5 py-1 rounded-lg bg-emerald-950/60 border border-emerald-500/20 text-xs font-medium whitespace-nowrap inline-flex items-center">
                              {booking.start_time} - {booking.end_time}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {booking.live_status === "Booked Today" ? (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-950/90 text-emerald-300 border border-emerald-500/40 shadow-sm animate-pulse whitespace-nowrap">
                                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                                Booked Today
                              </span>
                            ) : booking.live_status === "Upcoming" ? (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-950/80 text-indigo-300 border border-indigo-500/40 whitespace-nowrap">
                                <span className="w-2 h-2 rounded-full bg-indigo-400"></span>
                                Upcoming
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-zinc-900 text-zinc-400 border border-zinc-700/50 whitespace-nowrap">
                                <span className="w-2 h-2 rounded-full bg-zinc-500"></span>
                                Completed
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <button
                              onClick={() => handleCancelBooking(booking.id)}
                              className="px-3.5 py-1.5 bg-red-600/90 hover:bg-red-600 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition shadow shadow-red-950/50 whitespace-nowrap"
                              title="Cancel this reservation and remove from database"
                            >
                              <TrashIcon className="w-3.5 h-3.5" />
                              <span>Cancel Reservation</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-12 text-center space-y-2 text-emerald-200/60">
                  <CalendarDaysIcon className="w-10 h-10 mx-auto text-emerald-500/40" />
                  <p className="text-sm font-semibold text-white">
                    {filterDate
                      ? `No room reservations found for date: ${filterDate}`
                      : "No room reservations found in database."}
                  </p>
                  <p className="text-xs text-emerald-400/60">
                    {filterDate ? (
                      <button
                        onClick={() => setFilterDate("")}
                        className="text-emerald-300 underline font-semibold mt-1"
                      >
                        Click here to view all recorded bookings
                      </button>
                    ) : (
                      "Reservations will appear here once booking requests are approved."
                    )}
                  </p>
                </div>
              )}
            </div>
          </div>
        );

      case "rooms":
        return (
          <div className="space-y-6">
            <div className="glass-panel p-6 rounded-2xl border-emerald-500/20 shadow-xl space-y-4">
              <h3 className="text-lg font-bold text-white">
                {editRoom ? "Edit Existing Room" : "Add New Room"}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-emerald-300 mb-1">
                    Room Name
                  </label>
                  <input
                    className="w-full glass-input p-3 rounded-xl text-sm border-emerald-500/20 text-white"
                    placeholder="e.g. Room 402"
                    value={editRoom ? editRoom.name : newRoom.name}
                    onChange={(e) =>
                      editRoom
                        ? setEditRoom({ ...editRoom, name: e.target.value })
                        : setNewRoom({ ...newRoom, name: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-emerald-300 mb-1">
                    Annex / Building
                  </label>
                  <input
                    className="w-full glass-input p-3 rounded-xl text-sm border-emerald-500/20 text-white"
                    placeholder="e.g. Building A"
                    value={editRoom ? editRoom.annex : newRoom.annex}
                    onChange={(e) =>
                      editRoom
                        ? setEditRoom({ ...editRoom, annex: e.target.value })
                        : setNewRoom({ ...newRoom, annex: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-emerald-300 mb-1">
                    Type ID
                  </label>
                  <input
                    className="w-full glass-input p-3 rounded-xl text-sm border-emerald-500/20 text-white"
                    placeholder="e.g. 1"
                    value={editRoom ? editRoom.type_id : newRoom.type_id}
                    onChange={(e) =>
                      editRoom
                        ? setEditRoom({ ...editRoom, type_id: e.target.value })
                        : setNewRoom({ ...newRoom, type_id: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                {editRoom ? (
                  <>
                    <button
                      onClick={() => setEditRoom(null)}
                      className="px-4 py-2 glass-card text-emerald-200 hover:text-white rounded-xl text-sm font-semibold"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleUpdateRoom}
                      className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-bold shadow"
                    >
                      Update Room
                    </button>
                  </>
                ) : (
                  <button
                    onClick={handleCreateRoom}
                    className="px-6 py-2.5 bg-gradient-to-r from-[#02B81C] to-emerald-500 hover:from-emerald-500 hover:to-[#02B81C] text-white rounded-xl text-sm font-bold shadow flex items-center gap-2"
                  >
                    <PlusCircleIcon className="w-5 h-5" />
                    Create Room
                  </button>
                )}
              </div>
            </div>

            {/* Room List Table */}
            <div className="glass-card rounded-2xl overflow-hidden border border-emerald-500/20 shadow-xl">
              <div className="p-5 border-b border-emerald-500/15">
                <h3 className="text-lg font-bold text-white">Managed Rooms Directory</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-emerald-100/90 min-w-[650px]">
                  <thead className="bg-[#05240d] text-emerald-300 text-xs uppercase tracking-wider font-semibold">
                    <tr>
                      <th className="px-6 py-4 whitespace-nowrap">ID</th>
                      <th className="px-6 py-4 whitespace-nowrap">Name</th>
                      <th className="px-6 py-4 whitespace-nowrap">Annex</th>
                      <th className="px-6 py-4 whitespace-nowrap">Type ID</th>
                      <th className="px-6 py-4 whitespace-nowrap">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-emerald-500/10">
                    {safeRooms.map((room) => (
                      <tr key={room.id} className="hover:bg-emerald-900/20 transition-colors">
                        <td className="px-6 py-4 font-bold text-emerald-300 whitespace-nowrap">#{room.id}</td>
                        <td className="px-6 py-4 font-semibold text-white whitespace-nowrap">{room.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{room.annex}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{room.type_id}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2 whitespace-nowrap">
                            <button
                              onClick={() => setEditRoom(room)}
                              className="px-3 py-1 bg-indigo-600/80 hover:bg-indigo-600 text-white rounded-lg text-xs font-semibold flex items-center gap-1 whitespace-nowrap"
                            >
                              <PencilSquareIcon className="w-3.5 h-3.5" /> Edit
                            </button>
                            <button
                              onClick={() => handleDeleteRoom(room.id)}
                              className="px-3 py-1 bg-red-600/80 hover:bg-red-600 text-white rounded-lg text-xs font-semibold flex items-center gap-1 whitespace-nowrap"
                            >
                              <TrashIcon className="w-3.5 h-3.5" /> Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );

      case "users":
        return (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Create User Form */}
            <div className="lg:col-span-1 glass-panel p-6 rounded-2xl border-emerald-500/20 shadow-xl space-y-4">
              <h3 className="text-lg font-bold text-white">Create New User</h3>
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  const formData = new FormData(e.target);
                  const email = formData.get("email");
                  const password = formData.get("password");

                  try {
                    const token =
                      typeof window !== "undefined" ? localStorage.getItem("token") : null;
                    const res = await fetch(`${API_URL}/api/users`, {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                        ...(token ? { Authorization: `Bearer ${token}` } : {}),
                      },
                      body: JSON.stringify({ email, password }),
                      credentials: "include",
                    });

                    const result = await res.json();
                    alert(result.message || "User created");
                    e.target.reset();
                    mutateUsers();
                  } catch (err) {
                    console.error(err);
                  }
                }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-xs font-semibold text-emerald-300 mb-1">
                    Email Address
                  </label>
                  <input
                    name="email"
                    type="email"
                    required
                    placeholder="user@university.edu"
                    className="w-full glass-input p-3 rounded-xl text-sm border-emerald-500/20 text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-emerald-300 mb-1">
                    Password
                  </label>
                  <input
                    name="password"
                    type="password"
                    required
                    placeholder="••••••••"
                    className="w-full glass-input p-3 rounded-xl text-sm border-emerald-500/20 text-white"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-3 bg-gradient-to-r from-[#02B81C] to-emerald-500 hover:from-emerald-500 hover:to-[#02B81C] text-white rounded-xl text-sm font-bold shadow flex items-center justify-center gap-2"
                >
                  <UserGroupIcon className="w-5 h-5" /> Add User
                </button>
              </form>
            </div>

            {/* Users List */}
            <div className="lg:col-span-2 glass-card rounded-2xl overflow-hidden border border-emerald-500/20 shadow-xl">
              <div className="p-5 border-b border-emerald-500/15 flex justify-between items-center">
                <h3 className="text-lg font-bold text-white">Registered System Users</h3>
                <span className="bg-emerald-950 text-emerald-300 border border-emerald-500/30 px-3 py-1 rounded-full text-xs font-semibold">
                  {safeUsers.length} Total
                </span>
              </div>
              <ul className="divide-y divide-emerald-500/10">
                {safeUsers.map((user) => (
                  <li
                    key={user.id}
                    className="p-4 flex items-center justify-between hover:bg-emerald-900/20 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-emerald-900/80 border border-emerald-500/30 flex items-center justify-center text-emerald-300 font-bold">
                        <UserGroupIcon className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-white">{user.email}</div>
                        <div className="text-xs text-emerald-200/60">
                          ID: #{user.id} &bull; Role: {user.role || "user"}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteUser(user.id)}
                      className="px-3 py-1.5 bg-red-600/80 hover:bg-red-600 text-white rounded-lg text-xs font-semibold flex items-center gap-1"
                    >
                      <TrashIcon className="w-3.5 h-3.5" /> Delete
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const tabs = [
    { name: "Dashboard", key: "dashboard", icon: ChartBarIcon },
    { name: "Reservations", key: "reservations", icon: CalendarDaysIcon },
    { name: "Rooms", key: "rooms", icon: HomeModernIcon },
    { name: "Users", key: "users", icon: UserGroupIcon },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 min-h-screen">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar Nav */}
        <aside className="w-full md:w-64 glass-panel p-4 rounded-3xl border-emerald-500/20 shadow-2xl h-fit space-y-4">
          <div className="px-3 py-2 border-b border-emerald-500/15">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Cog8ToothIcon className="w-6 h-6 text-emerald-400" />
              <span>Admin Center</span>
            </h2>
          </div>
          <nav className="space-y-1">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.key;
              const Icon = tab.icon;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                    isActive
                      ? "bg-gradient-to-r from-emerald-600 to-green-500 text-white shadow-lg shadow-emerald-950/50"
                      : "text-emerald-100/70 hover:bg-emerald-900/40 hover:text-white"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{tab.name}</span>
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 space-y-6">
          <div className="glass-panel p-5 rounded-2xl border border-emerald-500/20 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-white capitalize">{activeTab} Overview</h1>
            <div className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-emerald-950/80 border border-emerald-500/30 text-emerald-300">
              {new Date().toLocaleDateString(undefined, {
                weekday: "long",
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </div>
          </div>

          {renderTabContent()}
        </main>
      </div>
    </div>
  );
}