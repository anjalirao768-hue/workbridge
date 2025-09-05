import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { verifyToken } from '@/lib/auth';

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

    const { projectId, reason, description, amount } = await request.json();

    if (!projectId || !reason || !amount) {
      return NextResponse.json(
        { success: false, error: 'Project ID, reason, and amount are required' },
        { status: 400 }
      );
    }

    const validReasons = [
      'Work not delivered',
      'Quality issues', 
      'Project cancelled',
      'No longer required',
      'Freelancer not responding'
    ];

    if (!validReasons.includes(reason)) {
      return NextResponse.json(
        { success: false, error: 'Invalid refund reason' },
        { status: 400 }
      );
    }

    // Create refund request
    const { data: refundRequest, error } = await supabase
      .from('refund_requests')
      .insert([
        {
          user_id: user.userId,
          project_id: projectId,
          reason,
          description: description || '',
          amount: parseFloat(amount),
          status: 'pending',
          created_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('Error creating refund request:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to create refund request' },
        { status: 500 }
      );
    }

    // Send confirmation email (optional)
    // TODO: Implement email notification to user and admin

    return NextResponse.json({
      success: true,
      message: 'Refund request submitted successfully',
      data: refundRequest,
    });
  } catch (error) {
    console.error('Error in refund request API:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

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

    // Get user's refund requests
    const { data: refundRequests, error } = await supabase
      .from('refund_requests')
      .select('*')
      .eq('user_id', user.userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching refund requests:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch refund requests' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: refundRequests || [],
    });
  } catch (error) {
    console.error('Error in get refund requests API:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}