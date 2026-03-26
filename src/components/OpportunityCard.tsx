'use client';

import { Bookmark, Flag, Trash2, ExternalLink } from 'lucide-react';
import { useState } from 'react';

interface Tag {
  name: string;
  category?: string;
}

interface Opportunity {
  id: string;
  title: string;
  organization: string;
  type: 'job' | 'hackathon' | 'program' | 'conference' | 'opensource' | 'trend' | 'paper';
  tags: Tag[];
  deadline: string;
  relevanceScore: number;
  description?: string;
  link?: string;
  url?: string;
  postedAt?: string;
}

interface OpportunityCardProps {
  opportunity: Opportunity;
  onBookmark?: (id: string) => void;
  onReport?: (id: string) => void;
  onDismiss?: (id: string) => void;
  expanded?: boolean;
  onReportClick?: (opportunity: Opportunity) => void;
}

const typeColors: Record<string, { bg: string; text: string; badge: string }> = {
  job: { bg: 'bg-blue-100', text: 'text-blue-700', badge: 'bg-blue-600' },
  hackathon: { bg: 'bg-purple-100', text: 'text-purple-700', badge: 'bg-purple-600' },
  program: { bg: 'bg-emerald-100', text: 'text-emerald-700', badge: 'bg-emerald-600' },
  conference: { bg: 'bg-amber-100', text: 'text-amber-700', badge: 'bg-amber-600' },
  opensource: { bg: 'bg-teal-100', text: 'text-teal-700', badge: 'bg-teal-600' },
  trend: { bg: 'bg-rose-100', text: 'text-rose-700', badge: 'bg-rose-600' },
  paper: { bg: 'bg-indigo-100', text: 'text-indigo-700', badge: 'bg-indigo-600' },
};

const typeLabels: Record<string, string> = {
  job: '채용',
  hackathon: '해커톤',
  program: '프로그램',
  conference: '컨퍼런스',
  opensource: '오픈소스',
  trend: '트렌드',
  paper: '논문',
};

