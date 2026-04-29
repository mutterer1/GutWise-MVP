import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Brain,
  Frown,
  FileText,
  Settings,
  Menu,
  X,
  Waves,
  TrendingUp,
  ChevronDown,
  Droplet,
  Utensils,
  AlertCircle,
  Moon,
  Pill,
  Heart,
  BookOpen,
  Sun,
  Dumbbell,
  ClipboardCheck,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { DEV_CYCLE_LOG_ACCESS } from '../lib/devFlags';

const mainNavigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Daily Check-In', href: '/daily-check-in', icon: ClipboardCheck },
  { name: 'Logging Hub', href: null, icon: BookOpen, submenu: true },
  { name: 'Health Insights', href: '/insights', icon: Brain },
  { name: 'Trends & Analytics', href: '/trends', icon: TrendingUp },
  { name: 'Reports', href: '/reports', icon: FileText },
  { name: 'Settings', href: '/settings', icon: Settings },
];

interface LoggingMenuItem {
  name: string;
  href: string;
  icon: typeof Waves;
  group: 'core' | 'lifestyle' | 'context';
}

const loggingSubmenu: LoggingMenuItem[] = [
  { name: 'Bowel Movement', href: '/bm-log', icon: Waves, group: 'core' },
  { name: 'Symptoms', href: '/symptoms-log', icon: AlertCircle, group: 'core' },
  { name: 'Food Intake', href: '/food-log', icon: Utensils, group: 'core' },
  { name: 'Hydration', href: '/hydration-log', icon: Droplet, group: 'core' },
  { name: 'Sleep', href: '/sleep-log', icon: Moon, group: 'lifestyle' },
  { name: 'Stress', href: '/stress-log', icon: Frown, group: 'lifestyle' },
  { name: 'Exercise', href: '/exercise-log', icon: Dumbbell, group: 'lifestyle' },
  { name: 'Medication', href: '/medication-log', icon: Pill, group: 'context' },
  { name: 'Menstrual Cycle', href: '/menstrual-cycle-log', icon: Heart, group: 'context' },
];

const loggingGroups: { key: LoggingMenuItem['group']; label: string }[] = [
  { key: 'core', label: 'Core' },
  { key: 'lifestyle', label: 'Lifestyle' },
  { key: 'context', label: 'Context' },
];

const navItemBase =
  'motion-nav-link flex min-h-10 items-center gap-3 rounded-[var(--gw-radius-md)] border border-transparent px-3 py-2.5 text-sm font-semibold transition-colors duration-150';
const navItemActive =
  'border-[rgba(197,168,255,0.18)] bg-[rgba(139,92,246,0.1)] text-[var(--gw-intelligence-100)]';
const navItemIdle =
  'text-neutral-text hover:border-[rgba(202,190,255,0.12)] hover:bg-neutral-bg dark:text-dark-text dark:hover:bg-dark-surface';
const subNavItemBase =
  'motion-nav-link flex min-h-9 items-center gap-2.5 rounded-[var(--gw-radius-md)] border border-transparent px-3 py-2 text-sm font-medium transition-colors duration-150';
const subNavItemIdle =
  'text-neutral-muted hover:border-[rgba(202,190,255,0.12)] hover:bg-neutral-bg hover:text-neutral-text dark:text-dark-muted dark:hover:bg-dark-surface dark:hover:text-dark-text';
const disabledSubNavItem =
  'cursor-not-allowed border-[rgba(202,190,255,0.08)] bg-white/[0.02] text-neutral-muted/60 dark:text-dark-muted/55';

function isCycleTrackingRelevant(gender: string | null | undefined): boolean {
  if (DEV_CYCLE_LOG_ACCESS) return true;
  return gender !== 'male';
}

