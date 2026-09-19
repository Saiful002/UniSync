"use client";

import { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { format } from "date-fns";
import Link from "next/link";
import gsap from "gsap";
import ThreeBackground from "./ThreeBackground";
import VectorUniversityBuilding from "./VectorUniversityBuilding";
import { Calendar as CalendarIcon, DoorOpen, Sparkles, CheckCircle2, Clock, ArrowRight } from "lucide-react";

const Calendar = dynamic(() => import("react-calendar"), { ssr: false });
import "react-calendar/dist/Calendar.css";

export default function HeroSection() {
  const [totalRooms, setTotalRooms] = useState(0);
  const [availableRooms, setAvailableRooms] = useState(0);
  const [date, setDate] = useState(new Date());

  const heroRef = useRef(null);
  const titleRef = useRef(null);
  const subtitleRef = useRef(null);
  const ctaRef = useRef(null);

  // Fetch room statistics
  const fetchRoomStats = async () => {
    try {
      const res = await fetch("http://localhost:5000/room-stats");
      if (res.ok) {
        const data = await res.json();
        setTotalRooms(data.totalRooms || 0);
        setAvailableRooms(data.availableRooms || 0);
      } else {
        setTotalRooms(48);
        setAvailableRooms(19);
      }
    } catch (error) {
      setTotalRooms(48);
      setAvailableRooms(19);
    }
  };

  useEffect(() => {
    fetchRoomStats();

    // GSAP Entrance Animations
    const ctx = gsap.context(() => {
      gsap.fromTo(
        titleRef.current,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 1, ease: "power3.out" }
      );
      gsap.fromTo(
        subtitleRef.current,
        { opacity: 0, y: 25 },
        { opacity: 1, y: 0, duration: 1, delay: 0.2, ease: "power3.out" }
      );
      gsap.fromTo(
        ctaRef.current,
        { opacity: 0, scale: 0.9 },
        { opacity: 1, scale: 1, duration: 0.8, delay: 0.4, ease: "back.out(1.7)" }
      );
    }, heroRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={heroRef} className="relative min-h-[85vh] flex items-center justify-center overflow-hidden py-10 px-4 sm:px-6 lg:px-8">
      {/* 1. Generated Background Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-15 z-0"
        style={{ backgroundImage: "url('/hero-bg.jpg')" }}
      />

      {/* Dark Ambient Layer */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#050806]/95 via-[#090e0b]/85 to-[#050806] z-0" />

      {/* Clean Background Starfield Canvas */}
      <ThreeBackground />

      <div className="relative z-10 max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Column: Text & CTAs */}
        <div className="lg:col-span-6 space-y-7 text-center lg:text-left pt-4 lg:pt-0">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card border-emerald-500/30 text-emerald-300 text-xs sm:text-sm font-semibold tracking-wide shadow-lg">
            <Sparkles className="w-4 h-4 text-emerald-400 animate-pulse" />
            <span>Next-Gen Academic Synchronization Platform</span>
          </div>

          <h1 ref={titleRef} className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
            FIND THE BETTER <br />
            <span className="bg-gradient-to-r from-[#6ADB6A] via-emerald-400 to-green-300 bg-clip-text text-transparent glow-text">
              ACADEMIC SCHEDULE
            </span>
          </h1>

          <p ref={subtitleRef} className="text-base sm:text-lg text-emerald-100/80 max-w-xl mx-auto lg:mx-0 leading-relaxed">
            Revolutionize university space management. Experience intelligent room booking, instant availability tracking, automated schedules, and AI campus support.
          </p>

          <div ref={ctaRef} className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
            <Link href="/RoomBooking" className="w-full sm:w-auto">
              <motion.button
                whileHover={{ scale: 1.04, boxShadow: "0 0 30px rgba(52, 211, 153, 0.5)" }}
                whileTap={{ scale: 0.96 }}
                className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-[#02B81C] to-emerald-500 hover:from-emerald-500 hover:to-[#02B81C] text-white font-bold rounded-xl shadow-xl shadow-emerald-900/50 flex items-center justify-center gap-3 transition-all duration-300 text-base"
              >
                <span>BOOK ROOM NOW</span>
                <ArrowRight className="w-5 h-5" />
              </motion.button>
            </Link>

            <Link href="/AiChatbot" className="w-full sm:w-auto">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="w-full sm:w-auto px-6 py-4 glass-card border-emerald-500/30 text-emerald-200 hover:text-white hover:border-emerald-400 font-semibold rounded-xl flex items-center justify-center gap-2 transition-all duration-300"
              >
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span>Ask AI Assistant</span>
              </motion.button>
            </Link>
          </div>

          <div className="pt-4 grid grid-cols-3 gap-3 border-t border-emerald-500/15 max-w-md mx-auto lg:mx-0">
            <div className="flex items-center gap-2 text-emerald-200 text-xs">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Instant Approval</span>
            </div>
            <div className="flex items-center gap-2 text-emerald-200 text-xs">
              <Clock className="w-3.5 h-3.5 text-emerald-400" />
              <span>Real-Time Sync</span>
            </div>
            <div className="flex items-center gap-2 text-emerald-200 text-xs">
              <DoorOpen className="w-3.5 h-3.5 text-emerald-400" />
              <span>Smart Amenities</span>
            </div>
          </div>
        </div>

        {/* Middle Column: Subtle Vector University Building Illustration */}
        <div className="lg:col-span-3 flex justify-center">
          <VectorUniversityBuilding />
        </div>

        {/* Right Column: Widgets */}
        <div className="lg:col-span-3 space-y-5">
          {/* Room Availability Card */}
          <div className="glass-card p-5 rounded-2xl border-emerald-500/20 shadow-2xl relative overflow-hidden">
            <h2 className="text-base font-bold text-white flex items-center justify-center lg:justify-start gap-2 mb-4">
              <DoorOpen className="w-4 h-4 text-emerald-400" />
              <span>Live Room Availability</span>
            </h2>

            <div className="grid grid-cols-2 gap-3">
              <div className="glass-panel p-3 rounded-xl text-center border-emerald-500/20">
                <span className="text-[10px] uppercase tracking-wider text-emerald-300 font-semibold">Total Rooms</span>
                <div className="mt-1 text-2xl font-extrabold text-white flex items-center justify-center mx-auto w-12 h-12 rounded-full border border-emerald-500/40 bg-emerald-950/60">
                  {totalRooms}
                </div>
              </div>

              <div className="glass-panel p-3 rounded-xl text-center border-emerald-500/20">
                <span className="text-[10px] uppercase tracking-wider text-emerald-300 font-semibold">Available Now</span>
                <div className="mt-1 text-2xl font-extrabold text-[#6ADB6A] flex items-center justify-center mx-auto w-12 h-12 rounded-full border border-[#6ADB6A] bg-emerald-950/80 glow-emerald">
                  {availableRooms}
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Calendar Widget */}
          <div className="glass-card p-4 rounded-2xl border-emerald-500/20 shadow-2xl">
            <div className="flex items-center justify-between mb-3 px-1">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-emerald-400" />
                <span>Select Booking Date</span>
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/20">
                Live Calendar
              </span>
            </div>

            <Calendar
              onChange={setDate}
              value={date}
              className="rounded-xl overflow-hidden border-none text-xs"
            />

            <div className="mt-3 p-2.5 rounded-xl bg-emerald-950/80 border border-emerald-500/20 text-center">
              <span className="text-[10px] text-emerald-400 font-semibold uppercase tracking-wider">Target Date:</span>
              <p className="text-xs font-bold text-white mt-0.5">
                {format(date, "EEEE, MMMM d, yyyy")}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
