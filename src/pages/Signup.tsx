import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AlertCircle, Loader2, Lock, Mail, ShieldCheck, User } from 'lucide-react';
import AuthShell from '../components/AuthShell';
import Button from '../components/Button';
import { useAuth } from '../contexts/AuthContext';

export default function Signup() {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    const { error } = await signUp(email, password, name);

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      navigate('/dashboard', { replace: true });
    }
  };

  return (
    <AuthShell
      mode="signup"
      badge="Start Gut Intelligence"
      title="Create your workspace"
      subtitle="Set up a private account for non-diagnostic pattern detection across logs, symptoms, lifestyle context, and clinician-ready reports."
      footer={
        <div className="space-y-4 text-center">
          <p className="text-sm text-[var(--color-text-tertiary)]">
            Already have an account?{' '}
            <Link
              to="/login"
              className="motion-nav-link inline-flex font-semibold text-[var(--gw-intelligence-200)] transition-colors hover:text-[var(--gw-intelligence-100)]"
            >
              Sign in
            </Link>
          </p>
          <div className="flex items-center justify-center gap-2 text-xs leading-5 text-[var(--color-text-tertiary)]">
            <ShieldCheck className="h-4 w-4 text-[var(--gw-brand-300)]" aria-hidden="true" />
            <span>No credit card required to start.</span>
          </div>
        </div>
      }
    >
      {error && (
        <div
          id="signup-error"
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
        aria-describedby={error ? 'signup-error' : undefined}
      >
        <div>
          <label htmlFor="name" className="field-label">
            Full Name
          </label>
          <div className="motion-field relative">
            <User className="motion-field-icon pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--color-text-tertiary)]" aria-hidden="true" />
            <input
              id="name"
              name="name"
              type="text"
              autoComplete="name"
              required
              className="input-base auth-input-with-icon"
              placeholder="Jane Smith"
              aria-invalid={Boolean(error)}
            />
          </div>
        </div>

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
              className="input-base auth-input-with-icon"
              placeholder="you@example.com"
              aria-invalid={Boolean(error)}
            />
          </div>
        </div>

        <div>
          <label htmlFor="password" className="field-label">
            Password
          </label>
          <div className="motion-field relative">
            <Lock className="motion-field-icon pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--color-text-tertiary)]" aria-hidden="true" />
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              className="input-base auth-input-with-icon"
              placeholder="Strong password"
              aria-describedby="signup-password-help"
              aria-invalid={Boolean(error)}
            />
          </div>
          <p id="signup-password-help" className="field-help">
            Use at least 8 characters.
          </p>
        </div>

        <label className="motion-checkbox flex cursor-pointer select-none items-start gap-3 rounded-2xl border border-[rgba(202,190,255,0.12)] bg-white/[0.025] px-4 py-3">
          <input
            id="terms"
            name="terms"
            type="checkbox"
            required
            className="mt-1 h-4 w-4 rounded border-[rgba(202,190,255,0.24)] bg-transparent accent-[var(--gw-intelligence-500)]"
          />
          <span className="text-sm leading-6 text-[var(--color-text-secondary)]">
            I agree to the{' '}
            <Link to="/privacy" className="motion-nav-link inline-flex font-semibold text-[var(--gw-brand-300)] hover:text-[var(--gw-brand-200)]">
              Privacy Policy
            </Link>{' '}
            and{' '}
            <Link to="/disclaimer" className="motion-nav-link inline-flex font-semibold text-[var(--gw-brand-300)] hover:text-[var(--gw-brand-200)]">
              Medical Disclaimer
            </Link>
            .
          </span>
        </label>

        <Button type="submit" className="w-full" size="md" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Creating account
            </>
          ) : (
            'Create account'
          )}
        </Button>
      </form>
    </AuthShell>
  );
}
