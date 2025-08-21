// src/app/api/signup/route.ts
import { NextResponse } from "next/server";
import { sendEmail } from "@/app/lib/mailer";

export async function POST(req: Request) {
  const { email } = await req.json();

  // TODO: save user to DB here

  await sendEmail({
    to: email,
    subject: "Welcome to Workbridge 🎉",
    html: "<p>Thanks for signing up!</p>",
  });

  return NextResponse.json({ ok: true });
}
