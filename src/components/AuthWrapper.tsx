'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import BouncingDots from './BouncingDots';

export default function AuthWrapper({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  // Only run on client-side
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || loading) return;

    const pathname = window.location.pathname;
    // Handle trailing slashes by normalizing the pathname
    const normalizedPathname = pathname.endsWith('/') && pathname.length > 1
      ? pathname.slice(0, -1)
      : pathname;
    const isLoginPage = normalizedPathname === '/login';
    const isRootPage = normalizedPathname === '/';

    // Get token to check if we have a valid custom token
    const token = localStorage.getItem('token');

    if (user) {
      // Authenticated user redirections
      // Only redirect to dashboard if we have a valid token
      // On login page, let the login flow handle the redirect after OTP verification
      if ((isLoginPage || isRootPage) && token) {
        router.push('/dashboard');
      }
    } else {
      // Unauthenticated user redirections
      // On login page, don't redirect - let user log in
      if (!isLoginPage) {
        router.push('/login');
      }
    }
  }, [user, loading, router, mounted]);

  // Don't render anything on server-side
  if (!mounted) {
    return null;
  }

  // Show loading spinner while auth is loading
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <BouncingDots />
      </div>
    );
  }

  return <>{children}</>;
}