'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { usePrivy } from '@privy-io/react-auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../../components/ui/card';
import { Button } from '../../../../components/ui/button';
import { fetchApi } from '../../../../lib/api';

export default function CourseBatchClaimPage() {
  const params = useParams();
  const courseId = params.courseId as string;
  const { ready, authenticated, user, login } = usePrivy();

  const [course, setCourse] = useState<any>(null);
  const [certificates, setCertificates] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCert, setSelectedCert] = useState<any | null>(null);
  const [isClaiming, setIsClaiming] = useState(false);
  const [claimSuccess, setClaimSuccess] = useState(false);
  const [claimError, setClaimError] = useState<string | null>(null);

  useEffect(() => {
    if (courseId) {
      setIsLoading(true);
      Promise.all([
        fetchApi(`/courses/${courseId}`),
        fetchApi(`/certificates/course/${courseId}`),
      ])
        .then(([courseData, certsData]: [any, any]) => {
          if (courseData) setCourse(courseData);
          if (Array.isArray(certsData)) setCertificates(certsData);
        })
        .catch((err) => {
          console.warn('Could not load course claim portal:', err);
        })
        .finally(() => setIsLoading(false));
    }
  }, [courseId]);

  // Filter certificates by name, email, or wallet address
  const filteredCertificates = certificates.filter((cert) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return (
      (cert.studentName && cert.studentName.toLowerCase().includes(q)) ||
      (cert.studentEmail && cert.studentEmail.toLowerCase().includes(q)) ||
      (cert.studentWallet && cert.studentWallet.toLowerCase().includes(q)) ||
      (cert.certificateId && cert.certificateId.toLowerCase().includes(q))
    );
  });

  const handleClaim = async (cert: any) => {
    if (!authenticated) {
      login();
      return;
    }

    setIsClaiming(true);
    setClaimError(null);

    const userEmail = user?.email?.address || user?.google?.email;
    const userWallet = user?.wallet?.address;

    try {
      const res = await fetchApi(`/certificates/${cert.certificateId}/claim`, {
        method: 'PATCH',
        body: JSON.stringify({
          studentWallet: userWallet || cert.studentWallet,
          studentEmail: userEmail || cert.studentEmail,
        }),
      });

      if (res) {
        setClaimSuccess(true);
        // Update state in certificate list
        setCertificates((prev) =>
          prev.map((c) =>
            c.certificateId === cert.certificateId
              ? { ...c, isClaimed: true, claimedAt: new Date() }
              : c,
          ),
        );
        setSelectedCert((prev: any) => ({
          ...prev,
          isClaimed: true,
          claimedAt: new Date(),
        }));
      }
    } catch (err: any) {
      console.error('Failed to claim certificate:', err);
      setClaimError(err?.message || 'Failed to claim certificate. Please try again.');
    } finally {
      setIsClaiming(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-24 text-center space-y-4 max-w-lg">
        <h2 className="text-xl font-bold">Loading Student Claim Portal...</h2>
        <p className="text-xs text-muted-foreground">
          Fetching issued credentials and verification records.
        </p>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="container mx-auto px-4 py-20 text-center space-y-4 max-w-md">
        <h2 className="text-2xl font-bold">Course Cohort Not Found</h2>
        <p className="text-xs text-muted-foreground">
          The requested course claim portal does not exist or has expired.
        </p>
        <Link href="/">
          <Button variant="outline" size="sm">
            Return Home
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-10 space-y-8 max-w-5xl">
      {/* Course Portal Header */}
      <Card className="border-border shadow-sm">
        <CardContent className="p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="rounded bg-primary/10 px-2.5 py-0.5 text-xs font-mono font-bold text-primary">
                  {course.code}
                </span>
                <span className="text-xs text-muted-foreground font-medium">
                  {course.durationHours} Hours Certified Program
                </span>
                <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-600 border border-emerald-500/20">
                  Official Claim Portal
                </span>
              </div>
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-foreground">
                {course.title}
              </h1>
              <p className="text-xs text-muted-foreground max-w-2xl">
                {course.description ||
                  'Official decentralized student credential distribution portal. Search your name or email below to claim your soulbound diploma.'}
              </p>
            </div>

            {/* Total Records Counter */}
            <div className="flex items-center gap-3 shrink-0">
              <div className="rounded-xl border bg-muted/30 p-4 text-center min-w-[110px]">
                <p className="text-2xl font-black text-primary">{certificates.length}</p>
                <p className="text-[10px] text-muted-foreground uppercase font-semibold">
                  Certificates
                </p>
              </div>
            </div>
          </div>

          {/* Student Instructions */}
          <div className="mt-6 pt-6 border-t grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-3 rounded-lg bg-muted/30 border space-y-1">
              <p className="font-bold text-foreground">1. Find Your Certificate</p>
              <p className="text-muted-foreground text-[11px]">
                Type your student name or email in the search bar below.
              </p>
            </div>
            <div className="p-3 rounded-lg bg-muted/30 border space-y-1">
              <p className="font-bold text-foreground">2. 100% Free & Gasless</p>
              <p className="text-muted-foreground text-[11px]">
                All blockchain fees are sponsored by your institution. No gas cost for you.
              </p>
            </div>
            <div className="p-3 rounded-lg bg-muted/30 border space-y-1">
              <p className="font-bold text-foreground">3. No Crypto Wallet Needed</p>
              <p className="text-muted-foreground text-[11px]">
                Log in with your email or connect a wallet to save to your Student Vault.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Student Search & Credential Finder */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-0.5">
            <h2 className="text-lg font-bold text-foreground">Find & Claim Your Diploma</h2>
            <p className="text-xs text-muted-foreground">
              Showing {filteredCertificates.length} of {certificates.length} issued credentials
            </p>
          </div>

          {/* Search Input */}
          <div className="w-full sm:w-80">
            <input
              type="text"
              placeholder="Search by Name, Email, or Wallet..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-md border bg-background px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary shadow-sm"
            />
          </div>
        </div>

        {/* Certificates Grid / List */}
        {filteredCertificates.length === 0 ? (
          <div className="p-12 text-center space-y-3 rounded-xl border border-dashed bg-muted/10">
            <h4 className="text-sm font-semibold">No Matching Certificates Found</h4>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              We couldn't find any certificate matching &quot;{searchQuery}&quot;. Please check your spelling or contact your course instructor.
            </p>
            {searchQuery && (
              <Button variant="outline" size="sm" onClick={() => setSearchQuery('')}>
                Clear Search
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCertificates.map((cert) => (
              <Card
                key={cert._id || cert.certificateId}
                className="border-border hover:border-primary/50 transition-all shadow-sm flex flex-col justify-between"
              >
                <CardContent className="p-5 space-y-4">
                  {/* Top Badges */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-[11px] font-bold text-primary">
                      {cert.certificateId}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold ${
                        cert.isClaimed
                          ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                          : 'bg-amber-500/10 text-amber-600 border border-amber-500/20'
                      }`}
                    >
                      {cert.isClaimed ? '✓ Claimed' : 'Available to Claim'}
                    </span>
                  </div>

                  {/* Student Details */}
                  <div className="space-y-1">
                    <h3 className="text-base font-bold text-foreground line-clamp-1">
                      {cert.studentName}
                    </h3>
                    <p className="text-xs text-muted-foreground truncate">{cert.studentEmail}</p>
                  </div>

                  {/* Performance Meta */}
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t text-xs">
                    <div>
                      <span className="text-[10px] text-muted-foreground block">Grade</span>
                      <span className="font-semibold text-foreground">{cert.grade || 'Pass'}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-muted-foreground block">Score</span>
                      <span className="font-mono font-semibold text-foreground">
                        {cert.score ? `${cert.score}%` : '-'}
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-2 flex items-center gap-2">
                    <Button
                      size="sm"
                      className="w-full text-xs font-bold"
                      onClick={() => {
                        setSelectedCert(cert);
                        setClaimSuccess(false);
                        setClaimError(null);
                      }}
                    >
                      {cert.isClaimed ? 'View & Download →' : 'Claim Certificate →'}
                    </Button>
                    <Link href={`/verify/${cert.certificateId}`} target="_blank">
                      <Button variant="outline" size="sm" className="text-xs px-2.5" title="Verify Proof">
                        Verify
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* CLAIM & INSPECTION MODAL */}
      {selectedCert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <Card className="w-full max-w-2xl border-border bg-card shadow-2xl my-8">
            <CardHeader className="border-b pb-4 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold">
                  Claim Credential: {selectedCert.studentName}
                </CardTitle>
                <CardDescription className="text-xs font-mono">
                  Certificate ID: {selectedCert.certificateId} • {course.code}
                </CardDescription>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-xs font-mono"
                onClick={() => setSelectedCert(null)}
              >
                ✕ Close
              </Button>
            </CardHeader>

            <CardContent className="p-6 space-y-6">
              {/* Certificate Snapshot Card */}
              <div className="rounded-xl border border-primary/20 bg-primary/5 p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold uppercase text-primary">
                    Soulbound Academic Credential
                  </span>
                  <span className="text-xs font-mono text-muted-foreground">
                    Issued: {selectedCert.issueDate ? new Date(selectedCert.issueDate).toLocaleDateString() : 'Recent'}
                  </span>
                </div>

                <div className="space-y-1">
                  <h2 className="text-xl font-extrabold text-foreground">{selectedCert.studentName}</h2>
                  <p className="text-xs text-muted-foreground">
                    Program: <span className="font-semibold text-foreground">{course.title}</span> ({course.code})
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t text-xs">
                  <div>
                    <span className="text-[10px] text-muted-foreground block">Grade</span>
                    <span className="font-semibold">{selectedCert.grade || 'Pass'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-muted-foreground block">Score</span>
                    <span className="font-mono font-semibold">{selectedCert.score ? `${selectedCert.score}%` : '-'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-muted-foreground block">Network</span>
                    <span className="font-mono font-semibold">
                      {selectedCert.network === 'SOLANA_DEVNET' ? 'Solana Devnet' : 'Arbitrum Sepolia'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-muted-foreground block">IPFS Storage</span>
                    <span className="font-mono text-emerald-600 font-semibold">Pinata Verified</span>
                  </div>
                </div>
              </div>

              {/* Claiming Logic & Status */}
              {claimSuccess || selectedCert.isClaimed ? (
                <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-5 text-center space-y-3">
                  <h4 className="text-base font-bold text-emerald-700 dark:text-emerald-400">
                    ✓ Certificate Successfully Claimed!
                  </h4>
                  <p className="text-xs text-muted-foreground max-w-md mx-auto">
                    This credential is now attached to your student profile and blockchain address. You can view it anytime in your Student Vault.
                  </p>
                  <div className="pt-2 flex flex-wrap justify-center gap-3">
                    <Link href="/student">
                      <Button size="sm" className="font-bold text-xs">
                        Open My Student Vault →
                      </Button>
                    </Link>
                    <Link href={`/verify/${selectedCert.certificateId}`} target="_blank">
                      <Button variant="outline" size="sm" className="text-xs">
                        View On-Chain Verification
                      </Button>
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-4 rounded-lg border bg-muted/30 space-y-2">
                    <h4 className="text-xs font-bold uppercase text-foreground">How to Claim:</h4>
                    <p className="text-xs text-muted-foreground">
                      To secure your certificate into your personal portfolio, log in using your student email (<strong>{selectedCert.studentEmail}</strong>) or directly claim using your connected Web3 wallet.
                    </p>
                  </div>

                  {claimError && (
                    <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20 text-destructive text-xs">
                      {claimError}
                    </div>
                  )}

                  <div className="pt-2 flex flex-col sm:flex-row gap-3">
                    {!authenticated ? (
                      <Button
                        size="lg"
                        className="w-full text-xs font-bold"
                        onClick={login}
                      >
                        Log In / Create Account with Email or Wallet
                      </Button>
                    ) : (
                      <Button
                        size="lg"
                        className="w-full text-xs font-bold"
                        onClick={() => handleClaim(selectedCert)}
                        disabled={isClaiming}
                      >
                        {isClaiming
                          ? 'Claiming Credential...'
                          : `Claim to Account (${user?.email?.address || user?.wallet?.address?.slice(0, 8) + '...'})`}
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
