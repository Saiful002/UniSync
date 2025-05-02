"use client";

import { usePathname } from "next/navigation";
import Navbar from "./Navbar";

export default function LayoutClient({ children }) {
  const pathname = usePathname();
  const hideNavbar = pathname === "/Login";

  return (
    <>
      {!hideNavbar && <Navbar />}
      {children}
    </>
  );
}
