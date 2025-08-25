import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { supabase } from "@/app/lib/supabase";

// GET /api/transactions - List transactions (role-based filtering)
export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type');
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    let query = supabase
      .from('transactions')
      .select(`
        *,
        user:users(id, email),
        project:projects(id, title),
        milestone:milestones(id, title),
        escrow:escrows(id, external_escrow_id)
      `)
      .range(offset, offset + limit - 1)
      .order('created_at', { ascending: false });

    // Apply role-based filtering
    if (user.role === 'client' || user.role === 'freelancer') {
      // Users can only see their own transactions
      query = query.eq('user_id', user.userId);
    }
    // Admin can see all transactions

    if (type) {
      query = query.eq('type', type);
    }

    if (status) {
      query = query.eq('status', status);
    }

    const { data: transactions, error } = await query;

    if (error) {
      console.error('Transactions fetch error:', error);
      return NextResponse.json({ error: "Failed to fetch transactions" }, { status: 500 });
    }

    // Calculate summary stats for the user
    let summary = null;
    if (user.role !== 'admin') {
      const { data: userTransactions } = await supabase
        .from('transactions')
        .select('type, amount, status')
        .eq('user_id', user.userId)
        .eq('status', 'completed');

      if (userTransactions) {
        summary = {
          total_earned: userTransactions
            .filter(t => t.type === 'escrow_release')
            .reduce((sum, t) => sum + t.amount, 0),
          total_paid: userTransactions
            .filter(t => t.type === 'escrow_fund')
            .reduce((sum, t) => sum + t.amount, 0),
          total_refunded: userTransactions
            .filter(t => t.type === 'escrow_refund')
            .reduce((sum, t) => sum + t.amount, 0)
        };
      }
    }

    return NextResponse.json({ transactions, summary });

  } catch (error) {
    console.error('Transactions API error:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}