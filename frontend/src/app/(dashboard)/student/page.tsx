'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { fetchApi } from '../../../lib/api';
import {
  Award,
  ShieldCheck,
  Share2,
  ExternalLink,
  CheckCircle2,
  Search,
  Sparkles,
  Info,
  Building2,
  FolderOpen,
} from 'lucide-react';

interface StudentCertificate {
  _id?: string;
  certificateId: string;
  courseTitle?: string;
  courseCode?: string;
  issuerName?: string;
  issueDate: string;
  grade?: string;
  score?: number;
  transactionHash?: string;
  ipfsCID?: string;
  status: string;
}

export default function StudentDashboardPage() {
  const router = useRouter();
  const { user, walletAddress, userRole, isReady, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isReady && isAuthenticated && userRole === 'ISSUER') {
      router.push('/issuer');
    }
  }, [isReady, isAuthenticated, userRole, router]);

  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchFeedback, setSearchFeedback] = useState('');
  const [certificates, setCertificates] = useState<StudentCertificate[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load certificates automatically if user has an email or wallet
  useEffect(() => {
    const userEmail = user?.email?.address;
    if (userEmail) {
      setIsLoading(true);
      fetchApi(`/certificates/student/email/${encodeURIComponent(userEmail)}`)
        .then((res: any) => {
          if (Array.isArray(res)) {
            setCertificates(res);
          }
        })
        .catch(() => {})
        .finally(() => setIsLoading(false));
    } else if (walletAddress) {
      setIsLoading(true);
      fetchApi(`/certificates/student/wallet/${walletAddress}`)
        .then((res: any) => {
          if (Array.isArray(res)) {
            setCertificates(res);
          }
        })
        .catch(() => {})
        .finally(() => setIsLoading(false));
    }
  }, [user, walletAddress]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setSearchFeedback('');

    const cleanQuery = searchQuery.trim();

    try {
      if (cleanQuery.includes('@')) {
        // Search by email
        const res: any = await fetchApi(`/certificates/student/email/${encodeURIComponent(cleanQuery)}`);
        if (Array.isArray(res) && res.length > 0) {
          setCertificates(res);
          setSearchFeedback(`Found ${res.length} certificate(s) for ${cleanQuery}`);
        } else {
          setCertificates([]);
          setSearchFeedback(`No certificates found for email: ${cleanQuery}`);
        }
      } else {
        // Search by Certificate ID
        const res: any = await fetchApi(`/certificates/${encodeURIComponent(cleanQuery)}`);
        if (res && res.certificateId) {
          setCertificates([res]);
          setSearchFeedback(`Found Certificate ${res.certificateId}`);
        } else {
          setCertificates([]);
          setSearchFeedback(`No certificate found with ID: ${cleanQuery}`);
        }
      }
    } catch (err: any) {
      setCertificates([]);
      setSearchFeedback(`No matching credentials found for "${cleanQuery}".`);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-8 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b pb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold tracking-tight">Student Credential Vault</h1>
            <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-500 border border-emerald-500/20">
              Zero Login Required
            </span>
          </div>
          <p className="text-muted-foreground mt-1 text-sm">
            View, verify, and share your non-transferable Soulbound Credentials without needing an account.
          </p>
        </div>
      </div>

      {/* Info Notice */}
      <div className="rounded-lg border bg-muted/40 p-4 text-xs text-muted-foreground flex items-start gap-2.5">
        <Info className="h-4 w-4 text-primary shrink-0 mt-0.5" />
        <p>
          <strong className="text-foreground">Student accounts are completely optional:</strong> You do not need to create an account to claim or view your certificates. Simply enter your <strong>Certificate ID</strong> or <strong>Issued Email</strong> below to access your credentials.
        </p>
      </div>

      {/* Search Bar */}
      <Card className="border-border/80">
        <CardContent className="p-6">
          <form onSubmit={handleSearch} className="space-y-3">
            <label className="text-xs font-semibold uppercase text-muted-foreground flex items-center gap-1.5">
              <Search className="h-3.5 w-3.5 text-primary" />
              Find Credentials by Certificate ID or Email
            </label>
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <input
                type="text"
                required
                className="rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary w-full"
                placeholder="Enter Certificate ID (e.g. XERTY-2026-A49F1B) or student email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Button size="default" type="submit" disabled={isSearching} className="w-full sm:w-auto shrink-0">
                {isSearching ? 'Searching...' : 'View Certificate'}
              </Button>
            </div>
            {searchFeedback && (
              <p className="text-xs text-muted-foreground pt-1">{searchFeedback}</p>
            )}
          </form>
        </CardContent>
      </Card>

      {/* Certificate Gallery */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Award className="h-5 w-5 text-primary" />
            Verified Credentials ({certificates.length})
          </h2>
          <Link href="/verify">
            <Button variant="ghost" size="sm" className="text-xs text-muted-foreground">
              Public Cryptographic Verifier $\rightarrow$
            </Button>
          </Link>
        </div>

        {certificates.length === 0 ? (
          <div className="rounded-xl border border-dashed p-12 text-center space-y-3">
            <FolderOpen className="h-10 w-10 text-muted-foreground mx-auto opacity-50" />
            <h3 className="text-sm font-semibold">No Credentials Found</h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              Enter your Certificate ID or student email address above to view your issued certificates.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {certificates.map((cert) => (
              <Card key={cert.certificateId} className="border-border/80 hover:border-primary/50 transition-colors">
                <div className="h-48 rounded-t-xl bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 border-b border-amber-500/30 p-5 flex flex-col justify-between relative">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono text-[10px] text-amber-300/80 uppercase font-semibold">
                      Soulbound Token (ERC-5192)
                    </span>
                    <span className="flex items-center gap-1 text-green-400 font-medium text-[11px]">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Verified Active
                    </span>
                  </div>

                  <div className="text-center space-y-1">
                    <p className="text-[10px] uppercase font-serif tracking-widest text-amber-200/80">Certificate of Completion</p>
                    <p className="font-bold text-sm text-foreground line-clamp-1">{cert.courseTitle || 'Certification Program'}</p>
                    <p className="text-[11px] text-muted-foreground">{cert.issuerName || 'Verified Academy'}</p>
                  </div>

                  <div className="flex items-end justify-between text-[10px] font-mono text-muted-foreground border-t border-border/30 pt-2">
                    <span>{cert.certificateId}</span>
                    <span>{cert.issueDate ? new Date(cert.issueDate).toLocaleDateString() : 'Active'}</span>
                  </div>
                </div>

                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <div>
                      <span className="text-muted-foreground">Honor / Grade: </span>
                      <span className="font-semibold text-foreground">{cert.grade || 'Pass'} {cert.score ? `(${cert.score}%)` : ''}</span>
                    </div>
                    {cert.courseCode && <span className="font-mono text-xs text-muted-foreground">{cert.courseCode}</span>}
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-2 border-t text-xs">
                    <div className="flex items-center gap-2">
                      <Link href={`/verify/${cert.certificateId}`} target="_blank">
                        <Button variant="outline" size="sm" className="h-8 text-xs">
                          <ShieldCheck className="h-3.5 w-3.5 mr-1 text-primary" />
                          Verify
                        </Button>
                      </Link>
                      {cert.transactionHash && (
                        <a
                          href={`https://sepolia.arbiscan.io/tx/${cert.transactionHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Button variant="ghost" size="sm" className="h-8 text-xs">
                            <ExternalLink className="h-3.5 w-3.5 mr-1" />
                            Arbiscan
                          </Button>
                        </a>
                      )}
                    </div>

                    <a
                      href={`https://www.linkedin.com/profile/add?startTask=CERTIFICATION_NAME&name=${encodeURIComponent(
                        cert.courseTitle || 'Certified Professional'
                      )}&organizationName=${encodeURIComponent(cert.issuerName || 'Xerty Verified')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button size="sm" variant="secondary" className="h-8 text-xs">
                        <Share2 className="h-3.5 w-3.5 mr-1 text-primary" />
                        Add to LinkedIn
                      </Button>
                    </a>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
