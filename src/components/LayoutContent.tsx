'use client';

import { Menu, X, LayoutDashboard, Briefcase, TrendingUp, User, Settings, LogOut, LogIn } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useId, useState } from 'react';
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
  LayoutDashboard: <LayoutDashboard size={24} aria-hidden="true" />,
  Briefcase: <Briefcase size={24} aria-hidden="true" />,
  TrendingUp: <TrendingUp size={24} aria-hidden="true" />,
  User: <User size={24} aria-hidden="true" />,
  Settings: <Settings size={24} aria-hidden="true" />,
};

export default function LayoutContent({ navigationItems, children }: LayoutContentProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { user, loading, signOut } = useAuth();
  const router = useRouter();
  const mobileNavId = useId();

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="flex h-screen bg-white md:flex-row flex-col">
      {/* Skip Navigation Link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-indigo-600 focus:text-white focus:rounded-lg focus:font-medium focus:shadow-lg"
      >
        본문으로 건너뛰기
      </a>

      {/* Sidebar - Desktop */}
      <aside
        className="hidden md:flex md:w-64 bg-white border-r border-gray-200 flex-col overflow-y-auto"
        aria-label="사이드바"
      >
        {/* Logo / Title */}
        <div className="p-6 border-b border-gray-200">
          <Link href="/" aria-label="NewsCollector 홈으로 이동">
            <span className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
              <div
                className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-blue-600 rounded-lg flex items-center justify-center"
                aria-hidden="true"
              >
                <span className="text-white font-bold text-sm">NC</span>
              </div>
              NewsCollector
            </span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2" aria-label="메인 네비게이션">
          {navigationItems.map((item) => {
            const isActive = pathname === item.href;
            const iconElement = iconMap[item.iconName];
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? 'page' : undefined}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors duration-200 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-600'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <span
                  className={`transition-colors ${isActive ? 'text-indigo-600' : 'text-gray-400 group-hover:text-gray-600'}`}
                >
                  {iconElement}
                </span>
                <span className="font-medium text-sm">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200">
          {user ? (
            <div className="space-y-4">
              {/* User Info */}
              <div className="flex items-center gap-3 pb-4 border-b border-gray-200">
                <div
                  className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center flex-shrink-0"
                  aria-hidden="true"
                >
                  <span className="text-white font-semibold text-sm">
                    {user.email?.[0].toUpperCase() || 'U'}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-gray-900 truncate">
                    {user.user_metadata?.name || user.email?.split('@')[0] || 'User'}
                  </p>
                  <p className="text-xs text-gray-500 truncate">{user.email}</p>
                </div>
              </div>

              {/* Sign Out Button */}
              <button
                onClick={async () => {
                  await signOut();
                  router.push('/login');
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
              >
                <LogOut size={16} aria-hidden="true" />
                로그아웃
              </button>
            </div>
          ) : !loading ? (
            <div className="space-y-3">
              <div className="text-xs text-gray-500 mb-4">
                <p className="font-semibold text-gray-700 mb-2">DevOps/SRE</p>
                <p>Career Intelligence Platform</p>
              </div>
              <Link
                href="/login"
                className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
              >
                <LogIn size={16} aria-hidden="true" />
                로그인
              </Link>
            </div>
          ) : (
            <div className="text-xs text-gray-500">
              <p className="font-semibold text-gray-700 mb-2">DevOps/SRE</p>
              <p>Career Intelligence Platform</p>
            </div>
          )}
        </div>
      </aside>

      {/* Mobile Top Bar */}
      <div className="md:hidden flex items-center justify-between px-4 py-4 bg-white border-b border-gray-200">
        <Link href="/" aria-label="NewsCollector 홈으로 이동">
          <span className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <div
              className="w-6 h-6 bg-gradient-to-br from-indigo-600 to-blue-600 rounded-lg flex items-center justify-center"
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
          className="text-gray-600 hover:text-gray-900 p-2 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
        >
          {mobileMenuOpen ? <X size={24} aria-hidden="true" /> : <Menu size={24} aria-hidden="true" />}
        </button>
      </div>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <nav
          id={mobileNavId}
          aria-label="모바일 메뉴"
          className="md:hidden bg-white border-b border-gray-200 px-4 py-3 space-y-1 shadow-md"
        >
          {navigationItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? 'page' : undefined}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-600'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <span aria-hidden="true">{iconMap[item.iconName]}</span>
                <span className="font-medium text-sm">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      )}

      {/* Main Content */}
      <main id="main-content" className="flex-1 overflow-y-auto bg-gray-50" tabIndex={-1}>
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>

      {/* Bottom Navigation - Mobile */}
      {isMobile && (
        <nav
          aria-label="하단 네비게이션"
          className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around px-2 py-2"
        >
          {navigationItems.map((item) => {
            const isActive = pathname === item.href;
            const iconElement = iconMapLarge[item.iconName];
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? 'page' : undefined}
                aria-label={item.label}
                className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                  isActive
                    ? 'text-indigo-600 bg-indigo-50'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <span aria-hidden="true">{iconElement}</span>
                <span className="text-xs" aria-hidden="true">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      )}
    </div>
  );
}
