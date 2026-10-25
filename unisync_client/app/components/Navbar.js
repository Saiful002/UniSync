"use client";

import { Disclosure, DisclosureButton, DisclosurePanel, Menu } from "@headlessui/react";
import { Bars3Icon, XMarkIcon, ArrowLeftOnRectangleIcon, ShieldCheckIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Notification from "./Notification";
import Profile from "./Profile";
import BrandLogo from "./BrandLogo";
import { motion } from "framer-motion";

const navigation = [
  { name: "Home", href: "/" },
  { name: "Room Booking", href: "/RoomBooking" },
  { name: "My Bookings", href: "/MyBookings" },
  { name: "Contact Admin", href: "/ContactAdmin" },
  { name: "AI Chatbot", href: "/AiChatbot" },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const isAdmin = pathname?.startsWith("/AdminPanel");

  const handleSignOut = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userRole");
    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    router.push("/Login");
  };

  return (
    <header className="sticky top-0 z-50 w-full px-4 sm:px-8 py-3 transition-all duration-300">
      <Disclosure as="nav" className="glass-panel max-w-7xl mx-auto rounded-2xl border border-emerald-500/20 shadow-2xl shadow-black/80 backdrop-blur-xl bg-[#090d0a]/85">
        {({ open }) => (
          <>
            <div className="px-4 sm:px-6 lg:px-8">
              <div className="relative flex h-16 items-center justify-between">
                {/* Mobile menu button */}
                <div className="absolute inset-y-0 left-0 flex items-center lg:hidden">
                  <DisclosureButton className="group relative inline-flex items-center justify-center rounded-xl p-2 text-emerald-300 hover:bg-emerald-900/50 hover:text-white focus:outline-none focus:ring-2 focus:ring-emerald-400">
                    <span className="sr-only">Open main menu</span>
                    <Bars3Icon aria-hidden="true" className="block size-6 group-data-open:hidden" />
                    <XMarkIcon aria-hidden="true" className="hidden size-6 group-data-open:block" />
                  </DisclosureButton>
                </div>

                {/* Left side: Brand Logo + Admin Badge */}
                <div className="flex items-center justify-center lg:justify-start flex-1 lg:flex-initial pl-8 lg:pl-0 gap-3">
                  <BrandLogo size="md" href={isAdmin ? "/AdminPanel" : "/"} />
                  {isAdmin && (
                    <div className="hidden sm:flex items-center pl-3 border-l border-emerald-500/20">
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-widest bg-emerald-950/90 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5 shadow-sm">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        Admin Portal
                      </span>
                    </div>
                  )}
                </div>

                {/* Middle: Desktop Navigation Links (Only for user panel) */}
                <div className="hidden lg:block">
                  {!isAdmin ? (
                    <div className="flex items-center space-x-1 bg-[#051e11]/60 p-1.5 rounded-full border border-emerald-500/10">
                      {navigation.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                          <Link
                            key={item.name}
                            href={item.href}
                            className={`relative px-4 py-2 text-sm font-semibold rounded-full transition-all duration-300 ${
                              isActive
                                ? "text-white"
                                : "text-emerald-100/70 hover:text-white hover:bg-emerald-800/30"
                            }`}
                          >
                            {isActive && (
                              <motion.span
                                layoutId="activePill"
                                className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-green-500 rounded-full shadow-md shadow-emerald-500/30 -z-10"
                                transition={{ type: "spring", stiffness: 380, damping: 30 }}
                              />
                            )}
                            {item.name}
                          </Link>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#051e11]/80 border border-emerald-500/20 text-xs font-semibold text-emerald-200 shadow-inner">
                      <ShieldCheckIcon className="w-4 h-4 text-emerald-400" />
                      <span>System Administration Console</span>
                      <span className="text-emerald-500/30">•</span>
                      <span className="text-emerald-400/90 font-mono text-[11px]">Strict Mode</span>
                    </div>
                  )}
                </div>

                {/* Right Side: Admin specific tools or User tools */}
                <div className="flex items-center gap-3">
                  {isAdmin ? (
                    <>
                      <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-950/70 border border-emerald-500/30 text-xs text-emerald-300 font-bold">
                        <span className="w-2 h-2 rounded-full bg-emerald-400" />
                        Administrator
                      </div>
                      <button
                        onClick={handleSignOut}
                        className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-red-950/50 hover:bg-red-900/70 text-red-300 border border-red-500/30 transition shadow-sm"
                      >
                        <ArrowLeftOnRectangleIcon className="w-4 h-4" />
                        <span className="hidden sm:inline">Sign Out</span>
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="bg-emerald-950/40 p-1 rounded-full border border-emerald-500/10 flex items-center">
                        <Notification />
                      </div>
                      <Menu as="div" className="relative">
                        <Profile />
                      </Menu>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Mobile Navigation Panel */}
            <DisclosurePanel className="lg:hidden px-4 pb-4 pt-2 border-t border-emerald-500/10">
              {isAdmin ? (
                <div className="space-y-3 pt-2">
                  <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/20 flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-300 uppercase tracking-wide">Portal: Administrator</span>
                    <span className="text-[11px] text-emerald-400 font-mono bg-emerald-900/60 px-2.5 py-0.5 rounded-full border border-emerald-500/30">Active</span>
                  </div>
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold bg-red-950/60 hover:bg-red-900/80 text-red-300 border border-red-500/30 transition"
                  >
                    <ArrowLeftOnRectangleIcon className="w-4 h-4" />
                    <span>Sign Out of Admin</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-1.5 pt-2">
                  {navigation.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                      <DisclosureButton
                        key={item.name}
                        as={Link}
                        href={item.href}
                        className={`block rounded-xl px-4 py-3 text-base font-semibold transition-all ${
                          isActive
                            ? "bg-gradient-to-r from-emerald-600 to-green-500 text-white shadow-lg shadow-emerald-900/40"
                            : "text-emerald-100/80 hover:bg-emerald-900/40 hover:text-white"
                        }`}
                      >
                        {item.name}
                      </DisclosureButton>
                    );
                  })}
                </div>
              )}
            </DisclosurePanel>
          </>
        )}
      </Disclosure>
    </header>
  );
}
