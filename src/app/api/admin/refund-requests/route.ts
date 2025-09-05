import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/app/lib/supabase';
import { verifyToken } from '@/lib/auth';

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
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      );
    }

    // Get all refund requests with user and project details
    const { data: refundRequests, error } = await supabase
      .from('refund_requests')
      .select(`
        *,
        users!refund_requests_user_id_fkey(email, role)
      `)
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
    console.error('Error in admin refund requests API:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}