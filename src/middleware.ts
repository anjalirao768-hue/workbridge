import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  // Temporarily disable middleware to test frontend redirect
  console.log("Middleware debug - URL:", req.nextUrl.pathname, "- ALLOWING ACCESS");
  return NextResponse.next();
}

export const config = {
  matcher: ["/home", "/admin/:path*", "/dashboard/:path*"], // protect home, admin, and dashboard routes
};
