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

    // Check admin access for admin routes
    if (req.nextUrl.pathname.startsWith('/admin') && payload.role !== 'admin') {
      return NextResponse.redirect(new URL("/home", req.url));
    }

    // Check role-based dashboard access
    if (req.nextUrl.pathname.startsWith('/dashboard/admin') && payload.role !== 'admin') {
      return NextResponse.redirect(new URL("/dashboard/" + payload.role, req.url));
    }
    
    if (req.nextUrl.pathname.startsWith('/dashboard/client') && payload.role !== 'client') {
      if (payload.role === 'admin') {
        // Allow admin to access client dashboard
      } else {
        return NextResponse.redirect(new URL("/dashboard/" + payload.role, req.url));
      }
    }
    
    if (req.nextUrl.pathname.startsWith('/dashboard/freelancer') && payload.role !== 'freelancer') {
      if (payload.role === 'admin') {
        // Allow admin to access freelancer dashboard
      } else {
        return NextResponse.redirect(new URL("/dashboard/" + payload.role, req.url));
      }
    }

    const res = NextResponse.next();
    res.headers.set("x-user-id", payload.userId);
    res.headers.set("x-user-role", payload.role);
    return res;
  } catch {
    return NextResponse.redirect(new URL("/login", req.url));
  }
}

export const config = {
  matcher: ["/home", "/admin/:path*", "/dashboard/:path*"], // protect home, admin, and dashboard routes
};
