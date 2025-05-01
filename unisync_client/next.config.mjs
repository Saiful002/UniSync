/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
      serverActions: true,
    },
    // Middleware configuration
    matcher: [
      // Define all routes that should be protected
      "/:path*",
      "/RoomBooking/:path*",
      "/MyBooking/:path*",
      // Add more protected paths if needed
    ],
  };
  
  export default nextConfig;
  