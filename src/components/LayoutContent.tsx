'use client';

import { Menu, X, LayoutDashboard, Briefcase, TrendingUp, User, Settings, LogOut, LogIn } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
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
  LayoutDashboard: <LayoutDashboard size={20} />,
  Briefcase: <Briefcase size={20} />,
  TrendingUp: <TrendingUp size={20} />,
  User: <User size={20} />,
  Settings: <Settings size={20} />,
};

const iconMapLarge: Record<string, React.ReactNode> = {
  LayoutDashboard: <LayoutDashboard size={24} />,
  Briefcase: <Briefcase size={24} />,
  TrendingUp: <TrendingUp size={24} />,
  User: <User size={24} />,
  Settings: <Settings size={24} />,
};

export default function LayoutContent({ navigationItems, children }: LayoutContentProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { user, loading, signOut } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="flex h-screen bg-white md:flex-row flex-col">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex md:w-64 bg-white border-r border-gray-200 flex-col overflow-y-auto">
        {/* Logo / Title */}
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">NC</span>
            </div>
            NewsCollector
          </h1>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          {navigationItems.map((item) => {
            const isActive = pathname === item.href;
            const iconElement = iconMap[item.iconName];
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors duration-200 group ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-600'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <span className={`transition-colors ${isActive ? 'text-indigo-600' : 'text-gray-400 group-hover:text-gray-600'}`}>
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
                <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
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
                className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <LogOut size={16} />
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
                className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
              >
                <LogIn size={16} />
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

      {/* Mobile Menu Button */}
      <div className="md:hidden flex items-center justify-between px-4 py-4 bg-white border-b border-gray-200">
        <h1 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <div className="w-6 h-6 bg-gradient-to-br from-indigo-600 to-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xs">NC</span>
          </div>
          NewsCollector
        </h1>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="text-gray-600 hover:text-gray-900"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-gray-50 md:bg-gray-50">
        {children}
      </main>

      {/* Bottom Navigation - Mobile */}
      {!isMobile ? null : (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around px-2 py-2">
          {navigationItems.map((item) => {
            const isActive = pathname === item.href;
            const iconElement = iconMapLarge[item.iconName];
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors ${
                  isActive
                    ? 'text-indigo-600 bg-indigo-50'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                title={item.label}
              >
                {iconElement}
                <span className="text-xs">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      )}
    </div>
  );
}
