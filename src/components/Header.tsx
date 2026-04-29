import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import Button from './Button';

export default function Header() {
  return (
    <header className="motion-reveal-soft fixed inset-x-0 top-0 z-30 border-b border-[rgba(202,190,255,0.1)] bg-[rgba(7,10,24,0.86)] backdrop-blur-xl">
      <nav
        className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:h-[72px] sm:px-6 lg:px-8"
        aria-label="Top navigation"
      >
        <Link to="/" className="motion-nav-link flex items-center rounded-2xl" aria-label="GutWise home">
          <img
            src="/logos/gutwise-horizontal-dark.svg"
            alt="GutWise"
            className="block h-[42px] w-auto sm:h-[50px]"
          />
        </Link>

        <div className="hidden items-center gap-3 md:flex">
          <Link to="/login">
            <Button variant="ghost" size="sm" className="min-w-[92px]">
              Log in
            </Button>
          </Link>

          <Link to="/signup">
            <Button variant="primary" size="sm" className="min-w-[140px]">
              Create account
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Button>
          </Link>
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <Link to="/login">
            <Button variant="ghost" size="sm" className="min-h-[38px] px-3 text-sm">
              Log in
            </Button>
          </Link>
        </div>
      </nav>
    </header>
  );
}
