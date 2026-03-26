'use client';

import { Bookmark, CheckCircle, Clock } from 'lucide-react';

interface BookmarkedItem {
  id: string;
  title: string;
  organization: string;
  type: string;
  status: 'bookmarked' | 'applied' | 'interviewing' | 'completed';
}

const mockBookmarked: BookmarkedItem[] = [
  {
    id: '1',
    title: 'Senior SRE Engineer',
    organization: 'Google Cloud',
    type: '채용',
    status: 'bookmarked',
  },
  {
    id: '2',
    title: 'KubeCon North America 2026',
    organization: 'CNCF',
    type: '컨퍼런스',
    status: 'applied',
  },
  {
    id: '3',
    title: 'Prometheus Observability Program',
    organization: 'CNCF',
    type: '프로그램',
    status: 'interviewing',
  },
  {
    id: '4',
    title: 'etcd Contributors Initiative',
    organization: 'Kubernetes',
    type: '오픈소스',
    status: 'completed',
  },
];

const statusLabels: Record<string, string> = {
  bookmarked: '북마크',
  applied: '지원함',
  interviewing: '인터뷰 중',
  completed: '완료',
};

const statusColors: Record<string, string> = {
  bookmarked: 'bg-blue-900 text-blue-300',
  applied: 'bg-yellow-900 text-yellow-300',
  interviewing: 'bg-purple-900 text-purple-300',
  completed: 'bg-green-900 text-green-300',
};

export default function PortfolioPage() {
  return (
    <div className="p-8 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="section-title mb-2">포트폴리오</h1>
        <p className="text-gray-400">북마크한 기회와 지원 현황을 관리하세요</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="card">
          <div className="flex items-center gap-2 mb-2">
            <Bookmark size={18} className="text-blue-400" />
            <p className="text-gray-400 text-sm">북마크</p>
          </div>
          <p className="text-2xl font-bold text-blue-400">
            {mockBookmarked.filter((b) => b.status === 'bookmarked').length}
          </p>
        </div>

        <div className="card">
          <div className="flex items-center gap-2 mb-2">
            <Clock size={18} className="text-yellow-400" />
            <p className="text-gray-400 text-sm">지원 중</p>
          </div>
          <p className="text-2xl font-bold text-yellow-400">
            {mockBookmarked.filter((b) => b.status === 'applied').length}
          </p>
        </div>

        <div className="card">
          <div className="flex items-center gap-2 mb-2">
            <Clock size={18} className="text-purple-400" />
            <p className="text-gray-400 text-sm">인터뷰</p>
          </div>
          <p className="text-2xl font-bold text-purple-400">
            {mockBookmarked.filter((b) => b.status === 'interviewing').length}
          </p>
        </div>

        <div className="card">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle size={18} className="text-green-400" />
            <p className="text-gray-400 text-sm">완료</p>
          </div>
          <p className="text-2xl font-bold text-green-400">
            {mockBookmarked.filter((b) => b.status === 'completed').length}
          </p>
        </div>
      </div>

      {/* Bookmarked Items */}
      <div>
        <h2 className="subsection-title mb-4">기회 진행 상황</h2>

        <div className="space-y-3">
          {mockBookmarked.map((item) => (
            <div key={item.id} className="card">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-white text-lg">{item.title}</h3>
                    <span className="text-xs bg-gray-800 text-gray-300 px-2 py-1 rounded">
                      {item.type}
                    </span>
                  </div>
                  <p className="text-sm text-gray-400">{item.organization}</p>
                </div>

                <span
                  className={`flex-shrink-0 text-xs font-semibold px-3 py-1.5 rounded-full ${
                    statusColors[item.status]
                  }`}
                >
                  {statusLabels[item.status]}
                </span>
              </div>

              {/* Actions */}
              <div className="mt-4 pt-4 border-t border-gray-800 flex gap-2">
                <button className="button-secondary text-sm flex-1">상태 변경</button>
                <button className="button-secondary text-sm flex-1">메모</button>
                <button className="button-secondary text-sm flex-1">제거</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Empty State */}
      {mockBookmarked.length === 0 && (
        <div className="card text-center py-12">
          <Bookmark size={48} className="mx-auto text-gray-700 mb-4" />
          <p className="text-gray-400 mb-4">아직 북마크한 기회가 없습니다</p>
          <p className="text-sm text-gray-500 mb-6">
            기회를 둘러보고 북마크하여 추적하기 시작하세요
          </p>
          <button className="button-primary">기회 검색</button>
        </div>
      )}

      {/* Tips */}
      <div className="mt-8 card border-l-4 border-l-cyan-500 bg-cyan-950/20">
        <h3 className="font-semibold text-cyan-300 mb-2">💡 팁</h3>
        <ul className="space-y-1 text-sm text-gray-300">
          <li>• 기회의 상태를 업데이트하여 진행 상황을 추적하세요</li>
          <li>• 인터뷰 날짜, 연락처 등 중요한 정보를 메모에 기록하세요</li>
          <li>• 완료된 기회들은 자동으로 아카이브되며 언제든 확인할 수 있습니다</li>
        </ul>
      </div>
    </div>
  );
}
