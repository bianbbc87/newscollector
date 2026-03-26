import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';
import { Priority } from '@/types';

interface BookmarkPayload {
  opportunity_id?: string;
  deep_link_id?: string;
  signal_id?: string;
  collection: string;
  priority?: Priority;
  memo?: string;
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const collection = searchParams.get('collection');

    const db = getServiceSupabase();
    let query = db.from('bookmarks').select('*').order('created_at', { ascending: false });

    if (collection) {
      query = query.eq('collection', collection);
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    return NextResponse.json({
      data: data || [],
      total: data?.length || 0,
    });
  } catch (error) {
    console.error('Bookmarks fetch error:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to fetch bookmarks',
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as BookmarkPayload;
    const {
      opportunity_id,
      deep_link_id,
      signal_id,
      collection,
      priority = 'medium',
      memo = '',
    } = body;

    if (!collection) {
      return NextResponse.json(
        { error: 'collection is required' },
        { status: 400 }
      );
    }

    if (!opportunity_id && !deep_link_id && !signal_id) {
      return NextResponse.json(
        { error: 'At least one of opportunity_id, deep_link_id, or signal_id is required' },
        { status: 400 }
      );
    }

    const db = getServiceSupabase();

    const bookmarkData = {
      opportunity_id: opportunity_id || null,
      deep_link_id: deep_link_id || null,
      signal_id: signal_id || null,
      collection,
      priority,
      memo,
      created_at: new Date().toISOString(),
    };

    const { data, error } = await db
      .from('bookmarks')
      .insert([bookmarkData])
      .select();

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      bookmark: data?.[0],
    });
  } catch (error) {
    console.error('Bookmark creation error:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to create bookmark',
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'id query parameter is required' },
        { status: 400 }
      );
    }

    const db = getServiceSupabase();

    const { error } = await db.from('bookmarks').delete().eq('id', id);

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      message: `Bookmark ${id} deleted`,
    });
  } catch (error) {
    console.error('Bookmark deletion error:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to delete bookmark',
      },
      { status: 500 }
    );
  }
}
