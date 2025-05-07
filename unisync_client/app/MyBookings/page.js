"use client"
import { useState } from "react";
import useSWR from "swr";

const fetcher = (url) => fetch(url, { credentials: "include" }).then(res => res.json());

const statusStyles = {
  Approved: 'bg-green-100 text-green-700',
  Pending: 'bg-yellow-100 text-yellow-700',
  Rejected: 'bg-red-100 text-red-700',
};

const MyBookings = () => {
  const { data: bookingsData, error } = useSWR("http://localhost:5000/api/my-bookings", fetcher);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");

  const filteredBookings = (bookingsData || []).filter(booking => {
    const matchesStatus = filter === 'All' || booking.status === filter;
    const matchesSearch = booking.room.toLowerCase().includes(search.toLowerCase()) || booking.date.includes(search);
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="p-4 w-full max-w-5xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">My Bookings</h2>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-3">
        <input
          type="text"
          placeholder="Search by room or date"
          className="w-full md:w-1/3 px-4 py-2 border border-gray-300 rounded-md"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <div className="flex gap-2 flex-wrap">
          {['All', 'Approved', 'Pending', 'Rejected'].map(status => (
            <button
              key={status}
              className={`px-4 py-1 rounded-full text-sm border transition ${
                filter === status ? 'bg-green-600 text-white border-green-600' : 'bg-white text-gray-700 border-gray-300'
              }`}
              onClick={() => setFilter(status)}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {filteredBookings.map(({ id, room, date, start_time, end_time, status }) => (
          <div
            key={id}
            className="border border-gray-200 rounded-lg p-4 flex justify-between items-center flex-col md:flex-row gap-4 bg-[#FFFFFF20] transition-transform duration-200 hover:scale-[1.01]"
          >
            <div>
              <h3 className="font-semibold text-lg">{room}</h3>
              <p className="text-sm">{date} | {start_time} - {end_time}</p>
            </div>

            <div className="flex items-center gap-4">
              <span className={`text-sm font-medium px-3 py-1 rounded-full ${statusStyles[status]}`}>{status}</span>
              {status === 'Pending' && (
                <button className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded-md text-sm">
                  Cancel
                </button>
              )}
            </div>
          </div>
        ))}

        {bookingsData && filteredBookings.length === 0 && (
          <p className="text-center text-gray-500">No bookings found.</p>
        )}

        {!bookingsData && !error && <p className="text-center text-gray-400">Loading...</p>}
        {error && <p className="text-center text-red-500">Failed to load bookings.</p>}
      </div>
    </div>
  );
};

export default MyBookings;
