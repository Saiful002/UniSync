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
} from "@heroicons/react/24/outline";
import { motion } from "framer-motion";

const fetcher = (url) =>
  fetch(`http://localhost:5000${url}`, {
    credentials: "include",
  }).then((res) => res.json());

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const { data: requests } = useSWR("/api/room-requests", fetcher);
  const { data: rooms } = useSWR("/api/rooms", fetcher);
  const [newRoom, setNewRoom] = useState({ name: "", annex: "", type_id: "" });
  const [editRoom, setEditRoom] = useState(null);
  const { data: users, mutate: mutateUsers } = useSWR("/api/users", fetcher);

  const handleDeleteUser = async (id) => {
    if (!confirm("Are you sure you want to delete this user?")) return;

    try {
      const res = await fetch(`http://localhost:5000/api/users/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const result = await res.json();
      alert(result.message);
      mutateUsers();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDecision = async (id, decision) => {
    try {
      const res = await fetch(`http://localhost:5000/api/room-requests/${id}/${decision}`, {
        method: "POST",
        credentials: "include",
      });
      const result = await res.json();
      alert(result.message);
      mutate("/api/room-requests");
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateRoom = async () => {
    await fetch("http://localhost:5000/api/rooms", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(newRoom),
    });
    setNewRoom({ name: "", annex: "", type_id: "" });
    mutate("/api/rooms");
  };

  const handleUpdateRoom = async () => {
    await fetch(`http://localhost:5000/api/rooms/${editRoom.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(editRoom),
    });
    setEditRoom(null);
    mutate("/api/rooms");
  };

  const handleDeleteRoom = async (id) => {
    await fetch(`http://localhost:5000/api/rooms/${id}`, { method: "DELETE", credentials: "include" });
    mutate("/api/rooms");
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "dashboard":
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-white">Pending Room Requests</h2>
              <span className="bg-emerald-950 text-emerald-300 border border-emerald-500/30 px-3 py-1 rounded-full text-xs font-semibold">
                {requests?.length || 0} Pending
              </span>
            </div>

            {requests?.length ? (
              <div className="glass-card rounded-2xl overflow-hidden border border-emerald-500/20 shadow-xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-emerald-100/90">
                    <thead className="bg-[#05240d] text-emerald-300 text-xs uppercase tracking-wider font-semibold">
                      <tr>
                        <th className="px-6 py-4">User Email</th>
                        <th className="px-6 py-4">Room ID</th>
                        <th className="px-6 py-4">Date</th>
                        <th className="px-6 py-4">Time Slot</th>
                        <th className="px-6 py-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-emerald-500/10">
                      {requests.map((req) => (
                        <tr key={req.id} className="hover:bg-emerald-900/20 transition-colors">
                          <td className="px-6 py-4 font-semibold text-white">{req.user_email}</td>
                          <td className="px-6 py-4">{req.room_id}</td>
                          <td className="px-6 py-4">{req.selected_date}</td>
                          <td className="px-6 py-4">{req.start_time} - {req.end_time}</td>
                          <td className="px-6 py-4 flex gap-2">
                            <button
                              onClick={() => handleDecision(req.id, "accept")}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition"
                            >
                              <CheckCircleIcon className="w-4 h-4" /> Accept
                            </button>
                            <button
                              onClick={() => handleDecision(req.id, "reject")}
                              className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition"
                            >
                              <XCircleIcon className="w-4 h-4" /> Reject
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="glass-card p-12 text-center rounded-2xl border-emerald-500/20 text-emerald-200">
                <ChartBarIcon className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-white">No Pending Requests</h3>
                <p className="text-sm text-emerald-100/60 mt-1">
                  All room reservation requests have been processed.
                </p>
              </div>
            )}
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
                  <label className="block text-xs font-semibold text-emerald-300 mb-1">Room Name</label>
                  <input
                    className="w-full glass-input p-3 rounded-xl text-sm border-emerald-500/20 text-white"
                    placeholder="e.g. Room 402"
                    value={editRoom ? editRoom.name : newRoom.name}
                    onChange={(e) => editRoom ? setEditRoom({ ...editRoom, name: e.target.value }) : setNewRoom({ ...newRoom, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-emerald-300 mb-1">Annex / Building</label>
                  <input
                    className="w-full glass-input p-3 rounded-xl text-sm border-emerald-500/20 text-white"
                    placeholder="e.g. Building A"
                    value={editRoom ? editRoom.annex : newRoom.annex}
                    onChange={(e) => editRoom ? setEditRoom({ ...editRoom, annex: e.target.value }) : setNewRoom({ ...newRoom, annex: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-emerald-300 mb-1">Type ID</label>
                  <input
                    className="w-full glass-input p-3 rounded-xl text-sm border-emerald-500/20 text-white"
                    placeholder="e.g. 1"
                    value={editRoom ? editRoom.type_id : newRoom.type_id}
                    onChange={(e) => editRoom ? setEditRoom({ ...editRoom, type_id: e.target.value }) : setNewRoom({ ...newRoom, type_id: e.target.value })}
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
                <table className="w-full text-left text-sm text-emerald-100/90">
                  <thead className="bg-[#05240d] text-emerald-300 text-xs uppercase tracking-wider font-semibold">
                    <tr>
                      <th className="px-6 py-4">ID</th>
                      <th className="px-6 py-4">Name</th>
                      <th className="px-6 py-4">Annex</th>
                      <th className="px-6 py-4">Type ID</th>
                      <th className="px-6 py-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-emerald-500/10">
                    {rooms?.map((room) => (
                      <tr key={room.id} className="hover:bg-emerald-900/20 transition-colors">
                        <td className="px-6 py-4">{room.id}</td>
                        <td className="px-6 py-4 font-semibold text-white">{room.name}</td>
                        <td className="px-6 py-4">{room.annex}</td>
                        <td className="px-6 py-4">{room.type_id}</td>
                        <td className="px-6 py-4 flex gap-2">
                          <button
                            onClick={() => setEditRoom(room)}
                            className="px-3 py-1 bg-indigo-600/80 hover:bg-indigo-600 text-white rounded-lg text-xs font-semibold flex items-center gap-1"
                          >
                            <PencilSquareIcon className="w-3.5 h-3.5" /> Edit
                          </button>
                          <button
                            onClick={() => handleDeleteRoom(room.id)}
                            className="px-3 py-1 bg-red-600/80 hover:bg-red-600 text-white rounded-lg text-xs font-semibold flex items-center gap-1"
                          >
                            <TrashIcon className="w-3.5 h-3.5" /> Delete
                          </button>
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
                    const res = await fetch("http://localhost:5000/api/users", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ email, password }),
                      credentials: "include",
                    });

                    const result = await res.json();
                    alert(result.message);
                    e.target.reset();
                    mutateUsers();
                  } catch (err) {
                    console.error(err);
                  }
                }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-xs font-semibold text-emerald-300 mb-1">Email Address</label>
                  <input
                    name="email"
                    type="email"
                    required
                    placeholder="user@university.edu"
                    className="w-full glass-input p-3 rounded-xl text-sm border-emerald-500/20 text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-emerald-300 mb-1">Password</label>
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
                  {users?.length || 0} Total
                </span>
              </div>
              <ul className="divide-y divide-emerald-500/10">
                {(users || []).map((user) => (
                  <li key={user.id} className="p-4 flex items-center justify-between hover:bg-emerald-900/20 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-emerald-900/80 border border-emerald-500/30 flex items-center justify-center text-emerald-300 font-bold">
                        <UserGroupIcon className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-white">{user.email}</div>
                        <div className="text-xs text-emerald-200/60">ID: {user.id}</div>
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
              {new Date().toLocaleDateString()}
            </div>
          </div>

          {renderTabContent()}
        </main>
      </div>
    </div>
  );
}