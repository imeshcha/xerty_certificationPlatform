'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { ShieldCheck, Search, QrCode, CheckCircle2, Lock, Cpu, Globe } from 'lucide-react';

export default function PublicVerifySearchPage() {
  const router = useRouter();
  const [certIdInput, setCertIdInput] = useState('');
  const [error, setError] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanId = certIdInput.trim();
    if (!cleanId) {
      setError('Please enter a valid Certificate ID or Transaction Hash');
      return;
    }
    setError('');
    router.push(`/verify/${encodeURIComponent(cleanId)}`);
  };

  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl space-y-12">
      {/* Hero Section */}
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold uppercase tracking-wider">
          <ShieldCheck className="h-4 w-4" />
          Decentralized Verification Engine
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
          Verify Any Certificate in Real-Time
        </h1>
        <p className="text-muted-foreground text-sm sm:text-base">
          Zero login required. Instantly validate cryptographic proof, issuer identity, and active on-chain status on Arbitrum Sepolia & Solana Devnet.
        </p>
      </div>

      {/* Search Box */}
      <Card className="border-border/80 shadow-lg bg-card/60 backdrop-blur-sm max-w-2xl mx-auto">
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-lg">Enter Certificate ID or NFT Transaction Hash</CardTitle>
          <CardDescription className="text-xs">
            Search by Certificate ID (e.g. <code>XERTY-2026-001A-XYZ</code>) or On-Chain Transaction Hash (<code>0x...</code> / Solana Signature)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <input
                type="text"
                className="w-full rounded-lg border bg-background pl-11 pr-4 py-3 text-sm font-mono tracking-wider focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="e.g. XERTY-2026-A49F1B or 0x4f2a9..."
                value={certIdInput}
                onChange={(e) => {
                  setCertIdInput(e.target.value);
                  if (error) setError('');
                }}
              />
            </div>

            {error && <p className="text-xs text-destructive text-center font-medium">{error}</p>}

            <Button type="submit" size="lg" className="w-full font-semibold">
              <ShieldCheck className="mr-2 h-5 w-5" />
              Verify Authenticity Now
            </Button>
          </form>

          <div className="pt-4 mt-4 border-t text-center text-xs text-muted-foreground">
            Try a sample credential:{' '}
            <button
              type="button"
              className="font-mono text-primary underline hover:opacity-80"
              onClick={() => router.push('/verify/XERTY-2026-A49F1B')}
            >
              XERTY-2026-A49F1B
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Trust & Architecture Badges */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 max-w-3xl mx-auto text-center">
        <div className="p-4 rounded-xl border bg-card/40 space-y-2">
          <div className="mx-auto w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
            <Lock className="h-4 w-4" />
          </div>
          <h3 className="text-sm font-semibold">Tamper-Proof Keccak-256</h3>
          <p className="text-xs text-muted-foreground">
            Metadata payload hash is immutably anchored on-chain at time of issuance.
          </p>
        </div>

        <div className="p-4 rounded-xl border bg-card/40 space-y-2">
          <div className="mx-auto w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
            <Cpu className="h-4 w-4" />
          </div>
          <h3 className="text-sm font-semibold">Arbitrum Sepolia L2</h3>
          <p className="text-xs text-muted-foreground">
            Sub-second verification backed by Ethereum layer-2 decentralized consensus.
          </p>
        </div>

        <div className="p-4 rounded-xl border bg-card/40 space-y-2">
          <div className="mx-auto w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
            <Globe className="h-4 w-4" />
          </div>
          <h3 className="text-sm font-semibold">Decentralized IPFS</h3>
          <p className="text-xs text-muted-foreground">
            Permanent high-res certificate media preservation without centralized cloud single points of failure.
          </p>
        </div>
      </div>
    </div>
  );
}
