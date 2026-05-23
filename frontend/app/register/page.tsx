'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Zap, Mail, Lock, UserPlus, AlertCircle, CheckCircle2, Eye, EyeOff, User } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const API_BASE = `${API_URL}/api/v1`;

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  // If user is already logged in, redirect to dashboard
  useEffect(() => {
    const existing = localStorage.getItem('token');
    if (existing) {
      router.replace('/dashboard');
    } else {
      setCheckingAuth(false);
    }
  }, [router]);

  if (checkingAuth) {
    return (
      <div className="flex-grow flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 rounded-full border-2 border-primaryAccent/30 border-t-primaryAccent animate-spin" />
      </div>
    );
  }

  const handleSubmit = async () => {
    setError(null);

    if (!name.trim()) {
      setError('Please enter your full name.');
      return;
    }

    if (!email.trim() || !password.trim() || !confirmPassword.trim()) {
      setError('Please fill in all fields.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError('Please enter a valid email address.');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please check and try again.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        // Handle pydantic validation errors (422)
        if (res.status === 422 && data?.detail) {
          if (Array.isArray(data.detail)) {
            const firstError = data.detail[0];
            throw new Error(firstError?.msg || 'Validation error. Please check your inputs.');
          }
          throw new Error(data.detail);
        }
        const message = data?.detail || 'Registration failed.';
        if (typeof message === 'string' && message.toLowerCase().includes('already')) {
          throw new Error('This email address is already registered. Please login instead.');
        }
        throw new Error(message);
      }

      setSuccess(true);

      // Auto-login: save the token returned from registration so user
      // doesn't have to log in again manually
      const token = data.token || data.access_token;
      if (token) {
        localStorage.setItem('token', token);
        if (data.user_id) localStorage.setItem('user_id', data.user_id);
      }

      // Redirect to dashboard after 1.5 seconds
      setTimeout(() => {
        router.push('/dashboard');
      }, 1500);
    } catch (err: any) {
      // Catch network errors (e.g. backend not running)
      if (err.message === 'Failed to fetch' || err.name === 'TypeError') {
        setError('Cannot connect to the server. Please make sure the backend is running on port 8000.');
      } else {
        setError(err.message || 'Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSubmit();
  };

  // Password strength indicator
  const getPasswordStrength = () => {
    if (!password) return null;
    if (password.length < 6) return { label: 'Weak', color: 'bg-dangerColor', textColor: 'text-dangerColor', width: 'w-1/4' };
    if (password.length < 8) return { label: 'Fair', color: 'bg-warningColor', textColor: 'text-warningColor', width: 'w-1/2' };
    if (password.length >= 8 && /[A-Z]/.test(password) && /[0-9]/.test(password)) {
      return { label: 'Strong', color: 'bg-successColor', textColor: 'text-successColor', width: 'w-full' };
    }
    return { label: 'Good', color: 'bg-primaryAccent', textColor: 'text-primaryAccent', width: 'w-3/4' };
  };

  const strength = getPasswordStrength();

  return (
    <div className="flex-grow flex items-center justify-center px-4 py-16 min-h-screen relative overflow-hidden">
      {/* Background glows */}
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-secondaryAccent/8 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-primaryAccent/8 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-md animate-fade-in">
        <div className="glass-card p-8 md:p-10 flex flex-col gap-7">

          {/* Header */}
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="flex items-center gap-2">
              <Zap size={22} className="text-primaryAccent" />
              <span className="font-bold text-xl text-white">
                Startup<span className="text-primaryAccent">AI</span>
              </span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white mt-1">Create your account</h1>
              <p className="text-sm text-textSecondary mt-1">Start generating AI-powered business plans</p>
            </div>
          </div>

          {/* Success State */}
          {success ? (
            <div className="flex flex-col items-center gap-4 py-6 text-center animate-slide-up">
              <div className="w-16 h-16 rounded-full bg-successColor/10 border border-successColor/30 flex items-center justify-center">
                <CheckCircle2 size={32} className="text-successColor" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Account Created!</h3>
                <p className="text-sm text-textSecondary mt-1">
                  Logging you in and redirecting to your dashboard...
                </p>
              </div>
              <div className="w-4 h-4 rounded-full border-2 border-successColor/30 border-t-successColor animate-spin" />
            </div>
          ) : (
            <div className="flex flex-col gap-4">

              {/* Full Name */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-textSecondary uppercase tracking-wider">
                  Full Name
                </label>
                <div className="relative flex items-center">
                  <User size={15} className="absolute left-3.5 text-textSecondary pointer-events-none" />
                  <input
                    id="register-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="John Doe"
                    autoComplete="name"
                    className="w-full bg-white/5 border border-borderColor rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-textSecondary focus:outline-none focus:border-primaryAccent/60 focus:bg-primaryAccent/5 focus:ring-1 focus:ring-primaryAccent/30 transition-all"
                  />
                </div>
              </div>

              {/* Email */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-textSecondary uppercase tracking-wider">
                  Email Address
                </label>
                <div className="relative flex items-center">
                  <Mail size={15} className="absolute left-3.5 text-textSecondary pointer-events-none" />
                  <input
                    id="register-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="you@example.com"
                    autoComplete="email"
                    className="w-full bg-white/5 border border-borderColor rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-textSecondary focus:outline-none focus:border-primaryAccent/60 focus:bg-primaryAccent/5 focus:ring-1 focus:ring-primaryAccent/30 transition-all"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-textSecondary uppercase tracking-wider">
                  Password
                </label>
                <div className="relative flex items-center">
                  <Lock size={15} className="absolute left-3.5 text-textSecondary pointer-events-none" />
                  <input
                    id="register-password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Minimum 8 characters"
                    autoComplete="new-password"
                    className="w-full bg-white/5 border border-borderColor rounded-xl pl-10 pr-12 py-3 text-sm text-white placeholder-textSecondary focus:outline-none focus:border-primaryAccent/60 focus:bg-primaryAccent/5 focus:ring-1 focus:ring-primaryAccent/30 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3.5 text-textSecondary hover:text-white transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                {/* Password Strength Bar */}
                {strength && (
                  <div className="flex flex-col gap-1 mt-1">
                    <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full transition-all duration-500 ${strength.color} ${strength.width}`} />
                    </div>
                    <span className="text-[10px] text-textSecondary">
                      Strength: <span className={`font-semibold ${strength.textColor}`}>{strength.label}</span>
                    </span>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-textSecondary uppercase tracking-wider">
                  Confirm Password
                </label>
                <div className="relative flex items-center">
                  <Lock size={15} className="absolute left-3.5 text-textSecondary pointer-events-none" />
                  <input
                    id="register-confirm-password"
                    type={showConfirm ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Re-enter your password"
                    autoComplete="new-password"
                    className={`w-full bg-white/5 border rounded-xl pl-10 pr-12 py-3 text-sm text-white placeholder-textSecondary focus:outline-none focus:ring-1 transition-all ${
                      confirmPassword && confirmPassword !== password
                        ? 'border-dangerColor/50 focus:border-dangerColor focus:ring-dangerColor/30'
                        : 'border-borderColor focus:border-primaryAccent/60 focus:bg-primaryAccent/5 focus:ring-primaryAccent/30'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm((v) => !v)}
                    className="absolute right-3.5 text-textSecondary hover:text-white transition-colors"
                    tabIndex={-1}
                  >
                    {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                {confirmPassword && confirmPassword !== password && (
                  <span className="text-[10px] text-dangerColor">Passwords do not match</span>
                )}
              </div>

              {/* Error Message */}
              {error && (
                <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-dangerColor/10 border border-dangerColor/25 animate-slide-up">
                  <AlertCircle size={15} className="text-dangerColor flex-shrink-0 mt-0.5" />
                  <p className="text-dangerColor text-xs leading-relaxed">{error}</p>
                </div>
              )}

              {/* Submit Button */}
              <button
                id="register-submit-btn"
                onClick={handleSubmit}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl bg-indigo-violet text-white font-semibold text-sm hover:opacity-90 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-primaryAccent/25 mt-1"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    Creating account...
                  </>
                ) : (
                  <>
                    <UserPlus size={16} />
                    Create Account
                  </>
                )}
              </button>
            </div>
          )}

          {/* Footer Link */}
          <p className="text-center text-xs text-textSecondary">
            Already have an account?{' '}
            <Link
              href="/login"
              className="text-primaryAccent hover:text-secondaryAccent font-semibold transition-colors"
            >
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
