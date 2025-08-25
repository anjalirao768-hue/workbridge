import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { supabase } from "@/app/lib/supabase";
import { escrowService } from "@/lib/mock-escrow";

// POST /api/disputes/[id]/resolve - Resolve dispute (admins only)
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const user = getCurrentUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: "Only admins can resolve disputes" }, { status: 403 });
    }

    const { resolution, admin_notes } = await req.json();

    if (!resolution || !['release_funds', 'refund_client', 'partial_release'].includes(resolution)) {
      return NextResponse.json({ 
        error: "Valid resolution required: release_funds, refund_client, or partial_release" 
      }, { status: 400 });
    }

    // Get dispute with full details
    const { data: dispute, error: fetchError } = await supabase
      .from('disputes')
      .select(`
        *,
        milestone:milestones(
          *,
          project:projects(
            *,
            client:users!projects_client_id_fkey(id, email),
            freelancer:users!projects_freelancer_id_fkey(id, email)
          ),
          escrows(*)
        )
      `)
      .eq('id', resolvedParams.id)
      .single();

    if (fetchError || !dispute) {
      return NextResponse.json({ error: "Dispute not found" }, { status: 404 });
    }

    if (dispute.status !== 'open') {
      return NextResponse.json({ 
        error: `Cannot resolve dispute in status: ${dispute.status}` 
      }, { status: 400 });
    }

    const escrow = dispute.milestone.escrows[0];
    if (!escrow || escrow.status !== 'funded') {
      return NextResponse.json({ 
        error: "No funded escrow found for this dispute" 
      }, { status: 400 });
    }

    let resolvedStatus;
    let milestoneStatus;

    try {
      // Execute resolution based on admin decision
      switch (resolution) {
        case 'release_funds':
          await escrowService.releaseToFreelancer(escrow.external_escrow_id);
          resolvedStatus = 'resolved_release';
          milestoneStatus = 'paid';
          break;
        
        case 'refund_client':
          await escrowService.refundToClient(
            escrow.external_escrow_id, 
            undefined, 
            `Admin dispute resolution: ${admin_notes || 'Dispute resolved in favor of client'}`
          );
          resolvedStatus = 'resolved_refund';
          milestoneStatus = 'cancelled';
          break;
        
        case 'partial_release':
          // For demo, split 50/50. In real app, admin would specify amounts
          const halfAmount = dispute.milestone.amount / 2;
          await escrowService.releaseToFreelancer(escrow.external_escrow_id, halfAmount);
          // The remaining would be refunded (handled by the escrow service)
          resolvedStatus = 'resolved_release';
          milestoneStatus = 'paid';
          break;
        
        default:
          throw new Error('Invalid resolution type');
      }

      // Update dispute
      const { data: updatedDispute, error: updateError } = await supabase
        .from('disputes')
        .update({
          status: resolvedStatus,
          resolution,
          resolved_by: user.userId,
          resolved_at: new Date().toISOString(),
          admin_notes: admin_notes || `Dispute resolved: ${resolution}`
        })
        .eq('id', params.id)
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
        .single();

      if (updateError) {
        console.error('Dispute update error:', updateError);
        return NextResponse.json({ error: "Failed to update dispute" }, { status: 500 });
      }

      // Update milestone status
      await supabase
        .from('milestones')
        .update({
          status: milestoneStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', dispute.milestone_id);

      // Log audit event
      await supabase
        .from('audit_events')
        .insert({
          event_type: 'dispute_resolved',
          user_id: user.userId,
          project_id: dispute.milestone.project_id,
          milestone_id: dispute.milestone_id,
          dispute_id: params.id,
          data: { 
            resolution, 
            admin_notes,
            previous_status: dispute.status 
          }
        });

      return NextResponse.json({ 
        dispute: updatedDispute,
        message: `Dispute resolved: ${resolution}` 
      });

    } catch (escrowError) {
      console.error('Escrow resolution error:', escrowError);
      return NextResponse.json({ 
        error: "Failed to execute resolution in escrow system" 
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Dispute resolution API error:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}