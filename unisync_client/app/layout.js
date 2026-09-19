import { Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import LayoutClient from "./components/LayoutClient";

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

const monoFont = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata = {
  title: "UniSync - Modern Campus & Room Synchronization Platform",
  description: "Seamless university room booking, AI assistance, and academic scheduling.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <body className={`${plusJakarta.variable} ${monoFont.variable} font-sans antialiased bg-[#031109] text-gray-100 selection:bg-emerald-500 selection:text-black min-h-screen flex flex-col`}>
        <LayoutClient>{children}</LayoutClient>
      </body>
    </html>
  );
}

