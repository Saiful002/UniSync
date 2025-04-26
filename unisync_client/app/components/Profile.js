"use client";

import React, { useState, useRef, useEffect } from "react";
import { UserIcon, ArrowLeftOnRectangleIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation"; // ✅ Import router

const Profile = () => {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);
  const router = useRouter(); // ✅ Setup router

  const handleToggle = () => setOpen(!open);

  const handleSignOut = () => {
    localStorage.removeItem("token"); // ✅ Remove token
    router.push("/Login"); // ✅ Redirect to login
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        onClick={handleToggle}
        className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-200 hover:bg-gray-300"
      >
        <UserIcon className="w-6 h-6 text-gray-700" />
      </button>

      {open && (
        <div className="absolute right-0 z-10 mt-2 w-48 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5">
          <div className="py-1">
            <button
              onClick={() => alert("Go to Profile")}
              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              <UserIcon className="w-5 h-5 mr-2" /> Profile
            </button>
            <button
              onClick={handleSignOut}
              className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
            >
              <ArrowLeftOnRectangleIcon className="w-5 h-5 mr-2" /> Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
