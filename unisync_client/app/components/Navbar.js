"use client"
import { Button, Disclosure, DisclosureButton, DisclosurePanel, Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react'
import { Bars3Icon, BellIcon, XMarkIcon } from '@heroicons/react/24/outline'
import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import Notification from './Notification'
import Profile from './Profile'


const navigation = [
  { name: 'Home', href: '/'},
  { name: 'Room Booking', href: '/RoomBooking'},
  { name: 'My Bookings', href: '/MyBookings'},
  { name: 'Contact Admin', href: '/ContactAdmin' },
  { name: 'AI Chatbot', href: '/AiChatbot' },
]

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

export default function Navbar() {

    const [current,setCurrent]=useState(null)
  return (
    <Disclosure as="nav" className="bg-gradient-to-r from-green-900 to-[#042A1A80]">
      <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
        <div className="relative flex h-16 items-center justify-between">
          <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
            {/* Mobile menu button*/}
            <DisclosureButton className="group relative inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-700 hover:text-white focus:ring-2 focus:ring-white focus:outline-hidden focus:ring-inset">
              <span className="absolute -inset-0.5" />
              <span className="sr-only">Open main menu</span>
              <Bars3Icon aria-hidden="true" className="block size-6 group-data-open:hidden" />
              <XMarkIcon aria-hidden="true" className="hidden size-6 group-data-open:block" />
            </DisclosureButton>
          </div>
          <div className="flex flex-1 items-center justify-center sm:justify-evenly">
            <div className="flex items-center">
              <h1 className='text-bold text-3xl'>UniSync</h1>
            </div>
            <div className="hidden sm:ml-6 sm:block">
              <div className="flex space-x-4">
                {navigation.map((item) => (
                   <Link
                   onClick={() => setCurrent(item.name)}
                   key={item.name}
                   href={item.href}
                   aria-current={current === item.name ? 'page' : undefined}
                   className={classNames(
                     current === item.name ? 'text-[#6ADB6A]' : 'hover:text-[#6ADB6A]',
                     'rounded-md px-3 py-2 text-sm font-medium'
                   )}
                 >
                   {item.name}
                 </Link>
                ))}
              </div>
            </div>
          </div>
          <div className="absolute inset-y-0 right-0 flex justify-between items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
             <Notification></Notification>
            {/* Profile dropdown */}
            <Menu as="div" className="ml-8">
              <Profile></Profile>
            </Menu>
          </div>
        </div>
      </div>

      <DisclosurePanel className="sm:hidden">
        <div className="space-y-1 px-2 pt-2 pb-3">
          {navigation.map((item) => (
            <DisclosureButton
            onClick={() => setCurrent(item.name)}
              key={item.name}
              as="a"
              href={item.href}
              aria-current={item.current ? 'page' : undefined}
              className={classNames(
                current==item.name ? 'text-[#6ADB6A]' : 'hover:text-[#6ADB6A]',
                'block rounded-md px-3 py-2 text-base font-medium',
              )}
            >
              {item.name}
            </DisclosureButton>
          ))}
        </div>
      </DisclosurePanel>
    </Disclosure>
  )
}
