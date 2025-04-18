// components/Notification.js
"use client";

import React, { useState, useEffect, useRef } from "react";
import { BellIcon } from "@heroicons/react/24/outline";
import Link from "next/link";

const mockNotifications = [
  { id: 1, type: "success", message: "Room booking confirmed for 12 April at 3 PM." },
  { id: 2, type: "warning", message: "Room booking pending approval for 15 April." },
  { id: 3, type: "error", message: "Room booking rejected for 10 April." },
];

const Notification = () => {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState(mockNotifications);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <Link
      onClick={() => setOpen(!open)}
         href={"#"}
              type="button"
              className="relative p-4 rounded-full  item-center text-gray-400 hover:text-[#6ADB6A]  focus:outline-hidden"
            >
              {/* <span className="absolute -inset-1.5" />
              <span className="sr-only">View notifications</span> */}
              <BellIcon aria-hidden="true" className="size-6" />
              {notifications.length > 0 && (
          <span className="absolute top-8 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white bg-red-600 rounded-full">
            {notifications.length}
          </span>
        )}
              
            </Link>

      {open && (
        <div className="absolute right-0 z-10 mt-2 w-80 origin-top-right rounded-md bg-[#FFFFFF20] shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="p-4 border-b font-semibold">Notifications</div>
          <div className="max-h-60 overflow-y-auto divide-y">
            {notifications.length > 0 ? (
              notifications.map((note) => (
                <div
                  key={note.id}
                  className={`px-4 py-2 text-sm ${
                    note.type === "success"
                      ? "text-green-600"
                      : note.type === "warning"
                      ? "text-yellow-600"
                      : "text-red-600"
                  }`}
                >
                  {note.message}
                </div>
              ))
            ) : (
              <div className="px-4 py-2 text-sm text-gray-500">No new notifications</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Notification;
