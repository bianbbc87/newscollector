import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';
import { crawlHackerNews, crawlRSS, crawlGitHub, crawlDevpost, crawlPrograms } from '@/lib/crawlers';
import { batchEmbedOpportunities } from '@/lib/embeddings';

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

    // Authorization:
    // 1. Scheduled runs (GitHub Actions): Bearer CRON_SECRET in Authorization header
    // 2. Manual triggers from the dashboard UI: same-origin request verified via Origin header
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    const isAuthorizedCron = !!(cronSecret && authHeader === `Bearer ${cronSecret}`);

    // For manual triggers, verify same-origin by checking the Origin header matches
    // the request host. Browsers always send Origin on cross-origin fetches and
    // omit or set it to the page origin for same-origin requests.
    const requestHost = request.headers.get('host') || '';
    const originHeader = request.headers.get('origin') || '';
    const isSameOriginManual =
      manual === true &&
      !!originHeader &&
      (originHeader === `https://${requestHost}` ||
        originHeader === `http://${requestHost}`);

    if (!isAuthorizedCron && !isSameOriginManual) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const results: Record<string, number> = {};
    const tasks: Promise<void>[] = [];

    if (!source || source === 'hackernews') {
      tasks.push(
        crawlHackerNews()
          .then((n) => { results.hackernews = n; })
          .catch((e) => { console.error('HN crawl failed:', e); results.hackernews = 0; })
      );
    }

    if (!source || source === 'rss') {
      tasks.push(
        Promise.all(
          RSS_SOURCES.map((feed) =>
            crawlRSS(feed.name, feed.url).catch((e) => {
              console.error(`RSS crawl failed (${feed.name}):`, e);
              return 0;
            })
          )
        ).then((counts) => { results.rss = counts.reduce((a, b) => a + b, 0); })
      );
    }

    if (!source || source === 'github') {
      tasks.push(
        crawlGitHub()
          .then((n) => { results.github = n; })
          .catch((e) => { console.error('GitHub crawl failed:', e); results.github = 0; })
      );
    }

    if (!source || source === 'devpost') {
      tasks.push(
        crawlDevpost()
          .then((n) => { results.devpost = n; })
          .catch((e) => { console.error('Devpost crawl failed:', e); results.devpost = 0; })
      );
    }

    if (!source || source === 'programs') {
      tasks.push(
        crawlPrograms()
          .then((n) => { results.programs = n; })
          .catch((e) => { console.error('Programs crawl failed:', e); results.programs = 0; })
      );
    }

    await Promise.all(tasks);

    // Update crawl_configs last_run_at
    const supabase = getServiceSupabase();
    await supabase
      .from('crawl_configs')
      .update({ last_run_at: new Date().toISOString() })
      .eq('enabled', true);

    const total = Object.values(results).reduce((a, b) => a + b, 0);

    // Embed any opportunities that haven't been embedded yet.
    // We fetch IDs already in opportunity_embeddings and exclude them.
    let embeddedCount = 0;
    try {
      const { data: existingEmbeds } = await supabase
        .from('opportunity_embeddings')
        .select('opportunity_id');

      const embeddedIds = new Set((existingEmbeds || []).map((r: { opportunity_id: string }) => r.opportunity_id));

      const { data: unembedded } = await supabase
        .from('opportunities')
        .select('id, title, description, source_url, type, tags')
        .eq('status', 'active')
        .not('id', 'in', embeddedIds.size > 0 ? `(${[...embeddedIds].join(',')})` : '(00000000-0000-0000-0000-000000000000)');

      if (unembedded && unembedded.length > 0) {
        embeddedCount = await batchEmbedOpportunities(
          unembedded.map((o: { id: string; title: string; description: string; source_url: string; type: string; tags: string[] }) => ({
            id: o.id,
            title: o.title,
            description: o.description,
            source: o.source_url,
            type: o.type,
            tags: Array.isArray(o.tags) ? o.tags : [],
          }))
        );
      }
    } catch (embedError) {
      // Embedding failures should not fail the whole crawl response
      console.error('Embedding step error:', embedError);
    }

    return NextResponse.json({
      success: true,
      message: `Crawled ${total} opportunities, embedded ${embeddedCount}`,
      results,
      embedded: embeddedCount,
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
