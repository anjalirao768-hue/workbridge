import { NextResponse } from "next/server";
import { sendEmail } from "@/app/lib/mailer";
import { supabase } from "@/app/lib/supabase";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Insert into Supabase
    const { error } = await supabase
      .from("users") // make sure your table is called "users"
      .insert([{ email }]);

    if (error) {
      // 23505 = Postgres unique violation (duplicate key)
      if ((error as any).code === "23505") {
        return NextResponse.json(
          { error: "Email already registered" },
          { status: 400 }
        );
      }

      return NextResponse.json(
        { error: error.message },
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
