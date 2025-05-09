"use client";

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export function withAuth(Component) {
  return function ProtectedRoute(props) {
    const { user, loading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
      // Allow access to story pages even when not logged in
      const isStoryPage = pathname.startsWith('/dashboard/stories/');
      
      if (!loading && !user && !isStoryPage) {
        console.log('No user found, redirecting to home');
        router.push('/');
      }
    }, [user, loading, router, pathname]);

    // Show loading state while checking authentication
    if (loading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      );
    }

    // If no user and not on a story page, don't render the component
    if (!user && !pathname.startsWith('/dashboard/stories/')) {
      return null;
    }

    // If user exists or on a story page, render the protected component
    return <Component {...props} />;
  };
}
