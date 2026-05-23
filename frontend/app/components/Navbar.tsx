'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Zap, LogOut, LogIn, UserPlus } from 'lucide-react';

const NAV_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'Analyze', href: '/analyze' },
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'Chat', href: '/chat' },
];

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [token, setToken] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  /**
   * BUG 4 FIX: localStorage is read ONLY inside useEffect (client-side).
   * Re-runs on every route change (pathname) so the logout button
   * appears/disappears immediately after login/logout.
   */
  useEffect(() => {
    const stored = localStorage.getItem('token');
    setToken(stored);
  }, [pathname]);

  const handleLogout = () => {
    // BUG 5 FIX: Clear all auth data from localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user_id');
    setToken(null);
    setMenuOpen(false);
    router.push('/login');
  };

  return (
    <header className="sticky top-0 z-50 border-b border-borderColor bg-background/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between gap-4">

        {/* Logo */}
        <Link
          href="/"
          id="navbar-logo"
          className="flex items-center gap-2 hover:opacity-90 transition-opacity flex-shrink-0"
          onClick={() => setMenuOpen(false)}
        >
          <Zap size={20} className="text-primaryAccent" />
          <span className="font-bold text-lg md:text-xl tracking-tight text-white">
            Startup<span className="text-primaryAccent">AI</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-primaryAccent/10 text-primaryAccent border border-primaryAccent/20'
                    : 'text-textSecondary hover:text-white hover:bg-white/5'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Desktop Auth Actions */}
        <div className="hidden md:flex items-center gap-2">
          {token ? (
            <button
              id="navbar-logout-btn"
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-textSecondary hover:text-white hover:bg-white/10 transition-all font-medium"
            >
              <LogOut size={14} />
              Logout
            </button>
          ) : (
            <>
              <Link
                href="/login"
                id="navbar-login-btn"
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm text-textSecondary hover:text-white hover:bg-white/5 transition-all font-medium"
              >
                <LogIn size={14} />
                Login
              </Link>
              <Link
                href="/register"
                id="navbar-register-btn"
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-violet text-white text-sm font-semibold hover:opacity-90 transition-all shadow-lg shadow-primaryAccent/20"
              >
                <UserPlus size={14} />
                Register
              </Link>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden flex items-center justify-center w-9 h-9 rounded-lg bg-white/5 border border-white/10 text-textSecondary hover:text-white transition-all"
          onClick={() => setMenuOpen((prev) => !prev)}
          aria-label="Toggle menu"
        >
          <span className="flex flex-col gap-1">
            <span className={`block w-4 h-0.5 bg-current transition-all ${menuOpen ? 'rotate-45 translate-y-1.5' : ''}`} />
            <span className={`block w-4 h-0.5 bg-current transition-all ${menuOpen ? 'opacity-0' : ''}`} />
            <span className={`block w-4 h-0.5 bg-current transition-all ${menuOpen ? '-rotate-45 -translate-y-1.5' : ''}`} />
          </span>
        </button>
      </div>

      {/* Mobile Dropdown Menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-borderColor bg-background/95 backdrop-blur-md px-4 py-4 flex flex-col gap-2 animate-slide-up">
          {NAV_LINKS.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className={`px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-primaryAccent/10 text-primaryAccent border border-primaryAccent/20'
                    : 'text-textSecondary hover:text-white hover:bg-white/5'
                }`}
              >
                {link.label}
              </Link>
            );
          })}

          <div className="border-t border-borderColor mt-2 pt-2 flex flex-col gap-2">
            {token ? (
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm text-dangerColor hover:bg-dangerColor/10 transition-all font-medium text-left"
              >
                <LogOut size={14} />
                Logout
              </button>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm text-textSecondary hover:text-white hover:bg-white/5 transition-all font-medium"
                >
                  <LogIn size={14} />
                  Login
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2 px-4 py-3 rounded-xl bg-indigo-violet text-white text-sm font-semibold hover:opacity-90 transition-all text-center justify-center"
                >
                  <UserPlus size={14} />
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
