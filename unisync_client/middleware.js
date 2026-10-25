import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

const PUBLIC_ROUTES = ["/Login"];

export async function middleware(req) {
  const { pathname } = req.nextUrl;

  // Allow public routes without token
  if (PUBLIC_ROUTES.includes(pathname)) {
    return NextResponse.next();
  }

  const token = req.cookies.get("token")?.value;
  console.log(token)

  if (!token) {
    return NextResponse.redirect(new URL("/Login", req.url));
  }

  try {
    // Verify token with secret matching server SECRET_KEY
    const secretKey = process.env.SECRET_KEY || "12345678";
    const secret = new TextEncoder().encode(secretKey);
    const { payload } = await jwtVerify(token, secret);

    const userRole = (payload.role || "").toLowerCase();

    // STRICT PORTAL ISOLATION:
    // 1. If admin attempts to visit user dashboard or user routes, force redirect to /AdminPanel
    if (userRole === "admin" && !pathname.startsWith("/AdminPanel")) {
      return NextResponse.redirect(new URL("/AdminPanel", req.url));
    }

    // 2. If regular user attempts to visit /AdminPanel, force redirect to /
    if (userRole !== "admin" && pathname.startsWith("/AdminPanel")) {
      return NextResponse.redirect(new URL("/", req.url));
    }

    return NextResponse.next();
  } catch (err) {
    console.error("Middleware JWT Verification Error:", err.message);
    return NextResponse.redirect(new URL("/Login", req.url));
  }
}

export const config = {
  matcher: [
    // Match all paths except public ones
    "/((?!_next/static|_next/image|favicon.ico|Login|register).*)",
  ],
};
