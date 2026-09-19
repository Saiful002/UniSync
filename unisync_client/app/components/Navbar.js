"use client";

import { Disclosure, DisclosureButton, DisclosurePanel, Menu } from "@headlessui/react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { usePathname } from "next/navigation";
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

                {/* Left side: Brand Logo */}
                <div className="flex items-center justify-center lg:justify-start flex-1 lg:flex-initial pl-8 lg:pl-0">
                  <BrandLogo size="md" />
                </div>

                {/* Middle: Desktop Navigation Links */}
                <div className="hidden lg:block">
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
                </div>

                {/* Right Side: Notification & Profile */}
                <div className="flex items-center gap-3">
                  <div className="bg-emerald-950/40 p-1 rounded-full border border-emerald-500/10 flex items-center">
                    <Notification />
                  </div>
                  <Menu as="div" className="relative">
                    <Profile />
                  </Menu>
                </div>
              </div>
            </div>

            {/* Mobile Navigation Panel */}
            <DisclosurePanel className="lg:hidden px-4 pb-4 pt-2 border-t border-emerald-500/10">
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
            </DisclosurePanel>
          </>
        )}
      </Disclosure>
    </header>
  );
}
