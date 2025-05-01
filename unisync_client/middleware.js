import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

const PUBLIC_ROUTES = ["/Login", "/register"];

export async function middleware(req) {
  const { pathname } = req.nextUrl;

  // Allow public routes without token
  if (PUBLIC_ROUTES.includes(pathname)) {
    return NextResponse.next();
  }

  const token = req.cookies.get("token")?.value;

  if (!token) {
    return NextResponse.redirect(new URL("/Login", req.url));
  }

  try {
    // Verify token (replace with your actual secret)
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    await jwtVerify(token, secret);
    return NextResponse.next();
  } catch (err) {
    return NextResponse.redirect(new URL("/Login", req.url));
  }
}

export const config = {
  matcher: [
    // Match all paths except public ones
    "/((?!_next/static|_next/image|favicon.ico|Login|register).*)",
  ],
};
