import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { supabase } from "@/app/lib/supabase";
import { escrowService } from "@/lib/mock-escrow";

// GET /api/projects/[id]/milestones - List project milestones
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Verify project access
    const { data: project } = await supabase
      .from('projects')
      .select('client_id, freelancer_id')
      .eq('id', params.id)
      .single();

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const hasAccess = 
      user.role === 'admin' ||
      project.client_id === user.userId ||
      project.freelancer_id === user.userId;

    if (!hasAccess) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const { data: milestones, error } = await supabase
      .from('milestones')
      .select(`
        *,
        escrows(*)
      `)
      .eq('project_id', params.id)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Milestones fetch error:', error);
      return NextResponse.json({ error: "Failed to fetch milestones" }, { status: 500 });
    }

    return NextResponse.json({ milestones });

  } catch (error) {
    console.error('Milestones API error:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/projects/[id]/milestones - Create milestone (clients only)
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { title, description, amount, due_date } = await req.json();

    if (!title || !amount || amount <= 0) {
      return NextResponse.json({ error: "Title and valid amount are required" }, { status: 400 });
    }

    // Verify project access and that user is client
    const { data: project } = await supabase
      .from('projects')
      .select('client_id')
      .eq('id', params.id)
      .single();

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    if (user.role !== 'admin' && project.client_id !== user.userId) {
      return NextResponse.json({ error: "Only project client can create milestones" }, { status: 403 });
    }

    // Create milestone
    const { data: milestone, error: milestoneError } = await supabase
      .from('milestones')
      .insert({
        project_id: params.id,
        title,
        description,
        amount,
        due_date,
        status: 'pending'
      })
      .select()
      .single();

    if (milestoneError) {
      console.error('Milestone creation error:', milestoneError);
      return NextResponse.json({ error: "Failed to create milestone" }, { status: 500 });
    }

    // Create corresponding escrow
    try {
      const { escrowId } = await escrowService.createEscrow(amount, milestone.id, params.id);
      
      const { error: escrowError } = await supabase
        .from('escrows')
        .insert({
          milestone_id: milestone.id,
          amount,
          status: 'created',
          external_escrow_id: escrowId
        });

      if (escrowError) {
        console.error('Escrow creation error:', escrowError);
      }
    } catch (escrowError) {
      console.error('Escrow service error:', escrowError);
    }

    // Log audit event
    await supabase
      .from('audit_events')
      .insert({
        event_type: 'milestone_created',
        user_id: user.userId,
        project_id: params.id,
        milestone_id: milestone.id,
        data: { title, amount }
      });

    return NextResponse.json({ milestone });

  } catch (error) {
    console.error('Milestone creation API error:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}