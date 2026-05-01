import { AUTH_STATUS, useAuthStore } from '@unbogi/shared';
import { useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';

/**
 * Auth guard — initializes Firebase auth listener,
 * redirects to /login or /(main) based on auth status.
 * Returns current auth status for splash-screen gating.
 */
export function useProtectedRoute() {
  const segments = useSegments();
  const router = useRouter();
  const status = useAuthStore((s) => s.status);
  const initialize = useAuthStore((s) => s.initialize);

  useEffect(() => {
    // Initialize without initData for Mobile app
    const unsubscribe = initialize('');
    return () => unsubscribe();
  }, [initialize]);

  useEffect(() => {
    if (status === AUTH_STATUS.LOADING || status === AUTH_STATUS.IDLE) return;

    const inAuthGroup = segments[0] === 'login';

    if (status === AUTH_STATUS.UNAUTHENTICATED && !inAuthGroup) {
      router.replace('/login');
    } else if (status === AUTH_STATUS.AUTHENTICATED && inAuthGroup) {
      router.replace('/surprises');
    }
  }, [status, segments, router]);

  return status;
}
