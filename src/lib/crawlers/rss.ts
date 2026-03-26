import Parser from 'rss-parser';
import { getServiceSupabase } from '@/lib/supabase';

const parser = new Parser({
  customFields: {
    item: [['content:encoded', 'contentEncoded']],
  },
});

export async function crawlRSS(sourceName: string, feedUrl: string): Promise<number> {
  const supabase = getServiceSupabase();
  const feed = await parser.parseURL(feedUrl);
  const rows: Record<string, unknown>[] = [];

  for (const entry of feed.items) {
    if (!entry.title || !entry.link) continue;

    const description = (
      entry.contentEncoded || entry.contentSnippet || entry.content || entry.summary || ''
    ).slice(0, 2000);

    // Determine type based on source
    let type = 'trend';
    if (sourceName.includes('job') || sourceName.includes('career')) type = 'job';
    if (sourceName.includes('hackathon')) type = 'hackathon';

    // Basic tag extraction from title + categories
    const tags: string[] = [];
    const categories = entry.categories || [];
    categories.forEach((c: string) => tags.push(c.toLowerCase()));

    rows.push({
      type,
      title: entry.title,
      organization: feed.title || sourceName,
      url: entry.link,
      description,
      location: 'global',
      tags: tags.slice(0, 10),
      eligibility: 'anyone',
      status: 'active',
      source_url: feedUrl,
      crawl_depth: 0,
      relevance_score: 0.5,
      raw_data: {
        source: sourceName,
        author: entry.creator || (entry as unknown as Record<string, unknown>).author || null,
        pub_date: entry.pubDate || entry.isoDate || null,
      },
    });
  }

  if (rows.length > 0) {
    const { error } = await supabase.from('opportunities').insert(rows);
    if (error) console.error(`RSS insert error (${sourceName}):`, error.message);
  }

  return rows.length;
}
