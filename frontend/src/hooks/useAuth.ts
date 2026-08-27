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
  const hasAutoRedirected = useRef(false);

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
      }
      setUserRole(null);
      setSolanaAddress(null);
      hasAutoRedirected.current = false;
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

  // 2. Synchronize user with MongoDB Atlas on login (run once per authenticated session)
  useEffect(() => {
    async function syncUserWithBackend() {
      if (ready && authenticated && user?.wallet?.address) {
        try {
          setIsSyncing(true);
          const response: any = await fetchApi('/auth/sync', {
            method: 'POST',
            body: JSON.stringify({
              privyUserId: user.id,
              walletAddress: user.wallet.address,
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
            const hasIssuerProfile = !!dbUser?.issuerProfile?.academyName;
            const hasStudentProfile = !!dbUser?.studentProfile?.bio || !!dbUser?.studentProfile?.headline;
            const isIssuer = dbUser?.role === 'ISSUER' || hasIssuerProfile;
            const isStudent = dbUser?.role === 'STUDENT' && hasStudentProfile;

            if (isIssuer) {
              setUserRole('ISSUER');
              localStorage.setItem('xerty_user_role', 'ISSUER');
              localStorage.setItem('xerty_onboarding_completed', 'true');

              // Only auto-redirect once upon initial login or from onboarding
              if (!hasAutoRedirected.current && pathname === '/onboarding') {
                hasAutoRedirected.current = true;
                router.push('/issuer');
              }
            } else if (isStudent) {
              setUserRole('STUDENT');
              localStorage.setItem('xerty_user_role', 'STUDENT');
              localStorage.setItem('xerty_onboarding_completed', 'true');

              if (!hasAutoRedirected.current && pathname === '/onboarding') {
                hasAutoRedirected.current = true;
                router.push('/student');
              }
            } else {
              // Brand new un-onboarded user
              const localRole = localStorage.getItem('xerty_user_role');
              if (localRole === 'ISSUER') {
                setUserRole('ISSUER');
              } else if (localRole === 'STUDENT') {
                setUserRole('STUDENT');
              }
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

    if (ready && authenticated && user?.wallet?.address) {
      syncUserWithBackend();
    }
  }, [ready, authenticated, user?.wallet?.address, user?.id]);

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
