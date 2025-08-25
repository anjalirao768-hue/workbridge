import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/app/lib/supabase";

interface WebhookData {
  escrowId: string;
  amount?: number;
  metadata?: Record<string, unknown>;
  fundedAt?: string;
  reason?: string;
  transactionId?: string;
  freelancerAmount?: number;
  platformFee?: number;
  releasedAt?: string;
  refundId?: string;
  refundedAt?: string;
}

// Webhook handler for mock escrow provider events
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { event, data, timestamp, signature } = body;

    // Verify webhook signature (in production, verify against actual secret)
    const webhookSignature = req.headers.get('x-webhook-signature');
    if (!webhookSignature || webhookSignature !== signature) {
      console.warn('Invalid webhook signature');
      // In production, we'd reject this, but for demo we'll continue
    }

    console.log(`📨 Webhook received: ${event}`, data);

    // Make this operation idempotent by checking if event was already processed
    const eventId = `${event}_${data.escrowId}_${timestamp}`;
    
    const { data: existingEvent } = await supabase
      .from('audit_events')
      .select('id')
      .eq('event_type', event)
      .eq('data->>escrowId', data.escrowId)
      .single();

    if (existingEvent) {
      console.log('Event already processed:', eventId);
      return NextResponse.json({ status: 'already_processed' });
    }

    // Process different event types
    switch (event) {
      case 'escrow.created':
        await handleEscrowCreated(data);
        break;
      
      case 'payin.success':
        await handlePayinSuccess(data);
        break;
      
      case 'payin.failed':
        await handlePayinFailed(data);
        break;
      
      case 'payout.success':
        await handlePayoutSuccess(data);
        break;
      
      case 'refund.success':
        await handleRefundSuccess(data);
        break;
      
      default:
        console.warn('Unknown webhook event:', event);
    }

    // Log audit event
    await supabase
      .from('audit_events')
      .insert({
        event_type: event,
        data: data,
        created_at: new Date().toISOString()
      });

    return NextResponse.json({ status: 'processed' });

  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

async function handleEscrowCreated(data: WebhookData) {
  const { escrowId } = data;
  
  // Update escrow record
  const { error } = await supabase
    .from('escrows')
    .update({
      external_escrow_id: escrowId,
      status: 'created',
      updated_at: new Date().toISOString()
    })
    .eq('external_escrow_id', escrowId);

  if (error) {
    console.error('Failed to update escrow:', error);
  }
}

async function handlePayinSuccess(data: WebhookData) {
  const { escrowId, amount, fundedAt } = data;
  
  // Update escrow status to funded
  const { error: escrowError } = await supabase
    .from('escrows')
    .update({
      status: 'funded',
      funded_at: fundedAt,
      updated_at: new Date().toISOString()
    })
    .eq('external_escrow_id', escrowId);

  if (escrowError) {
    console.error('Failed to update escrow:', escrowError);
    return;
  }

  // Create transaction record
  const { data: escrow } = await supabase
    .from('escrows')
    .select(`
      id,
      milestone_id,
      milestones!inner (
        project_id,
        projects!inner (
          client_id
        )
      )
    `)
    .eq('external_escrow_id', escrowId)
    .single();

  if (escrow && amount && escrow.milestones && Array.isArray(escrow.milestones) && escrow.milestones.length > 0) {
    const milestone = escrow.milestones[0];
    if (milestone.projects && Array.isArray(milestone.projects) && milestone.projects.length > 0) {
      const project = milestone.projects[0];
      
      await supabase
        .from('transactions')
        .insert({
          user_id: project.client_id,
          project_id: milestone.project_id,
          milestone_id: escrow.milestone_id,
          escrow_id: escrow.id,
          type: 'escrow_fund',
          amount,
          description: `Escrow funded for milestone`,
          status: 'completed',
          external_transaction_id: escrowId
        });
    }
  }
}

async function handlePayinFailed(data: WebhookData) {
  const { escrowId } = data;
  
  await supabase
    .from('escrows')
    .update({
      status: 'failed',
      updated_at: new Date().toISOString()
    })
    .eq('external_escrow_id', escrowId);

  // Update milestone status
  const { data: escrow } = await supabase
    .from('escrows')
    .select('milestone_id')
    .eq('external_escrow_id', escrowId)
    .single();

  if (escrow) {
    await supabase
      .from('milestones')
      .update({
        status: 'pending',
        updated_at: new Date().toISOString()
      })
      .eq('id', escrow.milestone_id);
  }
}

async function handlePayoutSuccess(data: WebhookData) {
  const { escrowId, transactionId, freelancerAmount, platformFee, releasedAt } = data;
  
  // Update escrow status
  const { error: escrowError } = await supabase
    .from('escrows')
    .update({
      status: 'released',
      released_at: releasedAt,
      updated_at: new Date().toISOString()
    })
    .eq('external_escrow_id', escrowId);

  if (escrowError) {
    console.error('Failed to update escrow:', escrowError);
    return;
  }

  // Get escrow details
  const { data: escrow } = await supabase
    .from('escrows')
    .select(`
      id,
      milestone_id,
      milestones (
        project_id,
        projects (
          client_id,
          freelancer_id
        )
      )
    `)
    .eq('external_escrow_id', escrowId)
    .single();

  if (escrow && freelancerAmount && transactionId) {
    // Create transaction for freelancer payment
    await supabase
      .from('transactions')
      .insert({
        user_id: escrow.milestones.projects.freelancer_id,
        project_id: escrow.milestones.project_id,
        milestone_id: escrow.milestone_id,
        escrow_id: escrow.id,
        type: 'escrow_release',
        amount: freelancerAmount,
        description: `Payment released to freelancer (Platform fee: $${platformFee})`,
        status: 'completed',
        external_transaction_id: transactionId
      });

    // Update milestone status
    await supabase
      .from('milestones')
      .update({
        status: 'paid',
        updated_at: new Date().toISOString()
      })
      .eq('id', escrow.milestone_id);
  }
}

async function handleRefundSuccess(data: WebhookData) {
  const { escrowId, refundId, amount, refundedAt } = data;
  
  // Update escrow status
  const { error: escrowError } = await supabase
    .from('escrows')
    .update({
      status: 'refunded',
      refunded_at: refundedAt,
      updated_at: new Date().toISOString()
    })
    .eq('external_escrow_id', escrowId);

  if (escrowError) {
    console.error('Failed to update escrow:', escrowError);
    return;
  }

  // Get escrow details
  const { data: escrow } = await supabase
    .from('escrows')
    .select(`
      id,
      milestone_id,
      milestones (
        project_id,
        projects (
          client_id
        )
      )
    `)
    .eq('external_escrow_id', escrowId)
    .single();

  if (escrow && amount && refundId) {
    // Create refund transaction
    await supabase
      .from('transactions')
      .insert({
        user_id: escrow.milestones.projects.client_id,
        project_id: escrow.milestones.project_id,
        milestone_id: escrow.milestone_id,
        escrow_id: escrow.id,
        type: 'escrow_refund',
        amount,
        description: `Escrow refunded: Refund requested`,
        status: 'completed',
        external_transaction_id: refundId
      });

    // Update milestone status
    await supabase
      .from('milestones')
      .update({
        status: 'cancelled',
        updated_at: new Date().toISOString()
      })
      .eq('id', escrow.milestone_id);
  }
}