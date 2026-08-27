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
        localStorage.removeItem('xerty_pending_role');
        localStorage.removeItem('xerty_pending_issuer_data');
        localStorage.removeItem('xerty_pending_student_data');
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

  // 2. Synchronize user with MongoDB Atlas on login & process pending registrations
  useEffect(() => {
    async function syncUserWithBackend() {
      if (ready && authenticated && user?.wallet?.address) {
        try {
          setIsSyncing(true);

          const pendingRole = typeof window !== 'undefined' ? localStorage.getItem('xerty_pending_role') : null;
          const pendingIssuerRaw = typeof window !== 'undefined' ? localStorage.getItem('xerty_pending_issuer_data') : null;
          const pendingStudentRaw = typeof window !== 'undefined' ? localStorage.getItem('xerty_pending_student_data') : null;

          const requestedRole = pendingRole || (userRole || 'STUDENT');

          const response: any = await fetchApi('/auth/sync', {
            method: 'POST',
            body: JSON.stringify({
              privyUserId: user.id,
              walletAddress: user.wallet.address,
              authProvider: user.linkedAccounts?.[0]?.type?.toUpperCase() || 'GOOGLE',
              email: user.email?.address,
              fullName: user.google?.name || user.apple?.email || undefined,
              role: requestedRole,
            }),
          });

          const dbUser = response?.user;

          // If there is pending issuer profile data to save
          if (pendingRole === 'ISSUER' && pendingIssuerRaw) {
            try {
              const issuerData = JSON.parse(pendingIssuerRaw);
              await fetchApi('/issuers/profile', {
                method: 'POST',
                body: JSON.stringify({
                  userId: user.id,
                  academyName: issuerData.academyName,
                  slug: issuerData.slug,
                  onchainIssuerAddress: user.wallet.address,
                  organizationInfo: {
                    description: issuerData.description,
                    website: issuerData.website,
                    contactEmail: issuerData.contactEmail || user.email?.address,
                  },
                }),
              });
            } catch (err) {
              console.warn('Could not save pending issuer data:', err);
            }
            if (typeof window !== 'undefined') {
              localStorage.removeItem('xerty_pending_role');
              localStorage.removeItem('xerty_pending_issuer_data');
            }
          }

          // If there is pending student profile data to save
          if (pendingRole === 'STUDENT' && pendingStudentRaw) {
            try {
              const studentData = JSON.parse(pendingStudentRaw);
              await fetchApi('/students/profile', {
                method: 'POST',
                body: JSON.stringify({
                  userId: user.id,
                  fullName: studentData.fullName,
                  headline: studentData.headline,
                  bio: studentData.bio,
                  socialLinks: {
                    linkedin: studentData.linkedin,
                  },
                }),
              });
            } catch (err) {
              console.warn('Could not save pending student data:', err);
            }
            if (typeof window !== 'undefined') {
              localStorage.removeItem('xerty_pending_role');
              localStorage.removeItem('xerty_pending_student_data');
            }
          }

          if (dbUser?.solanaAddress) {
            setSolanaAddress(dbUser.solanaAddress);
            if (typeof window !== 'undefined') {
              localStorage.setItem('xerty_solana_address', dbUser.solanaAddress);
            }
          }

          if (typeof window !== 'undefined') {
            const hasIssuerProfile = !!dbUser?.issuerProfile?.academyName;
            const hasStudentProfile = !!dbUser?.studentProfile?.fullName || !!dbUser?.studentProfile?.headline;
            const isStrictIssuer = dbUser?.role === 'ISSUER' || hasIssuerProfile || pendingRole === 'ISSUER';
            const isStrictStudent =
              (!isStrictIssuer && (dbUser?.role === 'STUDENT' || hasStudentProfile)) || pendingRole === 'STUDENT';

            if (isStrictIssuer) {
              setUserRole('ISSUER');
              localStorage.setItem('xerty_user_role', 'ISSUER');
              localStorage.setItem('xerty_onboarding_completed', 'true');

              if (pathname === '/' || pathname === '/onboarding') {
                router.push('/issuer');
              }
            } else if (isStrictStudent) {
              setUserRole('STUDENT');
              localStorage.setItem('xerty_user_role', 'STUDENT');
              localStorage.setItem('xerty_onboarding_completed', 'true');

              if (pathname === '/' || pathname === '/onboarding') {
                router.push('/student');
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
