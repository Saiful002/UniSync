"use client";

export const getApiUrl = () => {
  if (typeof window !== "undefined") {
    const hostname = window.location.hostname;
    if (hostname === "localhost" || hostname === "127.0.0.1" || hostname.startsWith("192.168.")) {
      return "http://localhost:5000";
    }
  }
  return process.env.NEXT_PUBLIC_API_URL || "https://uni-sync-delta.vercel.app";
};

export default getApiUrl;
