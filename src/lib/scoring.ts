/**
 * Smart keyword-based relevance scoring for DevOps/SRE career opportunities.
 * Returns a score between 0.0 and 1.0 based on how relevant the content is
 * to a DevOps/SRE engineer targeting big tech companies.
 */

// High-value keywords with weights
const KEYWORD_WEIGHTS: Record<string, number> = {
  // Core DevOps/SRE (highest weight)
  'devops': 0.15,
  'sre': 0.15,
  'site reliability': 0.15,
  'platform engineer': 0.14,
  'infrastructure engineer': 0.14,
  'cloud engineer': 0.13,
  'systems engineer': 0.12,
  'production engineer': 0.12,

  // Target companies (high weight)
  'google': 0.12,
  'aws': 0.11,
  'amazon': 0.10,
  'microsoft': 0.10,
  'nvidia': 0.12,
  'meta': 0.08,
  'apple': 0.08,
  'netflix': 0.08,

  // Core technologies
  'kubernetes': 0.10,
  'k8s': 0.10,
  'docker': 0.08,
  'terraform': 0.09,
  'ansible': 0.07,
  'pulumi': 0.07,
  'helm': 0.07,

  // Cloud platforms
  'gcp': 0.09,
  'azure': 0.08,
  'cloud-native': 0.08,
  'cncf': 0.09,

  // Observability & Monitoring
  'prometheus': 0.08,
  'grafana': 0.08,
  'datadog': 0.07,
  'observability': 0.08,
  'monitoring': 0.06,
  'alerting': 0.05,
  'opentelemetry': 0.08,
  'jaeger': 0.06,

  // CI/CD & Automation
  'ci/cd': 0.08,
  'cicd': 0.08,
  'github actions': 0.07,
  'jenkins': 0.05,
  'argocd': 0.08,
  'argo cd': 0.08,
  'gitops': 0.08,
  'flux': 0.06,

  // Networking & Service Mesh
  'envoy': 0.07,
  'istio': 0.07,
  'cilium': 0.08,
  'ebpf': 0.09,
  'service mesh': 0.07,

  // Systems & Architecture
  'distributed systems': 0.09,
  'microservices': 0.06,
  'scalability': 0.07,
  'reliability': 0.07,
  'high availability': 0.07,
  'fault tolerance': 0.07,
  'chaos engineering': 0.08,
  'incident response': 0.07,
  'postmortem': 0.06,
  'slo': 0.08,
  'sli': 0.07,
  'error budget': 0.08,

  // Container & Orchestration
  'container': 0.06,
  'orchestration': 0.05,
  'linux': 0.05,
  'systemd': 0.06,

  // Programming
  'golang': 0.07,
  'go lang': 0.07,
  'python': 0.04,
  'rust': 0.05,
  'bash': 0.04,

  // Career opportunities
  'hackathon': 0.06,
  'open source': 0.05,
  'gsoc': 0.07,
  'lfx': 0.07,
  'internship': 0.05,
  'mentorship': 0.06,
  'fellowship': 0.06,
  'scholarship': 0.05,
  'conference': 0.04,
  'kubecon': 0.09,

  // Data & ML Ops
  'mlops': 0.07,
  'data pipeline': 0.05,
  'airflow': 0.05,
  'kafka': 0.06,

  // Security
  'devsecops': 0.08,
  'security engineer': 0.06,
  'zero trust': 0.06,
};

// Negative keywords that lower relevance
const NEGATIVE_KEYWORDS: Record<string, number> = {
  'frontend': -0.08,
  'react developer': -0.06,
  'ui/ux': -0.08,
  'graphic design': -0.10,
  'marketing': -0.10,
  'sales': -0.12,
  'accounting': -0.12,
  'legal': -0.10,
  'hr manager': -0.10,
  'content writer': -0.10,
  'social media': -0.10,
};

// Source quality multipliers
const SOURCE_MULTIPLIERS: Record<string, number> = {
  'cncf': 1.2,
  'kubernetes': 1.2,
  'hashicorp': 1.15,
  'google_opensource': 1.15,
  'cloudflare': 1.1,
  'netflix': 1.1,
  'datadog': 1.1,
  'pagerduty': 1.1,
  'the_new_stack': 1.05,
  'github': 1.05,
  'hackernews': 1.0,
  'devto': 0.9,
  'dzone': 0.85,
};

