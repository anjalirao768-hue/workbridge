import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/app/lib/supabase';
import { verifyToken } from '@/lib/auth';

// Create new conversation or get existing active conversation
export async function POST(request: NextRequest) {
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

    // Check if user already has an active conversation
    const { data: existingConversation, error: existingError } = await supabase
      .from('chat_conversations')
      .select('*')
      .eq('user_id', user.userId)
      .eq('status', 'active')
      .single();

    if (existingConversation) {
      return NextResponse.json({
        success: true,
        data: existingConversation,
        message: 'Existing conversation found',
      });
    }

    // Create new conversation
    const { data: conversation, error } = await supabase
      .from('chat_conversations')
      .insert([
        {
          user_id: user.userId,
          status: 'waiting',
          title: 'Support Request',
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('Error creating conversation:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to create conversation' },
        { status: 500 }
      );
    }

    // Send initial system message
    const { error: messageError } = await supabase
      .from('chat_messages')
      .insert([
        {
          conversation_id: conversation.id,
          sender_id: user.userId,
          message_text: 'Chat started. A support agent will be with you shortly.',
          message_type: 'system',
          is_read: true,
        },
      ]);

    if (messageError) {
      console.error('Error creating initial message:', messageError);
    }

    return NextResponse.json({
      success: true,
      data: conversation,
      message: 'New conversation created',
    });
  } catch (error) {
    console.error('Error in create conversation API:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Get user's conversations (for support agents or conversation history)
export async function GET(request: NextRequest) {
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

    let query = supabase
      .from('chat_conversations')
      .select(`
        *,
        users!chat_conversations_user_id_fkey(id, email, role),
        support_agent:users!chat_conversations_support_agent_id_fkey(id, email)
      `);

    // If support agent, show all conversations
    if (user.role === 'support' || user.role === 'admin') {
      query = query.order('created_at', { ascending: false });
    } else {
      // Regular users see only their conversations
      query = query
        .eq('user_id', user.userId)
        .order('created_at', { ascending: false });
    }

    const { data: conversations, error } = await query;

    if (error) {
      console.error('Error fetching conversations:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch conversations' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: conversations || [],
    });
  } catch (error) {
    console.error('Error in get conversations API:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}