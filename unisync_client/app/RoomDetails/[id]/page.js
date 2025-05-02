"use client";

import * as React from "react";
import { useEffect, useState } from "react";
import useSWR from "swr";

const fetcher = (url) => fetch(url).then((res) => res.json());

export default function RoomDetailsPage({ params }) {
  const { id } = React.use(params);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [endingTime, setEndingTime] = useState("");

  const handleRequestRoom = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/request-room", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // ✅ Send cookies
        body: JSON.stringify({
          roomId: room.id,
          roomName: room.name,
          selectedDate:selectedDate,
          startTime:selectedTime,
          endingTime: endingTime,
        }),
      });
  
      const data = await res.json();
  
      if (res.ok) {
        alert("Room requested successfully");
      } else {
        alert(data.message || "Failed to request room");
      }
    } catch (err) {
      console.error("Request error:", err);
      alert("Server error");
    }
  };
  

  
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

  if (isLoading) return <div className="text-center mt-10">Loading...</div>;
  if (error) return <div className="text-center mt-10 text-red-600">Error loading room</div>;



  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-center text-blue-600">Room Details</h1>

      <div className="bg-white p-6 rounded-lg shadow-lg space-y-6 text-black">
        <div>
          <h2 className="text-xl font-semibold mb-2">Room Information</h2>
          <p><span className="font-medium">ID:</span> {room.id}</p>
          <p><span className="font-medium">Name:</span> {room.name}</p>
          <p><span className="font-medium">Annex:</span> {room.annex}</p>
          <p><span className="font-medium">Type:</span> {room.type}</p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">Booking Information</h2>
          <p><span className="font-medium">Selected Date:</span> {selectedDate || "Not selected"}</p>
          <p><span className="font-medium">Start Time:</span> {selectedTime || "Not selected"}</p>

          <div className="mt-2">
            <label className="block mb-1 font-medium ">Select Ending Time</label>
            <input
              type="time"
              value={endingTime}
              onChange={(e) => setEndingTime(e.target.value)}
              className="border border-gray-300 rounded px-3 py-2 w-full sm:w-1/2"
            />
          </div>
        </div>

        <div className="pt-4">
        <button
  onClick={handleRequestRoom}
  className="mt-4 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
>
  Request Room
</button>

        </div>
      </div>
    </div>
  );
}
