import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sun, Moon, Calendar, CheckCircle, Waves, Utensils, Droplet, AlertCircle } from 'lucide-react';
import DailyProgressCircle from './DailyProgressCircle';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

interface TodaySummaryWidgetProps {
  bmCount: number;
  mealsCount: number;
  snacksCount: number;
  hydrationMl: number;
  sleepHours: number | null;
  symptomsCount: number;
  loading: boolean;
  userName?: string;
}

interface Domain {
  label: string;
  logged: boolean;
  icon: React.ComponentType<{ className?: string }>;
  dotColor: string;
}

export default function TodaySummaryWidget({
  bmCount,
  mealsCount,
  snacksCount,
  hydrationMl,
  sleepHours,
  symptomsCount,
  loading,
  userName,
}: TodaySummaryWidgetProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [streakDays, setStreakDays] = useState(0);
  const [loggedToday, setLoggedToday] = useState(false);
  const [streakLoading, setStreakLoading] = useState(true);

  useEffect(() => {
    if (user) {
      calculateStreak();
    }
  }, [user]);

  const calculateStreak = async () => {
    if (!user) return;

    try {
      setStreakLoading(true);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      let streak = 0;
      const checkDate = new Date(today);
      let hasLoggedToday = false;

      const tables = ['bm_logs', 'food_logs', 'hydration_logs', 'symptom_logs', 'sleep_logs', 'stress_logs'];

      for (let i = 0; i < 400; i++) {
        const dayStart = new Date(checkDate);
        dayStart.setHours(0, 0, 0, 0);
        const dayEnd = new Date(checkDate);
        dayEnd.setHours(23, 59, 59, 999);

        let dayHasLogs = false;

        for (const table of tables) {
          const { count } = await supabase
            .from(table)
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id)
            .gte('logged_at', dayStart.toISOString())
            .lte('logged_at', dayEnd.toISOString());

          if ((count || 0) > 0) {
            dayHasLogs = true;
            break;
          }
        }

        if (i === 0) {
          hasLoggedToday = dayHasLogs;
          if (dayHasLogs) streak++;
        } else if (dayHasLogs) {
          streak++;
        } else {
          break;
        }

        checkDate.setDate(checkDate.getDate() - 1);
      }

      setStreakDays(streak);
      setLoggedToday(hasLoggedToday);
    } catch {
      setStreakDays(0);
    } finally {
      setStreakLoading(false);
    }
  };

  const totalFood = mealsCount + snacksCount;

  const domains: Domain[] = [
    { label: 'BM', logged: bmCount > 0, icon: Waves, dotColor: '#A78BFA' },
    { label: 'Food', logged: totalFood > 0, icon: Utensils, dotColor: '#C084FC' },
    { label: 'Hydration', logged: hydrationMl > 0, icon: Droplet, dotColor: '#8B5CF6' },
    { label: 'Sleep', logged: sleepHours !== null, icon: Moon, dotColor: '#7C3AED' },
    { label: 'Symptoms', logged: symptomsCount > 0, icon: AlertCircle, dotColor: '#D8B4FE' },
  ];

  const loggedCount = domains.filter((d) => d.logged).length;
  const totalDomains = domains.length;

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return { text: 'Good morning', icon: Sun };
    if (hour < 18) return { text: 'Good afternoon', icon: Sun };
    return { text: 'Good evening', icon: Moon };
  };

  const greeting = getGreeting();
  const GreetingIcon = greeting.icon;

  const getStatusHeadline = () => {
    if (loggedCount === 0) return 'Your health picture starts here';
    if (loggedCount === totalDomains) return "Today's picture is complete";
    if (loggedCount >= 3) return 'Good progress today';
    return "Building today's picture";
  };

  const getSnapshotSupportLine = () => {
    if (loggedCount === 0) return 'Log your first entry to bring today into focus';
    if (loggedCount === totalDomains) return `All ${totalDomains} core signals captured`;
    if (loggedCount === 1) return 'Each signal sharpens today\'s picture';
    const remaining = totalDomains - loggedCount;
    if (remaining === 1) return 'One more signal completes the picture';
    return `${remaining} signals left to complete today`;
  };

  const getGuidanceStrip = (): { message: string; ctaText: string | null; ctaPath: string | null } => {
    if (loggedCount === totalDomains) {
      return { message: 'All core signals are captured for today. Your picture is complete.', ctaText: null, ctaPath: null };
    }
    if (loggedCount === 0) {
      return { message: 'Log your first entry to begin today\'s snapshot.', ctaText: 'Start logging', ctaPath: '/bm-log' };
    }
    if (!domains[2].logged) {
      return { message: 'Hydration is the clearest missing signal today.', ctaText: 'Log hydration', ctaPath: '/hydration-log' };
    }
    if (!domains[1].logged) {
      return { message: 'A food entry would strengthen today\'s picture.', ctaText: 'Log food', ctaPath: '/food-log' };
    }
    if (!domains[0].logged) {
      return { message: 'Add a bowel movement to complete the gut picture.', ctaText: 'Log BM', ctaPath: '/bm-log' };
    }
    if (!domains[3].logged) {
      return { message: 'Sleep data would add useful context to today\'s pattern.', ctaText: 'Log sleep', ctaPath: '/sleep-log' };
    }
    return { message: 'One more core entry will sharpen today\'s picture.', ctaText: 'Log symptoms', ctaPath: '/symptoms-log' };
  };

  if (loading) {
    return (
      <div className="signal-card p-5 sm:p-6">
        <div className="animate-pulse space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-neutral-border dark:bg-dark-border rounded-lg flex-shrink-0" />
              <div className="h-4 bg-neutral-border dark:bg-dark-border rounded w-36" />
            </div>
            <div className="h-8 w-24 bg-neutral-border dark:bg-dark-border rounded-xl flex-shrink-0" />
          </div>
          <div className="flex items-start gap-6">
            <div className="flex-1 space-y-3">
              <div className="h-6 bg-neutral-border dark:bg-dark-border rounded w-64" />
              <div className="h-4 bg-neutral-border dark:bg-dark-border rounded w-56" />
              <div className="flex gap-2 flex-wrap">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-7 w-20 bg-neutral-border dark:bg-dark-border rounded-full" />
                ))}
              </div>
            </div>
            <div className="flex-shrink-0 flex flex-col items-center gap-3">
              <div className="h-3 w-24 bg-neutral-border dark:bg-dark-border rounded" />
              <div className="w-[120px] h-[120px] bg-neutral-border dark:bg-dark-border rounded-full" />
              <div className="h-3 w-32 bg-neutral-border dark:bg-dark-border rounded" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  const guidance = getGuidanceStrip();

  return (
    <section className="card-enter signal-card p-5 sm:p-6 lg:p-7">
      <div className="glass-sheen-overlay" aria-hidden="true" />

      <div className="relative grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
        <div className="flex min-w-0 flex-col justify-between gap-6">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <span className="signal-badge signal-badge-daily">
                <GreetingIcon className="h-3.5 w-3.5" />
                {greeting.text}{userName ? `, ${userName}` : ''}
              </span>

              {streakLoading ? (
                <span className="h-8 w-24 animate-pulse rounded-full bg-white/[0.06]" />
              ) : streakDays > 0 || loggedToday ? (
                <span className="signal-badge signal-badge-major">
                  {loggedToday && <CheckCircle className="h-3.5 w-3.5" />}
                  {streakDays}d streak
                </span>
              ) : (
                <span className="signal-badge signal-badge-daily">
                  <Calendar className="h-3.5 w-3.5" />
                  Start streak
                </span>
              )}
            </div>

            <div>
              <p className="data-kicker">Daily signal matrix</p>
              <h2 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-[var(--color-text-primary)]">
                {getStatusHeadline()}
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--color-text-secondary)]">
                {getSnapshotSupportLine()}. GutWise gets more useful when core signals overlap in
                the same day.
              </p>
            </div>
          </div>

          <div className="grid gap-2 sm:grid-cols-5">
            {domains.map((domain) => {
              const Icon = domain.icon;
              return (
                <div
                  key={domain.label}
                  className={[
                    'rounded-2xl border px-3 py-3 transition-smooth',
                    domain.logged
                      ? 'border-[rgba(197,168,255,0.24)] bg-[rgba(139,92,246,0.1)]'
                      : 'border-white/10 bg-white/[0.026]',
                  ].join(' ')}
                >
                  <div className="mb-3 flex items-center justify-between gap-2">
                    <div
                      className={[
                        'flex h-8 w-8 items-center justify-center rounded-xl',
                        domain.logged
                          ? 'bg-[rgba(139,92,246,0.2)] text-[var(--gw-intelligence-200)]'
                          : 'bg-white/[0.05] text-[var(--color-text-tertiary)]',
                      ].join(' ')}
                    >
                      <Icon className="h-3.5 w-3.5" />
                    </div>
                    {domain.logged && <CheckCircle className="h-3.5 w-3.5 text-[var(--gw-intelligence-300)]" />}
                  </div>
                  <p className="text-sm font-semibold text-[var(--color-text-primary)]">{domain.label}</p>
                  <p className="mt-1 text-xs text-[var(--color-text-tertiary)]">
                    {domain.logged ? 'Captured' : 'Needed'}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="rounded-[24px] border border-[rgba(197,168,255,0.16)] bg-white/[0.035] p-4">
            <p className="data-kicker mb-2">Next best step</p>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <p className="text-sm leading-6 text-[var(--color-text-secondary)]">
                {guidance.message}
              </p>
              {guidance.ctaText && guidance.ctaPath && (
                <button
                  onClick={() => navigate(guidance.ctaPath!)}
                  className="inline-flex flex-shrink-0 items-center justify-center rounded-full border border-[rgba(197,168,255,0.22)] bg-[rgba(139,92,246,0.12)] px-4 py-2 text-sm font-semibold text-[var(--gw-intelligence-200)] transition-smooth hover:border-[rgba(197,168,255,0.36)] hover:bg-[rgba(139,92,246,0.18)]"
                >
                  {guidance.ctaText}
                </button>
              )}
            </div>
          </div>
        </div>

        <aside className="flex flex-col items-center justify-center rounded-[28px] border border-[rgba(197,168,255,0.16)] bg-[rgba(7,10,24,0.34)] p-5">
          <p className="data-kicker mb-4">Today&apos;s snapshot</p>
          <div className="flex flex-col items-center gap-3">
            <DailyProgressCircle
              bmLogged={bmCount > 0}
              foodLogged={totalFood > 0}
              hydrationLogged={hydrationMl > 0}
              sleepLogged={sleepHours !== null}
              symptomsLogged={symptomsCount > 0}
              size={150}
              stroke={10}
            />

            <p className="max-w-[180px] text-center text-sm leading-6 text-[var(--color-text-secondary)]">
              {loggedCount} of {totalDomains} core signals captured.
            </p>

            <div className="flex items-center gap-2 pt-1">
              {domains.map((domain) => (
                <div
                  key={domain.label}
                  title={domain.label}
                >
                  <div
                    className="w-2 h-2 rounded-full transition-opacity duration-500"
                    style={{
                      backgroundColor: domain.dotColor,
                      opacity: domain.logged ? 1 : 0.2,
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}
