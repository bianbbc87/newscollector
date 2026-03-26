'use client';

import { X } from 'lucide-react';
import { useState } from 'react';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  opportunityId?: string;
}

interface ReportType {
  id: string;
  label: string;
  description: string;
}

const reportTypes: ReportType[] = [
  {
    id: 'expired',
    label: '마감된 기회',
    description: '이미 마감되었거나 더 이상 유효하지 않습니다',
  },
  {
    id: 'irrelevant',
    label: '관련 없음',
    description: '내 프로필과 관련이 없습니다',
  },
  {
    id: 'ai_generated',
    label: 'AI 생성 콘텐츠',
    description: '이 기회는 AI가 생성한 것으로 보입니다',
  },
  {
    id: 'inaccurate',
    label: '부정확한 정보',
    description: '제목, 설명 또는 요구사항이 정확하지 않습니다',
  },
  {
    id: 'duplicate',
    label: '중복',
    description: '동일하거나 유사한 기회가 이미 있습니다',
  },
  {
    id: 'spam',
    label: '스팸',
    description: '이것은 스팸이거나 피싱입니다',
  },
];

export default function ReportModal({ isOpen, onClose, opportunityId }: ReportModalProps) {
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [details, setDetails] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (!selectedType) return;

    // TODO: Send report to API
    console.log({
      opportunityId,
      reportType: selectedType,
      details,
    });

    setSubmitted(true);
    setTimeout(() => {
      setSelectedType(null);
      setDetails('');
      setSubmitted(false);
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="card w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-800">
          <h2 className="text-lg font-bold text-white">기회 신고</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-300 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {!submitted ? (
          <>
            {/* Report Type Selection */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-300 mb-3">
                신고 유형을 선택하세요
              </label>
              <div className="space-y-2">
                {reportTypes.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => setSelectedType(type.id)}
                    className={`w-full text-left p-3 rounded-lg border transition-all duration-200 ${
                      selectedType === type.id
                        ? 'bg-blue-900 border-blue-600'
                        : 'bg-gray-800 border-gray-700 hover:border-gray-600'
                    }`}
                  >
                    <div className="font-medium text-white">{type.label}</div>
                    <div className="text-xs text-gray-400 mt-1">{type.description}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Details Input */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                추가 정보 (선택사항)
              </label>
              <textarea
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="추가 세부사항을 입력하세요..."
                className="input-field resize-none h-24"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <button onClick={onClose} className="flex-1 button-secondary">
                취소
              </button>
              <button
                onClick={handleSubmit}
                disabled={!selectedType}
                className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                  selectedType
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                }`}
              >
                신고하기
              </button>
            </div>
          </>
        ) : (
          <div className="text-center py-8">
            <div className="w-12 h-12 bg-green-900 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-green-300 text-xl">✓</span>
            </div>
            <p className="text-white font-semibold">신고가 접수되었습니다</p>
            <p className="text-sm text-gray-400 mt-2">감사합니다. 검토 후 조치하겠습니다.</p>
          </div>
        )}
      </div>
    </div>
  );
}
