import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { supabase } from "@/app/lib/supabase";

// GET /api/milestones/[id] - Get milestone details
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { data: milestone, error } = await supabase
      .from('milestones')
      .select(`
        *,
        project:projects(
          *,
          client:users!projects_client_id_fkey(id, email),
          freelancer:users!projects_freelancer_id_fkey(id, email)
        ),
        escrows(*)
      `)
      .eq('id', params.id)
      .single();

    if (error) {
      console.error('Milestone fetch error:', error);
      return NextResponse.json({ error: "Milestone not found" }, { status: 404 });
    }

    // Check access permissions
    const hasAccess = 
      user.role === 'admin' ||
      milestone.project.client_id === user.userId ||
      milestone.project.freelancer_id === user.userId;

    if (!hasAccess) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    return NextResponse.json({ milestone });

  } catch (error) {
    console.error('Milestone details API error:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PUT /api/milestones/[id] - Update milestone
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const updates = await req.json();
    const allowedUpdates = ['title', 'description', 'amount', 'due_date', 'status', 'submitted_at', 'approved_at'];
    
    // Get milestone with project info
    const { data: milestone } = await supabase
      .from('milestones')
      .select(`
        *,
        project:projects(client_id, freelancer_id)
      `)
      .eq('id', params.id)
      .single();

    if (!milestone) {
      return NextResponse.json({ error: "Milestone not found" }, { status: 404 });
    }

    // Check permissions based on role and action
    const canUpdate = 
      user.role === 'admin' ||
      (user.role === 'client' && milestone.project.client_id === user.userId) ||
      (user.role === 'freelancer' && milestone.project.freelancer_id === user.userId);

    if (!canUpdate) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Filter updates based on role
    const filteredUpdates: any = {};
    
    if (user.role === 'client') {
      // Clients can approve/reject milestones and update basic info
      const clientAllowed = ['title', 'description', 'amount', 'due_date', 'status', 'approved_at'];
      Object.keys(updates).forEach(key => {
        if (clientAllowed.includes(key)) {
          filteredUpdates[key] = updates[key];
        }
      });
      
      // Auto-set approved_at when status changes to approved
      if (updates.status === 'approved') {
        filteredUpdates.approved_at = new Date().toISOString();
      }
    } else if (user.role === 'freelancer') {
      // Freelancers can update status and submit work
      const freelancerAllowed = ['status', 'submitted_at'];
      Object.keys(updates).forEach(key => {
        if (freelancerAllowed.includes(key)) {
          filteredUpdates[key] = updates[key];
        }
      });
      
      // Auto-set submitted_at when status changes to submitted
      if (updates.status === 'submitted') {
        filteredUpdates.submitted_at = new Date().toISOString();
      }
    } else if (user.role === 'admin') {
      // Admins can update anything
      Object.keys(updates).forEach(key => {
        if (allowedUpdates.includes(key)) {
          filteredUpdates[key] = updates[key];
        }
      });
    }

    const { data: updatedMilestone, error } = await supabase
      .from('milestones')
      .update({
        ...filteredUpdates,
        updated_at: new Date().toISOString()
      })
      .eq('id', params.id)
      .select(`
        *,
        project:projects(
          *,
          client:users!projects_client_id_fkey(id, email),
          freelancer:users!projects_freelancer_id_fkey(id, email)
        ),
        escrows(*)
      `)
      .single();

    if (error) {
      console.error('Milestone update error:', error);
      return NextResponse.json({ error: "Failed to update milestone" }, { status: 500 });
    }

    // Log audit event for status changes
    if (filteredUpdates.status) {
      await supabase
        .from('audit_events')
        .insert({
          event_type: `milestone_${filteredUpdates.status}`,
          user_id: user.userId,
          project_id: milestone.project_id,
          milestone_id: params.id,
          data: { status: filteredUpdates.status, previous_status: milestone.status }
        });
    }

    return NextResponse.json({ milestone: updatedMilestone });

  } catch (error) {
    console.error('Milestone update API error:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}