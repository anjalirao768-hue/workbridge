// src/app/api/logout/route.ts
import { NextResponse } from "next/server";

export async function POST() {
  // Clear the JWT cookie
  const res = NextResponse.json({ ok: true });
  res.cookies.set("token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: new Date(0), // expire immediately
  });

  return res;
}
