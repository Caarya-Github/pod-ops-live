'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import BouncingDots from './BouncingDots';

export default function AuthWrapper({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    if (!loading) {
      const isLoginPage = window.location.pathname === '/login';
      if (user && isLoginPage) {
        router.push('/dashboard');
      } else if (!user && !isLoginPage) {
        router.push('/login');
      } else {
        setShouldRender(true);
      }
    }
  }, [user, loading, router]);

  if (loading || !shouldRender) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <BouncingDots />
      </div>
    );
  }

  return <>{children}</>;
}