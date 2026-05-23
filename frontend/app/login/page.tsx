'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Zap, Mail, Lock, LogIn, AlertCircle, Eye, EyeOff } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const API_BASE = `${API_URL}/api/v1`;

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  // BUG 4 FIX: localStorage must only be read inside useEffect (never at SSR time)
  // If user is already logged in → skip the login page and go straight to dashboard
  useEffect(() => {
    const existingToken = localStorage.getItem('token');
    if (existingToken) {
      router.replace('/dashboard');
    } else {
      setCheckingAuth(false);
    }
  }, [router]);

  // Show spinner while checking existing session
  if (checkingAuth) {
    return (
      <div className="flex-grow flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 rounded-full border-2 border-primaryAccent/30 border-t-primaryAccent animate-spin" />
      </div>
    );
  }

  // BUG 5 FIX: Complete auth flow — POST → receive token → save → redirect
  const handleSubmit = async () => {
    setError(null);

    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }
    if (!password.trim()) {
      setError('Please enter your password.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
      });

      const data = await res.json();

      if (!res.ok) {
        // FastAPI returns { detail: "..." } for 401/422 errors
        const message = Array.isArray(data?.detail)
          ? data.detail[0]?.msg || 'Invalid email or password.'
          : data?.detail || 'Invalid email or password.';
        throw new Error(message);
      }

      // BUG 4 FIX: Backend may return { token, user_id } or { access_token, token_type }
      // Support both response shapes — always save as "token" key
      const token = data.token || data.access_token;
      if (!token) {
        throw new Error('No authentication token received from server. Please try again.');
      }

      // Save token with exact key "token" — this is what AuthGuard and useAuth check
      localStorage.setItem('token', token);
      if (data.user_id) {
        localStorage.setItem('user_id', data.user_id);
      }

      // Redirect to dashboard after successful auth
      router.push('/dashboard');
    } catch (err: any) {
      if (err.name === 'TypeError' || err.message === 'Failed to fetch') {
        setError('Cannot connect to server. Make sure the backend is running on port 8000.');
      } else {
        setError(err.message || 'Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Allow Enter key to submit from either field
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !loading) {
      handleSubmit();
    }
  };

  return (
    <div className="flex-grow flex items-center justify-center px-4 py-16 min-h-screen relative overflow-hidden">
      {/* Background glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primaryAccent/8 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-secondaryAccent/8 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-md animate-fade-in">
        {/* Card */}
        <div className="glass-card p-8 md:p-10 flex flex-col gap-8">

          {/* Header */}
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="flex items-center gap-2">
              <Zap size={22} className="text-primaryAccent" />
              <span className="font-bold text-xl text-white">
                Startup<span className="text-primaryAccent">AI</span>
              </span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white mt-1">Welcome back</h1>
              <p className="text-sm text-textSecondary mt-1">Sign in to access your AI consultant</p>
            </div>
          </div>

          {/* Form — using div not form tag (per requirements) */}
          <div className="flex flex-col gap-4">

            {/* Email field */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="login-email" className="text-xs font-semibold text-textSecondary uppercase tracking-wider">
                Email Address
              </label>
              <div className="relative flex items-center">
                <Mail size={15} className="absolute left-3.5 text-textSecondary pointer-events-none" />
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError(null);
                  }}
                  onKeyDown={handleKeyDown}
                  placeholder="you@example.com"
                  autoComplete="email"
                  disabled={loading}
                  className="w-full bg-white/5 border border-borderColor rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-textSecondary focus:outline-none focus:border-primaryAccent/60 focus:bg-primaryAccent/5 focus:ring-1 focus:ring-primaryAccent/30 transition-all disabled:opacity-60"
                />
              </div>
            </div>

            {/* Password field */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="login-password" className="text-xs font-semibold text-textSecondary uppercase tracking-wider">
                Password
              </label>
              <div className="relative flex items-center">
                <Lock size={15} className="absolute left-3.5 text-textSecondary pointer-events-none" />
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError(null);
                  }}
                  onKeyDown={handleKeyDown}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  disabled={loading}
                  className="w-full bg-white/5 border border-borderColor rounded-xl pl-10 pr-12 py-3 text-sm text-white placeholder-textSecondary focus:outline-none focus:border-primaryAccent/60 focus:bg-primaryAccent/5 focus:ring-1 focus:ring-primaryAccent/30 transition-all disabled:opacity-60"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3.5 text-textSecondary hover:text-white transition-colors"
                  tabIndex={-1}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Error message */}
            {error && (
              <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-dangerColor/10 border border-dangerColor/25 animate-slide-up">
                <AlertCircle size={15} className="text-dangerColor flex-shrink-0 mt-0.5" />
                <p className="text-dangerColor text-xs leading-relaxed">{error}</p>
              </div>
            )}

            {/* Submit button — onClick, not form submit */}
            <button
              id="login-submit-btn"
              onClick={handleSubmit}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl bg-indigo-violet text-white font-semibold text-sm hover:opacity-90 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-primaryAccent/25 mt-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  <LogIn size={16} />
                  Sign In
                </>
              )}
            </button>
          </div>

          {/* Footer */}
          <p className="text-center text-xs text-textSecondary">
            Don&apos;t have an account?{' '}
            <Link
              href="/register"
              className="text-primaryAccent hover:text-secondaryAccent font-semibold transition-colors"
            >
              Register for free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
