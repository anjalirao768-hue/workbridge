import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { supabase } from "@/app/lib/supabase";

export async function GET() {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Fetch fresh user data from database to get updated role
    const { data: userData, error } = await supabase
      .from('users')
      .select('id, email, role, skills, cover_letter, experiences, age, kyc_status')
      .eq('id', user.userId)
      .single();

    if (error || !userData) {
      console.error("Failed to fetch user data:", error);
      return NextResponse.json({ error: "Failed to fetch user data" }, { status: 500 });
    }

    return NextResponse.json({
      userId: userData.id,
      email: userData.email,
      role: userData.role,
      skills: userData.skills || [],
      cover_letter: userData.cover_letter,
      experiences: userData.experiences,
      age: userData.age,
      kyc_status: userData.kyc_status || 'pending'
    });
  } catch (error) {
    console.error("Get user info error:", error);
    return NextResponse.json({ error: "Failed to get user info" }, { status: 500 });
  }
}