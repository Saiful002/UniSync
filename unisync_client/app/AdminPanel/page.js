// components/AdminPanel.js
"use client";

import React, { useState } from "react";
import useSWR from "swr";
import {
  ChartBarIcon,
  UserGroupIcon,
  HomeModernIcon,
  Cog8ToothIcon,
} from "@heroicons/react/24/outline";


const fetcher = (url) =>
  fetch(`http://localhost:5000${url}`, {
    credentials: "include", // ✅ Send cookies for authentication
  }).then((res) => res.json());

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
const { data: requests, error, isLoading } = useSWR("/api/room-requests", fetcher);

console.log(requests)


const handleDecision = async (id, decision) => {
  try {
    const res = await fetch(`http://localhost:5000/api/room-requests/${id}/${decision}`, {
      method: "POST",
      credentials: "include",
    });
    const result = await res.json();
    alert(result.message);
    mutate(); // revalidate SWR data
  } catch (err) {
    console.error(err);
  }
};


  const renderTabContent = () => {
    switch (activeTab) {
      case "dashboard":
        return (
          <div className="p-4 space-y-4 bg-black">
            <h2 className="text-lg font-semibold text-white">Room Requests</h2>
            <table className="w-full border text-sm text-white">
              <thead>
                <tr className="bg-red-600 text-white">
                  <th className="p-2 border">User Email</th>
                  <th className="p-2 border">Room ID</th>
                  <th className="p-2 border">Date</th>
                  <th className="p-2 border">Time</th>
                  <th className="p-2 border">Actions</th>
                </tr>
              </thead>
              <tbody>
                {requests?.length ? (
                  requests.map((req) => (
                    <tr key={req.id}>
                      <td className="p-2 border">{req.user_email}</td>
                      <td className="p-2 border">{req.room_id}</td>
                      <td className="p-2 border">{req.selected_date}</td>
                      <td className="p-2 border">
                        {req.start_time} - {req.end_time}
                      </td>
                      <td className="p-2 border space-x-2">
                        <button
                          onClick={() => handleDecision(req.id, "accept")}
                          className="bg-green-500 text-white px-2 py-1 rounded"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => handleDecision(req.id, "reject")}
                          className="bg-red-500 text-white px-2 py-1 rounded"
                        >
                          Reject
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center p-4">
                      No room requests found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
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
        <h2 className="text-xl font-bold mb-4">Admin Panel</h2>
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-3 py-2 w-full rounded-md text-left hover:bg-green-100 transition ${
              activeTab === tab.key ? "bg-green-200 text-green-800" : "text-gray-300"
            }`}
          >
            <tab.icon className="w-5 h-5" /> {tab.name}
          </button>
        ))}
      </aside>

      <main className="flex-1 p-6 bg-gray-50 overflow-auto">
        <h1 className="text-2xl font-semibold mb-4">
          {tabs.find((t) => t.key === activeTab)?.name}
        </h1>
        <div className="bg-white shadow rounded-md p-4">{renderTabContent()}</div>
      </main>
    </div>
  );
};

export default AdminPanel;
