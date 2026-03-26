import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';
import { crawlHackerNews, crawlRSS, crawlGitHub, crawlDevpost, crawlPrograms } from '@/lib/crawlers';

// RSS feed sources to crawl - comprehensive list including major tech blogs and engineering blogs
const RSS_SOURCES = [
  // Cloud Native and Infrastructure
  { name: 'cncf_blog', url: 'https://www.cncf.io/blog/feed/' },
  { name: 'kubernetes_blog', url: 'https://kubernetes.io/feed.xml' },

  // Major Tech Companies
  { name: 'cloudflare_blog', url: 'https://blog.cloudflare.com/rss/' },
  { name: 'netflix_tech_blog', url: 'https://netflixtechblog.com/feed' },
  { name: 'uber_engineering', url: 'https://www.uber.com/en-US/blog/engineers/feed/' },
  { name: 'stripe_engineering', url: 'https://stripe.com/blog/feed.rss' },
  { name: 'meta_engineering', url: 'https://engineering.fb.com/feed/' },
  { name: 'linkedin_engineering', url: 'https://engineering.linkedin.com/feed' },
  { name: 'microsoft_devblogs', url: 'https://devblogs.microsoft.com/feed/' },

  // DevOps and Infrastructure Tools
  { name: 'hashicorp_blog', url: 'https://www.hashicorp.com/blog/feed.xml' },
  { name: 'datadog_blog', url: 'https://www.datadoghq.com/blog/feed.xml' },
  { name: 'pagerduty_blog', url: 'https://www.pagerduty.com/blog/feed.xml' },

  // Community and News
  { name: 'the_new_stack', url: 'https://thenewstack.io/feed/' },
  { name: 'infoq_devops', url: 'https://www.infoq.com/feed/devops-cloud' },
  { name: 'dzone_devops', url: 'https://dzone.com/feeds/zones/devops.rss' },

  // Developer Communities
  { name: 'devto_devops', url: 'https://dev.to/feed/tag/devops' },
  { name: 'devto_sre', url: 'https://dev.to/feed/tag/sre' },
  { name: 'google_opensource', url: 'https://opensource.googleblog.com/feeds/posts/default' },

  // Linux Foundation Events
  { name: 'lf_events', url: 'https://events.linuxfoundation.org/feed/' },
];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { source, manual } = body as { source?: string; manual?: boolean };

    // Authorization: allow CRON_SECRET for scheduled runs, or same-origin requests for manual triggers
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    const isAuthorizedCron = cronSecret && authHeader === `Bearer ${cronSecret}`;
    const isManualTrigger = manual === true;

    if (!isAuthorizedCron && !isManualTrigger) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

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

    if (!source || source === 'devpost') {
      try {
        results.devpost = await crawlDevpost();
      } catch (e) {
        console.error('Devpost crawl failed:', e);
        results.devpost = 0;
      }
    }

    if (!source || source === 'programs') {
      try {
        results.programs = await crawlPrograms();
      } catch (e) {
        console.error('Programs crawl failed:', e);
        results.programs = 0;
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
