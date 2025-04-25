"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import useSWR from "swr";

const fetcher = (url) => fetch(url).then((res) => res.json());

export default function RoomDetailsPage({ params }) {
  const { id } = params;
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);

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

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading room</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Room Details</h1>
      <div className=" p-4 rounded shadow">
        <p><strong>ID:</strong> {room.id}</p>
        <p><strong>Name:</strong> {room.name}</p>
        <p><strong>Annex:</strong> {room.annex}</p>
        <p><strong>Type:</strong> {room.type}</p>
        <p><strong>Selected Date:</strong> {selectedDate}</p>
        <p><strong>Selected Time:</strong> {selectedTime}</p>
      </div>
    </div>
  );
}
