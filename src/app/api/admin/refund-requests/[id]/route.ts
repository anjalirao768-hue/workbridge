import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/app/lib/supabase';
import { verifyToken } from '@/lib/auth';

export async function PATCH(
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
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      );
    }

    const { status, adminNotes } = await request.json();
    const { id: refundId } = await params;

    if (!['approved', 'rejected'].includes(status)) {
      return NextResponse.json(
        { success: false, error: 'Status must be either approved or rejected' },
        { status: 400 }
      );
    }

    // Update refund request status
    const { data: updatedRequest, error } = await supabase
      .from('refund_requests')
      .update({
        status,
        admin_notes: adminNotes || '',
        processed_by: user.userId,
        processed_at: new Date().toISOString(),
      })
      .eq('id', refundId)
      .select()
      .single();

    if (error) {
      console.error('Error updating refund request:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to update refund request' },
        { status: 500 }
      );
    }

    // TODO: Implement actual refund processing with payment gateway
    // TODO: Send notification email to user about refund status

    return NextResponse.json({
      success: true,
      message: `Refund request ${status} successfully`,
      data: updatedRequest,
    });
  } catch (error) {
    console.error('Error in update refund request API:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}