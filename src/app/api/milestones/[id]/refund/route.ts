import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { supabase } from "@/app/lib/supabase";
import { escrowService } from "@/lib/mock-escrow";

// POST /api/milestones/[id]/refund - Refund milestone payment (admins only or specific conditions)
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const user = getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { amount, reason } = await req.json();

    // Get milestone with project and escrow info
    const { data: milestone, error: fetchError } = await supabase
      .from('milestones')
      .select(`
        *,
        project:projects(
          client_id, 
          freelancer_id, 
          title,
          client:users!projects_client_id_fkey(id, email)
        ),
        escrows(*),
        disputes(*)
      `)
      .eq('id', resolvedParams.id)
      .single();

    if (fetchError || !milestone) {
      return NextResponse.json({ error: "Milestone not found" }, { status: 404 });
    }

    // Check refund permissions
    let canRefund = false;
    let refundReason = reason || "Refund requested";

    if (user.role === 'admin') {
      canRefund = true;
      refundReason = reason || "Admin-initiated refund";
    } else if (user.role === 'client' && milestone.project.client_id === user.userId) {
      // Clients can request refunds in specific conditions
      if (milestone.status === 'disputed' || milestone.disputes.length > 0) {
        canRefund = true;
        refundReason = reason || "Dispute resolution - refund";
      }
    }

    if (!canRefund) {
      return NextResponse.json({ 
        error: "Only admins can initiate refunds, or clients during dispute resolution" 
      }, { status: 403 });
    }

    // Check escrow status
    const escrow = milestone.escrows[0];
    if (!escrow || escrow.status !== 'funded') {
      return NextResponse.json({ 
        error: "No funded escrow found for refund" 
      }, { status: 400 });
    }

    // Validate refund amount
    const refundAmount = amount || milestone.amount;
    if (refundAmount > milestone.amount) {
      return NextResponse.json({ 
        error: "Refund amount cannot exceed milestone amount" 
      }, { status: 400 });
    }

    // Process refund through mock escrow service
    const result = await escrowService.refundToClient(escrow.external_escrow_id, refundAmount, refundReason);

    if (!result.success) {
      return NextResponse.json({ error: "Failed to process refund" }, { status: 500 });
    }

    // Update milestone status
    await supabase
      .from('milestones')
      .update({
        status: 'cancelled',
        updated_at: new Date().toISOString()
      })
      .eq('id', resolvedParams.id);

    // If there was an active dispute, resolve it
    if (milestone.disputes.length > 0) {
      await supabase
        .from('disputes')
        .update({
          status: 'resolved_refund',
          resolution: 'refund_client',
          resolved_by: user.userId,
          resolved_at: new Date().toISOString(),
          admin_notes: `Refund processed: ${refundReason}`
        })
        .eq('milestone_id', resolvedParams.id)
        .eq('status', 'open');
    }

    // Log audit event
    await supabase
      .from('audit_events')
      .insert({
        event_type: 'escrow_refunded',
        user_id: user.userId,
        project_id: milestone.project_id,
        milestone_id: resolvedParams.id,
        escrow_id: escrow.id,
        data: { 
          amount: refundAmount,
          reason: refundReason,
          refund_id: result.refundId,
          client_id: milestone.project.client_id
        }
      });

    return NextResponse.json({
      success: true,
      message: "Refund processed successfully",
      refund_id: result.refundId,
      amount: refundAmount,
      reason: refundReason
    });

  } catch (error) {
    console.error('Milestone refund API error:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}