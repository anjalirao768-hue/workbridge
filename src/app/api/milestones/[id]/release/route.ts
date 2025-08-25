import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { supabase } from "@/app/lib/supabase";
import { escrowService } from "@/lib/mock-escrow";

// POST /api/milestones/[id]/release - Release milestone payment (clients and admins)
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { amount } = await req.json(); // Optional partial release amount

    // Get milestone with project and escrow info
    const { data: milestone, error: fetchError } = await supabase
      .from('milestones')
      .select(`
        *,
        project:projects(
          client_id, 
          freelancer_id, 
          title,
          freelancer:users!projects_freelancer_id_fkey(id, email)
        ),
        escrows(*)
      `)
      .eq('id', resolvedParams.id)
      .single();

    if (fetchError || !milestone) {
      return NextResponse.json({ error: "Milestone not found" }, { status: 404 });
    }

    // Only clients and admins can release payments
    const canRelease = 
      user.role === 'admin' ||
      (user.role === 'client' && milestone.project.client_id === user.userId);

    if (!canRelease) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Check if milestone can be released
    if (!['submitted', 'approved'].includes(milestone.status)) {
      return NextResponse.json({ 
        error: `Cannot release payment for milestone in status: ${milestone.status}` 
      }, { status: 400 });
    }

    // Check escrow status
    const escrow = milestone.escrows[0];
    if (!escrow || escrow.status !== 'funded') {
      return NextResponse.json({ 
        error: "Escrow must be funded before release" 
      }, { status: 400 });
    }

    // Validate release amount
    const releaseAmount = amount || milestone.amount;
    if (releaseAmount > milestone.amount) {
      return NextResponse.json({ 
        error: "Release amount cannot exceed milestone amount" 
      }, { status: 400 });
    }

    // Release funds through mock escrow service
    const result = await escrowService.releaseToFreelancer(escrow.external_escrow_id, releaseAmount);

    if (!result.success) {
      return NextResponse.json({ error: "Failed to release funds" }, { status: 500 });
    }

    // Update milestone status
    await supabase
      .from('milestones')
      .update({
        status: 'paid',
        approved_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', resolvedParams.id);

    // Log audit event
    await supabase
      .from('audit_events')
      .insert({
        event_type: 'escrow_released',
        user_id: user.userId,
        project_id: milestone.project_id,
        milestone_id: resolvedParams.id,
        escrow_id: escrow.id,
        data: { 
          amount: releaseAmount,
          transaction_id: result.transactionId,
          freelancer_id: milestone.project.freelancer_id
        }
      });

    return NextResponse.json({
      success: true,
      message: "Payment released successfully",
      transaction_id: result.transactionId,
      amount: releaseAmount
    });

  } catch (error) {
    console.error('Milestone release API error:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}