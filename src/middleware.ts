import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyJwt, JwtPayload } from "@/lib/jwt";




export async function middleware(req: NextRequest) {
  const token = req.cookies.get("token")?.value;
  
  console.log("Middleware debug - URL:", req.nextUrl.pathname);
  console.log("Middleware debug - Token exists:", !!token);

  if (!token) {
    console.log("Middleware debug - No token, redirecting to login");
    return NextResponse.redirect(new URL("/login", req.url));
  }

  try {
    // Check if JWT_SECRET is available
    const JWT_SECRET = process.env.JWT_SECRET;
    if (!JWT_SECRET) {
      console.log("Middleware debug - JWT_SECRET not found");
      return NextResponse.redirect(new URL("/login", req.url));
    }

    const payload: JwtPayload | null = verifyJwt(token);
    console.log("Middleware debug - JWT payload:", payload);
    console.log("Middleware debug - JWT_SECRET exists:", !!JWT_SECRET);
    
    if (!payload) {
      console.log("Middleware debug - Invalid token, redirecting to login");
      return NextResponse.redirect(new URL("/login", req.url));
    }

    console.log("Middleware debug - User role:", payload.role);
    console.log("Middleware debug - Accessing path:", req.nextUrl.pathname);

    // Check admin access for admin routes
    if (req.nextUrl.pathname.startsWith('/admin') && payload.role !== 'admin') {
      console.log("Middleware debug - Non-admin accessing admin route, redirecting to home");
      return NextResponse.redirect(new URL("/home", req.url));
    }

    // Check role-based dashboard access
    if (req.nextUrl.pathname.startsWith('/dashboard/admin') && payload.role !== 'admin') {
      console.log("Middleware debug - Non-admin accessing admin dashboard, redirecting to user dashboard");
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
