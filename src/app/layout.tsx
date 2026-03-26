import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'NewsCollector - Career Intelligence Dashboard',
  description: 'DevOps/SRE Career Intelligence and Opportunity Tracking',
};

import LayoutContent from '@/components/LayoutContent';
import { AuthProvider } from '@/components/AuthProvider';
import './globals.css';

const navigationItems = [
  {
    label: '대시보드',
    href: '/',
    iconName: 'LayoutDashboard',
  },
  {
    label: '기회',
    href: '/opportunities',
    iconName: 'Briefcase',
  },
  {
    label: '신호',
    href: '/signals',
    iconName: 'TrendingUp',
  },
  {
    label: '포트폴리오',
    href: '/portfolio',
    iconName: 'User',
  },
  {
    label: '설정',
    href: '/settings',
    iconName: 'Settings',
  },
];

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className="bg-white text-gray-900">
        <AuthProvider>
          <LayoutContent navigationItems={navigationItems}>
            {children}
          </LayoutContent>
        </AuthProvider>
      </body>
    </html>
  );
}
