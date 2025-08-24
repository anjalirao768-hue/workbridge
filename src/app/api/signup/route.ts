// src/app/api/signup/route.ts
import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { supabase } from "@/app/lib/supabase";
import { signJwt } from "@/lib/jwt";
import type { DBUser } from "@/types/db";
import type { PostgrestError } from "@supabase/supabase-js";

export async function POST(req: Request) {
  try {
    const { email, password, cover_letter, experiences, age, skills } =
      await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email & password required" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const { data, error } = await supabase
      .from("users")
      .insert([
        {
          email,
          password_hash: hashedPassword,
          cover_letter,
          experiences,
          age,
          skills,
          role: "user",
        },
      ])
      .select("id, email, role")
      .single();

    if (error) {
      const pgError = error as PostgrestError;

      // 23505 = unique_violation in Postgres
      if (pgError.code === "23505") {
        return NextResponse.json(
          { error: "Email already registered" },
          { status: 400 }
        );
      }

      return NextResponse.json({ error: pgError.message }, { status: 500 });
    }

    // ✅ Type safety: cast Supabase result
    const user = data as DBUser;

    // Generate JWT with role
    const token = signJwt({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

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
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("Signup API error:", err);
    return NextResponse.json({ error: "Failed to signup" }, { status: 500 });
  }
}
