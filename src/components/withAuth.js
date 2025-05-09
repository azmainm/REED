"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export function withAuth(Component) {
  return function ProtectedRoute(props) {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (!loading && !user) {
        console.log('No user found, redirecting to home');
        router.push('/');
      }
    }, [user, loading, router]);

    // Show nothing while checking authentication
    if (loading) {
      return null;
    }

    // If no user, don't render the component
    if (!user) {
      return null;
    }

    // If user exists, render the protected component
    return <Component {...props} />;
  };
}
