"use client";

import { useState } from "react";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus(""); // clear old messages

    try {
      const res = await fetch("/api/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        // ✅ Use backend error messages directly
        if (data.error === "Email already registered") {
          setStatus("⚠️ You’re already signed up with this email!");
        } else {
          setStatus("❌ " + (data.error || "Something went wrong."));
        }
        return;
      }

      // ✅ Success case
      setStatus("✅ Signup successful! Check your email.");
      setEmail(""); // reset field
    } catch (err) {
      setStatus("❌ Something went wrong. Try again.");
    }
  }

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Signup</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          required
          style={{ marginRight: "1rem", padding: "0.5rem" }}
        />
        <button type="submit">Sign Up</button>
      </form>
      {status && <p>{status}</p>}
    </div>
  );
}
