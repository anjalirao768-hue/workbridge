import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    console.log("Debug auth endpoint called");
    
    const user = await getCurrentUser();
    console.log("getCurrentUser result:", user);
    
    return NextResponse.json({ 
      user,
      hasUser: !!user,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("Debug auth error:", error);
    return NextResponse.json({ 
      error: "Failed to get user info",
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}