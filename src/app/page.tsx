'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, Briefcase, CheckCircle, Clock, RefreshCw } from 'lucide-react';
import OpportunityCard from '@/components/OpportunityCard';
import ReportModal from '@/components/ReportModal';

interface Opportunity {
  id: string;
  title: string;
  organization: string;
  type: 'job' | 'hackathon' | 'program' | 'conference' | 'opensource' | 'trend' | 'paper';
  tags: Array<{ name: string; category?: string }>;
  deadline: string;
  relevance_score?: number;
  relevanceScore: number;
  description?: string;
  link?: string;
  url?: string;
  posted_at?: string;
  postedAt?: string;
}

interface Signal {
  keyword: string;
  mention_count: number;
  mentionCount?: number;
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
  const [crawling, setCrawling] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      const [oppRes, signalRes] = await Promise.all([
        fetch('/api/opportunities?limit=20&sort=relevance'),
        fetch('/api/signals?limit=10'),
      ]);

      if (oppRes.ok) {
        const oppData = await oppRes.json();
        const normalized = (oppData.data || []).map((opp: any) => ({
          ...opp,
          relevanceScore: opp.relevance_score || 0.5,
          postedAt: opp.posted_at,
        }));
        setOpportunities(normalized);
      }

      if (signalRes.ok) {
        const signalData = await signalRes.json();
        const normalized = (signalData.data || []).map((sig: any) => ({
          ...sig,
          mentionCount: sig.mention_count,
        }));
        setSignals(normalized);
      }

      setApplications(7);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCrawl = async () => {
    try {
      setCrawling(true);
      const response = await fetch('/api/crawl', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ manual: true }),
      });

      if (response.ok) {
        await fetchData();
      }
    } catch (error) {
      console.error('Crawl error:', error);
    } finally {
      setCrawling(false);
    }
  };

  const handleReportClick = (opportunity: Opportunity) => {
    setReportingOpportunity(opportunity);
    setIsReportModalOpen(true);
  };

  const statCards: StatCard[] = [
    {
      label: '총 기회',
      value: opportunities.length,
      icon: <Briefcase size={28} />,
      color: 'from-blue-500 to-blue-600',
    },
    {
      label: '지원 중',
      value: applications,
      icon: <CheckCircle size={28} />,
      color: 'from-emerald-500 to-emerald-600',
    },
    {
      label: '상승 신호',
      value: signals.filter((s) => s.trend === 'up' || s.trend === 'spike').length,
      icon: <TrendingUp size={28} />,
      color: 'from-indigo-500 to-indigo-600',
    },
    {
      label: '급한 마감',
      value: opportunities.filter((o) => {
        const daysLeft = Math.floor(
          (new Date(o.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
        );
        return daysLeft < 7 && daysLeft >= 0;
      }).length,
      icon: <Clock size={28} />,
      color: 'from-rose-500 to-rose-600',
    },
  ];

  return (
    <div className="bg-gray-50 min-h-screen pb-32 md:pb-8">
      <div className="p-8 md:p-10">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">대시보드</h1>
          <p className="text-gray-500">당신의 경력 개발 기회를 한눈에 파악하세요</p>
        </div>

        {/* Action Button */}
        <div className="mb-12">
          <button
            onClick={handleCrawl}
            disabled={crawling}
            className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw size={18} className={crawling ? 'animate-spin' : ''} />
            {crawling ? '수집 중...' : '지금 수집하기'}
          </button>
        </div>

        {/* Stats Grid */}
        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {statCards.map((stat, idx) => (
              <div key={idx} className="bg-white rounded-xl border border-gray-100 shadow-sm p-8">
                <div className="flex items-start justify-between mb-6">
                  <div className={`p-4 rounded-xl bg-gradient-to-br ${stat.color} text-white`}>
                    {stat.icon}
                  </div>
                </div>
                <p className="text-gray-500 text-sm font-semibold mb-2">{stat.label}</p>
                <p className="text-4xl font-bold text-gray-900">{stat.value}</p>
              </div>
            ))}
          </div>
        )}

        {/* Trending Signals */}
        {!loading && signals.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-5">트렌딩 신호</h2>
            <div className="overflow-x-auto pb-2 -mx-8 px-8">
              <div className="flex gap-4 min-w-min">
                {signals.slice(0, 8).map((signal, idx) => {
                  const trendIcon = signal.trend === 'spike' ? '📈' : signal.trend === 'up' ? '↑' : signal.trend === 'down' ? '↓' : '→';
                  const trendColor = signal.trend === 'spike' || signal.trend === 'up' ? 'text-emerald-600' : signal.trend === 'down' ? 'text-rose-600' : 'text-gray-600';
                  return (
                    <div
                      key={idx}
                      className="flex-shrink-0 bg-white rounded-lg border border-gray-100 px-4 py-3 shadow-sm hover:shadow-md transition-shadow"
                    >
                      <p className="font-semibold text-gray-900">{signal.keyword}</p>
                      <p className={`text-sm ${trendColor}`}>
                        {trendIcon} {signal.mentionCount || signal.mention_count} mentions
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-16">
            <div className="inline-block mb-4">
              <div className="animate-spin rounded-full h-10 w-10 border-2 border-gray-300 border-t-indigo-600"></div>
            </div>
            <p className="text-gray-500">데이터를 불러오는 중...</p>
          </div>
        )}

        {/* Recent Opportunities */}
        {!loading && (
          <div>
            {opportunities.length > 0 ? (
              <>
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">최신 기회</h2>
                  <p className="text-sm text-gray-500">관련성 순</p>
                </div>

                <div className="space-y-5">
                  {opportunities.map((opp) => (
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
              </>
            ) : (
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-12 text-center">
                <p className="text-gray-500 mb-4 text-lg">아직 수집된 기회가 없습니다</p>
                <button
                  onClick={handleCrawl}
                  className="text-indigo-600 hover:text-indigo-700 font-semibold"
                >
                  '지금 수집하기'를 눌러보세요!
                </button>
              </div>
            )}
          </div>
        )}
      </div>

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
