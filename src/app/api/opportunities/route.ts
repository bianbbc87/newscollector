import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';
import { OpportunityType, OpportunityStatus } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    // Parse query parameters
    const type = searchParams.get('type') as OpportunityType | null;
    const status = searchParams.get('status') as OpportunityStatus | null;
    const tagsStr = searchParams.get('tags');
    const tags = tagsStr ? tagsStr.split(',') : [];
    const search = searchParams.get('search');
    const sort = searchParams.get('sort') || 'relevance_score';
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 500);
    const offset = parseInt(searchParams.get('offset') || '0');

    const db = getServiceSupabase();
    let query = db.from('opportunities').select('*', { count: 'exact' });

    // Apply filters
    if (type) {
      query = query.eq('type', type);
    }

    if (status) {
      query = query.eq('status', status);
    }

    if (tags.length > 0) {
      // Filter by tags array overlap
      query = query.overlaps('tags', tags);
    }

    if (search) {
      // Search in title, organization, or description
      query = query.or(
        `title.ilike.%${search}%,organization.ilike.%${search}%,description.ilike.%${search}%`
      );
    }

    // Sort: default by relevance_score DESC, then created_at DESC
    if (sort === 'relevance_score' || sort === 'relevance') {
      query = query.order('relevance_score', { ascending: false });
      query = query.order('created_at', { ascending: false });
    } else if (sort === 'deadline') {
      query = query.order('deadline', { ascending: true, nullsFirst: false });
    } else if (sort === 'newest') {
      query = query.order('created_at', { ascending: false });
    }

    // Pagination
    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      throw error;
    }

    return NextResponse.json({
      data: data || [],
      total: count || 0,
      limit,
      offset,
      hasMore: count ? offset + limit < count : false,
    });
  } catch (error) {
    console.error('Opportunities error:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to fetch opportunities',
      },
      { status: 500 }
    );
  }
}
