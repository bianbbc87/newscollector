import { getServiceSupabase } from '@/lib/supabase';

interface HNItem {
  id: number;
  title: string;
  url?: string;
  text?: string;
  by: string;
  time: number;
  score: number;
  descendants?: number;
}

const HN_API_BASE = 'https://hacker-news.firebaseio.com/v0';
const DEVOPS_KEYWORDS = [
  'devops', 'sre', 'site reliability', 'infrastructure', 'kubernetes',
  'docker', 'aws', 'gcp', 'azure', 'terraform', 'ansible', 'ci/cd',
  'deployment', 'monitoring', 'observability', 'cloud', 'platform engineer',
  'ebpf', 'envoy', 'prometheus', 'grafana', 'linux', 'container',
];

async function fetchHNItem(itemId: number): Promise<HNItem | null> {
  try {
    const response = await fetch(`${HN_API_BASE}/item/${itemId}.json`);
    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  }
}

function isDevOpsRelated(title: string, text: string = ''): boolean {
  const content = `${title} ${text}`.toLowerCase();
  return DEVOPS_KEYWORDS.some((kw) => content.includes(kw));
}

export async function crawlHackerNews(): Promise<number> {
  const supabase = getServiceSupabase();

  // Fetch job stories
  const res = await fetch(`${HN_API_BASE}/jobstories.json`);
  if (!res.ok) throw new Error('Failed to fetch HN job stories');
  const jobIds: number[] = await res.json();

  // Also fetch top stories for tech trends
  const topRes = await fetch(`${HN_API_BASE}/topstories.json`);
  const topIds: number[] = topRes.ok ? await topRes.json() : [];

  const allIds = [...jobIds.slice(0, 25), ...topIds.slice(0, 25)];
  const rows: Record<string, unknown>[] = [];

  for (const id of allIds) {
    const item = await fetchHNItem(id);
    if (!item || !item.title) continue;

    const isJob = jobIds.includes(id);
    const isDevOps = isDevOpsRelated(item.title, item.text || '');

    // Skip non-devops top stories to reduce noise
    if (!isJob && !isDevOps) continue;

    rows.push({
      type: isJob ? 'job' : 'trend',
      title: item.title,
      organization: item.by || 'Hacker News',
      url: item.url || `https://news.ycombinator.com/item?id=${item.id}`,
      description: (item.text || '').slice(0, 2000),
      location: 'global',
      tags: isDevOps ? ['devops', 'sre'] : ['tech'],
      eligibility: 'anyone',
      status: 'active',
      source_url: `https://news.ycombinator.com/item?id=${item.id}`,
      crawl_depth: 0,
      relevance_score: isDevOps ? 0.8 : 0.4,
      raw_data: { hn_id: item.id, score: item.score, by: item.by },
    });

    await new Promise((r) => setTimeout(r, 50));
  }

  if (rows.length > 0) {
    const { error } = await supabase.from('opportunities').insert(rows);
    if (error) console.error('HN insert error:', error.message);
  }

  return rows.length;
}
