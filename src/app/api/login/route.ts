import { NextResponse } from "next/server";
import { supabase } from "@/app/lib/supabase";
import bcrypt from "bcrypt";
import { signJwt } from "@/lib/jwt";
import type { DBUser } from "@/types/db";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email & password required" }, { status: 400 });
    }

    // Fetch user
    const { data: users, error } = await supabase
    .from("users")
    .select("id, email, password_hash, role")
    .eq("email", email)
    .limit(1);
  
  if (error || !users || users.length === 0) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }
  
  const user = users[0] as DBUser;
  

    // Verify password
    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    // Generate JWT
    const token = signJwt({ userId: user.id, email: user.email, role: user.role });
    
    // Set HttpOnly cookie
    const res = NextResponse.json({ 
      ok: true, 
      user: { 
        userId: user.id, 
        email: user.email, 
        role: user.role 
      } 
    });
    res.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    return res;
  } catch (error) {
    console.error("Login API error:", error);
    return NextResponse.json({ error: "Failed to login" }, { status: 500 });
  }
}
