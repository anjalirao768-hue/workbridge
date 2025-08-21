"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const [form, setForm] = useState({
    email: "",
    password: "",
    cover_letter: "",
    experiences: "",
    age: "",
    skills: "",
  });
  const [status, setStatus] = useState("");
  const router = useRouter();

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const res = await fetch("/api/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        age: parseInt(form.age, 10),
        skills: form.skills.split(",").map((s) => s.trim()),
      }),
    });

    const data = await res.json();
    if (res.ok) {
      setStatus("✅ Signup successful!");
      router.push("/home"); // 👈 redirect user immediately
    } else {
      setStatus(`❌ ${data.error || "Something went wrong."}`);
    }
  }

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Signup</h1>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem", maxWidth: "400px" }}>
        <input type="email" name="email" placeholder="Email" value={form.email} onChange={handleChange} required />
        <input type="password" name="password" placeholder="Password" value={form.password} onChange={handleChange} required />
        <textarea name="cover_letter" placeholder="Cover Letter" value={form.cover_letter} onChange={handleChange} />
        <textarea name="experiences" placeholder="Past Experiences" value={form.experiences} onChange={handleChange} />
        <input type="number" name="age" placeholder="Age" value={form.age} onChange={handleChange} />
        <input type="text" name="skills" placeholder="Skills (comma separated)" value={form.skills} onChange={handleChange} />
        <button type="submit">Sign Up</button>
      </form>
      {status && <p>{status}</p>}
    </div>
  );
}
