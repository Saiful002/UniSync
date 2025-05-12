'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import { format } from 'date-fns';

const Calendar = dynamic(() => import('react-calendar'), { ssr: false });
import 'react-calendar/dist/Calendar.css';
import Link from 'next/link';

export default function HeroSection() {
  const [totalRooms, setTotalRooms] = useState(0);
  const [availableRooms, setAvailableRooms] = useState(0);
  const [date, setDate] = useState(new Date());

  // Fetch total and available rooms from backend
  const fetchRoomStats = async () => {
    try {
      const res = await fetch('http://localhost:5000/room-stats');
      const data = await res.json();
      setTotalRooms(data.totalRooms);
      setAvailableRooms(data.availableRooms);
    } catch (error) {
      console.error('Error fetching room stats:', error);
    }
  };

  useEffect(() => {
    fetchRoomStats();
  }, []);

  return (
    <div className="bg-gradient-to-r from-black to-green-900 flex flex-col lg:flex-row items-center justify-evenly p-6 gap-10">
      {/* Left Side Text Content */}
      <div className="text-white text-center lg:text-left max-w-md mt-24 sm:mt-0">
        <h1 className="text-4xl lg:text-5xl font-bold leading-tight">
          FIND THE BETTER <span className="text-green-400">SCHEDULE</span>
        </h1>
        <p className="mt-4 text-lg">
          In the digital realm of innovation and efficiency, our room booking system ensures seamless management.
        </p>
        <Link href={"/RoomBooking"}>
          <button className="mt-6 bg-[#02B81C] hover:bg-green-600 hover:border-2 border-[#40FE5B] text-white font-bold py-2 px-6 rounded-lg">
            BOOK NOW
          </button>
        </Link>
      </div>

      {/* Right Side - Room Stats & Calendar */}
      <div className="flex flex-col items-center space-y-6 mt-16 sm:mt-34">
        {/* Room Stats */}
        <div className="bg-[#FFFFFF20] text-white p-6 rounded-xl shadow-lg w-screen sm:w-full sm:max-w-md">
          <h2 className="text-xl font-bold text-center mb-4">Room Availability</h2>
          <div className="flex justify-between text-lg font-semibold">
            <div>
              <span>Total Rooms</span>
              <motion.span
                animate={{ opacity: [0, 1] }}
                transition={{ duration: 1 }}
                className="block text-2xl text-center items-center flex align-center justify-center border border-[#6ADB6A] w-20 h-20 rounded-full"
              >
                {totalRooms}
              </motion.span>
            </div>
            <div>
              <span>Available Rooms</span>
              <motion.span
                animate={{ opacity: [0, 1] }}
                transition={{ duration: 1 }}
                className="block text-2xl text-center items-center flex align-center justify-center border border-[#6ADB6A] w-20 h-20 rounded-full"
              >
                {availableRooms}
              </motion.span>
            </div>
          </div>
        </div>

        {/* Real-time Calendar */}
        <div className="bg-[#FFFFFF20] text-white p-3 sm:p-6 rounded-xl shadow-lg sm:w-full sm:max-w-md">
          <h2 className="text-xl font-bold text-center mb-4">Booking Calendar</h2>
          <Calendar 
            onChange={setDate} 
            value={date} 
            className="bg-white text-black p-2 rounded-lg w-full"
          />
          <p className="text-center mt-4 text-lg">
            Selected Date: {format(date, 'PPP')}
          </p>
        </div>
      </div>
    </div>
  );
}
