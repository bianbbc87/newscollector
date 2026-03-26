import type { Metadata } from 'next';
import { LayoutDashboard, Briefcase, TrendingUp, User, Settings as SettingsIcon } from 'lucide-react';
import Link from 'next/link';
import './globals.css';

export const metadata: Metadata = {
  title: 'NewsCollector - Career Intelligence Dashboard',
  description: 'DevOps/SRE Career Intelligence and Opportunity Tracking',
};

const navigationItems = [
  {
    label: '대시보드',
    href: '/',
    icon: LayoutDashboard,
  },
  {
    label: '기회',
    href: '/opportunities',
    icon: Briefcase,
  },
  {
    label: '신호',
    href: '/signals',
    icon: TrendingUp,
  },
  {
    label: '포트폴리오',
    href: '/portfolio',
    icon: User,
  },
  {
    label: '설정',
    href: '/settings',
    icon: SettingsIcon,
  },
];

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body>
        <div className="flex h-screen bg-gray-950">
          {/* Sidebar */}
          <aside className="w-64 bg-gray-950 border-r border-gray-800 flex flex-col overflow-y-auto">
            {/* Logo / Title */}
            <div className="p-6 border-b border-gray-800">
              <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">NC</span>
                </div>
                NewsCollector
              </h1>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 py-6 space-y-2">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:text-white hover:bg-gray-900 transition-colors duration-200 group"
                  >
                    <Icon size={20} className="text-gray-400 group-hover:text-gray-300 transition-colors" />
                    <span className="font-medium text-sm">{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-gray-800">
              <div className="text-xs text-gray-500">
                <p className="font-semibold text-gray-400 mb-2">DevOps/SRE</p>
                <p>Career Intelligence Platform</p>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 overflow-y-auto bg-gray-900">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
