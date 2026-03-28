'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, Briefcase, CheckCircle, Clock, RefreshCw } from 'lucide-react';
import OpportunityCard from '@/components/OpportunityCard';
import ReportModal from '@/components/ReportModal';

// Dashboard view-model types.
// These align with OpportunityCard's internal interface.
// TODO: migrate OpportunityCard to use @/types/index.ts canonical types,
// then remove these local definitions.
interface DashboardOpportunity {
  id: string;
  title: string;
  organization: string;
  type: 'job' | 'hackathon' | 'program' | 'conference' | 'opensource' | 'trend' | 'paper';
  tags: Array<{ name: string; category?: string }>;
  deadline: string | null;
  relevance_score?: number;
  relevanceScore: number;
  description?: string;
  link?: string;
  url?: string;
  posted_at?: string;
  postedAt?: string;
}

interface DashboardSignal {
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
  const [opportunities, setOpportunities] = useState<DashboardOpportunity[]>([]);
  const [signals, setSignals] = useState<DashboardSignal[]>([]);
  const [applications, setApplications] = useState(0);
  const [reportingOpportunity, setReportingOpportunity] = useState<DashboardOpportunity | null>(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [crawling, setCrawling] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [oppRes, signalRes, appRes] = await Promise.all([
        fetch('/api/opportunities?limit=20&sort=relevance'),
        fetch('/api/signals?limit=10'),
        fetch('/api/applications'),
      ]);

      if (oppRes.ok) {
        const oppData = await oppRes.json();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const normalized = (oppData.data || []).map((opp: any): DashboardOpportunity => ({
          ...opp,
          relevanceScore: Math.round((opp.relevance_score || 0.5) * 100),
          postedAt: opp.posted_at || opp.created_at,
          deadline: opp.deadline || null,
          tags: Array.isArray(opp.tags)
            ? opp.tags.map((t: unknown) => typeof t === 'string' ? { name: t } : t as { name: string; category?: string })
            : [],
        }));
        setOpportunities(normalized);
      }

      if (signalRes.ok) {
        const signalData = await signalRes.json();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const normalized = (signalData.data || []).map((sig: any): DashboardSignal => ({
          ...sig,
          mentionCount: sig.mention_count,
        }));
        setSignals(normalized);
      }

      if (appRes.ok) {
        const appData = await appRes.json();
        setApplications(appData.total ?? (appData.data?.length || 0));
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('데이터를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.');
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

  const handleReportClick = (opportunity: DashboardOpportunity) => {
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
        if (!o.deadline) return false;
        const d = new Date(o.deadline);
        if (isNaN(d.getTime())) return false;
        const daysLeft = Math.floor((d.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
        return daysLeft < 7 && daysLeft >= 0;
      }).length,
      icon: <Clock size={28} />,
      color: 'from-rose-500 to-rose-600',
    },
  ];

  return (
    <div className="bg-gray-50 min-h-screen pb-32 md:pb-8">
      <div className="p-6 md:p-10 lg:p-12">
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

        {/* Error State */}
        {!loading && error && (
          <div className="bg-rose-50 border border-rose-200 rounded-xl p-8 text-center">
            <p className="text-rose-600 font-semibold mb-2">⚠️ 오류 발생</p>
            <p className="text-rose-500 text-sm mb-4">{error}</p>
            <button
              onClick={fetchData}
              className="text-rose-600 hover:text-rose-700 font-semibold underline text-sm"
            >
              다시 시도
            </button>
          </div>
        )}

        {/* Recent Opportunities */}
        {!loading && !error && (
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
