import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { supabase } from "@/app/lib/supabase";
import { signJwt } from "@/lib/jwt";


export async function POST(req: Request) {
  const { email, password, cover_letter, experiences, age, skills } = await req.json();

  if (!email || !password) {
    return NextResponse.json({ error: "Email & password required" }, { status: 400 });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const { data, error } = await supabase
  .from("users")
  .insert([{
    email,
    password_hash : hashedPassword,
    cover_letter,
    experiences,
    age,
    skills,
    role: "user", // 👈 new
  }])
  .select("id, email, role")
  .single();

  if (error) {
    if ((error as any).code === "23505") {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 400 }
      );
    }
  
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // ✅ Generate token with userId
  const token = signJwt({ userId: data.id, email: data.email, role: data.role  });

  const res = NextResponse.json({ ok: true });
  res.cookies.set("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
  });

  return res;
}
