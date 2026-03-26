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
  kids?: number[];
}

const HN_API_BASE = 'https://hacker-news.firebaseio.com/v0';
const DEVOPS_KEYWORDS = [
  'devops', 'sre', 'site reliability', 'infrastructure', 'kubernetes',
  'docker', 'aws', 'gcp', 'azure', 'terraform', 'ansible', 'ci/cd',
  'deployment', 'monitoring', 'observability', 'cloud', 'platform engineer',
  'ebpf', 'envoy', 'prometheus', 'grafana', 'linux', 'container',
  'orchestration', 'deployment', 'opsops', 'cloud-native', 'microservices',
  'distributed systems', 'scalability', 'reliability', 'performance',
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
  const rows: Record<string, unknown>[] = [];

  // 1. Fetch job stories (increased from 25 to 50)
  const jobRes = await fetch(`${HN_API_BASE}/jobstories.json`);
  if (!jobRes.ok) throw new Error('Failed to fetch HN job stories');
  const jobIds: number[] = await jobRes.json();

  // 2. Fetch top stories for tech trends
  const topRes = await fetch(`${HN_API_BASE}/topstories.json`);
  const topIds: number[] = topRes.ok ? await topRes.json() : [];

  // 3. Fetch all stories to search for "Ask HN: Who is Hiring?" monthly threads
  const allRes = await fetch(`${HN_API_BASE}/newstories.json`);
  const allIds: number[] = allRes.ok ? await allRes.json() : [];

  // Process job stories (first 50)
  for (const id of jobIds.slice(0, 50)) {
    const item = await fetchHNItem(id);
    if (!item || !item.title) continue;

    rows.push({
      type: 'job',
      title: item.title,
      organization: item.by || 'Hacker News',
      url: item.url || `https://news.ycombinator.com/item?id=${item.id}`,
      description: (item.text || '').slice(0, 2000),
      location: 'global',
      tags: ['job', 'hacker-news'],
      eligibility: 'anyone',
      status: 'active',
      source_url: `https://news.ycombinator.com/item?id=${item.id}`,
      crawl_depth: 0,
      relevance_score: 0.85,
      raw_data: { hn_id: item.id, score: item.score, by: item.by, type: 'job' },
    });

    await new Promise((r) => setTimeout(r, 50));
  }

  // Process top stories (filter for DevOps relevance)
  for (const id of topIds.slice(0, 50)) {
    const item = await fetchHNItem(id);
    if (!item || !item.title) continue;

    const isDevOps = isDevOpsRelated(item.title, item.text || '');
    if (!isDevOps) continue;

    rows.push({
      type: 'trend',
      title: item.title,
      organization: 'Hacker News',
      url: item.url || `https://news.ycombinator.com/item?id=${item.id}`,
      description: (item.text || '').slice(0, 2000),
      location: 'global',
      tags: ['trend', 'devops', 'sre'],
      eligibility: 'anyone',
      status: 'active',
      source_url: `https://news.ycombinator.com/item?id=${item.id}`,
      crawl_depth: 0,
      relevance_score: 0.75,
      raw_data: { hn_id: item.id, score: item.score, by: item.by, type: 'trend' },
    });

    await new Promise((r) => setTimeout(r, 50));
  }

  // Process new stories to find "Ask HN: Who is Hiring?" threads
  for (const id of allIds.slice(0, 100)) {
    const item = await fetchHNItem(id);
    if (!item || !item.title) continue;

    if (item.title.toLowerCase().includes('ask hn: who is hiring')) {
      rows.push({
        type: 'job',
        title: item.title,
        organization: 'Hacker News Community',
        url: `https://news.ycombinator.com/item?id=${item.id}`,
        description: (item.text || 'Monthly "Who is Hiring?" thread from Hacker News. Post or browse job opportunities.').slice(0, 2000),
        location: 'global',
        tags: ['job', 'hiring', 'hacker-news'],
        eligibility: 'anyone',
        status: 'active',
        source_url: `https://news.ycombinator.com/item?id=${item.id}`,
        crawl_depth: 0,
        relevance_score: 0.8,
        raw_data: { hn_id: item.id, score: item.score, by: item.by, type: 'hiring_thread' },
      });
    }

    await new Promise((r) => setTimeout(r, 50));
  }

  if (rows.length > 0) {
    const { error } = await supabase.from('opportunities').insert(rows);
    if (error) console.error('HN insert error:', error.message);
  }

  return rows.length;
}