const getDeadlineColor = (deadline: string): { bg: string; text: string } => {
  const now = new Date();
  const deadlineDate = new Date(deadline);
  const daysLeft = Math.floor((deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  if (daysLeft < 3) return { bg: 'bg-rose-100', text: 'text-rose-700' };
  if (daysLeft < 7) return { bg: 'bg-amber-100', text: 'text-amber-700' };
  return { bg: 'bg-gray-100', text: 'text-gray-700' };
};

const formatDeadline = (deadline: string): string => {
  const date = new Date(deadline);
  const now = new Date();
  const daysLeft = Math.floor((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  if (daysLeft < 0) return '마감됨';
  if (daysLeft === 0) return '오늘 마감';
  if (daysLeft === 1) return '내일 마감';
  if (daysLeft <= 7) return `${daysLeft}일 남음`;

  return date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' });
};

const formatRelativeTime = (date: string): string => {
  const now = new Date();
  const postDate = new Date(date);
  const diffMs = now.getTime() - postDate.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 60) return `${diffMins}분 전`;
  if (diffHours < 24) return `${diffHours}시간 전`;
  if (diffDays < 30) return `${diffDays}일 전`;

  return postDate.toLocaleDateString('ko-KR');
};

export default function OpportunityCard({
  opportunity,
  onBookmark,
  onReport,
  onDismiss,
  expanded = false,
  onReportClick,
}: OpportunityCardProps) {
  const [isExpanded, setIsExpanded] = useState(expanded);
  const colors = typeColors[opportunity.type];
  const deadlineColor = getDeadlineColor(opportunity.deadline);
  const sourceUrl = opportunity.url || opportunity.link;

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 p-6">
      {/* Header with Badge and Deadline */}
      <div className="flex items-start justify-between gap-5 mb-4">
        <div className="flex items-center gap-2">
          <span className={`${colors.badge} text-white text-xs font-semibold px-3 py-1.5 rounded-full`}>
            {typeLabels[opportunity.type]}
          </span>
          <span className={`${deadlineColor.bg} ${deadlineColor.text} text-xs font-semibold px-3 py-1.5 rounded-full`}>
            {formatDeadline(opportunity.deadline)}
          </span>
        </div>
        <span className="text-xs text-gray-400 whitespace-nowrap">
          {opportunity.postedAt && formatRelativeTime(opportunity.postedAt)}
        </span>
      </div>

      {/* Title as clickable link */}
      <div className="mb-4">
        <div className="flex items-start gap-2">
          {sourceUrl ? (
            <a
              href={sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 group/link"
            >
              <h3 className="text-lg leading-relaxed font-semibold text-gray-900 group-hover/link:text-indigo-600 transition-colors">
                {opportunity.title}
              </h3>
            </a>
          ) : (
            <h3 className="flex-1 text-lg leading-relaxed font-semibold text-gray-900">
              {opportunity.title}
            </h3>
          )}
          {sourceUrl && (
            <a
              href={sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-indigo-600 transition-colors mt-0.5 flex-shrink-0"
            >
              <ExternalLink size={16} />
            </a>
          )}
        </div>
        <p className="text-sm text-gray-500 mt-1">{opportunity.organization}</p>
      </div>

      {/* Tags */}
      {opportunity.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-5">
          {opportunity.tags.slice(0, 5).map((tag, idx) => (
            <span key={idx} className="inline-block bg-gray-100 text-gray-600 text-xs px-3 py-1.5 rounded-full font-medium hover:bg-gray-200 transition-colors">
              {tag.name}
            </span>
          ))}
        </div>
      )}

      {/* Relevance Score - thin elegant bar */}
      <div className="mb-5">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs font-medium text-gray-500">관련성</span>
          <span className="text-sm font-semibold text-indigo-600">{Math.round(opportunity.relevanceScore)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 to-indigo-600 transition-all duration-300"
            style={{ width: `${opportunity.relevanceScore}%` }}
          />
        </div>
      </div>

      {/* Description - always shown but truncated, expandable */}
      {opportunity.description && (
        <div className="mb-5">
          <div
            className={`text-sm text-gray-600 leading-relaxed overflow-hidden transition-all duration-300 ${
              isExpanded ? 'max-h-none' : 'line-clamp-2'
            }`}
          >
            {opportunity.description}
          </div>
          {!isExpanded && (
            <button
              onClick={() => setIsExpanded(true)}
              className="text-indigo-600 hover:text-indigo-700 text-xs font-medium mt-2"
            >
              더 보기
            </button>
          )}
          {isExpanded && (
            <button
              onClick={() => setIsExpanded(false)}
              className="text-indigo-600 hover:text-indigo-700 text-xs font-medium mt-2"
            >
              숨기기
            </button>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2 pt-4 border-t border-gray-100">
        {sourceUrl && (
          <a
            href={sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 md:flex-none px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
          >
            <ExternalLink size={16} />
            <span className="hidden md:inline">원본 보기</span>
          </a>
        )}

        {onBookmark && (
          <button
            onClick={() => onBookmark(opportunity.id)}
            className="px-3 py-2 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors flex items-center justify-center"
            title="북마크"
          >
            <Bookmark size={18} />
            <span className="hidden md:inline ml-2 text-sm font-medium">북마크</span>
          </button>
        )}

        {onReportClick && (
          <button
            onClick={() => onReportClick(opportunity)}
            className="px-3 py-2 text-gray-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors flex items-center justify-center"
            title="신고"
          >
            <Flag size={18} />
            <span className="hidden md:inline ml-2 text-sm font-medium">신고</span>
          </button>
        )}

        {onDismiss && (
          <button
            onClick={() => onDismiss(opportunity.id)}
            className="px-3 py-2 text-gray-600 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors flex items-center justify-center"
            title="제거"
          >
            <Trash2 size={18} />
            <span className="hidden md:inline ml-2 text-sm font-medium">제거</span>
          </button>
        )}
      </div>
    </div>
  );
}
