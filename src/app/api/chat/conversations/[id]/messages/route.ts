import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/app/lib/supabase';
import { verifyToken } from '@/lib/auth';

// Send message to conversation
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
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
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Invalid token' },
        { status: 401 }
      );
    }

    const { id: conversationId } = await params;
    const { message, messageType = 'text' } = await request.json();

    if (!message || !message.trim()) {
      return NextResponse.json(
        { success: false, error: 'Message text is required' },
        { status: 400 }
      );
    }

    // Verify user has access to this conversation
    const { data: conversation, error: convError } = await supabase
      .from('chat_conversations')
      .select('*')
      .eq('id', conversationId)
      .single();

    if (convError || !conversation) {
      return NextResponse.json(
        { success: false, error: 'Conversation not found' },
        { status: 404 }
      );
    }

    // Check if user has permission to send messages
    const canSendMessage = 
      conversation.user_id === user.userId || // Original user
      conversation.support_agent_id === user.userId || // Assigned agent
      user.role === 'support' || // Any support agent
      user.role === 'admin'; // Admin

    if (!canSendMessage) {
      return NextResponse.json(
        { success: false, error: 'Permission denied' },
        { status: 403 }
      );
    }

    // If support agent is sending first message, assign them to conversation
    if (user.role === 'support' && !conversation.support_agent_id) {
      await supabase
        .from('chat_conversations')
        .update({ 
          support_agent_id: user.userId,
          status: 'active' 
        })
        .eq('id', conversationId);
    }

    // Create message
    const { data: newMessage, error: messageError } = await supabase
      .from('chat_messages')
      .insert([
        {
          conversation_id: conversationId,
          sender_id: user.userId,
          message_text: message.trim(),
          message_type: messageType,
        },
      ])
      .select(`
        *,
        sender:users!chat_messages_sender_id_fkey(id, email, role)
      `)
      .single();

    if (messageError) {
      console.error('Error creating message:', messageError);
      return NextResponse.json(
        { success: false, error: 'Failed to send message' },
        { status: 500 }
      );
    }

    // Update conversation updated_at
    await supabase
      .from('chat_conversations')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', conversationId);

    return NextResponse.json({
      success: true,
      data: newMessage,
      message: 'Message sent successfully',
    });
  } catch (error) {
    console.error('Error in send message API:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Get messages for conversation
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
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
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Invalid token' },
        { status: 401 }
      );
    }

    const { id: conversationId } = await params;

    // Verify user has access to this conversation
    const { data: conversation, error: convError } = await supabase
      .from('chat_conversations')
      .select('*')
      .eq('id', conversationId)
      .single();

    if (convError || !conversation) {
      return NextResponse.json(
        { success: false, error: 'Conversation not found' },
        { status: 404 }
      );
    }

    const canViewMessages = 
      conversation.user_id === user.userId || 
      conversation.support_agent_id === user.userId ||
      user.role === 'support' || 
      user.role === 'admin';

    if (!canViewMessages) {
      return NextResponse.json(
        { success: false, error: 'Permission denied' },
        { status: 403 }
      );
    }

    // Get messages
    const { data: messages, error } = await supabase
      .from('chat_messages')
      .select(`
        *,
        sender:users!chat_messages_sender_id_fkey(id, email, role)
      `)
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching messages:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch messages' },
        { status: 500 }
      );
    }

    // Mark messages as read for the current user
    await supabase
      .from('chat_messages')
      .update({ is_read: true })
      .eq('conversation_id', conversationId)
      .neq('sender_id', user.userId);

    return NextResponse.json({
      success: true,
      data: {
        conversation,
        messages: messages || [],
      },
    });
  } catch (error) {
    console.error('Error in get messages API:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}