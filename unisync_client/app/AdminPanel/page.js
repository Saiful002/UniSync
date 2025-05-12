// components/AdminPanel.js
"use client";

import React, { useState, useEffect } from "react";
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
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-800">Room Requests</h2>
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                {requests?.length || 0} Pending
              </span>
            </div>
            
            {requests?.length ? (
              <div className="overflow-x-auto bg-white rounded-lg shadow">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Room ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {requests.map((req) => (
                      <tr key={req.id} className="hover:bg-gray-50 transition">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{req.user_email}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{req.room_id}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{req.selected_date}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{req.start_time} - {req.end_time}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                          <button 
                            onClick={() => handleDecision(req.id, "accept")} 
                            className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                          >
                            <CheckCircleIcon className="w-4 h-4 mr-1" />
                            Accept
                          </button>
                          <button 
                            onClick={() => handleDecision(req.id, "reject")} 
                            className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                          >
                            <XCircleIcon className="w-4 h-4 mr-1" />
                            Reject
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="bg-white p-6 rounded-lg shadow text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100">
                  <ChartBarIcon className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="mt-3 text-lg font-medium text-gray-900">No pending requests</h3>
                <p className="mt-2 text-sm text-gray-500">
                  There are currently no room requests to review.
                </p>
              </div>
            )}
          </div>
        );
      case "rooms":
        return (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editRoom ? "Edit Room" : "Add New Room"}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Room Name</label>
                  <input 
                    className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md text-black" 
                    placeholder="Name" 
                    value={editRoom ? editRoom.name : newRoom.name} 
                    onChange={(e) => editRoom ? setEditRoom({ ...editRoom, name: e.target.value }) : setNewRoom({ ...newRoom, name: e.target.value })} 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Annex</label>
                  <input 
                    className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md text-black" 
                    placeholder="Annex" 
                    value={editRoom ? editRoom.annex : newRoom.annex} 
                    onChange={(e) => editRoom ? setEditRoom({ ...editRoom, annex: e.target.value }) : setNewRoom({ ...newRoom, annex: e.target.value })} 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Type ID</label>
                  <input 
                    className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md text-black" 
                    placeholder="Type ID" 
                    value={editRoom ? editRoom.type_id : newRoom.type_id} 
                    onChange={(e) => editRoom ? setEditRoom({ ...editRoom, type_id: e.target.value }) : setNewRoom({ ...newRoom, type_id: e.target.value })} 
                  />
                </div>
              </div>
              <div className="mt-4 flex justify-end">
                {editRoom ? (
                  <div className="space-x-2">
                    <button 
                      onClick={() => setEditRoom(null)} 
                      className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={handleUpdateRoom} 
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Update Room
                    </button>
                  </div>
                ) : (
                  <button 
                    onClick={handleCreateRoom} 
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    <PlusCircleIcon className="w-5 h-5 mr-2" />
                    Create Room
                  </button>
                )}
              </div>
            </div>
            
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="px-4 py-5 sm:px-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Room Management
                </h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">
                  List of all available rooms
                </p>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Annex</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type ID</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {rooms?.map(room => (
                      <tr key={room.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{room.id}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{room.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{room.annex}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{room.type_id}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                          <button 
                            onClick={() => setEditRoom(room)} 
                            className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                          >
                            <PencilSquareIcon className="w-4 h-4 mr-1" />
                            Edit
                          </button>
                          <button 
                            onClick={() => handleDeleteRoom(room.id)} 
                            className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                          >
                            <TrashIcon className="w-4 h-4 mr-1" />
                            Delete
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
            <div className="lg:col-span-1">
              <div className="bg-white shadow overflow-hidden rounded-lg">
                <div className="px-4 py-5 sm:px-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Add New User
                  </h3>
                  <p className="mt-1 max-w-2xl text-sm text-gray-500">
                    Create account credentials
                  </p>
                </div>
                <div className="border-t border-gray-200">
                  <form
                    className="p-6 space-y-4"
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
                      <label className="block text-sm font-medium text-gray-700">Email Address</label>
                      <input
                        name="email"
                        type="email"
                        required
                        className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md text-black"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Password</label>
                      <input
                        name="password"
                        type="password"
                        required
                        className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md text-black"
                      />
                    </div>
                    <div className="pt-2">
                      <button
                        type="submit"
                        className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        <UserGroupIcon className="w-5 h-5 mr-2" />
                        Add User
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
            
            <div className="lg:col-span-2">
              <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
                  <div>
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      User Management
                    </h3>
                    <p className="mt-1 max-w-2xl text-sm text-gray-500">
                      Manage system users and permissions
                    </p>
                  </div>
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                    {users?.length || 0} Total Users
                  </span>
                </div>
                <div className="border-t border-gray-200">
                  <ul className="divide-y divide-gray-200">
                    {(users || []).map((user) => (
                      <li key={user.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                            <UserGroupIcon className="h-6 w-6 text-indigo-600" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{user.email}</div>
                            <div className="text-sm text-gray-500">User ID: {user.id}</div>
                          </div>
                        </div>
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        >
                          <TrashIcon className="w-4 h-4 mr-1" />
                          Delete
                        </button>
                      </li>
                    ))}
                    {!users?.length && (
                      <li className="px-6 py-12 text-center">
                        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-gray-100">
                          <UserGroupIcon className="h-6 w-6 text-gray-600" />
                        </div>
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No users</h3>
                        <p className="mt-1 text-sm text-gray-500">
                          Get started by creating a new user.
                        </p>
                      </li>
                    )}
                  </ul>
                </div>
              </div>
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
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-100">
      <aside className="md:w-64 w-full bg-indigo-800 text-white shadow-xl">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-white flex items-center">
            <Cog8ToothIcon className="w-6 h-6 mr-2" />
            Admin Panel
          </h2>
        </div>
        <nav className="mt-2 px-4 pb-4">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-3 px-4 py-3 w-full rounded-lg text-left mb-1 transition-all ${
                activeTab === tab.key 
                  ? "bg-indigo-900 text-white shadow-md" 
                  : "text-indigo-100 hover:bg-indigo-700"
              }`}
            >
              <tab.icon className="w-5 h-5" /> 
              <span className="font-medium">{tab.name}</span>
            </button>
          ))}
        </nav>
      </aside>

      <main className="flex-1 p-6 overflow-auto">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900">
              {tabs.find((t) => t.key === activeTab)?.name}
            </h1>
            <div className="bg-white shadow rounded-lg px-3 py-1 text-sm text-gray-500">
              {new Date().toLocaleDateString()}
            </div>
          </div>
          
          {renderTabContent()}
        </div>
      </main>
    </div>
  );
};

export default AdminPanel;