export default function Sidebar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [expandedLoggingHub, setExpandedLoggingHub] = useState(false);

  const location = useLocation();
  const { user, profile } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const cycleRelevant = isCycleTrackingRelevant(profile?.gender);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024 && isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isMobileMenuOpen]);

  const displayName = profile?.full_name || user?.email?.split('@')[0] || 'User';

  const userEmail = profile?.email || user?.email || '';

  const getInitial = () => {
    return displayName.charAt(0).toUpperCase() || 'U';
  };

  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(`${path}/`);

  const isLoggingHubActive = loggingSubmenu.some((item) => isActive(item.href));

  useEffect(() => {
    if (isLoggingHubActive) {
      setExpandedLoggingHub(true);
    }
  }, [isLoggingHubActive]);

  return (
    <>
      <div className="motion-reveal-soft fixed top-0 left-0 right-0 z-50 flex h-14 items-center gap-2 border-b border-neutral-border bg-neutral-surface/95 px-3 backdrop-blur-md lg:hidden dark:border-dark-border dark:bg-dark-bg/95">
        <button
          type="button"
          className="motion-icon-button flex-shrink-0 rounded-[var(--gw-radius-md)] border border-transparent p-2 transition-colors hover:border-[rgba(202,190,255,0.12)] hover:bg-neutral-bg dark:hover:bg-dark-surface"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={isMobileMenuOpen}
          aria-controls="app-sidebar"
        >
          {isMobileMenuOpen ? (
            <X className="h-5 w-5 text-neutral-text dark:text-dark-text" />
          ) : (
            <Menu className="h-5 w-5 text-neutral-text dark:text-dark-text" />
          )}
        </button>
        <Link to="/dashboard" className="motion-nav-link flex items-center rounded-[var(--gw-radius-md)]" onClick={() => setIsMobileMenuOpen(false)}>
          <img
            src="/logos/gutwise-horizontal-dark.svg"
            alt="GutWise"
            style={{ height: '42px', width: 'auto', imageRendering: 'auto' }}
          />
        </Link>
      </div>

      <aside
        id="app-sidebar"
        className={`
          fixed top-0 left-0 z-50 h-screen w-64 border-r border-neutral-border bg-neutral-surface
          transition-transform duration-200 ease-[var(--gw-motion-ease-emphasized)] dark:border-dark-border dark:bg-dark-bg
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0
        `}
      >
        <div className="flex h-full flex-col">
          <div className="relative flex items-center justify-start border-b border-neutral-border px-4 py-4 dark:border-dark-border">
            <Link to="/dashboard" className="flex items-center" onClick={() => setIsMobileMenuOpen(false)}>
              <img
                src="/logos/gutwise-horizontal-dark.svg"
                alt="GutWise"
                style={{ height: '56px', width: 'auto' }}
              />
            </Link>
            <button
              onClick={toggleTheme}
              className="motion-icon-button absolute right-4 rounded-[var(--gw-radius-md)] border border-transparent p-2 transition-colors hover:border-[rgba(202,190,255,0.12)] hover:bg-neutral-bg dark:hover:bg-dark-surface"
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {theme === 'dark' ? (
                <Sun className="h-5 w-5 text-dark-muted" />
              ) : (
                <Moon className="h-5 w-5 text-neutral-muted" />
              )}
            </button>
          </div>

          <nav className="flex-1 space-y-1.5 overflow-y-auto px-3 py-4">
            {mainNavigation.map((item) => {
              const Icon = item.icon;
              const isLoggingHub = item.name === 'Logging Hub';
              const active = item.href ? isActive(item.href) : false;
              const showLoggingHubActive = isLoggingHub && isLoggingHubActive;

              if (isLoggingHub) {
                return (
                  <div key={item.name}>
                    <button
                      onClick={() => setExpandedLoggingHub(!expandedLoggingHub)}
                      aria-expanded={expandedLoggingHub}
                      aria-controls="logging-hub-submenu"
                      className={`w-full ${navItemBase} ${showLoggingHubActive ? navItemActive : navItemIdle}`}
                    >
                      <Icon className="h-5 w-5" />
                      <span className="flex-1 text-left">{item.name}</span>
                      <ChevronDown
                        className={`h-4 w-4 transition-transform duration-200 ${
                          expandedLoggingHub ? 'rotate-180' : ''
                        }`}
                      />
                    </button>

                    {expandedLoggingHub && (
                      <div id="logging-hub-submenu" className="mt-2 ml-2 border-l border-neutral-border/70 pl-2 dark:border-dark-border/70">
                        {loggingGroups.map((group, groupIdx) => {
                          const groupItems = loggingSubmenu.filter((s) => s.group === group.key);
                          return (
                            <div
                              key={group.key}
                              className={
                                groupIdx > 0
                                  ? 'mt-1 border-t border-neutral-border/50 pt-1 dark:border-dark-border/50'
                                  : ''
                              }
                            >
                              <span className="block px-3 pt-1.5 pb-0.5 text-[9px] font-semibold uppercase tracking-[0.08em] text-neutral-muted/55 dark:text-dark-muted/45">
                                {group.label}
                              </span>
                              {groupItems.map((subitem) => {
                                const SubIcon = subitem.icon;
                                const subActive = isActive(subitem.href);
                                const isCycleItem = subitem.href === '/menstrual-cycle-log';
                                const dimmed = isCycleItem && !cycleRelevant;
                                if (dimmed) {
                                  return (
                                    <div
                                      key={subitem.name}
                                      className={`${subNavItemBase} ${disabledSubNavItem}`}
                                      role="link"
                                      aria-disabled="true"
                                      title="Unavailable for this profile"
                                    >
                                      <SubIcon className="h-4 w-4 flex-shrink-0" />
                                      <span className="min-w-0">
                                        <span className="block text-xs font-semibold leading-4">
                                          {subitem.name}
                                        </span>
                                        <span className="block text-[11px] font-medium leading-4 text-neutral-muted/70 dark:text-dark-muted/60">
                                          Unavailable for this profile
                                        </span>
                                      </span>
                                    </div>
                                  );
                                }

                                return (
                                  <Link
                                    key={subitem.name}
                                    to={subitem.href}
                                    className={`${subNavItemBase} ${subActive ? navItemActive : subNavItemIdle}`}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    aria-current={subActive ? 'page' : undefined}
                                  >
                                    <SubIcon className="h-4 w-4 flex-shrink-0" />
                                    <span className="text-xs">{subitem.name}</span>
                                  </Link>
                                );
                              })}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              }

              return (
                <Link
                  key={item.name}
                  to={item.href!}
                  className={`${navItemBase} ${active ? navItemActive : navItemIdle}`}
                  onClick={() => setIsMobileMenuOpen(false)}
                  aria-current={active ? 'page' : undefined}
                >
                  <Icon className="h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          <div className="border-t border-neutral-border px-4 py-4 dark:border-dark-border">
            <Link
              to="/account"
              className="motion-nav-link flex items-center gap-3 rounded-[var(--gw-radius-md)] border border-transparent px-2 py-2 transition-colors duration-150 hover:border-[rgba(202,190,255,0.12)] hover:bg-neutral-bg dark:hover:bg-dark-surface"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-brand-700 font-semibold text-white">
                {getInitial()}
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-neutral-text dark:text-dark-text">
                  {displayName}
                </p>
                <p className="truncate text-xs text-neutral-muted dark:text-dark-muted">{userEmail}</p>
              </div>
            </Link>
          </div>
        </div>
      </aside>

      {isMobileMenuOpen && (
        <div
          className="animate-overlay-in fixed inset-0 z-40 bg-black/45 backdrop-blur-[2px] lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}
    </>
  );
}
