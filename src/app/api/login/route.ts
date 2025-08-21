import { NextResponse } from "next/server";
import { supabase } from "@/app/lib/supabase";
import bcrypt from "bcrypt";
import { PostgrestError } from "@supabase/supabase-js";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email & password required" }, { status: 400 });
    }

    // Get user by email
    const { data: users, error } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .limit(1);

    if (error) {
      const pgError = error as PostgrestError;
      return NextResponse.json({ error: pgError.message }, { status: 500 });
    }

    if (!users || users.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const user = users[0];

    // Check password
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return NextResponse.json({ error: "Invalid password" }, { status: 401 });
    }

    return NextResponse.json({ ok: true, user: { id: user.id, email: user.email } });
  } catch (error) {
    console.error("Login API error:", error);
    return NextResponse.json({ error: "Failed to login" }, { status: 500 });
  }
}
