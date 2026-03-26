import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId');
    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    const db = getServiceSupabase();
    const { data, error } = await db
      .from('portfolios')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    if (!data) {
      return NextResponse.json({ empty: true });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Portfolio fetch error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch portfolio' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, ...portfolioData } = body;

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    const db = getServiceSupabase();

    // Check if portfolio exists
    const { data: existing } = await db
      .from('portfolios')
      .select('id')
      .eq('user_id', userId)
      .single();

    const payload = {
      user_id: userId,
      name: portfolioData.name || '',
      title: portfolioData.title || '',
      location: portfolioData.location || '',
      bio: portfolioData.bio || '',
      profile_image: portfolioData.profile_image || null,
      github: portfolioData.github || '',
      linkedin: portfolioData.linkedin || '',
      blog: portfolioData.blog || '',
      email: portfolioData.email || '',
      experiences: portfolioData.experiences || [],
      projects: portfolioData.projects || [],
      skills: portfolioData.skills || [],
      certifications: portfolioData.certifications || [],
      education: portfolioData.education || [],
      updated_at: new Date().toISOString(),
    };

    let result;
    if (existing) {
      result = await db
        .from('portfolios')
        .update(payload)
        .eq('user_id', userId)
        .select();
    } else {
      result = await db
        .from('portfolios')
        .insert([payload])
        .select();
    }

    const { data, error } = result;
    if (error) throw error;

    return NextResponse.json({ success: true, portfolio: data?.[0] });
  } catch (error) {
    console.error('Portfolio save error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to save portfolio' },
      { status: 500 }
    );
  }
}
