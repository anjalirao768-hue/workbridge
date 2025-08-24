import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { supabase } from "@/app/lib/supabase";

export async function POST(req: Request) {
  try {
    const user = getCurrentUser();
    
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { role, skills } = await req.json();

    if (!role || !['client', 'freelancer'].includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    // Update user role and skills in database
    const updateData: any = { role };
    
    if (skills && Array.isArray(skills)) {
      updateData.skills = skills;
    }

    const { data, error } = await supabase
      .from("users")
      .update(updateData)
      .eq("id", user.userId)
      .select("*")
      .single();

    if (error) {
      console.error("Role update error:", error);
      return NextResponse.json({ error: "Failed to update role" }, { status: 500 });
    }

    return NextResponse.json({ 
      ok: true, 
      user: { 
        id: data.id, 
        email: data.email, 
        role: data.role,
        skills: data.skills 
      } 
    });

  } catch (error) {
    console.error("Update role error:", error);
    return NextResponse.json({ error: "Failed to update role" }, { status: 500 });
  }
}