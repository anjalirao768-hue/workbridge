import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyJwt, JwtPayload } from "@/lib/jwt";




export async function middleware(req: NextRequest) {
  const token = req.cookies.get("token")?.value;

  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  try {
    const payload: JwtPayload | null = verifyJwt(token);
    if (!payload) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    const res = NextResponse.next();
    res.headers.set("x-user-id", payload.userId);
    return res;
  } catch {
    return NextResponse.redirect(new URL("/login", req.url));
  }
}

export const config = {
  matcher: ["/home", "/admin/:path*"], // protect home and admin routes
};
