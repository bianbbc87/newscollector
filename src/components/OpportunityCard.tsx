'use client';

import { Bookmark, Flag, Trash2, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';
import { useId, useState } from 'react';

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
  deadline: string | null;
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

const typeBadge: Record<string, { bg: string; text: string }> = {
  job:         { bg: 'bg-blue-100',    text: 'text-blue-700' },
  hackathon:   { bg: 'bg-purple-100',  text: 'text-purple-700' },
  program:     { bg: 'bg-emerald-100', text: 'text-emerald-700' },
  conference:  { bg: 'bg-amber-100',   text: 'text-amber-700' },
  opensource:  { bg: 'bg-teal-100',    text: 'text-teal-700' },
  trend:       { bg: 'bg-rose-100',    text: 'text-rose-700' },
  paper:       { bg: 'bg-indigo-100',  text: 'text-indigo-700' },
};

const typeLabels: Record<string, string> = {
  job: '채용', hackathon: '해커톤', program: '프로그램',
  conference: '컨퍼런스', opensource: '오픈소스', trend: '트렌드', paper: '논문',
};

const getDeadlineInfo = (deadline: string | null): { label: string; urgent: boolean } => {
  if (!deadline) return { label: '상시', urgent: false };
  const date = new Date(deadline);
  if (isNaN(date.getTime())) return { label: '상시', urgent: false };
  const daysLeft = Math.floor((date.getTime() - Date.now()) / 86400000);
  if (daysLeft < 0)  return { label: '마감', urgent: false };
  if (daysLeft === 0) return { label: '오늘', urgent: true };
  if (daysLeft === 1) return { label: '내일', urgent: true };
  if (daysLeft <= 7)  return { label: `D-${daysLeft}`, urgent: true };
  return { label: date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' }), urgent: false };
};

const formatRelativeTime = (date: string): string => {
  const diffMs = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diffMs / 60000);
  const hours = Math.floor(diffMs / 3600000);
  const days = Math.floor(diffMs / 86400000);
  if (mins < 60)  return `${mins}분 전`;
  if (hours < 24) return `${hours}시간 전`;
  if (days < 30)  return `${days}일 전`;
  return new Date(date).toLocaleDateString('ko-KR');
};

export default function OpportunityCard({
  opportunity,
  onBookmark,
  onDismiss,
  expanded = false,
  onReportClick,
}: OpportunityCardProps) {
  const [isExpanded, setIsExpanded] = useState(expanded);
  const badge = typeBadge[opportunity.type] ?? typeBadge.trend;
  const { label: deadlineLabel, urgent } = getDeadlineInfo(opportunity.deadline);
  const sourceUrl = opportunity.url || opportunity.link;
  const descId = useId();

  return (
    <article
      className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow p-5"
      aria-labelledby={`card-title-${opportunity.id}`}
    >
      {/* Row 1: badges + meta */}
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${badge.bg} ${badge.text}`}>
            {typeLabels[opportunity.type]}
          </span>
          {urgent && (
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-rose-100 text-rose-700">
              {deadlineLabel}
            </span>
          )}
          {!urgent && deadlineLabel !== '상시' && deadlineLabel !== '마감' && (
            <span className="text-xs text-gray-400">{deadlineLabel} 마감</span>
          )}
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Relevance pill */}
          <span
            className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full tabular-nums"
            aria-label={`관련성 ${Math.round(opportunity.relevanceScore)}%`}
          >
            {Math.round(opportunity.relevanceScore)}%
          </span>
          {opportunity.postedAt && (
            <time dateTime={opportunity.postedAt} className="text-xs text-gray-400 hidden sm:block">
              {formatRelativeTime(opportunity.postedAt)}
            </time>
          )}
        </div>
      </div>

      {/* Row 2: title + org */}
      <div className="mb-3">
        {sourceUrl ? (
          <a
            href={sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${opportunity.title} — 원본 페이지 열기 (새 탭)`}
            className="group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-1 rounded"
          >
            <h3
              id={`card-title-${opportunity.id}`}
              className="text-base font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors leading-snug"
            >
              {opportunity.title}
            </h3>
          </a>
        ) : (
          <h3
            id={`card-title-${opportunity.id}`}
            className="text-base font-semibold text-gray-900 leading-snug"
          >
            {opportunity.title}
          </h3>
        )}
        <p className="text-sm text-gray-500 mt-0.5">{opportunity.organization}</p>
      </div>

      {/* Row 3: tags (max 3, compact) */}
      {opportunity.tags.length > 0 && (
        <ul className="flex flex-wrap gap-1.5 mb-3" aria-label="태그 목록">
          {opportunity.tags.slice(0, 3).map((tag, idx) => (
            <li key={idx}>
              <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-500 rounded-md">
                {tag.name}
              </span>
            </li>
          ))}
          {opportunity.tags.length > 3 && (
            <li>
              <span className="text-xs px-2 py-0.5 text-gray-400">
                +{opportunity.tags.length - 3}
              </span>
            </li>
          )}
        </ul>
      )}

      {/* Row 4: expandable description */}
      {opportunity.description && (
        <div className="mb-3">
          <p
            id={descId}
            className={`text-sm text-gray-500 leading-relaxed ${isExpanded ? '' : 'line-clamp-2'}`}
          >
            {opportunity.description}
          </p>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            aria-expanded={isExpanded}
            aria-controls={descId}
            className="mt-1 text-xs text-indigo-500 hover:text-indigo-700 flex items-center gap-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-1 rounded"
          >
            {isExpanded ? (
              <><ChevronUp size={12} aria-hidden="true" /> 접기</>
            ) : (
              <><ChevronDown size={12} aria-hidden="true" /> 더 보기</>
            )}
          </button>
        </div>
      )}

      {/* Row 5: actions */}
      <div className="flex items-center gap-1 pt-3 border-t border-gray-50" role="group" aria-label="작업 버튼">
        {sourceUrl && (
          <a
            href={sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${opportunity.title} — 원본 보기 (새 탭)`}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white text-xs font-medium rounded-lg hover:bg-indigo-700 transition-colors mr-auto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
          >
            <ExternalLink size={13} aria-hidden="true" />
            원본 보기
          </a>
        )}

        {onBookmark && (
          <button
            onClick={() => onBookmark(opportunity.id)}
            aria-label={`${opportunity.title} 북마크`}
            className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-1"
          >
            <Bookmark size={15} aria-hidden="true" />
          </button>
        )}

        {onReportClick && (
          <button
            onClick={() => onReportClick(opportunity)}
            aria-label={`${opportunity.title} 신고`}
            className="p-2 text-gray-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-1"
          >
            <Flag size={15} aria-hidden="true" />
          </button>
        )}

        {onDismiss && (
          <button
            onClick={() => onDismiss(opportunity.id)}
            aria-label={`${opportunity.title} 제거`}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-1"
          >
            <Trash2 size={15} aria-hidden="true" />
          </button>
        )}
      </div>
    </article>
  );
}
