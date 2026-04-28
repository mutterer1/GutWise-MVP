import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AlertCircle, Eye, EyeOff, Loader2, Lock, Mail, ShieldCheck } from 'lucide-react';
import AuthShell from '../components/AuthShell';
import Button from '../components/Button';
import { useAuth } from '../contexts/AuthContext';

export default function Login() {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    const { error } = await signIn(email, password);

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      navigate('/dashboard', { replace: true });
    }
  };

  return (
    <AuthShell
      mode="login"
      badge="Secure Signal Access"
      title="Welcome back"
      subtitle="Return to your private GutWise workspace and continue building careful, clinician-friendly pattern intelligence."
      footer={
        <div className="space-y-4 text-center">
          <p className="text-sm text-[var(--color-text-tertiary)]">
            New to GutWise?{' '}
            <Link
              to="/signup"
              className="motion-nav-link inline-flex font-semibold text-[var(--gw-intelligence-200)] transition-colors hover:text-[var(--gw-intelligence-100)]"
            >
              Start free
            </Link>
          </p>
          <div className="flex items-center justify-center gap-2 text-xs leading-5 text-[var(--color-text-tertiary)]">
            <ShieldCheck className="h-4 w-4 text-[var(--gw-brand-300)]" aria-hidden="true" />
            <span>Private health data stays scoped to your account.</span>
          </div>
          <p className="text-xs leading-5 text-[var(--color-text-tertiary)]">
            By logging in, you agree to the{' '}
            <Link to="/privacy" className="motion-nav-link inline-flex text-[var(--gw-brand-300)] hover:text-[var(--gw-brand-200)]">
              Privacy Policy
            </Link>{' '}
            and{' '}
            <Link to="/disclaimer" className="motion-nav-link inline-flex text-[var(--gw-brand-300)] hover:text-[var(--gw-brand-200)]">
              Medical Disclaimer
            </Link>
            .
          </p>
        </div>
      }
    >
      {error && (
        <div
          id="login-error"
          role="alert"
          aria-live="assertive"
          className="mb-5 flex items-start gap-3 rounded-2xl border border-[rgba(255,161,182,0.28)] bg-[rgba(255,161,182,0.09)] px-4 py-3 text-sm text-[var(--color-danger)]"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" aria-hidden="true" />
          <span>{error}</span>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="space-y-5"
        aria-busy={loading}
        aria-describedby={error ? 'login-error' : undefined}
      >
        <div>
          <label htmlFor="email" className="field-label">
            Email Address
          </label>
          <div className="motion-field relative">
            <Mail className="motion-field-icon pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--color-text-tertiary)]" aria-hidden="true" />
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              placeholder="you@example.com"
              className="input-base auth-input-with-icon"
              aria-invalid={Boolean(error)}
            />
          </div>
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between gap-3">
            <label htmlFor="password" className="field-label mb-0">
              Password
            </label>
            <span className="text-xs font-semibold text-[var(--color-text-tertiary)]">
              Protected session
            </span>
          </div>
          <div className="motion-field relative">
            <Lock className="motion-field-icon pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--color-text-tertiary)]" aria-hidden="true" />
            <input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              required
              placeholder="Password"
              className="input-base auth-input-with-icon auth-input-with-action"
              aria-invalid={Boolean(error)}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="motion-icon-button absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full text-[var(--color-text-tertiary)] transition-colors hover:bg-white/10 hover:text-[var(--color-text-primary)]"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              aria-pressed={showPassword}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <label className="motion-checkbox flex cursor-pointer select-none items-center gap-3 rounded-2xl border border-[rgba(202,190,255,0.12)] bg-white/[0.025] px-4 py-3">
          <input
            id="remember-me"
            name="remember-me"
            type="checkbox"
            className="h-4 w-4 rounded border-[rgba(202,190,255,0.24)] bg-transparent accent-[var(--gw-intelligence-500)]"
          />
          <span className="text-sm text-[var(--color-text-secondary)]">Keep this browser signed in</span>
        </label>

        <Button type="submit" className="w-full" size="md" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Signing in
            </>
          ) : (
            'Sign in'
          )}
        </Button>
      </form>
    </AuthShell>
  );
}
