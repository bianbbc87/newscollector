import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';
import { getPersonalizedRecommendations, searchSimilarOpportunities } from '@/lib/embeddings';

/**
 * GET /api/ai/recommend?userId=xxx
 * Get personalized opportunity recommendations using vector similarity
 *
 * How it works:
 * 1. If user has interaction history → uses weighted preference embeddings for personalized results
 * 2. If no history → falls back to general DevOps/SRE relevance search
 * 3. Results are combined with traditional scoring for hybrid ranking
 */
export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId');
    const limit = parseInt(request.nextUrl.searchParams.get('limit') || '10');

    const db = getServiceSupabase();

    let recommendations: Array<{
      opportunity_id: string;
      content_text: string;
      metadata: Record<string, unknown>;
      similarity: number;
      personalization_score?: number;
    }> = [];

    // Try personalized recommendations first
    if (userId) {
      recommendations = await getPersonalizedRecommendations(userId, limit);
    }

    // If no personalized results, fall back to general search
    if (recommendations.length === 0) {
      recommendations = await searchSimilarOpportunities(
        'DevOps SRE Kubernetes cloud infrastructure platform engineering site reliability',
        limit,
        0.3
      );
    }

    // Enrich with full opportunity data
    const opportunityIds = recommendations.map((r) => r.opportunity_id);

    if (opportunityIds.length === 0) {
      return NextResponse.json({
        recommendations: [],
        personalized: false,
        message: 'No recommendations yet. Browse and bookmark opportunities to get personalized suggestions.',
      });
    }

    const { data: opportunities } = await db
      .from('opportunities')
      .select('*')
      .in('id', opportunityIds);

    // Merge similarity scores with opportunity data
    const enriched = (opportunities || []).map((opp: Record<string, unknown>) => {
      const rec = recommendations.find((r) => r.opportunity_id === opp.id);
      return {
        ...opp,
        ai_similarity: rec?.similarity || 0,
        personalization_score: rec?.personalization_score || rec?.similarity || 0,
      };
    });

    // Sort by personalization score
    enriched.sort(
      (a: Record<string, unknown>, b: Record<string, unknown>) =>
        (b.personalization_score as number) - (a.personalization_score as number)
    );

    // Get user's bookmarked IDs to exclude already-seen content
    let bookmarkedIds: string[] = [];
    if (userId) {
      const { data: bookmarks } = await db
        .from('user_interactions')
        .select('opportunity_id')
        .eq('user_id', userId)
        .in('action', ['bookmark', 'apply']);

      bookmarkedIds = (bookmarks || []).map((b: Record<string, unknown>) => b.opportunity_id as string);
    }

    // Filter out already bookmarked/applied
    const filtered = enriched.filter(
      (opp: Record<string, unknown>) => !bookmarkedIds.includes(opp.id as string)
    );

    return NextResponse.json({
      recommendations: filtered.slice(0, limit),
      personalized: userId ? recommendations.length > 0 : false,
      total: filtered.length,
    });
  } catch (error) {
    console.error('Recommendation error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Recommendations failed' },
      { status: 500 }
    );
  }
}
