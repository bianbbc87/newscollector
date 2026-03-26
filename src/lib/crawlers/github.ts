import { getServiceSupabase } from '@/lib/supabase';

const GITHUB_API = 'https://api.github.com';

function headers() {
  const h: Record<string, string> = { Accept: 'application/vnd.github.v3+json' };
  if (process.env.GITHUB_TOKEN) h['Authorization'] = `token ${process.env.GITHUB_TOKEN}`;
  return h;
}

export async function crawlGitHub(): Promise<number> {
  const supabase = getServiceSupabase();
  const rows: Record<string, unknown>[] = [];

  // 1. CNCF repos — look for good-first-issue and help-wanted
  try {
    const reposRes = await fetch(`${GITHUB_API}/orgs/cncf/repos?sort=updated&per_page=20`, { headers: headers() });
    if (reposRes.ok) {
      const repos = await reposRes.json();
      for (const repo of repos.slice(0, 10)) {
        // Search issues with good labels
        const issuesRes = await fetch(
          `${GITHUB_API}/search/issues?q=repo:${repo.full_name}+label:"good first issue"+state:open&per_page=5`,
          { headers: headers() }
        );
        if (!issuesRes.ok) continue;
        const issuesData = await issuesRes.json();

        for (const issue of (issuesData.items || []).slice(0, 3)) {
          rows.push({
            type: 'opensource',
            title: `[${repo.name}] ${issue.title}`,
            organization: 'CNCF',
            url: issue.html_url,
            description: (issue.body || '').slice(0, 2000),
            location: 'global',
            tags: ['cncf', 'opensource', (repo.language || 'unknown').toLowerCase()],
            eligibility: 'anyone',
            status: 'active',
            source_url: repo.html_url,
            crawl_depth: 0,
            relevance_score: 0.75,
            raw_data: {
              repo: repo.full_name,
              stars: repo.stargazers_count,
              language: repo.language,
              labels: (issue.labels || []).map((l: { name: string }) => l.name),
            },
          });
        }
        await new Promise((r) => setTimeout(r, 200));
      }
    }
  } catch (e) {
    console.error('GitHub CNCF crawl error:', e);
  }

  // 2. Search for trending infra/devops repos
  try {
    const q = encodeURIComponent('stars:>500 topic:devops topic:kubernetes pushed:>2026-01-01');
    const trendRes = await fetch(`${GITHUB_API}/search/repositories?q=${q}&sort=stars&per_page=10`, { headers: headers() });
    if (trendRes.ok) {
      const data = await trendRes.json();
      for (const repo of (data.items || []).slice(0, 10)) {
        rows.push({
          type: 'trend',
          title: `[Trending] ${repo.full_name}`,
          organization: repo.owner?.login || 'GitHub',
          url: repo.html_url,
          description: (repo.description || '').slice(0, 2000),
          location: 'global',
          tags: ['github', 'trending', (repo.language || '').toLowerCase()].filter(Boolean),
          eligibility: 'anyone',
          status: 'active',
          source_url: repo.html_url,
          crawl_depth: 0,
          relevance_score: 0.6,
          raw_data: { stars: repo.stargazers_count, language: repo.language, forks: repo.forks_count },
        });
      }
    }
  } catch (e) {
    console.error('GitHub trending crawl error:', e);
  }

  if (rows.length > 0) {
    const { error } = await supabase.from('opportunities').insert(rows);
    if (error) console.error('GitHub insert error:', error.message);
  }

  return rows.length;
}
