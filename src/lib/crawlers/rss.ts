import Parser from 'rss-parser';
import { getServiceSupabase } from '@/lib/supabase';

const parser = new Parser({
  customFields: {
    item: [['content:encoded', 'contentEncoded']],
  },
  timeout: 10000,
});

export async function crawlRSS(sourceName: string, feedUrl: string): Promise<number> {
  const supabase = getServiceSupabase();

  try {
    const feed = await parser.parseURL(feedUrl);
    const rows: Record<string, unknown>[] = [];

    if (!feed.items || feed.items.length === 0) {
      console.warn(`No items found in feed: ${sourceName}`);
      return 0;
    }

    for (const entry of feed.items) {
      if (!entry.title || !entry.link) continue;

      try {
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
        if (Array.isArray(categories)) {
          categories.forEach((c: any) => {
            const tagStr = typeof c === 'string' ? c : (c.name || c);
            if (tagStr) tags.push(tagStr.toLowerCase());
          });
        }

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
          relevance_score: 0.6,
          raw_data: {
            source: sourceName,
            author: entry.creator || (entry as unknown as Record<string, unknown>).author || null,
            pub_date: entry.pubDate || entry.isoDate || null,
          },
        });
      } catch (entryError) {
        console.warn(`Error processing entry in ${sourceName}:`, entryError);
        continue;
      }
    }

    if (rows.length > 0) {
      let inserted = 0;
      for (const row of rows) {
        const { data: existing } = await supabase
          .from('opportunities')
          .select('id')
          .eq('url', row.url as string)
          .limit(1);
        if (existing && existing.length > 0) continue;
        const { error } = await supabase.from('opportunities').insert(row);
        if (error) {
          console.error(`RSS insert error (${sourceName}):`, error.message);
        } else {
          inserted++;
        }
      }
      return inserted;
    }

    return 0;
  } catch (error) {
    console.error(`Failed to parse RSS feed (${sourceName}): ${feedUrl}`, error);
    return 0;
  }
}
