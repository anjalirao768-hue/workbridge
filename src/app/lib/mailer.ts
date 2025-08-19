import { Resend } from "resend";

function getResend() {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error("RESEND_API_KEY missing");
  return new Resend(key);
}

export async function sendEmail({
  to,
  subject,
  html,
  from = process.env.EMAIL_FROM || "onboarding@resend.dev",
}: {
  to: string; subject: string; html: string; from?: string;
}) {
  const resend = getResend();
  try {
    const data = await resend.emails.send({ from, to, subject, html });
    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
}
