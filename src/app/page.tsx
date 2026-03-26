'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, Briefcase, CheckCircle, Clock } from 'lucide-react';
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

interface Signal {
  keyword: string;
  mentionCount: number;
  trend: 'up' | 'down' | 'stable' | 'spike';
  trendValue?: number;
}

interface StatCard {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
}

export default function Dashboard() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [signals, setSignals] = useState<Signal[]>([]);
  const [applications, setApplications] = useState(0);
  const [reportingOpportunity, setReportingOpportunity] = useState<Opportunity | null>(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching data from APIs
    const timer = setTimeout(() => {
      // Mock opportunities data
      setOpportunities([
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
      ]);

      // Mock signals data
      setSignals([
        { keyword: 'eBPF', mentionCount: 285, trend: 'spike', trendValue: 45 },
        { keyword: 'Kubernetes', mentionCount: 452, trend: 'up', trendValue: 12 },
        { keyword: 'Terraform', mentionCount: 328, trend: 'up', trendValue: 8 },
        { keyword: 'Prometheus', mentionCount: 218, trend: 'stable', trendValue: 2 },
        { keyword: 'AWS Lambda', mentionCount: 195, trend: 'down', trendValue: -5 },
      ]);

      setApplications(7);
      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  const handleReportClick = (opportunity: Opportunity) => {
    setReportingOpportunity(opportunity);
    setIsReportModalOpen(true);
  };

  const statCards: StatCard[] = [
    {
      label: '총 기회',
      value: opportunities.length,
      icon: <Briefcase size={24} />,
      color: 'from-blue-500 to-blue-600',
    },
    {
      label: '지원 중',
      value: applications,
      icon: <CheckCircle size={24} />,
      color: 'from-green-500 to-green-600',
    },
    {
      label: '상승 신호',
      value: signals.filter((s) => s.trend === 'up' || s.trend === 'spike').length,
      icon: <TrendingUp size={24} />,
      color: 'from-purple-500 to-purple-600',
    },
    {
      label: '급한 마감',
      value: opportunities.filter((o) => {
        const daysLeft = Math.floor(
          (new Date(o.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
        );
        return daysLeft < 7 && daysLeft >= 0;
      }).length,
      icon: <Clock size={24} />,
      color: 'from-orange-500 to-orange-600',
    },
  ];

  return (
    <div className="p-6 md:p-8 pb-32 md:pb-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">대시보드</h1>
        <p className="text-gray-500">당신의 경력 개발 기회를 한눈에 파악하세요</p>
      </div>

      {/* Stats Grid */}
      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat, idx) => (
            <div key={idx} className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-lg bg-gradient-to-br ${stat.color} text-white`}>
                  {stat.icon}
                </div>
              </div>
              <p className="text-gray-500 text-sm font-medium mb-2">{stat.label}</p>
              <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12">
          <div className="inline-block">
            <div className="animate-spin rounded-full h-8 w-8 border border-gray-300 border-t-indigo-600"></div>
          </div>
          <p className="text-gray-500 mt-3">데이터를 불러오는 중...</p>
        </div>
      )}

      {/* Recent Opportunities */}
      {!loading && (
        <div>
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900">최신 기회</h2>
            <p className="text-sm text-gray-500">관련성 순</p>
          </div>

          <div className="space-y-4">
            {opportunities.slice(0, 10).map((opp) => (
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
