"use client";

import { useEffect, useRef } from "react";
import HeroSection from "./components/HeroSection";
import Link from "next/link";
import { motion } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { 
  Building2, 
  Bot, 
  CalendarCheck, 
  ShieldCheck, 
  Zap, 
  Clock, 
  Layers, 
  ArrowRight,
  Sparkles
} from "lucide-react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const features = [
  {
    icon: Building2,
    title: "Smart Room Booking",
    description: "Filter by room type, capacity, projectors, whiteboards, and PCs with real-time status updates.",
    color: "from-emerald-500 to-green-600",
  },
  {
    icon: Bot,
    title: "AI Campus Assistant",
    description: "Instant answers for room inquiries, schedule clashes, facility guidance, and booking status.",
    color: "from-green-500 to-teal-600",
  },
  {
    icon: CalendarCheck,
    title: "My Bookings Hub",
    description: "Track all pending, approved, and requested room reservations in a single synchronized dashboard.",
    color: "from-emerald-600 to-green-400",
  },
  {
    icon: ShieldCheck,
    title: "Admin Governance",
    description: "Automated approval workflows, conflict resolution, role security, and real-time room analytics.",
    color: "from-teal-500 to-emerald-700",
  },
];

const stats = [
  { value: "99.9%", label: "System Uptime" },
  { value: "48+", label: "Smart Classrooms & Labs" },
  { value: "1,200+", label: "Monthly Reservations" },
  { value: "< 2s", label: "Instant Sync Speed" },
];

export default function Home() {
  const sectionRef = useRef(null);
  const cardsRef = useRef([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        cardsRef.current,
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.15,
          ease: "power3.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 80%",
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <main className="space-y-16 pb-20">
      {/* Hero Section */}
      <HeroSection />

      {/* Feature Showcase Grid with GSAP Scroll Trigger */}
      <section ref={sectionRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-950/60 border border-emerald-500/20 text-emerald-300 text-xs font-semibold uppercase tracking-wider">
            <Zap className="w-3.5 h-3.5 text-emerald-400" />
            <span>Platform Highlights</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
            Designed for Seamless <br />
            <span className="bg-gradient-to-r from-[#6ADB6A] to-emerald-400 bg-clip-text text-transparent">
              Campus Collaboration
            </span>
          </h2>
          <p className="text-emerald-100/70 text-base sm:text-lg">
            Streamline room reservations, reduce schedule collisions, and automate admin requests with our intuitive platform.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                ref={(el) => (cardsRef.current[idx] = el)}
                className="glass-card p-6 rounded-2xl border-emerald-500/20 hover:border-emerald-400/40 relative group flex flex-col justify-between"
              >
                <div>
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center text-white mb-6 shadow-lg shadow-emerald-900/40 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3 group-hover:text-emerald-300 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-emerald-100/70 text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </div>

                <div className="pt-6 mt-4 border-t border-emerald-500/10 flex items-center text-xs font-semibold text-emerald-400 group-hover:text-emerald-300">
                  <span>Explore Feature</span>
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Stats Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="glass-panel p-8 sm:p-12 rounded-3xl border-emerald-500/20 shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-950/40 via-transparent to-emerald-950/40" />
          <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {stats.map((stat) => (
              <div key={stat.label} className="space-y-2">
                <div className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#6ADB6A] glow-text">
                  {stat.value}
                </div>
                <div className="text-xs sm:text-sm font-semibold text-emerald-200/80 tracking-wide">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Bottom Section */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="glass-card p-8 sm:p-12 rounded-3xl border-emerald-500/30 text-center space-y-6 relative overflow-hidden bg-gradient-to-b from-[#05240d]/80 to-[#031109]">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400">
            <Sparkles className="w-8 h-8 animate-pulse" />
          </div>

          <h2 className="text-3xl sm:text-4xl font-bold text-white">
            Ready to Synchronize Your Campus Schedule?
          </h2>
          <p className="text-emerald-100/70 max-w-xl mx-auto text-base">
            Book your required classrooms, seminar halls, or lab rooms in seconds. Instant approval and conflict-free booking.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/RoomBooking">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-[#02B81C] to-emerald-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-900/50 flex items-center justify-center gap-2"
              >
                <span>Find & Reserve Rooms</span>
                <ArrowRight className="w-5 h-5" />
              </motion.button>
            </Link>

            <Link href="/ContactAdmin">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="w-full sm:w-auto px-6 py-4 glass-card text-emerald-200 hover:text-white font-semibold rounded-xl border border-emerald-500/30"
              >
                Contact Support
              </motion.button>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
