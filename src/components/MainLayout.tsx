import type { ReactNode } from 'react';
import Sidebar from './Sidebar';

interface MainLayoutProps {
  children: ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="page-shell min-h-screen text-[var(--text-primary)]">
      <Sidebar />
      <main id="main-content" tabIndex={-1} className="min-h-screen min-w-0 overflow-x-clip lg:pl-64">
        <div className="animate-page-in px-4 pb-6 pt-16 sm:px-5 sm:pb-8 lg:px-8 lg:pb-10 lg:pt-6">
          {children}
        </div>
      </main>
    </div>
  );
}
