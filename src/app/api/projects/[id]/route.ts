import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { supabase } from "@/app/lib/supabase";

// GET /api/projects/[id] - Get project details
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { data: project, error } = await supabase
      .from('projects')
      .select(`
        *,
        client:users!projects_client_id_fkey(id, email, skills, cover_letter),
        freelancer:users!projects_freelancer_id_fkey(id, email, skills, cover_letter),
        milestones(
          *,
          escrows(*)
        )
      `)
      .eq('id', params.id)
      .single();

    if (error) {
      console.error('Project fetch error:', error);
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Check access permissions
    const hasAccess = 
      user.role === 'admin' ||
      project.client_id === user.userId ||
      project.freelancer_id === user.userId;

    if (!hasAccess) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    return NextResponse.json({ project });

  } catch (error) {
    console.error('Project details API error:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PUT /api/projects/[id] - Update project
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const updates = await req.json();
    const allowedUpdates = ['title', 'description', 'budget', 'skills_required', 'deadline', 'status', 'freelancer_id'];
    
    // Filter to only allowed updates
    const filteredUpdates: any = {};
    Object.keys(updates).forEach(key => {
      if (allowedUpdates.includes(key)) {
        filteredUpdates[key] = updates[key];
      }
    });

    // Check permissions
    const { data: project } = await supabase
      .from('projects')
      .select('client_id, freelancer_id')
      .eq('id', params.id)
      .single();

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const canUpdate = 
      user.role === 'admin' ||
      (user.role === 'client' && project.client_id === user.userId) ||
      (user.role === 'freelancer' && project.freelancer_id === user.userId);

    if (!canUpdate) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Freelancers can only update certain fields
    if (user.role === 'freelancer') {
      const freelancerAllowed = ['status'];
      Object.keys(filteredUpdates).forEach(key => {
        if (!freelancerAllowed.includes(key)) {
          delete filteredUpdates[key];
        }
      });
    }

    const { data: updatedProject, error } = await supabase
      .from('projects')
      .update({
        ...filteredUpdates,
        updated_at: new Date().toISOString()
      })
      .eq('id', params.id)
      .select(`
        *,
        client:users!projects_client_id_fkey(id, email, skills),
        freelancer:users!projects_freelancer_id_fkey(id, email, skills)
      `)
      .single();

    if (error) {
      console.error('Project update error:', error);
      return NextResponse.json({ error: "Failed to update project" }, { status: 500 });
    }

    // Log audit event for important updates
    if (filteredUpdates.status || filteredUpdates.freelancer_id) {
      await supabase
        .from('audit_events')
        .insert({
          event_type: filteredUpdates.freelancer_id ? 'project_assigned' : 'project_status_updated',
          user_id: user.userId,
          project_id: params.id,
          data: filteredUpdates
        });
    }

    return NextResponse.json({ project: updatedProject });

  } catch (error) {
    console.error('Project update API error:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}