"use client";

import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/logout", { method: "POST" }); // calls your logout route
    router.push("/login"); // redirect to login
  }

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Hello WorkBridge 🚀</h1>
      <p>Next.js + Vercel is live. CI/CD working.</p>
      <button onClick={handleLogout} style={{ marginTop: "1rem" }}>
        Logout
      </button>
    </div>
  );
}
