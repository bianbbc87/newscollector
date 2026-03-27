'use client';

import { useState, useMemo } from 'react';
import { TrendingUp, TrendingDown, Minus, Zap } from 'lucide-react';

interface Signal {
  keyword: string;
  mentionCount: number;
  trend: 'up' | 'down' | 'stable' | 'spike';
  trendValue?: number;
  previousCount?: number;
}

const mockSignals: Signal[] = [
  { keyword: 'eBPF', mentionCount: 285, trend: 'spike', trendValue: 45, previousCount: 196 },
  {
    keyword: 'Kubernetes',
    mentionCount: 452,
    trend: 'up',
    trendValue: 12,
    previousCount: 403,
  },
  { keyword: 'Terraform', mentionCount: 328, trend: 'up', trendValue: 8, previousCount: 303 },
  {
    keyword: 'Prometheus',
    mentionCount: 218,
    trend: 'stable',
    trendValue: 2,
    previousCount: 214,
  },
  {
    keyword: 'AWS Lambda',
    mentionCount: 195,
    trend: 'down',
    trendValue: -5,
    previousCount: 205,
  },
  {
    keyword: 'ArgoCD',
    mentionCount: 156,
    trend: 'spike',
    trendValue: 38,
    previousCount: 113,
  },
  {
    keyword: 'GitOps',
    mentionCount: 287,
    trend: 'up',
    trendValue: 15,
    previousCount: 250,
  },
  {
    keyword: 'Service Mesh',
    mentionCount: 142,
    trend: 'stable',
    trendValue: 1,
    previousCount: 141,
  },
  {
    keyword: 'Observability',
    mentionCount: 368,
    trend: 'up',
    trendValue: 10,
    previousCount: 335,
  },
  { keyword: 'Container Security', mentionCount: 104, trend: 'down', trendValue: -3, previousCount: 107 },
];

const periodOptions = [
  { label: '1주', value: '1w' },
  { label: '1개월', value: '1m' },
  { label: '3개월', value: '3m' },
  { label: '6개월', value: '6m' },
  { label: '1년', value: '1y' },
];

