import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { supabase } from "@/app/lib/supabase";

// GET /api/disputes - List disputes (role-based filtering)
export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    let query = supabase
      .from('disputes')
      .select(`
        *,
        milestone:milestones(
          *,
          project:projects(
            *,
            client:users!projects_client_id_fkey(id, email),
            freelancer:users!projects_freelancer_id_fkey(id, email)
          )
        ),
        raised_by_user:users!disputes_raised_by_fkey(id, email),
        resolved_by_user:users!disputes_resolved_by_fkey(id, email)
      `)
      .range(offset, offset + limit - 1)
      .order('created_at', { ascending: false });

    // Apply role-based filtering
    if (user.role === 'client' || user.role === 'freelancer') {
      // Users can only see disputes related to their projects
      query = query.or(`
        milestone.project.client_id.eq.${user.userId},
        milestone.project.freelancer_id.eq.${user.userId}
      `);
    }
    // Admin can see all disputes

    if (status) {
      query = query.eq('status', status);
    }

    const { data: disputes, error } = await query;

    if (error) {
      console.error('Disputes fetch error:', error);
      return NextResponse.json({ error: "Failed to fetch disputes" }, { status: 500 });
    }

    return NextResponse.json({ disputes });

  } catch (error) {
    console.error('Disputes API error:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/disputes - Create new dispute
export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { milestone_id, reason } = await req.json();

    if (!milestone_id || !reason) {
      return NextResponse.json({ error: "Milestone ID and reason are required" }, { status: 400 });
    }

    // Verify milestone exists and user has access
    const { data: milestone, error: milestoneError } = await supabase
      .from('milestones')
      .select(`
        *,
        project:projects(client_id, freelancer_id, title)
      `)
      .eq('id', milestone_id)
      .single();

    if (milestoneError || !milestone) {
      return NextResponse.json({ error: "Milestone not found" }, { status: 404 });
    }

    // Check if user is part of the project
    const hasAccess = 
      milestone.project.client_id === user.userId ||
      milestone.project.freelancer_id === user.userId;

    if (!hasAccess) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Check if dispute already exists for this milestone
    const { data: existingDispute } = await supabase
      .from('disputes')
      .select('id')
      .eq('milestone_id', milestone_id)
      .eq('status', 'open')
      .single();

    if (existingDispute) {
      return NextResponse.json({ error: "An open dispute already exists for this milestone" }, { status: 400 });
    }

    // Check if milestone is in a state that allows disputes
    if (!['submitted', 'approved', 'in_progress'].includes(milestone.status)) {
      return NextResponse.json({ 
        error: `Cannot raise dispute for milestone in status: ${milestone.status}` 
      }, { status: 400 });
    }

    // Create dispute
    const { data: dispute, error } = await supabase
      .from('disputes')
      .insert({
        milestone_id,
        raised_by: user.userId,
        reason,
        status: 'open',
        auto_review_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days from now
      })
      .select(`
        *,
        milestone:milestones(
          *,
          project:projects(
            *,
            client:users!projects_client_id_fkey(id, email),
            freelancer:users!projects_freelancer_id_fkey(id, email)
          )
        ),
        raised_by_user:users!disputes_raised_by_fkey(id, email)
      `)
      .single();

    if (error) {
      console.error('Dispute creation error:', error);
      return NextResponse.json({ error: "Failed to create dispute" }, { status: 500 });
    }

    // Update milestone status to disputed
    await supabase
      .from('milestones')
      .update({
        status: 'disputed',
        updated_at: new Date().toISOString()
      })
      .eq('id', milestone_id);

    // Log audit event
    await supabase
      .from('audit_events')
      .insert({
        event_type: 'dispute_raised',
        user_id: user.userId,
        project_id: milestone.project_id,
        milestone_id,
        dispute_id: dispute.id,
        data: { reason }
      });

    return NextResponse.json({ dispute });

  } catch (error) {
    console.error('Dispute creation API error:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}