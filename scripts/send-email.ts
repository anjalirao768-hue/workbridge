import { config } from "dotenv";
config({ path: ".env.local" }); // load env BEFORE importing mailer

import { sendEmail } from "../src/app/lib/mailer.ts";

(async () => {
  const to = process.argv[2] || process.env.TEST_EMAIL || "anjalirao768@gmail.com";
  console.log("Sending to:", to);

  try {
    const result = await sendEmail({
      to,
      subject: "CLI test via tsx ✅",
      html: "<p>Hello from the CLI script!</p>",
    });
    console.log("Result:", result);
  } catch (err) {
    console.error("Failed:", err);
    process.exit(1);
  }
})();
