import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    // Parse query parameters
    const keyword = searchParams.get('keyword');
    const period = searchParams.get('period');
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 500);

    const db = getServiceSupabase();
    let query = db.from('signals').select('*');

    // Apply filters
    if (keyword) {
      query = query.ilike('keyword', `%${keyword}%`);
    }

    if (period) {
      query = query.eq('period', period);
    }

    // Sort by period DESC, then by mention_count DESC
    query = query
      .order('period', { ascending: false })
      .order('mention_count', { ascending: false })
      .limit(limit);

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    return NextResponse.json({
      data: data || [],
      total: data?.length || 0,
      limit,
    });
  } catch (error) {
    console.error('Signals error:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to fetch signals',
      },
      { status: 500 }
    );
  }
}
