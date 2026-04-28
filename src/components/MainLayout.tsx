import type { ReactNode } from 'react';
import Sidebar from './Sidebar';

interface MainLayoutProps {
  children: ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="page-shell min-h-screen text-[var(--text-primary)]">
      <Sidebar />
      <main id="main-content" tabIndex={-1} className="min-h-screen flex-1 lg:ml-64">
        <div className="animate-page-in min-h-screen px-4 pb-8 pt-20 sm:px-5 sm:pb-10 lg:px-8 lg:pb-12 lg:pt-8">
          {children}
        </div>
      </main>
    </div>
  );
}
