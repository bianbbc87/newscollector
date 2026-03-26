'use client';

import { useState, useEffect, useMemo } from 'react';
import { Search, X } from 'lucide-react';
import OpportunityCard from '@/components/OpportunityCard';
import ReportModal from '@/components/ReportModal';

interface Opportunity {
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
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [reportingOpportunity, setReportingOpportunity] = useState<Opportunity | null>(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchOpportunities = async (type?: string | null, search?: string) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ limit: '200', sort: 'relevance' });
      if (type) params.set('type', type);
      if (search) params.set('search', search);

      const response = await fetch(`/api/opportunities?${params}`);
      if (response.ok) {
        const data = await response.json();
        const normalized = (data.data || []).map((opp: any) => ({
          ...opp,
          relevanceScore: Math.round((opp.relevance_score || 0.5) * 100),
          postedAt: opp.posted_at || opp.created_at,
          deadline: opp.deadline || null,
          tags: Array.isArray(opp.tags)
            ? opp.tags.map((t: any) => typeof t === 'string' ? { name: t } : t)
            : [],
        }));
        setOpportunities(normalized);
      }
    } catch (error) {
      console.error('Error fetching opportunities:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOpportunities(selectedType, searchTerm);
  }, [selectedType]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchOpportunities(selectedType, searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

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
    <div className="bg-gray-50 min-h-screen pb-32 md:pb-8">
      <div className="p-8 md:p-10">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">기회</h1>
          <p className="text-gray-500">모든 기회를 검색하고 필터링하세요</p>
        </div>

        {/* Filter Bar */}
        <div className="mb-10 space-y-5 bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          {/* Search */}
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="기회 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 pl-10 rounded-full border border-gray-200 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Type Filter Chips */}
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-sm text-gray-500 font-medium">유형:</span>
            <button
              onClick={() => setSelectedType(null)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                selectedType === null
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              모두
            </button>
            {Object.entries(typeLabels).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setSelectedType(selectedType === key ? null : key)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  selectedType === key
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Tags Filter Chips */}
          {allTags.length > 0 && (
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-sm text-gray-500 font-medium">태그:</span>
              {selectedTags.length > 0 && (
                <button
                  onClick={() => setSelectedTags([])}
                  className="text-gray-500 hover:text-gray-700 flex items-center gap-1 text-xs font-medium"
                >
                  <X size={14} />
                  초기화
                </button>
              )}
              <div className="flex flex-wrap gap-2">
                {allTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
                      selectedTags.includes(tag)
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Results Count */}
        {!loading && (
          <div className="mb-6">
            <p className="text-sm text-gray-600 font-medium">
              {filteredOpportunities.length}개 기회 {opportunities.length > 0 && `(${opportunities.length}개 중)`}
            </p>
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

        {/* Opportunities List */}
        {!loading && (
          <>
            {filteredOpportunities.length > 0 ? (
              <div className="space-y-5">
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
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm text-center py-16">
                <p className="text-gray-500 mb-4 text-lg">일치하는 기회가 없습니다</p>
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedType(null);
                    setSelectedTags([]);
                  }}
                  className="text-indigo-600 hover:text-indigo-700 text-sm font-semibold"
                >
                  필터 초기화
                </button>
              </div>
            )}
          </>
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
