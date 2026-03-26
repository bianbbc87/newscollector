import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';
import { crawlHackerNews, crawlRSS, crawlGitHub } from '@/lib/crawlers';

// RSS feed sources to crawl
const RSS_SOURCES = [
  { name: 'cncf_blog', url: 'https://www.cncf.io/blog/feed/' },
  { name: 'kubernetes_blog', url: 'https://kubernetes.io/feed.xml' },
  { name: 'cloudflare_blog', url: 'https://blog.cloudflare.com/rss/' },
  { name: 'netflix_tech_blog', url: 'https://netflixtechblog.com/feed' },
  { name: 'devto_devops', url: 'https://dev.to/feed/tag/devops' },
  { name: 'devto_sre', url: 'https://dev.to/feed/tag/sre' },
];

export async function POST(request: NextRequest) {
  try {
    // Verify CRON_SECRET
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const { source } = body as { source?: string };

    const results: Record<string, number> = {};

    if (!source || source === 'hackernews') {
      try {
        results.hackernews = await crawlHackerNews();
      } catch (e) {
        console.error('HN crawl failed:', e);
        results.hackernews = 0;
      }
    }

    if (!source || source === 'rss') {
      let rssTotal = 0;
      for (const feed of RSS_SOURCES) {
        try {
          rssTotal += await crawlRSS(feed.name, feed.url);
        } catch (e) {
          console.error(`RSS crawl failed (${feed.name}):`, e);
        }
      }
      results.rss = rssTotal;
    }

    if (!source || source === 'github') {
      try {
        results.github = await crawlGitHub();
      } catch (e) {
        console.error('GitHub crawl failed:', e);
        results.github = 0;
      }
    }

    // Update crawl_configs last_run_at
    const supabase = getServiceSupabase();
    await supabase
      .from('crawl_configs')
      .update({ last_run_at: new Date().toISOString() })
      .eq('enabled', true);

    const total = Object.values(results).reduce((a, b) => a + b, 0);

    return NextResponse.json({
      success: true,
      message: `Crawled ${total} opportunities`,
      results,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Crawl error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Crawl failed' },
      { status: 500 }
    );
  }
}
