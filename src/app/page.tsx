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
      icon: <Briefcase size={18} />,
      color: 'from-blue-500 to-blue-600',
    },
    {
      label: '지원 중',
      value: applications,
      icon: <CheckCircle size={18} />,
      color: 'from-emerald-500 to-emerald-600',
    },
    {
      label: '상승 신호',
      value: signals.filter((s) => s.trend === 'up' || s.trend === 'spike').length,
      icon: <TrendingUp size={18} />,
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
      icon: <Clock size={18} />,
      color: 'from-rose-500 to-rose-600',
    },
  ];

  return (
    <>
      {/* Header row */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">대시보드</h1>
          <p className="text-sm text-gray-400 mt-0.5">경력 개발 기회를 한눈에</p>
        </div>
        <button
          onClick={handleCrawl}
          disabled={crawling}
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
        >
          <RefreshCw size={14} aria-hidden="true" className={crawling ? 'animate-spin' : ''} />
          {crawling ? '수집 중...' : '수집하기'}
        </button>
      </div>

      {/* Stats Grid — compact */}
      {!loading && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          {statCards.map((stat, idx) => (
            <div key={idx} className="bg-white rounded-xl border border-gray-100 shadow-sm px-4 py-4">
              <div className={`inline-flex p-2 rounded-lg bg-gradient-to-br ${stat.color} text-white mb-3`}>
                {stat.icon}
              </div>
              <p className="text-2xl font-bold text-gray-900 leading-none mb-1">{stat.value}</p>
              <p className="text-xs text-gray-400 font-medium">{stat.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Trending Signals — horizontal scroll, tighter */}
      {!loading && signals.length > 0 && (
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">트렌딩 신호</h2>
          <div className="overflow-x-auto -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 pb-1">
            <div className="flex gap-2 min-w-min">
              {signals.slice(0, 8).map((signal, idx) => {
                const isUp = signal.trend === 'spike' || signal.trend === 'up';
                const trendColor = isUp ? 'text-emerald-600' : signal.trend === 'down' ? 'text-rose-500' : 'text-gray-400';
                const trendChar = isUp ? '↑' : signal.trend === 'down' ? '↓' : '→';
                return (
                  <div
                    key={idx}
                    className="flex-shrink-0 bg-white rounded-lg border border-gray-100 px-3 py-2 shadow-sm"
                  >
                    <p className="text-sm font-semibold text-gray-800">{signal.keyword}</p>
                    <p className={`text-xs ${trendColor}`}>
                      {trendChar} {signal.mentionCount ?? signal.mention_count}
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
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-200 border-t-indigo-600 mx-auto mb-3" />
          <p className="text-sm text-gray-400">데이터를 불러오는 중...</p>
        </div>
      )}

      {/* Error State */}
      {!loading && error && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-6 text-center">
          <p className="text-rose-600 font-semibold mb-1">⚠️ 오류 발생</p>
          <p className="text-rose-500 text-sm mb-3">{error}</p>
          <button
            onClick={fetchData}
            className="text-rose-600 hover:text-rose-700 text-sm font-semibold underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-offset-2 rounded"
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
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                최신 기회 <span className="font-normal text-gray-400 normal-case">· 관련성 순</span>
              </h2>
              <div className="space-y-3">
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
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-8 text-center">
              <p className="text-gray-500 mb-3">아직 수집된 기회가 없습니다</p>
              <button
                onClick={handleCrawl}
                className="text-indigo-600 hover:text-indigo-700 text-sm font-semibold"
              >
                수집하기를 눌러보세요
              </button>
            </div>
          )}
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
    </>
  );
}
