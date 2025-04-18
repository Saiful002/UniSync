"use client";

import { useState } from "react";
import DatePicker from "react-datepicker";

import "react-datepicker/dist/react-datepicker.css";

const initialRooms = {
  "Annex E": ["E-101", "E-102", "E-103", "E-104", "E-105", "E-106", "E-107", "E-108", "E-109"],
  "Annex F": ["All Dean’s & Chairperson’s Room"],
  "Annex G": ["G-101", "G-102", "G-103", "G-104", "G-105", "G-106", "G-107", "G-108", "G-109"],
  "Annex H": ["H-101", "H-102", "H-103", "H-104", "H-105", "H-106", "H-107", "H-108", "H-109"],
  "Annex J": ["J-101", "J-102", "J-103", "J-104", "J-105", "J-106", "J-107", "J-108", "J-109"],
  "Annex K": ["K-101", "K-102", "K-103", "K-104", "K-105", "K-106", "K-107", "K-108", "K-109"],
  "Annex L": ["L-101", "L-102", "L-103", "L-104", "L-105", "L-106", "L-107", "L-108", "L-109"],
  "Annex M": ["Green Cafeteria"],
};

const roomTypes = ["Classroom", "Seminar Hall", "Conference Room"];
const amenities = ["Projector", "AC", "Whiteboard"];

export default function RoomBooking() {
  const [selectedType, setSelectedType] = useState("");
  const [selectedAmenities, setSelectedAmenities] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState("");
  const [filtered, setFiltered] = useState(false);

  const handleFilter = () => {
    setFiltered(true);
  };

  const toggleAmenity = (amenity) => {
    setSelectedAmenities((prev) =>
      prev.includes(amenity)
        ? prev.filter((a) => a !== amenity)
        : [...prev, amenity]
    );
  };

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-center">Room Booking</h1>

      {/* Filters */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <select
          className="p-2 border rounded-md"
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
        >
          <option value="">Select Room Type</option>
          {roomTypes.map((type) => (
            <option key={type} value={type}>{type}</option>
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

      {/* Tabular view before filtering */}
      {!filtered && (
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-200">
            <tbody>
              {Object.entries(initialRooms).map(([annex, rooms]) => (
                <tr key={annex} className="border-b">
                  <td className="font-semibold p-2 whitespace-nowrap w-32 align-top">{annex}</td>
                  <td className="p-2">
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                      {rooms.map((room) => (
                        <div key={room} className="border px-3 py-2 text-sm text-center">Room {room}</div>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Room grid view after filtering */}
      {filtered && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Available Rooms</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {Object.entries(initialRooms).flatMap(([annex, rooms]) =>
              rooms.map((room) => (
                <div
                  key={room}
                  className="border border-green-500 bg-green-100 rounded p-3 text-center hover:bg-green-200 text-black cursor-pointer transition"
                >
                  {room}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
