import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendEmail({ to, subject, html }: { to: string; subject: string; html: string }) {
  return await resend.emails.send({
    from: "onboarding@resend.dev", // or your verified sender
    to,
    subject,
    html,
  });
}
