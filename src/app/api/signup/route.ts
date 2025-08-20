import { NextResponse } from "next/server";
import { sendEmail } from "@/app/lib/mailer";
import { supabase } from "@/app/lib/supabase";
import type { PostgrestError } from "@supabase/supabase-js";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Insert into Supabase
    const { error } = await supabase
      .from("users")
      .insert([{ email }]);

    if (error) {
      // Make sure TS knows it's a PostgrestError
      const pgError: PostgrestError = error;

      // 23505 = Postgres unique violation (duplicate key)
      if (pgError.code === "23505") {
        return NextResponse.json(
          { error: "Email already registered" },
          { status: 400 }
        );
      }

      return NextResponse.json(
        { error: pgError.message },
        { status: 500 }
      );
    }

    // Send welcome email
    await sendEmail({
      to: email,
      subject: "Welcome to WorkBridge 🚀",
      html: "<p>Thanks for signing up!</p>",
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Signup API error:", error);
    return NextResponse.json({ error: "Failed to signup" }, { status: 500 });
  }
}
