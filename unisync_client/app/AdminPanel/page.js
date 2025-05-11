// components/AdminPanel.js
"use client";

import React, { useState, useEffect } from "react";
import useSWR, { mutate } from "swr";
import {
  ChartBarIcon,
  UserGroupIcon,
  HomeModernIcon,
  Cog8ToothIcon,
} from "@heroicons/react/24/outline";

const fetcher = (url) =>
  fetch(`http://localhost:5000${url}`, {
    credentials: "include",
  }).then((res) => res.json());

const AdminPanel = () => {
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
                      <td className="p-2 border">{req.start_time} - {req.end_time}</td>
                      <td className="p-2 border space-x-2">
                        <button onClick={() => handleDecision(req.id, "accept")} className="bg-green-500 text-white px-2 py-1 rounded">Accept</button>
                        <button onClick={() => handleDecision(req.id, "reject")} className="bg-red-500 text-white px-2 py-1 rounded">Reject</button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan="5" className="text-center p-4">No room requests found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        );
      case "rooms":
        return (
          <div className="p-4 space-y-4 bg-black">
            <h2 className="text-lg font-semibold">Manage Rooms</h2>
            <div className="flex gap-2">
              <input className="border px-2 py-1" placeholder="Name" value={editRoom ? editRoom.name : newRoom.name} onChange={(e) => editRoom ? setEditRoom({ ...editRoom, name: e.target.value }) : setNewRoom({ ...newRoom, name: e.target.value })} />
              <input className="border px-2 py-1" placeholder="Annex" value={editRoom ? editRoom.annex : newRoom.annex} onChange={(e) => editRoom ? setEditRoom({ ...editRoom, annex: e.target.value }) : setNewRoom({ ...newRoom, annex: e.target.value })} />
              <input className="border px-2 py-1" placeholder="Type ID" value={editRoom ? editRoom.type_id : newRoom.type_id} onChange={(e) => editRoom ? setEditRoom({ ...editRoom, type_id: e.target.value }) : setNewRoom({ ...newRoom, type_id: e.target.value })} />
              {editRoom ? (
                <button onClick={handleUpdateRoom} className="bg-blue-500 text-white px-3 py-1 rounded">Update</button>
              ) : (
                <button onClick={handleCreateRoom} className="bg-green-500 text-white px-3 py-1 rounded">Create</button>
              )}
            </div>
            <table className="w-full border text-sm">
              <thead><tr className=" bg-black"><th className="p-2 border">ID</th><th className="p-2 border">Name</th><th className="p-2 border">Annex</th><th className="p-2 border">Type ID</th><th className="p-2 border">Actions</th></tr></thead>
              <tbody>
                {rooms?.map(room => (
                  <tr key={room.id}>
                    <td className="p-2 border">{room.id}</td>
                    <td className="p-2 border">{room.name}</td>
                    <td className="p-2 border">{room.annex}</td>
                    <td className="p-2 border">{room.type_id}</td>
                    <td className="p-2 border space-x-2">
                      <button onClick={() => setEditRoom(room)} className="bg-yellow-400 px-2 py-1 rounded">Edit</button>
                      <button onClick={() => handleDeleteRoom(room.id)} className="bg-red-500 text-white px-2 py-1 rounded">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
        case "users":
          return (
            <div className="space-y-6 bg-black">
              <h2 className="text-lg font-semibold text-black">Users Management</h2>
        
              <form
                className="bg-black p-4 shadow rounded space-y-4"
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
                    mutateUsers(); // Re-fetch users data
                  } catch (err) {
                    console.error(err);
                  }
                }}
              >
                <div>
                  <label className="block font-medium">Email</label>
                  <input
                    name="email"
                    type="email"
                    required
                    className="w-full border px-3 py-2 rounded mt-1"
                  />
                </div>
                <div>
                  <label className="block font-medium">Password</label>
                  <input
                    name="password"
                    type="password"
                    required
                    className="w-full border px-3 py-2 rounded mt-1"
                  />
                </div>
                <button
                  type="submit"
                  className="bg-green-600 text-white px-4 py-2 rounded"
                >
                  Add User
                </button>
              </form>
        
              <div className="bg-black p-16">
                <h3 className="font-semibold text-md mb-2 ">Existing Users</h3>
                <ul className="space-y-2 bg-black">
                  {(users || []).map((user) => (
                    <li key={user.id} className="flex justify-between items-center text-black bg-gray-100 p-2 rounded">
                      <span>{user.email}</span>
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        className="text-red-500 hover:underline text-sm"
                      >
                        Delete
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
              activeTab === tab.key ? "bg-green-200 text-green-800" : "text-white"
            }`}
          >
            <tab.icon className="w-5 h-5 " /> {tab.name}
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