export function calculateRelevanceScore(
  title: string,
  description: string,
  source: string,
  type: string,
): number {
  const content = `${title} ${description}`.toLowerCase();
  let score = 0.3; // base score
  let matchCount = 0;

  // Positive keyword matching
  for (const [keyword, weight] of Object.entries(KEYWORD_WEIGHTS)) {
    if (content.includes(keyword.toLowerCase())) {
      score += weight;
      matchCount++;
    }
  }

  // Negative keyword matching
  for (const [keyword, weight] of Object.entries(NEGATIVE_KEYWORDS)) {
    if (content.includes(keyword.toLowerCase())) {
      score += weight; // weight is already negative
    }
  }

  // Bonus for multiple keyword matches (synergy)
  if (matchCount >= 5) score += 0.05;
  if (matchCount >= 8) score += 0.05;
  if (matchCount >= 12) score += 0.05;

  // Source quality multiplier
  const sourceKey = source.toLowerCase().replace(/[^a-z0-9_]/g, '_');
  let multiplier = 1.0;
  for (const [key, mult] of Object.entries(SOURCE_MULTIPLIERS)) {
    if (sourceKey.includes(key)) {
      multiplier = Math.max(multiplier, mult);
    }
  }
  score *= multiplier;

  // Type bonus
  if (type === 'opensource') score += 0.05;
  if (type === 'hackathon') score += 0.03;

  // Title has stronger signal than description
  const titleLower = title.toLowerCase();
  for (const keyword of ['devops', 'sre', 'site reliability', 'platform engineer', 'kubernetes', 'infrastructure']) {
    if (titleLower.includes(keyword)) {
      score += 0.05;
      break;
    }
  }

  // Clamp to 0.05 - 0.99
  return Math.max(0.05, Math.min(0.99, Math.round(score * 100) / 100));
}

/**
 * Extract smart tags from content based on keyword matching
 */
export function extractSmartTags(
  title: string,
  description: string,
  baseTags: string[] = [],
): string[] {
  const content = `${title} ${description}`.toLowerCase();
  const tags = new Set(baseTags);

  const TAG_PATTERNS: Record<string, string[]> = {
    'kubernetes': ['kubernetes', 'k8s', 'kubectl', 'kubecon'],
    'docker': ['docker', 'container', 'dockerfile'],
    'terraform': ['terraform', 'hcl', 'infrastructure as code'],
    'aws': ['aws', 'amazon web services', 'ec2', 's3', 'lambda', 'eks'],
    'gcp': ['gcp', 'google cloud', 'gke'],
    'azure': ['azure', 'aks'],
    'ci-cd': ['ci/cd', 'cicd', 'continuous integration', 'continuous delivery', 'github actions', 'jenkins'],
    'monitoring': ['monitoring', 'observability', 'prometheus', 'grafana', 'datadog', 'opentelemetry'],
    'security': ['security', 'devsecops', 'zero trust', 'vulnerability'],
    'golang': ['golang', 'go lang', ' go '],
    'python': ['python'],
    'linux': ['linux', 'systemd', 'kernel'],
    'networking': ['networking', 'envoy', 'istio', 'cilium', 'service mesh', 'ebpf'],
    'distributed-systems': ['distributed systems', 'microservices', 'scalability'],
    'incident-response': ['incident', 'postmortem', 'on-call', 'oncall', 'slo', 'sli'],
    'mlops': ['mlops', 'ml pipeline', 'machine learning ops'],
    'gitops': ['gitops', 'argocd', 'flux'],
    'big-tech': ['google', 'microsoft', 'amazon', 'nvidia', 'meta', 'apple', 'netflix'],
  };

  for (const [tag, patterns] of Object.entries(TAG_PATTERNS)) {
    if (patterns.some(p => content.includes(p))) {
      tags.add(tag);
    }
  }

  return Array.from(tags).slice(0, 12);
}
