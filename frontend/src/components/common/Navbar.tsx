'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../ui/button';
import { AuthModal } from '../auth/AuthModal';

export function Navbar() {
  const pathname = usePathname();
  const { isAuthenticated, userRole, isProfileComplete } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const isLandingPage = pathname === '/';

  // Automatically open AuthModal if user logged in with Privy but hasn't completed their Account Info Form
  useEffect(() => {
    if (isAuthenticated && !isProfileComplete && !userRole) {
      setIsAuthModalOpen(true);
    }
  }, [isAuthenticated, isProfileComplete, userRole]);

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center space-x-6">
            <Link href="/" className="flex items-center space-x-2">
              <span className="text-xl font-bold tracking-tight text-primary">Xerty</span>
              <div className="hidden sm:flex items-center gap-1.5 rounded-full border border-border bg-muted/60 px-2.5 py-0.5 text-[10px] font-semibold font-mono">
                <span className="text-primary">Arbitrum</span>
                <span className="text-muted-foreground">•</span>
                <span className="text-purple-600">Solana</span>
              </div>
            </Link>

            {/* Role-Specific Dashboard Navigation (When inside dashboard) */}
            {isAuthenticated && !isLandingPage && (
              <div className="hidden md:flex items-center space-x-4 text-xs font-medium">
                {userRole === 'ISSUER' && (
                  <>
                    <Link
                      href="/issuer"
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Issuer Studio
                    </Link>
                    <Link
                      href="/issuer/courses"
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Courses
                    </Link>
                    <Link
                      href="/issuer/certificates"
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Certificates
                    </Link>
                  </>
                )}

                {userRole === 'STUDENT' && (
                  <Link
                    href="/student"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    My Credentials
                  </Link>
                )}
              </div>
            )}
          </div>

          <nav className="flex items-center space-x-3">
            <Link
              href="/verify"
              className="text-xs font-medium text-muted-foreground transition-colors hover:text-foreground mr-1"
            >
              Verify Certificate
            </Link>

            {/* If NOT logged in: Show Login / Sign Up Button */}
            {!isAuthenticated ? (
              <Button
                onClick={() => setIsAuthModalOpen(true)}
                size="sm"
                className="text-xs font-semibold h-9 px-4 shadow-sm"
              >
                Login / Sign Up
              </Button>
            ) : (
              /* If Logged In: Show Single Dashboard Button + Role Badge + Profile Link */
              <div className="flex items-center space-x-2.5">
                {/* On Landing Page: Only show specific role button */}
                {isLandingPage && (
                  <>
                    {userRole === 'ISSUER' && (
                      <Link href="/issuer">
                        <Button size="sm" variant="outline" className="text-xs h-8 font-semibold">
                          Issuer Studio →
                        </Button>
                      </Link>
                    )}
                    {userRole === 'STUDENT' && (
                      <Link href="/student">
                        <Button size="sm" variant="outline" className="text-xs h-8 font-semibold">
                          Student Vault →
                        </Button>
                      </Link>
                    )}
                    {!userRole && (
                      <Button
                        size="sm"
                        variant="default"
                        className="text-xs h-8 font-semibold"
                        onClick={() => setIsAuthModalOpen(true)}
                      >
                        Complete Account Setup →
                      </Button>
                    )}
                  </>
                )}

                {/* Role Badge */}
                {userRole === 'ISSUER' && (
                  <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-semibold text-primary border border-primary/20">
                    Issuer
                  </span>
                )}
                {userRole === 'STUDENT' && (
                  <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-600 border border-emerald-500/20">
                    Student
                  </span>
                )}

                {/* User Profile Button */}
                <Link href="/profile" title="Account & Profile Settings">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 px-3 text-xs rounded-full border bg-muted/60 hover:bg-muted text-foreground transition-colors font-medium"
                  >
                    Profile
                  </Button>
                </Link>
              </div>
            )}
          </nav>
        </div>
      </header>

      {/* Full-Window Registration & Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </>
  );
}
