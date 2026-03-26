import { getServiceSupabase } from '@/lib/supabase';
import { calculateRelevanceScore, extractSmartTags } from '@/lib/scoring';

/**
 * Curated list of active/upcoming programs, conferences, and opportunities
 * for DevOps/SRE engineers targeting big tech companies.
 * Updated periodically — these are well-known recurring programs.
 */
interface ProgramEntry {
  title: string;
  organization: string;
  url: string;
  description: string;
  type: 'program' | 'conference';
  deadline: string | null; // YYYY-MM-DD or null
  location: string;
  baseTags: string[];
}

function getCurrentYear(): number {
  return new Date().getFullYear();
}

function getCuratedPrograms(): ProgramEntry[] {
  const year = getCurrentYear();
  return [
    // ===== MENTORSHIP & FELLOWSHIP PROGRAMS =====
    {
      title: `Google Summer of Code ${year}`,
      organization: 'Google',
      url: 'https://summerofcode.withgoogle.com/',
      description: `GSoC ${year}: Open source mentorship program by Google. Contributors work with open source organizations on 12+ week programming projects. Stipends provided. Great for building open source portfolio and getting noticed by big tech.`,
      type: 'program',
      deadline: null,
      location: 'Remote',
      baseTags: ['gsoc', 'google', 'open source', 'mentorship', 'big-tech'],
    },
    {
      title: `LFX Mentorship Program ${year}`,
      organization: 'Linux Foundation',
      url: 'https://mentorship.lfx.linuxfoundation.org/',
      description: `LFX Mentorship by Linux Foundation. Work on CNCF, Kubernetes, Prometheus, Envoy, and other critical open source infrastructure projects. Stipend provided. Multiple terms per year. Ideal for DevOps/SRE career growth.`,
      type: 'program',
      deadline: null,
      location: 'Remote',
      baseTags: ['lfx', 'linux foundation', 'cncf', 'kubernetes', 'mentorship', 'open source'],
    },
    {
      title: `Outreachy Internships ${year}`,
      organization: 'Outreachy',
      url: 'https://www.outreachy.org/',
      description: `Outreachy provides internships in open source and open science. Interns work remotely with mentors from FOSS communities. Many projects involve DevOps, cloud infrastructure, and Kubernetes.`,
      type: 'program',
      deadline: null,
      location: 'Remote',
      baseTags: ['outreachy', 'internship', 'open source', 'diversity'],
    },
    {
      title: `MLH Fellowship ${year}`,
      organization: 'Major League Hacking',
      url: 'https://fellowship.mlh.io/',
      description: `MLH Fellowship: 12-week internship alternative for aspiring software engineers. Work on real open source projects, build portfolio, and connect with tech companies. Multiple tracks including Open Source and Production Engineering.`,
      type: 'program',
      deadline: null,
      location: 'Remote',
      baseTags: ['mlh', 'fellowship', 'open source', 'internship'],
    },
    {
      title: 'CNCF Ambassador Program',
      organization: 'CNCF',
      url: 'https://www.cncf.io/people/ambassadors/',
      description: 'CNCF Ambassador Program recognizes community members passionate about cloud native technologies. Ambassadors get speaking opportunities, event access, and direct connection to the CNCF ecosystem. Great visibility for DevOps/SRE careers.',
      type: 'program',
      deadline: null,
      location: 'Global',
      baseTags: ['cncf', 'ambassador', 'cloud-native', 'kubernetes', 'networking'],
    },
    {
      title: 'AWS Community Builders',
      organization: 'Amazon Web Services',
      url: 'https://aws.amazon.com/developer/community/community-builders/',
      description: 'AWS Community Builders program provides technical resources, education, and networking opportunities for AWS enthusiasts. Get AWS credits, early access to services, and connect with AWS teams. Strong signal for AWS-focused DevOps roles.',
      type: 'program',
      deadline: null,
      location: 'Global',
      baseTags: ['aws', 'amazon', 'community', 'cloud', 'big-tech'],
    },
    {
      title: 'Google Developer Expert (GDE)',
      organization: 'Google',
      url: 'https://developers.google.com/community/experts',
      description: 'Google Developer Experts program for experienced professionals recognized for their expertise in Google technologies (GCP, Kubernetes, etc.). GDEs get access to Google teams, events, and early product previews.',
      type: 'program',
      deadline: null,
      location: 'Global',
      baseTags: ['google', 'gde', 'gcp', 'kubernetes', 'big-tech', 'expert'],
    },
    {
      title: 'Microsoft MVP Program',
      organization: 'Microsoft',
      url: 'https://mvp.microsoft.com/',
      description: 'Microsoft Most Valuable Professional award recognizes exceptional community leaders. MVPs get direct access to Microsoft engineering teams, early product access, and global networking. Strong credential for Azure/Microsoft DevOps roles.',
      type: 'program',
      deadline: null,
      location: 'Global',
      baseTags: ['microsoft', 'mvp', 'azure', 'big-tech', 'community'],
    },
    {
      title: `Kubernetes Contributor Summit ${year}`,
      organization: 'Kubernetes',
      url: 'https://www.kubernetes.dev/events/',
      description: `Kubernetes Contributor Summit brings together new and existing contributors for workshops, discussions, and hackathons. Co-located with KubeCon. Excellent way to break into Kubernetes contribution and meet maintainers.`,
      type: 'conference',
      deadline: null,
      location: 'Various',
      baseTags: ['kubernetes', 'contributor', 'summit', 'open source'],
    },

    // ===== CONFERENCES =====
    {
      title: `KubeCon + CloudNativeCon Europe ${year}`,
      organization: 'CNCF / Linux Foundation',
      url: 'https://events.linuxfoundation.org/kubecon-cloudnativecon-europe/',
      description: `KubeCon + CloudNativeCon Europe ${year}: The Cloud Native Computing Foundation's flagship conference. Thousands of attendees from leading tech companies. Technical talks, workshops, and networking. Must-attend for DevOps/SRE professionals.`,
      type: 'conference',
      deadline: `${year}-03-23`,
      location: 'Amsterdam, Netherlands',
      baseTags: ['kubecon', 'cncf', 'kubernetes', 'cloud-native', 'conference', 'linux foundation'],
    },
    {
      title: `KubeCon + CloudNativeCon North America ${year}`,
      organization: 'CNCF / Linux Foundation',
      url: 'https://events.linuxfoundation.org/kubecon-cloudnativecon-north-america/',
      description: `KubeCon + CloudNativeCon NA ${year}: Largest cloud native conference in North America. Keynotes from Google, AWS, Microsoft engineers. CFP and scholarship opportunities available.`,
      type: 'conference',
      deadline: null,
      location: 'North America',
      baseTags: ['kubecon', 'cncf', 'kubernetes', 'cloud-native', 'conference', 'linux foundation'],
    },
    {
      title: `Open Source Summit North America ${year}`,
      organization: 'Linux Foundation',
      url: 'https://events.linuxfoundation.org/open-source-summit-north-america/',
      description: `Open Source Summit NA ${year}: Premier event for open source developers, technologists, and leaders. Covers Linux, cloud infrastructure, containers, AI/ML, security, and more. CFP and diversity scholarships available.`,
      type: 'conference',
      deadline: null,
      location: 'North America',
      baseTags: ['open source', 'linux foundation', 'conference', 'linux', 'cloud'],
    },
    {
      title: `Open Source Summit Europe ${year}`,
      organization: 'Linux Foundation',
      url: 'https://events.linuxfoundation.org/open-source-summit-europe/',
      description: `Open Source Summit Europe ${year}: European edition of the Linux Foundation's flagship open source event. Technical talks, networking, and career opportunities in open source infrastructure.`,
      type: 'conference',
      deadline: null,
      location: 'Europe',
      baseTags: ['open source', 'linux foundation', 'conference', 'europe'],
    },
    {
      title: `MCP Dev Summit North America ${year}`,
      organization: 'Agentic AI Foundation',
      url: 'https://events.linuxfoundation.org/mcp-dev-summit-north-america/',
      description: `MCP Dev Summit NA ${year}: Premier gathering for builders and contributors advancing AI development with the Model Context Protocol. Explore open standards and shared infrastructure for AI agents.`,
      type: 'conference',
      deadline: `${year}-04-03`,
      location: 'New York, USA',
      baseTags: ['mcp', 'ai', 'conference', 'linux foundation'],
    },
    {
      title: `HashiConf ${year}`,
      organization: 'HashiCorp',
      url: 'https://hashiconf.com/',
      description: `HashiConf ${year}: HashiCorp's annual conference for infrastructure automation. Deep dives into Terraform, Vault, Consul, Nomad. Essential for DevOps/SRE engineers using HashiCorp stack.`,
      type: 'conference',
      deadline: null,
      location: 'TBD',
      baseTags: ['hashicorp', 'terraform', 'vault', 'conference', 'infrastructure'],
    },
    {
      title: `AWS re:Invent ${year}`,
      organization: 'Amazon Web Services',
      url: 'https://reinvent.awsevents.com/',
      description: `AWS re:Invent ${year}: Amazon's massive annual cloud conference. New service launches, hands-on labs, certification opportunities. Key event for anyone targeting AWS roles.`,
      type: 'conference',
      deadline: null,
      location: 'Las Vegas, USA',
      baseTags: ['aws', 'amazon', 'conference', 'cloud', 'big-tech'],
    },
    {
      title: `Google Cloud Next ${year}`,
      organization: 'Google Cloud',
      url: 'https://cloud.withgoogle.com/next',
      description: `Google Cloud Next ${year}: Google's premier cloud conference. GCP announcements, Kubernetes updates, AI/ML innovations. Networking with Google engineers and recruiters.`,
      type: 'conference',
      deadline: null,
      location: 'TBD',
      baseTags: ['google', 'gcp', 'conference', 'cloud', 'big-tech', 'kubernetes'],
    },
    {
      title: `Microsoft Build ${year}`,
      organization: 'Microsoft',
      url: 'https://build.microsoft.com/',
      description: `Microsoft Build ${year}: Microsoft's annual developer conference. Azure, GitHub, VS Code, and AI announcements. Free virtual attendance. Key for Microsoft/Azure career track.`,
      type: 'conference',
      deadline: null,
      location: 'Seattle, USA + Virtual',
      baseTags: ['microsoft', 'azure', 'conference', 'big-tech', 'github'],
    },
    {
      title: `GopherCon ${year}`,
      organization: 'GopherCon',
      url: 'https://www.gophercon.com/',
      description: `GopherCon ${year}: Largest Go conference. Go is the dominant language in cloud native/DevOps tooling (Kubernetes, Docker, Terraform). Essential for DevOps engineers working with Go.`,
      type: 'conference',
      deadline: null,
      location: 'TBD',
      baseTags: ['golang', 'conference', 'cloud-native'],
    },
    {
      title: `NVIDIA GTC ${year}`,
      organization: 'NVIDIA',
      url: 'https://www.nvidia.com/gtc/',
      description: `NVIDIA GTC ${year}: GPU Technology Conference. AI infrastructure, MLOps, GPU computing. Key for engineers targeting NVIDIA or AI infrastructure roles.`,
      type: 'conference',
      deadline: null,
      location: 'TBD + Virtual',
      baseTags: ['nvidia', 'gpu', 'ai', 'conference', 'big-tech', 'mlops'],
    },
    {
      title: `SREcon ${year}`,
      organization: 'USENIX',
      url: 'https://www.usenix.org/conferences/byname/925',
      description: `SREcon ${year}: USENIX's Site Reliability Engineering conference. Deep technical talks on reliability, incident management, SLOs, and production engineering. THE conference for SRE professionals.`,
      type: 'conference',
      deadline: null,
      location: 'Various',
      baseTags: ['sre', 'usenix', 'conference', 'reliability', 'incident-response'],
    },
    {
      title: `Chaos Carnival ${year}`,
      organization: 'ChaosNative / LitmusChaos',
      url: 'https://chaoscarnival.io/',
      description: `Chaos Carnival ${year}: Community conference on chaos engineering. Learn resilience testing, Litmus, chaos experiments at scale. Free virtual event. Relevant for SRE roles.`,
      type: 'conference',
      deadline: null,
      location: 'Virtual',
      baseTags: ['chaos engineering', 'conference', 'sre', 'reliability'],
    },

    // ===== CERTIFICATION & TRAINING =====
    {
      title: 'CKA - Certified Kubernetes Administrator',
      organization: 'CNCF / Linux Foundation',
      url: 'https://training.linuxfoundation.org/certification/certified-kubernetes-administrator-cka/',
      description: 'CKA certification validates skills in Kubernetes cluster administration. Recognized globally by employers including Google, AWS, Microsoft. Essential credential for DevOps/SRE targeting cloud native roles.',
      type: 'program',
      deadline: null,
      location: 'Online',
      baseTags: ['cka', 'kubernetes', 'certification', 'cncf', 'linux foundation'],
    },
    {
      title: 'CKAD - Certified Kubernetes Application Developer',
      organization: 'CNCF / Linux Foundation',
      url: 'https://training.linuxfoundation.org/certification/certified-kubernetes-application-developer-ckad/',
      description: 'CKAD certification for Kubernetes application developers. Design, build, and deploy cloud native applications. Complements CKA for full Kubernetes expertise.',
      type: 'program',
      deadline: null,
      location: 'Online',
      baseTags: ['ckad', 'kubernetes', 'certification', 'cncf'],
    },
    {
      title: 'CKS - Certified Kubernetes Security Specialist',
      organization: 'CNCF / Linux Foundation',
      url: 'https://training.linuxfoundation.org/certification/certified-kubernetes-security-specialist/',
      description: 'CKS certification for Kubernetes security. Covers cluster hardening, system hardening, supply chain security, monitoring, and runtime security. Advanced credential for security-focused SRE roles.',
      type: 'program',
      deadline: null,
      location: 'Online',
      baseTags: ['cks', 'kubernetes', 'security', 'certification', 'cncf'],
    },
    {
      title: 'AWS Solutions Architect Certification',
      organization: 'Amazon Web Services',
      url: 'https://aws.amazon.com/certification/certified-solutions-architect-associate/',
      description: 'AWS Solutions Architect Associate certification. Demonstrates ability to design distributed systems on AWS. Widely recognized credential for cloud/DevOps roles at companies using AWS.',
      type: 'program',
      deadline: null,
      location: 'Online',
      baseTags: ['aws', 'certification', 'cloud', 'architecture'],
    },
    {
      title: 'Terraform Associate Certification',
      organization: 'HashiCorp',
      url: 'https://www.hashicorp.com/certifications/terraform-associate',
      description: 'HashiCorp Terraform Associate certification validates knowledge of IaC concepts and Terraform skills. Increasingly required for DevOps/SRE positions at companies using Terraform.',
      type: 'program',
      deadline: null,
      location: 'Online',
      baseTags: ['terraform', 'hashicorp', 'certification', 'infrastructure'],
    },
  ];
}

export async function crawlPrograms(): Promise<number> {
  const supabase = getServiceSupabase();
  const programs = getCuratedPrograms();
  const rows: Record<string, unknown>[] = [];

  for (const prog of programs) {
    const score = calculateRelevanceScore(prog.title, prog.description, prog.organization, prog.type);
    const tags = extractSmartTags(prog.title, prog.description, prog.baseTags);

    rows.push({
      type: prog.type,
      title: prog.title,
      organization: prog.organization,
      url: prog.url,
      description: prog.description,
      location: prog.location,
      tags,
      eligibility: 'anyone',
      status: 'active',
      deadline: prog.deadline,
      source_url: prog.url,
      crawl_depth: 0,
      relevance_score: score,
      raw_data: { source: 'curated', category: prog.type },
    });
  }

  console.log(`Programs: ${rows.length} curated entries to check`);

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
      console.error('Programs insert error:', error.message);
    } else {
      inserted++;
    }
  }

  console.log(`Programs: inserted ${inserted} new entries`);
  return inserted;
}
