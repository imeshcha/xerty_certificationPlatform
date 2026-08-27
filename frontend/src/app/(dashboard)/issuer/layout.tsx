'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../hooks/useAuth';
import { ShieldAlert, Loader2 } from 'lucide-react';
import { Button } from '../../../components/ui/button';

export default function IssuerLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isReady, isAuthenticated, userRole, isProfileComplete } = useAuth();

  useEffect(() => {
    if (isReady) {
      if (!isAuthenticated) {
        router.replace('/');
      } else if (userRole === 'STUDENT') {
        router.replace('/student');
      }
    }
  }, [isReady, isAuthenticated, userRole, router]);

  // Loading state while checking authentication
  if (!isReady || (isAuthenticated && !userRole)) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Verifying Issuer credentials & access...</p>
      </div>
    );
  }

  // Strictly block if unauthenticated or logged in as a Student
  if (!isAuthenticated || userRole === 'STUDENT') {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full rounded-2xl border border-destructive/30 bg-destructive/5 p-8 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mx-auto">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <h2 className="text-xl font-bold">Issuer Access Restricted</h2>
          <p className="text-xs text-muted-foreground">
            {userRole === 'STUDENT'
              ? 'Your account is registered as a Student. Student accounts are strictly prohibited from accessing the Issuer Studio.'
              : 'You must be logged in as an Educational Institution / Issuer to access this portal.'}
          </p>
          <Button
            onClick={() => router.push(userRole === 'STUDENT' ? '/student' : '/')}
            variant="default"
            size="sm"
            className="w-full"
          >
            {userRole === 'STUDENT' ? 'Go to Student Vault →' : 'Return to Home'}
          </Button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
