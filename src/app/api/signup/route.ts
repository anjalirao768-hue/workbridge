import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { supabase } from "@/app/lib/supabase";
import { signJwt } from "@/app/lib/jwt";

export async function POST(req: Request) {
  const { email, password, cover_letter, experiences, age, skills } = await req.json();

  if (!email || !password) {
    return NextResponse.json({ error: "Email & password required" }, { status: 400 });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const { data, error } = await supabase
    .from("users")
    .insert([
      {
        email,
        password_hash: hashedPassword, // ✅ explicit mapping
        cover_letter,
        experiences,
        age,
        skills,
      },
    ])
    .select("id, email")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // ✅ Generate token with userId
  const token = signJwt({ userId: data.id, email: data.email });

  const res = NextResponse.json({ ok: true });
  res.cookies.set("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
  });

  return res;
}
