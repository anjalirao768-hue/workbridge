import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = getCurrentUser();
    
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    return NextResponse.json({
      userId: user.userId,
      email: user.email,
      role: user.role,
    });
  } catch (error) {
    console.error("Get user info error:", error);
    return NextResponse.json({ error: "Failed to get user info" }, { status: 500 });
  }
}