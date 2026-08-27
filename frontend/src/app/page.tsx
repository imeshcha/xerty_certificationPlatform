'use client';

import Link from 'next/link';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '../components/ui/card';

export default function HomePage() {
  const { isAuthenticated, userRole, login } = useAuth();

  return (
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
          <Link href="/verify">
            <Button size="lg" className="h-11 px-8 font-semibold">
              Verify Certificate
            </Button>
          </Link>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant="outline" size="lg" className="h-11 px-8 font-semibold">
              Documentation
            </Button>
          </a>
        </div>
      </div>

      {/* Feature Pillar Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-20">
        {/* For Issuers Card */}
        <Card className="border-border shadow-sm bg-card flex flex-col justify-between hover:border-primary/50 transition-colors">
          <CardHeader>
            <CardTitle>For Issuers</CardTitle>
            <CardDescription>
              Universities, Academies & Bootcamps
            </CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2 flex-grow">
            <p>• Multi-chain minting on Arbitrum Sepolia & Solana Devnet</p>
            <p>• Visual template designer & single/bulk CSV pipeline</p>
            <p>• Soulbound token minting with on-chain revocation control</p>
          </CardContent>
          <CardFooter className="pt-4 border-t border-border/40">
            {isAuthenticated ? (
              <Link href="/issuer" className="w-full">
                <Button className="w-full font-semibold" variant={userRole === 'ISSUER' ? 'default' : 'outline'}>
                  {userRole === 'ISSUER' ? 'Launch Issuer Studio' : 'Enter as Issuer'}
                </Button>
              </Link>
            ) : (
              <Button onClick={() => login()} className="w-full font-semibold">
                Sign In as Issuer
              </Button>
            )}
          </CardFooter>
        </Card>

        {/* For Students Card */}
        <Card className="border-border shadow-sm bg-card flex flex-col justify-between hover:border-emerald-500/50 transition-colors">
          <CardHeader>
            <CardTitle>For Students</CardTitle>
            <CardDescription>
              Credential Holders & Lifelong Learners
            </CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2 flex-grow">
            <p>• Zero account required to claim, view, and verify credentials</p>
            <p>• Multi-chain support for EVM & Solana wallet addresses</p>
            <p>• 1-click LinkedIn certification sharing & PDF export</p>
          </CardContent>
          <CardFooter className="pt-4 border-t border-border/40">
            <Link href="/student" className="w-full">
              <Button className="w-full font-semibold" variant="outline">
                Open Student Vault
              </Button>
            </Link>
          </CardFooter>
        </Card>

        {/* For Verifiers Card */}
        <Card className="border-border shadow-sm bg-card flex flex-col justify-between hover:border-blue-400/50 transition-colors">
          <CardHeader>
            <CardTitle>For Verifiers</CardTitle>
            <CardDescription>
              Employers, Recruiters & Background Screeners
            </CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2 flex-grow">
            <p>• Instant cryptographic proof verification</p>
            <p>• Zero account or login requirement</p>
            <p>• Direct verification on Arbiscan & Solana Explorer</p>
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
  );
}
