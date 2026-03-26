'use client';

import { GitBranch } from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const { user, loading, signIn } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user && !loading) {
      router.push('/');
    }
  }, [user, loading, router]);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo & Title */}
        <div className="text-center mb-12">
          <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-blue-600 rounded-lg flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-lg">NC</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">NewsCollector</h1>
          <p className="text-gray-600">Career Intelligence Dashboard</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-8">
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">로그인</h2>
            <p className="text-gray-600 text-sm">
              DevOps/SRE 커리어 인텔리전스 플랫폼에 접속하세요
            </p>
          </div>

          <button
            onClick={signIn}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-gray-900 text-white rounded-lg font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <GitBranch size={20} />
            {loading ? '로그인 중...' : 'GitHub로 로그인'}
          </button>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">또는</span>
            </div>
          </div>

          {/* Info Text */}
          <p className="text-xs text-gray-600 text-center">
            GitHub 계정으로 안전하게 로그인하세요. 계정 생성이나 추가 정보가 필요 없습니다.
          </p>
        </div>

        {/* Footer Info */}
        <div className="mt-8 text-center text-xs text-gray-500">
          <p>
            로그인하면{' '}
            <a href="#" className="text-indigo-600 hover:underline">
              이용약관
            </a>
            과{' '}
            <a href="#" className="text-indigo-600 hover:underline">
              개인정보처리방침
            </a>
            에 동의하는 것입니다.
          </p>
        </div>
      </div>
    </div>
  );
}
