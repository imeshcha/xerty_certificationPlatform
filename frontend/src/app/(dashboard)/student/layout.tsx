'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../hooks/useAuth';
import { ShieldAlert, Loader2 } from 'lucide-react';
import { Button } from '../../../components/ui/button';

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isReady, isAuthenticated, userRole } = useAuth();

  useEffect(() => {
    if (isReady && isAuthenticated && userRole === 'ISSUER') {
      router.replace('/issuer');
    }
  }, [isReady, isAuthenticated, userRole, router]);

  // If logged in as an Issuer, block and redirect
  if (isReady && isAuthenticated && userRole === 'ISSUER') {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full rounded-2xl border border-primary/30 bg-primary/5 p-8 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <h2 className="text-xl font-bold">Issuer Account Active</h2>
          <p className="text-xs text-muted-foreground">
            You are currently authenticated as an Educational Institution / Issuer. You cannot hold or create a Student account on this profile.
          </p>
          <Button onClick={() => router.push('/issuer')} variant="default" size="sm" className="w-full">
            Return to Issuer Studio →
          </Button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
