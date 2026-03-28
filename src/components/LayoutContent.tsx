'use client';

import { Menu, X, LayoutDashboard, Briefcase, TrendingUp, User, Settings, LogOut, LogIn } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useId, useState } from 'react';
import { useAuth } from './AuthProvider';

interface NavItem {
  label: string;
  href: string;
  iconName: string;
}

interface LayoutContentProps {
  navigationItems: NavItem[];
  children: React.ReactNode;
}

const iconMap: Record<string, React.ReactNode> = {
  LayoutDashboard: <LayoutDashboard size={20} aria-hidden="true" />,
  Briefcase: <Briefcase size={20} aria-hidden="true" />,
  TrendingUp: <TrendingUp size={20} aria-hidden="true" />,
  User: <User size={20} aria-hidden="true" />,
  Settings: <Settings size={20} aria-hidden="true" />,
};

const iconMapLarge: Record<string, React.ReactNode> = {
  LayoutDashboard: <LayoutDashboard size={22} aria-hidden="true" />,
  Briefcase: <Briefcase size={22} aria-hidden="true" />,
  TrendingUp: <TrendingUp size={22} aria-hidden="true" />,
  User: <User size={22} aria-hidden="true" />,
  Settings: <Settings size={22} aria-hidden="true" />,
};

export default function LayoutContent({ navigationItems, children }: LayoutContentProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, loading, signOut } = useAuth();
  const router = useRouter();
  const mobileNavId = useId();

  return (
    <div className="flex h-screen bg-gray-50 md:flex-row flex-col">
      {/* Skip Navigation */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-indigo-600 focus:text-white focus:rounded-lg focus:font-medium focus:shadow-lg"
      >
        본문으로 건너뛰기
      </a>

      {/* Sidebar — Desktop */}
      <aside
        className="hidden md:flex md:w-56 bg-white border-r border-gray-100 flex-col"
        aria-label="사이드바"
      >
        {/* Logo */}
        <div className="px-5 py-5 border-b border-gray-100">
          <Link href="/" aria-label="NewsCollector 홈으로 이동">
            <span className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <div
                className="w-7 h-7 bg-gradient-to-br from-indigo-600 to-blue-500 rounded-lg flex items-center justify-center flex-shrink-0"
                aria-hidden="true"
              >
                <span className="text-white font-bold text-xs">NC</span>
              </div>
              NewsCollector
            </span>
          </Link>
        </div>

        {/* Nav links */}
        <nav className="flex-1 px-3 py-4 space-y-0.5" aria-label="메인 네비게이션">
          {navigationItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? 'page' : undefined}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-1 ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-600'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <span className={isActive ? 'text-indigo-600' : 'text-gray-400'}>
                  {iconMap[item.iconName]}
                </span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="px-4 py-4 border-t border-gray-100">
          {user ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2.5">
                <div
                  className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center flex-shrink-0"
                  aria-hidden="true"
                >
                  <span className="text-white font-semibold text-xs">
                    {user.email?.[0].toUpperCase() || 'U'}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-gray-900 truncate">
                    {user.user_metadata?.name || user.email?.split('@')[0] || 'User'}
                  </p>
                  <p className="text-xs text-gray-400 truncate">{user.email}</p>
                </div>
              </div>
              <button
                onClick={async () => { await signOut(); router.push('/login'); }}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
              >
                <LogOut size={14} aria-hidden="true" />
                로그아웃
              </button>
            </div>
          ) : !loading ? (
            <Link
              href="/login"
              className="flex items-center justify-center gap-2 px-3 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            >
              <LogIn size={14} aria-hidden="true" />
              로그인
            </Link>
          ) : null}
        </div>
      </aside>

      {/* Mobile Top Bar */}
      <header className="md:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-gray-100 shadow-sm">
        <Link href="/" aria-label="NewsCollector 홈으로 이동">
          <span className="text-base font-bold text-gray-900 flex items-center gap-2">
            <div
              className="w-6 h-6 bg-gradient-to-br from-indigo-600 to-blue-500 rounded-md flex items-center justify-center"
              aria-hidden="true"
            >
              <span className="text-white font-bold text-xs">NC</span>
            </div>
            NewsCollector
          </span>
        </Link>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-expanded={mobileMenuOpen}
          aria-controls={mobileNavId}
          aria-label={mobileMenuOpen ? '메뉴 닫기' : '메뉴 열기'}
          className="p-2 text-gray-500 hover:text-gray-900 rounded-lg hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
        >
          {mobileMenuOpen ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}
        </button>
      </header>

      {/* Mobile Dropdown */}
      {mobileMenuOpen && (
        <nav
          id={mobileNavId}
          aria-label="모바일 메뉴"
          className="md:hidden bg-white border-b border-gray-100 px-3 py-2 shadow-md space-y-0.5"
        >
          {navigationItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? 'page' : undefined}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-600'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <span aria-hidden="true">{iconMap[item.iconName]}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>
      )}

      {/* Main Content */}
      <main id="main-content" className="flex-1 overflow-y-auto pb-20 md:pb-0" tabIndex={-1}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>

      {/* Bottom Navigation — Mobile only */}
      <nav
        aria-label="하단 네비게이션"
        className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 flex justify-around px-1 py-1 shadow-lg"
      >
        {navigationItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? 'page' : undefined}
              aria-label={item.label}
              className={`flex flex-col items-center gap-0.5 px-3 py-2 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 min-w-[52px] ${
                isActive ? 'text-indigo-600' : 'text-gray-400 hover:text-gray-700'
              }`}
            >
              <span aria-hidden="true">{iconMapLarge[item.iconName]}</span>
              <span className="text-[10px] font-medium" aria-hidden="true">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
