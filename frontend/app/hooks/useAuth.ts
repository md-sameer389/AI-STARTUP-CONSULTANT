'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

/**
 * BUG 4 FIX: useAuth — SSR-safe authentication hook
 *
 * Rules enforced here:
 * 1. localStorage is NEVER accessed at module load time or during SSR render.
 *    It is ONLY read inside useEffect (runs client-side only).
 * 2. If no token is found → redirect to /login immediately.
 * 3. Exposes: token (the JWT string or null), isLoading (auth check in progress), logout().
 */
export function useAuth() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  // Prevent double-redirect on StrictMode double-mount
  const redirected = useRef(false);

  useEffect(() => {
    // CORRECT: localStorage only accessed inside useEffect (client-side only)
    const storedToken = localStorage.getItem('token');

    if (storedToken) {
      setToken(storedToken);
    } else if (!redirected.current) {
      // No token → redirect to login
      redirected.current = true;
      router.replace('/login');
    }

    setIsLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  /**
   * BUG 5 FIX: Logout — clears both token and user_id from localStorage,
   * resets local state, and redirects to login page.
   */
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user_id');
    setToken(null);
    router.replace('/login');
  };

  return { token, isLoading, logout };
}
