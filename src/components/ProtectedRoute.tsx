import { Navigate, Outlet } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function ProtectedRoute() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="page-shell flex min-h-screen items-center justify-center px-4">
        <div
          role="status"
          aria-live="polite"
          aria-label="Checking your GutWise session"
          className="surface-intelligence max-w-sm rounded-[32px] px-6 py-7 text-center"
        >
          <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-[rgba(139,92,246,0.18)] text-[var(--gw-intelligence-200)] shadow-[var(--gw-glow-intelligence-soft)]">
            <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
          </div>
          <p className="data-kicker">Checking Session</p>
          <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">
            Preparing your GutWise signal workspace.
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
