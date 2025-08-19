// src/app/api/email-test/route.ts
import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function GET() {
  try {
    const data = await resend.emails.send({
      from: process.env.EMAIL_FROM || "onboarding@resend.dev",
      to: "anjalirao768@gmail.com",  // 👈 replace with your test email
      subject: "Test email from Next.js + Resend",
      html: "<p>It works! 🚀</p>",
    });

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error }, { status: 500 });
  }
}
