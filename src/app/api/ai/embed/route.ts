import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';
import { batchEmbedOpportunities } from '@/lib/embeddings';

/**
 * POST /api/ai/embed
 * Embed all un-embedded opportunities into the vector DB
 * Should be called after crawling to keep vectors up to date
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { limit = 100 } = body as { limit?: number };

    const db = getServiceSupabase();

    // Find opportunities that don't have embeddings yet
    const { data: allOpps } = await db
      .from('opportunities')
      .select('id')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (!allOpps || allOpps.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No opportunities to embed',
        embedded: 0,
      });
    }

    // Get existing embeddings
    const oppIds = allOpps.map((o: Record<string, unknown>) => o.id as string);
    const { data: existingEmbeddings } = await db
      .from('opportunity_embeddings')
      .select('opportunity_id')
      .in('opportunity_id', oppIds);

    const embeddedIds = new Set(
      (existingEmbeddings || []).map((e: Record<string, unknown>) => e.opportunity_id as string)
    );

    // Filter to only un-embedded opportunities
    const unembeddedIds = oppIds.filter((id: string) => !embeddedIds.has(id));

    if (unembeddedIds.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'All opportunities already embedded',
        embedded: 0,
        total: allOpps.length,
      });
    }

    // Fetch full data for un-embedded opportunities
    const { data: toEmbed } = await db
      .from('opportunities')
      .select('id, title, description, source_url, type, tags')
      .in('id', unembeddedIds);

    if (!toEmbed || toEmbed.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No data to embed',
        embedded: 0,
      });
    }

    // Batch embed
    const count = await batchEmbedOpportunities(
      toEmbed.map((o: Record<string, unknown>) => ({
        id: o.id as string,
        title: o.title as string,
        description: (o.description as string) || '',
        source: (o.source_url as string) || '',
        type: (o.type as string) || '',
        tags: (o.tags as string[]) || [],
      }))
    );

    return NextResponse.json({
      success: true,
      message: `Embedded ${count} opportunities`,
      embedded: count,
      total: allOpps.length,
      alreadyEmbedded: embeddedIds.size,
    });
  } catch (error) {
    console.error('Embedding error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Embedding failed' },
      { status: 500 }
    );
  }
}
