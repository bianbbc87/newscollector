import { getServiceSupabase } from '@/lib/supabase';

const GITHUB_API = 'https://api.github.com';

// Popular DevOps/SRE organizations to crawl
const ORGS_TO_CRAWL = [
  { name: 'cncf', label: 'CNCF' },
  { name: 'kubernetes', label: 'Kubernetes' },
  { name: 'prometheus', label: 'Prometheus' },
  { name: 'grafana', label: 'Grafana' },
  { name: 'envoyproxy', label: 'Envoy' },
  { name: 'istio', label: 'Istio' },
  { name: 'cilium', label: 'Cilium' },
];

function headers() {
  const h: Record<string, string> = { Accept: 'application/vnd.github.v3+json' };
  if (process.env.GITHUB_TOKEN) h['Authorization'] = `token ${process.env.GITHUB_TOKEN}`;
  return h;
}

export async function crawlGitHub(): Promise<number> {
  const supabase = getServiceSupabase();
  const rows: Record<string, unknown>[] = [];

  // 1. Crawl key DevOps/SRE organizations for good-first-issue items
  for (const org of ORGS_TO_CRAWL) {
    try {
      const reposRes = await fetch(
        `${GITHUB_API}/orgs/${org.name}/repos?sort=updated&per_page=30`,
        { headers: headers() }
      );
      if (!reposRes.ok) continue;

      const repos = await reposRes.json();
      for (const repo of repos.slice(0, 15)) {
        try {
          // Search for issues with good labels
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
              organization: org.label,
              url: issue.html_url,
              description: (issue.body || '').slice(0, 2000),
              location: 'global',
              tags: ['opensource', org.name, (repo.language || 'unknown').toLowerCase()],
              eligibility: 'anyone',
              status: 'active',
              source_url: repo.html_url,
              crawl_depth: 0,
              relevance_score: 0.8,
              raw_data: {
                repo: repo.full_name,
                stars: repo.stargazers_count,
                language: repo.language,
                labels: (issue.labels || []).map((l: { name: string }) => l.name),
              },
            });
          }
        } catch (e) {
          console.warn(`Failed to crawl issues for ${repo.full_name}:`, e);
        }
        await new Promise((r) => setTimeout(r, 200));
      }
    } catch (e) {
      console.warn(`GitHub org crawl error for ${org.name}:`, e);
    }
  }

  // 2. Search for trending DevOps/SRE repos
  try {
    const q = encodeURIComponent('stars:>500 (topic:devops OR topic:kubernetes OR topic:sre OR topic:monitoring) pushed:>2026-01-01');
    const trendRes = await fetch(
      `${GITHUB_API}/search/repositories?q=${q}&sort=stars&per_page=20`,
      { headers: headers() }
    );
    if (trendRes.ok) {
      const data = await trendRes.json();
      for (const repo of (data.items || []).slice(0, 15)) {
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
          relevance_score: 0.7,
          raw_data: {
            stars: repo.stargazers_count,
            language: repo.language,
            forks: repo.forks_count,
            topics: repo.topics || [],
          },
        });
      }
    }
  } catch (e) {
    console.error('GitHub trending crawl error:', e);
  }

  // 3. Search for DevOps-related help-wanted issues
  try {
    const q = encodeURIComponent('label:"help wanted" (topic:devops OR topic:sre OR topic:kubernetes OR topic:monitoring) state:open');
    const helpRes = await fetch(
      `${GITHUB_API}/search/issues?q=${q}&per_page=15`,
      { headers: headers() }
    );
    if (helpRes.ok) {
      const data = await helpRes.json();
      for (const issue of (data.items || []).slice(0, 10)) {
        rows.push({
          type: 'opensource',
          title: `[Help Wanted] ${issue.title}`,
          organization: (issue.repository_url || '').split('/').pop() || 'GitHub',
          url: issue.html_url,
          description: (issue.body || '').slice(0, 2000),
          location: 'global',
          tags: ['opensource', 'help-wanted', 'devops'],
          eligibility: 'anyone',
          status: 'active',
          source_url: issue.repository_url || issue.html_url,
          crawl_depth: 0,
          relevance_score: 0.75,
          raw_data: {
            repo: issue.repository_url,
            labels: (issue.labels || []).map((l: any) => l.name || l),
          },
        });
      }
    }
  } catch (e) {
    console.warn('GitHub help-wanted crawl error:', e);
  }

  if (rows.length > 0) {
    const { error } = await supabase.from('opportunities').insert(rows);
    if (error) console.error('GitHub insert error:', error.message);
  }

  return rows.length;
}
