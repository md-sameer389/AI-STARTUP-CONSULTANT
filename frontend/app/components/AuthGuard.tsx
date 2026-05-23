'use client';

import React from 'react';
import { useAuth } from '../hooks/useAuth';

interface AuthGuardProps {
  children: React.ReactNode;
}

/**
 * BUG 4 FIX: AuthGuard — wraps protected pages.
 *
 * Shows a loading spinner while the auth check is running (useEffect is async).
 * If no token found → useAuth redirects to /login automatically.
 * If token found → renders children.
 *
 * NEVER accesses localStorage directly — delegates to useAuth hook which
 * handles it safely inside useEffect (client-side only).
 */
export default function AuthGuard({ children }: AuthGuardProps) {
  const { token, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex-grow flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-12 h-12">
            <div className="absolute inset-0 rounded-full border-2 border-primaryAccent/20" />
            <div className="absolute inset-0 rounded-full border-2 border-t-primaryAccent animate-spin" />
          </div>
          <p className="text-textSecondary text-sm">Verifying session...</p>
        </div>
      </div>
    );
  }

  // If no token, useAuth has already triggered router.replace('/login').
  // Render null to avoid flash of protected content during the redirect.
  if (!token) {
    return null;
  }

  return <>{children}</>;
}
