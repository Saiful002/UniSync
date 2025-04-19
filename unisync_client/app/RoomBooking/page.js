"use client";

import { useState } from "react";
import DatePicker from "react-datepicker";
import useSWR from "swr";

import "react-datepicker/dist/react-datepicker.css";

const fetcher = (url, body) =>
  fetch(`http://localhost:5000${url}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  }).then((res) => res.json());



const roomTypes = ["Classroom", "Seminar Hall", "Conference Room", "Lab Room"];
const amenities = ["Projector", "PC", "Whiteboard"];

export default function RoomBooking() {
  const [selectedType, setSelectedType] = useState("");
  const [selectedAmenities, setSelectedAmenities] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState("");
  const [filterParams, setFilterParams] = useState(null);

  const toggleAmenity = (amenity) => {
    setSelectedAmenities((prev) =>
      prev.includes(amenity)
        ? prev.filter((a) => a !== amenity)
        : [...prev, amenity]
    );
  };

  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, "0");
    const day = `${date.getDate()}`.padStart(2, "0");
    return `${year}-${month}-${day}`;
  };
  
  

  const handleFilter = () => {
    if (!selectedDate || !selectedTime) return alert("Date and Time required");
  
    const formattedDate = formatDate(selectedDate); // <-- use local date format
  
    const query = new URLSearchParams({
      type: selectedType,
      amenities: selectedAmenities.join(","),
      date: formattedDate,
      time: selectedTime,
    });

    console.log({
      type: selectedType,
      amenities: selectedAmenities.join(","),
      date: formattedDate,
      time: selectedTime,
    });
  
    setFilterParams(query.toString());
  };
  
  

 
  
// SWR usage
const { data: rooms, error, isLoading } = useSWR(
  filterParams
    ? ["/api/available-rooms", {
        type: selectedType,
        amenities: selectedAmenities,
        date: formatDate(selectedDate),
        time: selectedTime,
      }]
    : null,
  ([url, body]) => fetcher(url, body)
);


  return (
    <div className="p-4 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-center">Room Booking</h1>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <select
          className="p-2 border rounded-md"
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
        >
          <option value="">Select Room Type</option>
          {roomTypes.map((type) => (
            <option className="text-black" key={type} value={type}>{type}</option>
          ))}
        </select>

        <div>
          <label className="block font-semibold mb-1">Amenities</label>
          <div className="flex flex-wrap gap-2">
            {amenities.map((item) => (
              <button
                key={item}
                onClick={() => toggleAmenity(item)}
                className={`px-3 py-1 border rounded-full text-sm ${selectedAmenities.includes(item) ? 'bg-green-500 text-white' : ''}`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block font-semibold mb-1">Select Date</label>
          <DatePicker
            selected={selectedDate}
            onChange={(date) => setSelectedDate(date)}
            className="p-2 border w-full rounded-md"
            placeholderText="Choose Date"
            dateFormat="MMMM d, yyyy"
          />
        </div>

        <div>
          <label className="block font-semibold mb-1">Select Time</label>
          <input
            type="time"
            value={selectedTime}
            onChange={(e) => setSelectedTime(e.target.value)}
            className="p-3 border w-full rounded-md"
          />
        </div>
      </div>

      <button
        onClick={handleFilter}
        className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 mb-6"
      >
        Apply Filters
      </button>

      {isLoading && <p className="text-center">Loading rooms...</p>}
      {error && <p className="text-center text-red-500">Failed to load rooms.</p>}

      {rooms && rooms.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Available Rooms</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {rooms.map((room) => (
              <div
                key={room.id}
                className="border border-green-500 bg-green-100 rounded p-3 text-center hover:bg-green-200 text-black cursor-pointer transition"
              >
                {room.name}
              </div>
            ))}
          </div>
        </div>
      )}

      {rooms && rooms.length === 0 && (
        <p className="text-center text-gray-500">No available rooms found.</p>
      )}
    </div>
  );
}