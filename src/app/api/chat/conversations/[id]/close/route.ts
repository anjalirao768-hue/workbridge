import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/app/lib/supabase';
import { verifyToken } from '@/lib/auth';

// Close a chat conversation
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = request.cookies.get('auth-token')?.value;
    
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const user = await verifyToken(token);
    if (!user || !['support', 'admin'].includes(user.role)) {
      return NextResponse.json(
        { success: false, error: 'Access denied. Support agents only.' },
        { status: 403 }
      );
    }

    const conversationId = params.id;
    const body = await request.json().catch(() => ({}));
    const { closure_note } = body;

    // First, get the conversation to verify it exists and agent assignment
    const { data: conversation, error: fetchError } = await supabase
      .from('chat_conversations')
      .select('*')
      .eq('id', conversationId)
      .single();

    if (fetchError || !conversation) {
      return NextResponse.json(
        { success: false, error: 'Conversation not found' },
        { status: 404 }
      );
    }

    // Check if conversation is already closed
    if (conversation.status === 'closed') {
      return NextResponse.json(
        { success: false, error: 'Conversation is already closed' },
        { status: 400 }
      );
    }

    // Only the assigned agent or any admin can close the conversation
    if (user.role === 'support' && conversation.support_agent_id !== user.userId) {
      return NextResponse.json(
        { success: false, error: 'Only the assigned support agent can close this conversation' },
        { status: 403 }
      );
    }

    // Update conversation to closed status
    const { data: updatedConversation, error: updateError } = await supabase
      .from('chat_conversations')
      .update({
        status: 'closed',
        closed_by: user.userId,
        closure_note: closure_note || null,
        // closed_at and resolution_time_minutes will be set by the trigger
      })
      .eq('id', conversationId)
      .select(`
        *,
        users!chat_conversations_user_id_fkey(id, email, role),
        closed_by_user:users!chat_conversations_closed_by_fkey(id, email)
      `)
      .single();

    if (updateError) {
      console.error('Error closing conversation:', updateError);
      return NextResponse.json(
        { success: false, error: 'Failed to close conversation' },
        { status: 500 }
      );
    }

    // Add a system message about the closure
    const closureMessage = closure_note 
      ? `Chat closed by support agent. Reason: ${closure_note}`
      : 'Chat closed by support agent.';

    const { error: messageError } = await supabase
      .from('chat_messages')
      .insert([
        {
          conversation_id: conversationId,
          sender_id: user.userId,
          message_text: closureMessage,
          message_type: 'system',
          is_read: true,
        },
      ]);

    if (messageError) {
      console.error('Error creating closure message:', messageError);
    }

    // Create notification for the user (optional)
    const { error: notificationError } = await supabase
      .from('chat_notifications')
      .insert([
        {
          user_id: conversation.user_id,
          conversation_id: conversationId,
          notification_type: 'chat_closed',
          message: `Your support chat has been closed. ${closure_note ? `Reason: ${closure_note}` : ''}`.trim(),
        },
      ]);

    if (notificationError) {
      console.error('Error creating notification:', notificationError);
    }

    return NextResponse.json({
      success: true,
      message: 'Conversation closed successfully',
      data: {
        id: updatedConversation.id,
        status: updatedConversation.status,
        closed_at: updatedConversation.closed_at,
        closed_by: updatedConversation.closed_by,
        closure_note: updatedConversation.closure_note,
        resolution_time_minutes: updatedConversation.resolution_time_minutes,
      },
    });
  } catch (error) {
    console.error('Error in close conversation API:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Reopen a closed conversation (admin only)
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const token = request.cookies.get('auth-token')?.value;
    
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const user = await verifyToken(token);
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Access denied. Admin access required.' },
        { status: 403 }
      );
    }

    const { id: conversationId } = await context.params;

    // Reopen the conversation
    const { data: updatedConversation, error: updateError } = await supabase
      .from('chat_conversations')
      .update({
        status: 'active',
        closed_by: null,
        closed_at: null,
        closure_note: null,
        resolution_time_minutes: null,
      })
      .eq('id', conversationId)
      .eq('status', 'closed')
      .select()
      .single();

    if (updateError || !updatedConversation) {
      return NextResponse.json(
        { success: false, error: 'Failed to reopen conversation or conversation not found' },
        { status: 400 }
      );
    }

    // Add system message about reopening
    const { error: messageError } = await supabase
      .from('chat_messages')
      .insert([
        {
          conversation_id: conversationId,
          sender_id: user.userId,
          message_text: 'Chat reopened by admin.',
          message_type: 'system',
          is_read: true,
        },
      ]);

    if (messageError) {
      console.error('Error creating reopen message:', messageError);
    }

    return NextResponse.json({
      success: true,
      message: 'Conversation reopened successfully',
      data: updatedConversation,
    });
  } catch (error) {
    console.error('Error in reopen conversation API:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}