'use client';

import { useState, useMemo } from 'react';
import { Search, Filter, X } from 'lucide-react';
import OpportunityCard from '@/components/OpportunityCard';
import ReportModal from '@/components/ReportModal';

interface Opportunity {
  id: string;
  title: string;
  organization: string;
  type: 'job' | 'hackathon' | 'program' | 'conference' | 'opensource' | 'trend' | 'paper';
  tags: Array<{ name: string; category?: string }>;
  deadline: string;
  relevanceScore: number;
  description?: string;
  link?: string;
  postedAt?: string;
}

// Mock data - same as dashboard
const mockOpportunities: Opportunity[] = [
  {
    id: '1',
    title: 'Senior SRE Engineer',
    organization: 'Google Cloud',
    type: 'job',
    tags: [{ name: 'Kubernetes' }, { name: 'Python' }, { name: 'GCP' }],
    deadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
    relevanceScore: 92,
    description:
      'We are looking for a Senior SRE Engineer to join our Google Cloud team. You will work on infrastructure automation, monitoring, and reliability improvements.',
    postedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '2',
    title: 'DevOps Hackathon 2026',
    organization: 'AWS Community',
    type: 'hackathon',
    tags: [{ name: 'Infrastructure' }, { name: 'AWS' }, { name: 'Terraform' }],
    deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    relevanceScore: 85,
    description:
      '최고의 DevOps 엔지니어들이 모여 인프라 자동화 솔루션을 개발하는 해커톤입니다. 상금 $10,000',
    postedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '3',
    title: 'eBPF and Linux Kernel Trends',
    organization: 'LWN.net',
    type: 'trend',
    tags: [{ name: 'eBPF' }, { name: 'Linux' }, { name: 'Systems' }],
    deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    relevanceScore: 78,
    description:
      'Latest trends in eBPF and Linux kernel development. Increasingly important for modern observability platforms.',
    postedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '4',
    title: 'KubeCon North America 2026',
    organization: 'Cloud Native Computing Foundation',
    type: 'conference',
    tags: [{ name: 'Kubernetes' }, { name: 'CloudNative' }, { name: 'Networking' }],
    deadline: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
    relevanceScore: 88,
    description:
      'The largest cloud native conference in North America. CFP deadline approaching. Early bird registration open.',
    postedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '5',
    title: 'Prometheus Observability Program',
    organization: 'Cloud Native Computing Foundation',
    type: 'program',
    tags: [{ name: 'Monitoring' }, { name: 'Prometheus' }, { name: 'OpenSource' }],
    deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(),
    relevanceScore: 81,
    description:
      'Join the Prometheus community program to contribute to monitoring infrastructure. Mentorship available.',
    postedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '6',
    title: 'etcd Contributors Initiative',
    organization: 'Kubernetes',
    type: 'opensource',
    tags: [{ name: 'etcd' }, { name: 'Kubernetes' }, { name: 'Go' }],
    deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
    relevanceScore: 76,
    description:
      'Help improve etcd reliability and performance. Great opportunity to contribute to a critical Kubernetes component.',
    postedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '7',
    title: 'Platform Engineering at Netflix',
    organization: 'Netflix',
    type: 'job',
    tags: [{ name: 'ScalableArchitecture' }, { name: 'Java' }, { name: 'AWS' }],
    deadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(),
    relevanceScore: 87,
    description:
      'Join Netflix platform engineering team working on global scale infrastructure. Work with cutting-edge technologies.',
    postedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '8',
    title: 'Understanding eBPF in Production',
    organization: 'USENIX',
    type: 'paper',
    tags: [{ name: 'eBPF' }, { name: 'Observability' }, { name: 'Research' }],
    deadline: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
    relevanceScore: 72,
    description:
      'A comprehensive research paper on deploying eBPF in production environments. Essential reading for SRE teams.',
    postedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '9',
    title: 'Staff SRE at Stripe',
    organization: 'Stripe',
    type: 'job',
    tags: [{ name: 'Reliability' }, { name: 'Architecture' }, { name: 'Leadership' }],
    deadline: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString(),
    relevanceScore: 93,
    description:
      'Lead reliability efforts across Stripe infrastructure. Shape the future of payment systems reliability.',
    postedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '10',
    title: 'Open Source Observability Summit',
    organization: 'OpenTelemetry',
    type: 'conference',
    tags: [{ name: 'OpenTelemetry' }, { name: 'Observability' }, { name: 'Tracing' }],
    deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
    relevanceScore: 79,
    description:
      'Annual summit for OpenTelemetry community. Network with observability experts and learn about latest developments.',
    postedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

const typeLabels: Record<string, string> = {
  job: '채용',
  hackathon: '해커톤',
  program: '프로그램',
  conference: '컨퍼런스',
  opensource: '오픈소스',
  trend: '트렌드',
  paper: '논문',
};

export default function OpportunitiesPage() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>(mockOpportunities);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [reportingOpportunity, setReportingOpportunity] = useState<Opportunity | null>(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  // Extract all unique tags
  const allTags = useMemo(() => {
    const tags = new Set<string>();
    opportunities.forEach((opp) => {
      opp.tags.forEach((tag) => {
        tags.add(tag.name);
      });
    });
    return Array.from(tags).sort();
  }, [opportunities]);

  // Filter opportunities
  const filteredOpportunities = useMemo(() => {
    return opportunities.filter((opp) => {
      // Search filter
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        if (
          !opp.title.toLowerCase().includes(term) &&
          !opp.organization.toLowerCase().includes(term) &&
          !opp.tags.some((t) => t.name.toLowerCase().includes(term))
        ) {
          return false;
        }
      }

      // Type filter
      if (selectedType && opp.type !== selectedType) {
        return false;
      }

      // Tags filter
      if (selectedTags.length > 0) {
        const oppTags = opp.tags.map((t) => t.name);
        if (!selectedTags.some((tag) => oppTags.includes(tag))) {
          return false;
        }
      }

      return true;
    });
  }, [opportunities, searchTerm, selectedType, selectedTags]);

  const handleReportClick = (opportunity: Opportunity) => {
    setReportingOpportunity(opportunity);
    setIsReportModalOpen(true);
  };

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="section-title mb-2">기회</h1>
        <p className="text-gray-400">모든 기회를 검색하고 필터링하세요</p>
      </div>

      {/* Filter Bar */}
      <div className="mb-6 space-y-4">
        {/* Search */}
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              placeholder="기회 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10"
            />
          </div>
        </div>

        {/* Type and Tags Filter */}
        <div className="flex flex-wrap gap-2 items-center">
          <Filter size={18} className="text-gray-500" />

          {/* Type Dropdown */}
          <select
            value={selectedType || ''}
            onChange={(e) => setSelectedType(e.target.value || null)}
            className="input-field w-48 px-3 py-2"
          >
            <option value="">모든 유형</option>
            {Object.entries(typeLabels).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>

          {/* Clear Filters */}
          {(selectedType || selectedTags.length > 0) && (
            <button
              onClick={() => {
                setSelectedType(null);
                setSelectedTags([]);
              }}
              className="text-gray-400 hover:text-gray-300 flex items-center gap-1 text-sm"
            >
              <X size={16} />
              초기화
            </button>
          )}
        </div>

        {/* Tags Filter */}
        {allTags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                  selectedTags.includes(tag)
                    ? 'bg-blue-600 text-white border border-blue-500'
                    : 'bg-gray-800 text-gray-400 border border-gray-700 hover:border-gray-600'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Results */}
      <div className="mb-4">
        <p className="text-sm text-gray-400">
          {filteredOpportunities.length}개 기회 ({opportunities.length}개 중)
        </p>
      </div>

      {/* Opportunities List */}
      {filteredOpportunities.length > 0 ? (
        <div className="space-y-3">
          {filteredOpportunities.map((opp) => (
            <OpportunityCard
              key={opp.id}
              opportunity={opp}
              onReportClick={handleReportClick}
              onBookmark={(id) => console.log('Bookmarked:', id)}
              onDismiss={(id) => {
                setOpportunities(opportunities.filter((o) => o.id !== id));
              }}
            />
          ))}
        </div>
      ) : (
        <div className="card text-center py-12">
          <p className="text-gray-400 mb-2">일치하는 기회가 없습니다</p>
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedType(null);
              setSelectedTags([]);
            }}
            className="text-blue-400 hover:text-blue-300 text-sm"
          >
            필터 초기화
          </button>
        </div>
      )}

      {/* Report Modal */}
      <ReportModal
        isOpen={isReportModalOpen}
        onClose={() => {
          setIsReportModalOpen(false);
          setReportingOpportunity(null);
        }}
        opportunityId={reportingOpportunity?.id}
      />
    </div>
  );
}
