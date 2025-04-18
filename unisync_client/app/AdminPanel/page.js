// components/AdminPanel.js
"use client";

import React, { useState } from "react";
import { ChartBarIcon, UserGroupIcon, HomeModernIcon, Cog8ToothIcon } from "@heroicons/react/24/outline";

const dummyBookings = [
  { id: 1, room: "Seminar Hall 1", date: "2025-04-20", time: "10:00 AM", status: "Pending" },
  { id: 2, room: "Classroom A", date: "2025-04-22", time: "02:00 PM", status: "Approved" },
];

const dummyRooms = [
  { id: 1, name: "Seminar Hall 1", capacity: 100, amenities: ["Projector", "AC"] },
  { id: 2, name: "Classroom A", capacity: 30, amenities: ["Whiteboard"] },
];

const dummyUsers = [
  { id: 1, name: "Alice", role: "User" },
  { id: 2, name: "Bob", role: "AdminPanel" },
];

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState("dashboard");

  const renderTabContent = () => {
    switch (activeTab) {
      case "dashboard":
        return (
          <div className="p-4 space-y-4 bg-black">
            <h2 className="text-lg font-semibold">Recent Bookings</h2>
            <table className="w-full border text-sm">
              <thead>
                <tr className="bg-red-600">
                  <th className="p-2 border">Room</th>
                  <th className="p-2 border">Date</th>
                  <th className="p-2 border">Time</th>
                  <th className="p-2 border">Status</th>
                </tr>
              </thead>
              <tbody>
                {dummyBookings.map((booking) => (
                  <tr key={booking.id}>
                    <td className="p-2 border">{booking.room}</td>
                    <td className="p-2 border">{booking.date}</td>
                    <td className="p-2 border">{booking.time}</td>
                    <td className="p-2 border">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          booking.status === "Approved"
                            ? "bg-green-100 text-green-700"
                            : booking.status === "Pending"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {booking.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      case "rooms":
        return (
          <div className="p-4 bg-black">
            <h2 className="text-lg font-semibold mb-2">Manage Rooms</h2>
            <table className="w-full border text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-2 border">Room Name</th>
                  <th className="p-2 border">Capacity</th>
                  <th className="p-2 border">Amenities</th>
                  <th className="p-2 border">Actions</th>
                </tr>
              </thead>
              <tbody>
                {dummyRooms.map((room) => (
                  <tr key={room.id}>
                    <td className="p-2 border">{room.name}</td>
                    <td className="p-2 border">{room.capacity}</td>
                    <td className="p-2 border">{room.amenities.join(", ")}</td>
                    <td className="p-2 border space-x-2">
                      <button className="text-blue-600 hover:underline">Edit</button>
                      <button className="text-red-600 hover:underline">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      case "users":
        return (
          <div className="p-4 bg-black">
            <h2 className="text-lg font-semibold mb-2">Manage Users</h2>
            <table className="w-full border text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-2 border">Name</th>
                  <th className="p-2 border">Role</th>
                  <th className="p-2 border">Actions</th>
                </tr>
              </thead>
              <tbody>
                {dummyUsers.map((user) => (
                  <tr key={user.id}>
                    <td className="p-2 border">{user.name}</td>
                    <td className="p-2 border">{user.role}</td>
                    <td className="p-2 border space-x-2">
                      <button className="text-blue-600 hover:underline">Edit</button>
                      <button className="text-red-600 hover:underline">Remove</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      case "settings":
        return (
          <div className="p-4 space-y-4 bg-black">
            <h2 className="text-lg font-semibold">System Settings</h2>
            <p className="text-sm text-gray-600">Manage access controls and AdminPanel roles here. (Placeholder content)</p>
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
    { name: "Settings", key: "settings", icon: Cog8ToothIcon },
  ];

  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      <aside className="md:w-64 w-full text-white shadow-md p-4 space-y-2">
        <h2 className="text-xl font-bold mb-4">AdminPanel Panel</h2>
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center text-white gap-2 px-3 py-2 w-full rounded-md text-left hover:bg-green-100 transition ${
              activeTab === tab.key ? "bg-green-200 text-green-800" : "text-gray-700"
            }`}
          >
            <tab.icon className="w-5 h-5" /> {tab.name}
          </button>
        ))}
      </aside>

      <main className="flex-1 p-6 bg-gray-50 overflow-auto">
        <h1 className="text-2xl font-semibold mb-4">{tabs.find(t => t.key === activeTab)?.name}</h1>
        <div className="bg-white shadow rounded-md p-4">
          {renderTabContent()}
        </div>
      </main>
    </div>
  );
};

export default AdminPanel;