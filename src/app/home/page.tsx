"use client";

import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/logout", { method: "POST" }); // clears cookie
    router.push("/login"); // redirect to login
  }

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Hello WorkBridge 🚀</h1>
      <p>You are logged in!</p>
      <button onClick={handleLogout} style={{ marginTop: "1rem" }}>
        Logout
      </button>
    </div>
  );
}
