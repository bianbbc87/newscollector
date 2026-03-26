import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';
import { storeUserPreference } from '@/lib/embeddings';

/**
 * POST /api/interactions
 * Record a user interaction (bookmark, apply, view, report, dismiss)
 * This data feeds into the recommendation engine — more interactions = smarter recommendations
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, opportunityId, action, metadata } = body;

    if (!userId || !opportunityId || !action) {
      return NextResponse.json(
        { error: 'userId, opportunityId, and action are required' },
        { status: 400 }
      );
    }

    const validActions = ['bookmark', 'apply', 'view', 'report', 'dismiss'];
    if (!validActions.includes(action)) {
      return NextResponse.json(
        { error: `Invalid action. Must be one of: ${validActions.join(', ')}` },
        { status: 400 }
      );
    }

    const db = getServiceSupabase();

    // 1. Record the interaction
    const { error: insertError } = await db.from('user_interactions').insert({
      user_id: userId,
      opportunity_id: opportunityId,
      action,
      metadata: metadata || {},
    });

    if (insertError) {
      throw insertError;
    }

    // 2. For strong signals (bookmark, apply), also store as user preference embedding
    if (action === 'bookmark' || action === 'apply' || action === 'report') {
      // Get the opportunity details for embedding
      const { data: opportunity } = await db
        .from('opportunities')
        .select('title, description, type, source, tags')
        .eq('id', opportunityId)
        .single();

      if (opportunity) {
        const contentText = `${opportunity.title}\n${opportunity.description || ''}`;
        const weight = action === 'apply' ? 2.0 : action === 'bookmark' ? 1.5 : -1.0;

        try {
          await storeUserPreference(userId, action, contentText, weight);
        } catch (embedError) {
          // Don't fail the whole request if embedding fails
          console.error('Failed to store preference embedding:', embedError);
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `Interaction '${action}' recorded`,
    });
  } catch (error) {
    console.error('Interaction recording error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to record interaction' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/interactions?userId=xxx
 * Get user's interaction history
 */
export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId');
    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    const db = getServiceSupabase();
    const { data, error } = await db
      .from('user_interactions')
      .select(`
        id,
        action,
        metadata,
        created_at,
        opportunities (id, title, type, source, url)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) throw error;

    // Also get action summary
    const summary: Record<string, number> = {};
    (data || []).forEach((item: Record<string, unknown>) => {
      const action = item.action as string;
      summary[action] = (summary[action] || 0) + 1;
    });

    return NextResponse.json({
      interactions: data || [],
      summary,
      total: (data || []).length,
    });
  } catch (error) {
    console.error('Get interactions error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to get interactions' },
      { status: 500 }
    );
  }
}
