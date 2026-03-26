import OpenAI from 'openai';
import { getServiceSupabase } from './supabase';

let _openai: OpenAI | null = null;
function getOpenAI(): OpenAI {
  if (!_openai) {
    _openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  return _openai;
}

/**
 * Generate embedding vector from text using OpenAI text-embedding-3-small
 * 1536 dimensions, fast and cost-effective
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  // Clean and truncate text (max ~8000 tokens for embedding model)
  const cleanText = text.replace(/\n+/g, ' ').trim().slice(0, 8000);

  const response = await getOpenAI().embeddings.create({
    model: 'text-embedding-3-small',
    input: cleanText,
  });

  return response.data[0].embedding;
}

/**
 * Embed and store an opportunity in the vector DB
 */
export async function embedOpportunity(
  opportunityId: string,
  title: string,
  description: string,
  metadata: Record<string, unknown> = {}
): Promise<void> {
  const contentText = `${title}\n${description}`;
  const embedding = await generateEmbedding(contentText);
  const db = getServiceSupabase();

  // Check if embedding already exists
  const { data: existing } = await db
    .from('opportunity_embeddings')
    .select('id')
    .eq('opportunity_id', opportunityId)
    .single();

  if (existing) {
    await db
      .from('opportunity_embeddings')
      .update({
        content_text: contentText,
        embedding: JSON.stringify(embedding),
        metadata,
      })
      .eq('opportunity_id', opportunityId);
  } else {
    await db.from('opportunity_embeddings').insert({
      opportunity_id: opportunityId,
      content_text: contentText,
      embedding: JSON.stringify(embedding),
      metadata,
    });
  }
}

/**
 * Batch embed multiple opportunities
 */
export async function batchEmbedOpportunities(
  opportunities: Array<{
    id: string;
    title: string;
    description: string;
    source: string;
    type: string;
    tags: string[];
  }>
): Promise<number> {
  let count = 0;

  // Process in batches of 20 to avoid rate limits
  for (let i = 0; i < opportunities.length; i += 20) {
    const batch = opportunities.slice(i, i + 20);

    const promises = batch.map(async (opp) => {
      try {
        await embedOpportunity(opp.id, opp.title, opp.description, {
          source: opp.source,
          type: opp.type,
          tags: opp.tags,
        });
        count++;
      } catch (error) {
        console.error(`Failed to embed opportunity ${opp.id}:`, error);
      }
    });

    await Promise.all(promises);

    // Small delay between batches to respect rate limits
    if (i + 20 < opportunities.length) {
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }

  return count;
}

/**
 * Search for similar opportunities using vector similarity
 */
export async function searchSimilarOpportunities(
  queryText: string,
  matchCount: number = 10,
  matchThreshold: number = 0.5
): Promise<
  Array<{
    opportunity_id: string;
    content_text: string;
    metadata: Record<string, unknown>;
    similarity: number;
  }>
> {
  const queryEmbedding = await generateEmbedding(queryText);
  const db = getServiceSupabase();

  const { data, error } = await db.rpc('match_opportunities', {
    query_embedding: JSON.stringify(queryEmbedding),
    match_threshold: matchThreshold,
    match_count: matchCount,
  });

  if (error) {
    console.error('Vector search error:', error);
    return [];
  }

  return data || [];
}

/**
 * Store user preference embedding (learned from their behavior)
 */
export async function storeUserPreference(
  userId: string,
  preferenceType: string,
  contentText: string,
  weight: number = 1.0
): Promise<void> {
  const embedding = await generateEmbedding(contentText);
  const db = getServiceSupabase();

  await db.from('user_preference_embeddings').insert({
    user_id: userId,
    preference_type: preferenceType,
    content_text: contentText,
    embedding: JSON.stringify(embedding),
    weight,
  });
}

/**
 * Get personalized recommendations for a user based on their preference vectors
 */
export async function getPersonalizedRecommendations(
  userId: string,
  limit: number = 10
): Promise<
  Array<{
    opportunity_id: string;
    content_text: string;
    metadata: Record<string, unknown>;
    similarity: number;
    personalization_score: number;
  }>
> {
  const db = getServiceSupabase();

  // Get user's preference embeddings
  const { data: preferences } = await db
    .from('user_preference_embeddings')
    .select('embedding, weight, preference_type')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })
    .limit(20);

  if (!preferences || preferences.length === 0) {
    // No preferences yet — return general top opportunities
    return [];
  }

  // Compute weighted average of user preference embeddings
  const avgEmbedding = computeWeightedAverageEmbedding(preferences);

  // Search using the user's average preference vector
  const { data, error } = await db.rpc('match_opportunities', {
    query_embedding: JSON.stringify(avgEmbedding),
    match_threshold: 0.3,
    match_count: limit,
  });

  if (error) {
    console.error('Personalized search error:', error);
    return [];
  }

  // Add personalization score
  return (data || []).map(
    (item: {
      opportunity_id: string;
      content_text: string;
      metadata: Record<string, unknown>;
      similarity: number;
    }) => ({
      ...item,
      personalization_score: item.similarity * 1.2, // boost personalized results
    })
  );
}

/**
 * Compute weighted average of multiple embeddings
 */
function computeWeightedAverageEmbedding(
  preferences: Array<{
    embedding: number[] | string;
    weight: number;
    preference_type: string;
  }>
): number[] {
  const dim = 1536;
  const avg = new Array(dim).fill(0);
  let totalWeight = 0;

  // Weight multipliers by preference type
  const typeWeights: Record<string, number> = {
    bookmark: 1.5,    // Bookmarks = strong positive signal
    apply: 2.0,       // Applications = strongest signal
    view: 0.5,        // Views = weak positive signal
    report: -1.0,     // Reports = negative signal
    dismiss: -0.5,    // Dismiss = mild negative signal
  };

  for (const pref of preferences) {
    const embedding =
      typeof pref.embedding === 'string'
        ? JSON.parse(pref.embedding)
        : pref.embedding;

    const typeMultiplier = typeWeights[pref.preference_type] || 1.0;
    const weight = pref.weight * typeMultiplier;
    totalWeight += Math.abs(weight);

    for (let i = 0; i < dim; i++) {
      avg[i] += embedding[i] * weight;
    }
  }

  if (totalWeight > 0) {
    for (let i = 0; i < dim; i++) {
      avg[i] /= totalWeight;
    }
  }

  return avg;
}
