'use client';

import { usePrivy } from '@privy-io/react-auth';
import { useEffect, useState, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { fetchApi } from '../lib/api';

export function useAuth() {
  const privy = usePrivy();
  const router = useRouter();
  const pathname = usePathname();

  const [isSyncing, setIsSyncing] = useState(false);
  const [userRole, setUserRole] = useState<'ISSUER' | 'STUDENT' | null>(null);
  const [solanaAddress, setSolanaAddress] = useState<string | null>(null);

  const ready = privy?.ready ?? false;
  const authenticated = privy?.authenticated ?? false;
  const user = privy?.user ?? null;

  const handleLogin = async () => {
    try {
      if (privy?.login) {
        await privy.login();
      }
    } catch (err: any) {
      console.warn('Privy Login Notice:', err?.message || err);
    }
  };

  const handleLogout = async () => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('xerty_user_role');
        localStorage.removeItem('xerty_onboarding_completed');
        localStorage.removeItem('xerty_solana_address');
        localStorage.removeItem('xerty_selected_role');
      }
      setUserRole(null);
      setSolanaAddress(null);
      if (privy?.logout) {
        await privy.logout();
      }
      router.push('/');
    } catch (err: any) {
      console.warn('Privy Logout Notice:', err?.message || err);
    }
  };

  // 1. Instantly read cached role and solana address on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedRole = localStorage.getItem('xerty_user_role') as 'ISSUER' | 'STUDENT' | null;
      if (savedRole) {
        setUserRole(savedRole);
      }
      const savedSolana = localStorage.getItem('xerty_solana_address');
      if (savedSolana) {
        setSolanaAddress(savedSolana);
      }
    }
  }, []);

  // 2. Synchronize user with MongoDB Atlas on login (for existing users)
  useEffect(() => {
    async function syncUserWithBackend() {
      if (ready && authenticated && (user?.wallet?.address || user?.id)) {
        try {
          setIsSyncing(true);

          const response: any = await fetchApi('/auth/sync', {
            method: 'POST',
            body: JSON.stringify({
              privyUserId: user.id,
              walletAddress: user?.wallet?.address || '0x0000000000000000000000000000000000000000',
              authProvider: user.linkedAccounts?.[0]?.type?.toUpperCase() || 'GOOGLE',
              email: user.email?.address,
              fullName: user.google?.name || user.apple?.email || undefined,
            }),
          });

          const dbUser = response?.user;

          if (dbUser?.solanaAddress) {
            setSolanaAddress(dbUser.solanaAddress);
            if (typeof window !== 'undefined') {
              localStorage.setItem('xerty_solana_address', dbUser.solanaAddress);
            }
          }

          if (typeof window !== 'undefined') {
            const hasCompletedIssuer = !!dbUser?.issuerProfile?.academyName;
            const hasCompletedStudent = !!dbUser?.studentProfile?.fullName;

            if (dbUser?.role === 'ISSUER' && hasCompletedIssuer) {
              setUserRole('ISSUER');
              localStorage.setItem('xerty_user_role', 'ISSUER');
              localStorage.setItem('xerty_onboarding_completed', 'true');
            } else if (dbUser?.role === 'STUDENT' && hasCompletedStudent) {
              setUserRole('STUDENT');
              localStorage.setItem('xerty_user_role', 'STUDENT');
              localStorage.setItem('xerty_onboarding_completed', 'true');
            }
          }
        } catch (error) {
          console.error('Failed to sync user with backend:', error);
          if (typeof window !== 'undefined') {
            const savedRole = localStorage.getItem('xerty_user_role') as 'ISSUER' | 'STUDENT' | null;
            if (savedRole) {
              setUserRole(savedRole);
            }
          }
        } finally {
          setIsSyncing(false);
        }
      }
    }

    if (ready && authenticated && user?.id) {
      syncUserWithBackend();
    }
  }, [ready, authenticated, user?.wallet?.address, user?.id]);

  // 3. Strict Route Enforcement: Issuers CANNOT enter /student, Students CANNOT enter /issuer
  useEffect(() => {
    if (ready && authenticated && userRole) {
      if (userRole === 'ISSUER' && pathname.startsWith('/student')) {
        console.warn('Access denied: Issuer accounts cannot access student vault.');
        router.push('/issuer');
      } else if (userRole === 'STUDENT' && pathname.startsWith('/issuer')) {
        console.warn('Access denied: Student accounts cannot access issuer studio.');
        router.push('/student');
      }
    }
  }, [ready, authenticated, userRole, pathname]);

  return {
    isReady: ready,
    isAuthenticated: authenticated,
    user,
    userRole,
    walletAddress: user?.wallet?.address,
    solanaAddress,
    isSyncing,
    login: handleLogin,
    logout: handleLogout,
  };
}