export default function SignalsPage() {
  const [period, setPeriod] = useState<string>('1m');
  const [signals, setSignals] = useState<Signal[]>(mockSignals);

  // Sort by mention count
  const sortedSignals = useMemo(() => {
    return [...signals].sort((a, b) => b.mentionCount - a.mentionCount);
  }, [signals]);

  // Get max mention count for scaling
  const maxMentions = Math.max(...sortedSignals.map((s) => s.mentionCount), 1);

  const getTrendIcon = (trend: Signal['trend'], trendValue?: number) => {
    switch (trend) {
      case 'spike':
        return (
          <div className="flex items-center gap-1 text-red-600">
            <Zap size={16} />
            <span className="text-sm font-semibold">+{trendValue}%</span>
          </div>
        );
      case 'up':
        return (
          <div className="flex items-center gap-1 text-green-600">
            <TrendingUp size={16} />
            <span className="text-sm font-semibold">+{trendValue}%</span>
          </div>
        );
      case 'down':
        return (
          <div className="flex items-center gap-1 text-red-600">
            <TrendingDown size={16} />
            <span className="text-sm font-semibold">{trendValue}%</span>
          </div>
        );
      case 'stable':
        return (
          <div className="flex items-center gap-1 text-gray-500">
            <Minus size={16} />
            <span className="text-sm font-semibold">보합</span>
          </div>
        );
      default:
        return null;
    }
  };

  const getTrendColor = (trend: Signal['trend']) => {
    switch (trend) {
      case 'spike':
        return 'bg-gradient-to-r from-red-600 to-red-500';
      case 'up':
        return 'bg-gradient-to-r from-green-600 to-green-500';
      case 'down':
        return 'bg-gradient-to-r from-red-500 to-red-400';
      case 'stable':
        return 'bg-gradient-to-r from-gray-400 to-gray-300';
      default:
        return 'bg-indigo-600';
    }
  };

  return (
    <div className="p-6 md:p-10 lg:p-12 pb-32 md:pb-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">신호</h1>
        <p className="text-gray-500">DevOps/SRE 분야의 주요 키워드 및 트렌드</p>
      </div>

      {/* Period Filter */}
      <div className="mb-8 flex flex-wrap gap-2">
        <span className="text-sm text-gray-500 flex items-center">기간:</span>
        {periodOptions.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setPeriod(opt.value)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
              period === opt.value
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          <p className="text-gray-500 text-sm mb-2">상승 키워드</p>
          <p className="text-2xl font-bold text-green-600">
            {signals.filter((s) => s.trend === 'up' || s.trend === 'spike').length}
          </p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          <p className="text-gray-500 text-sm mb-2">총 언급 수</p>
          <p className="text-2xl font-bold text-indigo-600">
            {signals.reduce((sum, s) => sum + s.mentionCount, 0)}
          </p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          <p className="text-gray-500 text-sm mb-2">추적 중인 키워드</p>
          <p className="text-2xl font-bold text-purple-600">{signals.length}</p>
        </div>
      </div>

      {/* Signals List */}
      <div className="space-y-4">
        {sortedSignals.map((signal) => {
          const barWidth = (signal.mentionCount / maxMentions) * 100;

          return (
            <div key={signal.keyword} className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
              <div className="flex items-center justify-between gap-4 mb-4">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 text-lg">{signal.keyword}</h3>
                  <p className="text-sm text-gray-500">
                    {signal.mentionCount}개의 언급
                  </p>
                </div>

                <div className="flex-shrink-0">
                  {getTrendIcon(signal.trend, signal.trendValue)}
                </div>
              </div>

              {/* Bar Chart */}
              <div className="w-full bg-gray-200 rounded-full h-8 overflow-hidden">
                <div
                  className={`h-full ${getTrendColor(signal.trend)} transition-all duration-500 flex items-center justify-end pr-3`}
                  style={{ width: `${barWidth}%` }}
                >
                  {barWidth > 30 && (
                    <span className="text-white text-xs font-bold">{signal.mentionCount}</span>
                  )}
                </div>
              </div>

              {/* Change Info */}
              {signal.previousCount !== undefined && (
                <div className="flex items-center gap-2 mt-3">
                  <span className="text-xs text-gray-400">이전 기간:</span>
                  <span className="text-xs text-gray-500">{signal.previousCount}개</span>
                  <span className={`text-xs font-semibold ${
                    signal.trend === 'up' || signal.trend === 'spike'
                      ? 'text-green-600'
                      : signal.trend === 'down'
                      ? 'text-red-600'
                      : 'text-gray-500'
                  }`}>
                    {signal.trend === 'spike' || signal.trend === 'up'
                      ? '↑'
                      : signal.trend === 'down'
                      ? '↓'
                      : '→'}{' '}
                    {Math.abs(signal.mentionCount - (signal.previousCount || 0))}개
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Insights */}
      <div className="mt-8 bg-white rounded-lg border border-indigo-200 border-l-4 border-l-indigo-600 shadow-sm p-6">
        <h3 className="font-semibold text-gray-900 mb-3">인사이트</h3>
        <ul className="space-y-2 text-sm text-gray-600">
          <li>• eBPF와 ArgoCD가 급상승하고 있습니다 - 최신 기술을 학습할 좋은 기회입니다</li>
          <li>
            • GitOps와 Observability는 계속 상승 추세입니다 - 관련 기술 습득이 추천됩니다
          </li>
          <li>
            • Kubernetes는 여전히 주요 관심 영역이며, 마스터 수준의 지식이 경쟁력을 줍니다
          </li>
          <li>• 새로운 기회를 찾을 때 상승 중인 신호의 키워드를 활용해보세요</li>
        </ul>
      </div>
    </div>
  );
}
