// src/app/api/signup/route.ts
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { signJwt } from "@/lib/jwt";
import { supabase } from "@/app/lib/supabase";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password, cover_letter, experiences, age, skills } = body;

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from("users")
      .select("id")
      .eq("email", email)
      .single();

    if (existingUser) {
      return NextResponse.json({ error: "Email already registered" }, { status: 409 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const { data: user, error } = await supabase
      .from("users")
      .insert({
        email,
        password_hash: hashedPassword,
        cover_letter,
        experiences,
        age,
        skills: skills || [],
        role: "user", // Default role
      })
      .select("id, email, role")
      .single();

    if (error) {
      console.error("User creation error:", error);
      return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
    }

    // Generate JWT
    const token = signJwt({ userId: user.id, email: user.email, role: user.role });

    // Set cookie
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
      path: "/",
    });

    return res;
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}