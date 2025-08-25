import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  // Temporarily disable middleware to test frontend redirect
  console.log("Middleware debug - URL:", req.nextUrl.pathname, "- ALLOWING ACCESS");
  return NextResponse.next();
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
