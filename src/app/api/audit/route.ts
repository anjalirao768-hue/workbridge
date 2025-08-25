import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { supabase } from "@/app/lib/supabase";

// GET /api/audit - List audit events (admins only, or user's own events)
export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const event_type = searchParams.get('event_type');
    const user_id = searchParams.get('user_id');
    const project_id = searchParams.get('project_id');
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');

    let query = supabase
      .from('audit_events')
      .select(`
        *,
        user:users(id, email),
        project:projects(id, title),
        milestone:milestones(id, title),
        escrow:escrows(id, external_escrow_id),
        dispute:disputes(id, reason)
      `)
      .range(offset, offset + limit - 1)
      .order('created_at', { ascending: false });

    // Apply role-based filtering
    if (user.role !== 'admin') {
      // Non-admins can only see events they're involved in
      query = query.eq('user_id', user.userId);
    }

    // Apply filters
    if (event_type) {
      query = query.eq('event_type', event_type);
    }

    if (user_id && user.role === 'admin') {
      query = query.eq('user_id', user_id);
    }

    if (project_id) {
      // Verify access to project
      const { data: project } = await supabase
        .from('projects')
        .select('client_id, freelancer_id')
        .eq('id', project_id)
        .single();

      if (project) {
        const hasAccess = 
          user.role === 'admin' ||
          project.client_id === user.userId ||
          project.freelancer_id === user.userId;

        if (hasAccess) {
          query = query.eq('project_id', project_id);
        } else {
          return NextResponse.json({ error: "Access denied to project audit logs" }, { status: 403 });
        }
      }
    }

    const { data: auditEvents, error } = await query;

    if (error) {
      console.error('Audit events fetch error:', error);
      return NextResponse.json({ error: "Failed to fetch audit events" }, { status: 500 });
    }

    // Get event type summary for admins
    let eventSummary: Record<string, number> | null = null;
    if (user.role === 'admin') {
      const { data: summaryData } = await supabase
        .from('audit_events')
        .select('event_type')
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()); // Last 30 days

      if (summaryData) {
        eventSummary = summaryData.reduce((acc: Record<string, number>, event) => {
          acc[event.event_type] = (acc[event.event_type] || 0) + 1;
          return acc;
        }, {});
      }
    }

    return NextResponse.json({ 
      auditEvents, 
      eventSummary,
      meta: {
        total: auditEvents?.length || 0,
        limit,
        offset
      }
    });

  } catch (error) {
    console.error('Audit API error:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}