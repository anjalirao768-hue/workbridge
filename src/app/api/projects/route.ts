import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser, getCurrentUserWithFreshData } from "@/lib/auth";
import { supabase } from "@/app/lib/supabase";

// GET /api/projects - List projects (role-based filtering)
export async function GET(req: NextRequest) {
  try {
    const user = getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    let query = supabase
      .from('projects')
      .select(`
        *,
        client:users!projects_client_id_fkey(id, email, skills),
        freelancer:users!projects_freelancer_id_fkey(id, email, skills),
        milestones(id, title, amount, status, due_date)
      `)
      .range(offset, offset + limit - 1)
      .order('created_at', { ascending: false });

    // Apply role-based filtering
    if (user.role === 'client') {
      query = query.eq('client_id', user.userId);
    } else if (user.role === 'freelancer') {
      query = query.or(`freelancer_id.eq.${user.userId},freelancer_id.is.null`);
    }
    // Admin can see all projects

    if (status) {
      query = query.eq('status', status);
    }

    const { data: projects, error } = await query;

    if (error) {
      console.error('Projects fetch error:', error);
      return NextResponse.json({ error: "Failed to fetch projects" }, { status: 500 });
    }

    return NextResponse.json({ projects });

  } catch (error) {
    console.error('Projects API error:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/projects - Create new project (clients only)
export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUserWithFreshData();
    if (!user || user.role !== 'client') {
      return NextResponse.json({ error: "Only clients can create projects" }, { status: 403 });
    }

    const { title, description, budget, skills_required, deadline } = await req.json();

    if (!title || !description) {
      return NextResponse.json({ error: "Title and description are required" }, { status: 400 });
    }

    const { data: project, error } = await supabase
      .from('projects')
      .insert({
        client_id: user.userId,
        title,
        description,
        budget,
        status: 'open'
      })
      .select(`
        *,
        client:users!projects_client_id_fkey(id, email, skills)
      `)
      .single();

    if (error) {
      console.error('Project creation error:', error);
      return NextResponse.json({ error: "Failed to create project" }, { status: 500 });
    }

    // Log audit event
    await supabase
      .from('audit_events')
      .insert({
        event_type: 'project_created',
        user_id: user.userId,
        project_id: project.id,
        data: { title, budget }
      });

    return NextResponse.json({ project });

  } catch (error) {
    console.error('Project creation API error:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}