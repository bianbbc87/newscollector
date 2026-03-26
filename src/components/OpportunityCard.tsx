'use client';

import { Bookmark, Flag, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
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
  job: { bg: 'bg-blue-900', text: 'text-blue-300', badge: 'bg-blue-600' },
  hackathon: { bg: 'bg-purple-900', text: 'text-purple-300', badge: 'bg-purple-600' },
  program: { bg: 'bg-green-900', text: 'text-green-300', badge: 'bg-green-600' },
  conference: { bg: 'bg-orange-900', text: 'text-orange-300', badge: 'bg-orange-600' },
  opensource: { bg: 'bg-teal-900', text: 'text-teal-300', badge: 'bg-teal-600' },
  trend: { bg: 'bg-yellow-900', text: 'text-yellow-300', badge: 'bg-yellow-600' },
  paper: { bg: 'bg-pink-900', text: 'text-pink-300', badge: 'bg-pink-600' },
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

  if (daysLeft < 3) return { bg: 'bg-red-900', text: 'text-red-300' };
  if (daysLeft < 7) return { bg: 'bg-yellow-900', text: 'text-yellow-300' };
  return { bg: 'bg-gray-800', text: 'text-gray-300' };
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

  return (
    <div className="card-hover group">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className={`badge ${colors.badge} text-white`}>
              {typeLabels[opportunity.type]}
            </span>
            <span className={`text-xs font-semibold ${deadlineColor.bg} ${deadlineColor.text} px-2 py-1 rounded`}>
              {formatDeadline(opportunity.deadline)}
            </span>
          </div>

          <h3 className="text-lg font-semibold text-white group-hover:text-blue-400 transition-colors mb-1">
            {opportunity.title}
          </h3>
          <p className="text-sm text-gray-400">{opportunity.organization}</p>
        </div>

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-gray-500 hover:text-gray-300 transition-colors mt-1"
        >
          {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>
      </div>

      {/* Tags */}
      {opportunity.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-3 mb-3">
          {opportunity.tags.map((tag, idx) => (
            <span key={idx} className="tag-pill">
              {tag.name}
            </span>
          ))}
        </div>
      )}

      {/* Relevance Score */}
      <div className="mt-3 mb-3">
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs text-gray-400">관련성</span>
          <span className="text-sm font-semibold text-blue-400">{Math.round(opportunity.relevanceScore)}%</span>
        </div>
        <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 transition-all duration-300"
            style={{ width: `${opportunity.relevanceScore}%` }}
          />
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && opportunity.description && (
        <div className="mt-4 pt-4 border-t border-gray-800">
          <p className="text-sm text-gray-300 leading-relaxed mb-4">
            {opportunity.description}
          </p>

          {opportunity.postedAt && (
            <p className="text-xs text-gray-500 mb-4">
              게시됨: {new Date(opportunity.postedAt).toLocaleDateString('ko-KR')}
            </p>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2">
            {onBookmark && (
              <button
                onClick={() => onBookmark(opportunity.id)}
                className="flex-1 button-secondary flex items-center justify-center gap-2"
              >
                <Bookmark size={16} />
                <span>북마크</span>
              </button>
            )}
            {onReportClick && (
              <button
                onClick={() => onReportClick(opportunity)}
                className="flex-1 button-secondary flex items-center justify-center gap-2"
              >
                <Flag size={16} />
                <span>신고</span>
              </button>
            )}
            {onDismiss && (
              <button
                onClick={() => onDismiss(opportunity.id)}
                className="flex-1 button-secondary flex items-center justify-center gap-2"
              >
                <Trash2 size={16} />
                <span>제거</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
