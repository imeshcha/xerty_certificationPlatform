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
  const [isProfileComplete, setIsProfileComplete] = useState<boolean>(false);

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
      setIsProfileComplete(false);
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
      const completed = localStorage.getItem('xerty_onboarding_completed') === 'true';
      setIsProfileComplete(completed);
    }
  }, []);

  // 2. Synchronize user with MongoDB Atlas on login
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
              authProvider: user.linkedAccounts?.[0]?.type?.toUpperCase() || 'WALLET',
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

          // If the user is an already established user who completed registration in the past:
          if (dbUser?.isProfileComplete && dbUser?.role && dbUser.role !== 'UNASSIGNED') {
            const role = dbUser.role as 'ISSUER' | 'STUDENT';
            setUserRole(role);
            setIsProfileComplete(true);
            if (typeof window !== 'undefined') {
              localStorage.setItem('xerty_user_role', role);
              localStorage.setItem('xerty_onboarding_completed', 'true');
            }
          }
        } catch (error) {
          console.error('Failed to sync user with backend:', error);
        } finally {
          setIsSyncing(false);
        }
      }
    }

    if (ready && authenticated && user?.wallet?.address) {
      syncUserWithBackend();
    }
  }, [ready, authenticated, user?.wallet?.address, user?.id]);

  // 3. Strict Route Enforcement:
  // - Issuers CANNOT enter /student (auto-redirect to /issuer)
  // - Students CANNOT enter /issuer (auto-redirect to /student)
  useEffect(() => {
    if (ready && authenticated && userRole) {
      if (userRole === 'ISSUER' && pathname.startsWith('/student')) {
        console.warn('Strict Access Policy: Issuer accounts cannot access student vault.');
        router.push('/issuer');
      } else if (userRole === 'STUDENT' && pathname.startsWith('/issuer')) {
        console.warn('Strict Access Policy: Student accounts cannot access issuer studio.');
        router.push('/student');
      }
    }
  }, [ready, authenticated, userRole, pathname, router]);

  return {
    isReady: ready,
    isAuthenticated: authenticated,
    user,
    userRole,
    isProfileComplete,
    walletAddress: user?.wallet?.address,
    solanaAddress,
    isSyncing,
    login: handleLogin,
    logout: handleLogout,
  };
}
