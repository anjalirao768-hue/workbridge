import { NextResponse } from "next/server";
import { getCurrentUserWithFreshData } from "@/lib/auth";

export async function GET() {
  try {
    const userData = await getCurrentUserWithFreshData();
    
    if (!userData) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    return NextResponse.json(userData);
  } catch (error) {
    console.error("Get user info error:", error);
    return NextResponse.json({ error: "Failed to get user info" }, { status: 500 });
  }
}