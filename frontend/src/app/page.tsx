'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '../components/ui/card';
import { AuthModal } from '../components/auth/AuthModal';

export default function HomePage() {
  const { isAuthenticated, userRole, isProfileComplete } = useAuth();
  const [authModalRole, setAuthModalRole] = useState<'ISSUER' | 'STUDENT' | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const openAuthWithRole = (role: 'ISSUER' | 'STUDENT') => {
    setAuthModalRole(role);
    setIsAuthModalOpen(true);
  };

  return (
    <>
      <div className="container mx-auto px-4 py-16 md:py-24">
        {/* Hero Section */}
        <div className="flex flex-col items-center text-center space-y-6 max-w-3xl mx-auto">
          <div className="inline-flex items-center space-x-2 rounded-full border bg-muted/50 px-4 py-1.5 text-sm font-medium">
            <span>Multi-Chain Protocol: Arbitrum Sepolia & Solana Devnet</span>
          </div>

          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl">
            Verifiable Academic Credentials on{' '}
            <span className="text-primary">Arbitrum</span> & <span className="text-purple-600">Solana</span>
          </h1>

          <p className="text-lg text-muted-foreground max-w-2xl">
            Empowering universities, academies, and training organizations to issue
            non-transferable Soulbound Certificates across Arbitrum Layer 2 and Solana High-Throughput SVM
            with instant public verification.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            {!isAuthenticated ? (
              <Button
                size="lg"
                className="h-11 px-8 font-semibold shadow-md"
                onClick={() => {
                  setAuthModalRole(null);
                  setIsAuthModalOpen(true);
                }}
              >
                Get Started / Sign Up →
              </Button>
            ) : userRole === 'ISSUER' ? (
              <Link href="/issuer">
                <Button size="lg" className="h-11 px-8 font-semibold shadow-md">
                  Open Issuer Studio →
                </Button>
              </Link>
            ) : userRole === 'STUDENT' ? (
              <Link href="/student">
                <Button size="lg" className="h-11 px-8 font-semibold shadow-md">
                  Open Student Vault →
                </Button>
              </Link>
            ) : (
              <Button
                size="lg"
                className="h-11 px-8 font-semibold shadow-md"
                onClick={() => setIsAuthModalOpen(true)}
              >
                Complete Account Setup →
              </Button>
            )}

            <Link href="/verify">
              <Button variant="outline" size="lg" className="h-11 px-8 font-semibold">
                Verify Certificate
              </Button>
            </Link>
          </div>
        </div>

        {/* Feature Pillar Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-20">
          {/* For Issuers Card */}
          <Card className="border-border shadow-sm bg-card flex flex-col justify-between hover:border-primary/50 transition-colors">
            <CardHeader>
              <CardTitle>For Educational Institutions</CardTitle>
              <CardDescription>
                Universities, Academies & Bootcamps
              </CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-2 flex-grow">
              <p>• Multi-chain minting on Arbitrum Sepolia & Solana Devnet</p>
              <p>• Visual template designer & single/bulk CSV pipeline</p>
              <p>• Soulbound token minting with on-chain revocation control</p>
              <p>• Unified batch claim links for whole cohorts</p>
            </CardContent>
            <CardFooter className="pt-4 border-t border-border/40">
              {isAuthenticated && userRole === 'ISSUER' ? (
                <Link href="/issuer" className="w-full">
                  <Button className="w-full font-semibold" variant="default">
                    Launch Issuer Studio
                  </Button>
                </Link>
              ) : isAuthenticated && userRole === 'STUDENT' ? (
                <Link href="/student" className="w-full">
                  <Button className="w-full font-semibold" variant="outline">
                    Student Account Active
                  </Button>
                </Link>
              ) : (
                <Button
                  onClick={() => openAuthWithRole('ISSUER')}
                  className="w-full font-semibold"
                >
                  Register as Issuer
                </Button>
              )}
            </CardFooter>
          </Card>

          {/* For Students Card */}
          <Card className="border-border shadow-sm bg-card flex flex-col justify-between hover:border-emerald-500/50 transition-colors">
            <CardHeader>
              <CardTitle>For Students & Graduates</CardTitle>
              <CardDescription>
                Credential Holders & Lifelong Learners
              </CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-2 flex-grow">
              <p>• Public lookup and claim without requiring an account</p>
              <p>• Multi-chain support for EVM & Solana wallet addresses</p>
              <p>• 1-click LinkedIn certification sharing & PDF export</p>
              <p>• Soulbound credentials stored in permanent personal vault</p>
            </CardContent>
            <CardFooter className="pt-4 border-t border-border/40">
              {isAuthenticated && userRole === 'STUDENT' ? (
                <Link href="/student" className="w-full">
                  <Button className="w-full font-semibold" variant="outline">
                    Open Student Vault
                  </Button>
                </Link>
              ) : isAuthenticated && userRole === 'ISSUER' ? (
                <Link href="/issuer" className="w-full">
                  <Button className="w-full font-semibold" variant="outline">
                    Issuer Account Active
                  </Button>
                </Link>
              ) : (
                <div className="flex gap-2 w-full">
                  <Link href="/student" className="flex-1">
                    <Button className="w-full font-semibold" variant="outline">
                      View Vault
                    </Button>
                  </Link>
                  <Button
                    onClick={() => openAuthWithRole('STUDENT')}
                    className="flex-1 font-semibold border-emerald-500/30 text-emerald-600 hover:bg-emerald-500/10"
                    variant="outline"
                  >
                    Register Student
                  </Button>
                </div>
              )}
            </CardFooter>
          </Card>

          {/* For Verifiers Card */}
          <Card className="border-border shadow-sm bg-card flex flex-col justify-between hover:border-blue-400/50 transition-colors">
            <CardHeader>
              <CardTitle>For Verifiers & Employers</CardTitle>
              <CardDescription>
                Employers, Recruiters & Background Screeners
              </CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-2 flex-grow">
              <p>• Instant cryptographic proof verification</p>
              <p>• Zero account or login requirement</p>
              <p>• Direct verification on Arbiscan & Solana Explorer</p>
              <p>• Validates IPFS metadata & Soulbound locked status</p>
            </CardContent>
            <CardFooter className="pt-4 border-t border-border/40">
              <Link href="/verify" className="w-full">
                <Button variant="secondary" className="w-full font-semibold">
                  Verify Certificate
                </Button>
              </Link>
            </CardFooter>
          </Card>
        </div>
      </div>

      {/* Full-Window Registration & Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        defaultRole={authModalRole}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </>
  );
}
