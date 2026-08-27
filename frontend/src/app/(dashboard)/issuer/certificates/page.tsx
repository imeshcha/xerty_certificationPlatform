'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../../components/ui/card';
import { Button } from '../../../../components/ui/button';
import { fetchApi } from '../../../../lib/api';
import {
  ArrowLeft,
  Search,
  ExternalLink,
  Ban,
  CheckCircle2,
  AlertTriangle,
  History,
  ShieldCheck,
  Eye,
  PlusCircle,
  FolderOpen,
} from 'lucide-react';

interface CertificateRecord {
  _id?: string;
  certificateId: string;
  studentName?: string;
  studentEmail?: string;
  courseTitle?: string;
  grade?: string;
  score?: number;
  issueDate: string;
  status: string;
  transactionHash?: string;
  ipfsCID?: string;
}

export default function CertificatesManagementPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ISSUED' | 'REVOKED'>('ALL');
  const [revokingCert, setRevokingCert] = useState<CertificateRecord | null>(null);
  const [revocationReason, setRevocationReason] = useState('');
  const [isRevoking, setIsRevoking] = useState(false);
  const [certificates, setCertificates] = useState<CertificateRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load real certificates from backend
  useEffect(() => {
    setIsLoading(true);
    fetchApi('/certificates')
      .then((res: any) => {
        if (Array.isArray(res)) {
          setCertificates(res);
        }
      })
      .catch((err) => {
        console.warn('Could not fetch certificates:', err);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const filteredCerts = certificates.filter((cert) => {
    const matchesSearch =
      cert.certificateId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (cert.studentName && cert.studentName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (cert.studentEmail && cert.studentEmail.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'ALL' || cert.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleRevoke = async () => {
    if (!revokingCert) return;
    setIsRevoking(true);

    try {
      await fetchApi(`/certificates/${revokingCert.certificateId}/revoke`, {
        method: 'PATCH',
        body: JSON.stringify({
          revocationReason: revocationReason,
        }),
      });

      setCertificates((prev) =>
        prev.map((c) =>
          c.certificateId === revokingCert.certificateId ? { ...c, status: 'REVOKED' } : c,
        ),
      );
      setRevokingCert(null);
      setRevocationReason('');
    } catch (err: any) {
      console.error('Revocation failed:', err);
    } finally {
      setIsRevoking(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Link href="/issuer">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Issued Certificates & Audit History</h1>
            <p className="text-sm text-muted-foreground">
              Search and inspect credentials issued on Arbitrum Sepolia with on-chain revocation control.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/issuer/issue/single">
            <Button size="sm" variant="outline">
              <PlusCircle className="mr-1.5 h-3.5 w-3.5" />
              Single Issue
            </Button>
          </Link>
          <Link href="/issuer/issue/bulk">
            <Button size="sm">
              Bulk Issue
            </Button>
          </Link>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            className="w-full rounded-md border bg-background pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
            placeholder="Search by ID, name, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto text-xs">
          <Button
            variant={statusFilter === 'ALL' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setStatusFilter('ALL')}
          >
            All ({certificates.length})
          </Button>
          <Button
            variant={statusFilter === 'ISSUED' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setStatusFilter('ISSUED')}
          >
            Active
          </Button>
          <Button
            variant={statusFilter === 'REVOKED' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setStatusFilter('REVOKED')}
          >
            Revoked
          </Button>
        </div>
      </div>

      {/* Certificates Table */}
      {certificates.length === 0 ? (
        <div className="rounded-xl border border-dashed p-12 text-center space-y-3">
          <FolderOpen className="h-10 w-10 text-muted-foreground mx-auto opacity-50" />
          <h3 className="text-sm font-semibold">No Certificates Issued Yet</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            You haven&apos;t issued any Soulbound credentials yet. Create a course and issue your first certificate!
          </p>
          <div className="pt-2">
            <Link href="/issuer/issue/single">
              <Button size="sm">
                <PlusCircle className="mr-1.5 h-3.5 w-3.5" />
                Issue First Certificate
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-muted/50 text-muted-foreground border-b uppercase font-mono text-[10px]">
                  <tr>
                    <th className="p-3">Certificate ID</th>
                    <th className="p-3">Recipient</th>
                    <th className="p-3">Course</th>
                    <th className="p-3">Grade</th>
                    <th className="p-3">Issue Date</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredCerts.map((cert) => (
                    <tr key={cert.certificateId} className="hover:bg-muted/20">
                      <td className="p-3 font-mono font-medium text-foreground">{cert.certificateId}</td>
                      <td className="p-3">
                        <div className="font-medium text-foreground">{cert.studentName || 'Recipient'}</div>
                        <div className="text-[11px] text-muted-foreground">{cert.studentEmail}</div>
                      </td>
                      <td className="p-3 max-w-[200px] truncate text-muted-foreground">{cert.courseTitle || 'Course'}</td>
                      <td className="p-3 font-medium">{cert.grade || 'Pass'}</td>
                      <td className="p-3 text-muted-foreground">
                        {cert.issueDate ? new Date(cert.issueDate).toLocaleDateString() : 'Active'}
                      </td>
                      <td className="p-3">
                        {cert.status === 'ISSUED' ? (
                          <span className="inline-flex items-center rounded-full bg-green-500/10 px-2 py-0.5 text-[11px] font-medium text-green-400 border border-green-500/20">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-full bg-destructive/10 px-2 py-0.5 text-[11px] font-medium text-destructive border border-destructive/20">
                            <Ban className="h-3 w-3 mr-1" />
                            Revoked
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-right space-x-1">
                        <Link href={`/verify/${cert.certificateId}`} target="_blank">
                          <Button variant="ghost" size="sm" className="h-7 px-2">
                            <Eye className="h-3.5 w-3.5 mr-1" />
                            Verify
                          </Button>
                        </Link>
                        {cert.transactionHash && (
                          <a
                            href={`https://sepolia.arbiscan.io/tx/${cert.transactionHash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Button variant="ghost" size="sm" className="h-7 px-2">
                              <ExternalLink className="h-3.5 w-3.5 mr-1" />
                              Arbiscan
                            </Button>
                          </a>
                        )}
                        {cert.status === 'ISSUED' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2 text-destructive hover:text-destructive"
                            onClick={() => setRevokingCert(cert)}
                          >
                            <Ban className="h-3.5 w-3.5 mr-1" />
                            Revoke
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Revocation Modal */}
      {revokingCert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <Card className="w-full max-w-md border-destructive/40 bg-card">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2 text-destructive font-semibold">
                <AlertTriangle className="h-5 w-5" />
                Revoke Certificate On-Chain
              </div>
              <CardDescription className="text-xs">
                This will permanently change status to <span className="font-mono text-destructive">REVOKED</span> on Arbitrum Sepolia.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-3 rounded bg-muted/50 text-xs space-y-1 font-mono">
                <p>Certificate: {revokingCert.certificateId}</p>
                <p>Recipient: {revokingCert.studentName || revokingCert.studentEmail}</p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase text-muted-foreground">Reason for Revocation</label>
                <textarea
                  required
                  rows={3}
                  className="w-full rounded border bg-background px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-destructive"
                  placeholder="e.g. Academic integrity investigation or credential replacement..."
                  value={revocationReason}
                  onChange={(e) => setRevocationReason(e.target.value)}
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="ghost" size="sm" onClick={() => setRevokingCert(null)}>
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  disabled={!revocationReason.trim() || isRevoking}
                  onClick={handleRevoke}
                >
                  {isRevoking ? 'Revoking on-chain...' : 'Confirm Revocation'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
