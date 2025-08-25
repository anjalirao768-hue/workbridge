import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { supabase } from "@/app/lib/supabase";
import { escrowService } from "@/lib/mock-escrow";

// POST /api/milestones/[id]/fund - Fund milestone escrow (clients only)
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const user = getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Get milestone with project and escrow info
    const { data: milestone, error: fetchError } = await supabase
      .from('milestones')
      .select(`
        *,
        project:projects(client_id, freelancer_id, title),
        escrows(*)
      `)
      .eq('id', resolvedParams.id)
      .single();

    if (fetchError || !milestone) {
      return NextResponse.json({ error: "Milestone not found" }, { status: 404 });
    }

    // Only clients can fund their own project milestones
    if (user.role !== 'admin' && milestone.project.client_id !== user.userId) {
      return NextResponse.json({ error: "Only project client can fund milestones" }, { status: 403 });
    }

    // Check if milestone can be funded
    if (milestone.status !== 'pending') {
      return NextResponse.json({ 
        error: `Cannot fund milestone in status: ${milestone.status}` 
      }, { status: 400 });
    }

    // Check if escrow exists and is in correct state
    const escrow = milestone.escrows[0];
    if (!escrow) {
      return NextResponse.json({ error: "No escrow found for this milestone" }, { status: 400 });
    }

    if (escrow.status !== 'created') {
      return NextResponse.json({ 
        error: `Escrow is in status: ${escrow.status}, cannot fund` 
      }, { status: 400 });
    }

    // Initiate payment through mock escrow service
    const result = await escrowService.fundEscrow(escrow.external_escrow_id);

    if (!result.success) {
      return NextResponse.json({ error: "Failed to initiate escrow funding" }, { status: 500 });
    }

    // Update milestone status to in_progress (funding initiated)
    await supabase
      .from('milestones')
      .update({
        status: 'in_progress',
        updated_at: new Date().toISOString()
      })
      .eq('id', resolvedParams.id);

    // Log audit event
    await supabase
      .from('audit_events')
      .insert({
        event_type: 'escrow_funding_initiated',
        user_id: user.userId,
        project_id: milestone.project_id,
        milestone_id: resolvedParams.id,
        escrow_id: escrow.id,
        data: { 
          amount: milestone.amount,
          escrow_id: escrow.external_escrow_id,
          payment_url: result.paymentUrl
        }
      });

    return NextResponse.json({
      success: true,
      message: "Escrow funding initiated",
      payment_url: result.paymentUrl,
      escrow_id: escrow.external_escrow_id
    });

  } catch (error) {
    console.error('Milestone funding API error:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}