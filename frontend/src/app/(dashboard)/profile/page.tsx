'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { truncateAddress, deriveSolanaAddress } from '../../../lib/utils';
import { fetchApi } from '../../../lib/api';
import {
  Building2,
  GraduationCap,
  Save,
  LogOut,
  ArrowLeft,
  Copy,
  Check,
  ExternalLink,
  ShieldCheck,
  Globe,
  Mail,
  User,
  Layers,
} from 'lucide-react';

export default function ProfilePage() {
  const router = useRouter();
  const { user, walletAddress, solanaAddress, userRole, logout } = useAuth();

  const [copiedEvm, setCopiedEvm] = useState(false);
  const [copiedSol, setCopiedSol] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [userSolanaAddress, setUserSolanaAddress] = useState<string>(solanaAddress || '');

  // Issuer Form Data
  const [issuerData, setIssuerData] = useState({
    academyName: '',
    slug: '',
    website: '',
    contactEmail: '',
    description: '',
  });

  // Student Form Data
  const [studentData, setStudentData] = useState({
    fullName: '',
    headline: '',
    bio: '',
    linkedin: '',
    github: '',
  });

  // Load existing profile from MongoDB
  useEffect(() => {
    if (walletAddress) {
      fetchApi(`/users/wallet/${walletAddress}`)
        .then((res: any) => {
          if (res) {
            if (res.solanaAddress) {
              setUserSolanaAddress(res.solanaAddress);
            }
            if (res.issuerProfile) {
              setIssuerData({
                academyName: res.issuerProfile.academyName || '',
                slug: res.issuerProfile.slug || '',
                website: res.issuerProfile.website || '',
                contactEmail: res.issuerProfile.contactEmail || res.email || '',
                description: res.issuerProfile.description || '',
              });
            }
            if (res.studentProfile) {
              setStudentData({
                fullName: res.fullName || res.studentProfile.fullName || '',
                headline: res.studentProfile.headline || '',
                bio: res.studentProfile.bio || '',
                linkedin: res.studentProfile.linkedin || '',
                github: res.studentProfile.github || '',
              });
            }
          }
        })
        .catch((err) => {
          console.warn('Could not load profile from MongoDB:', err);
        });
    }
  }, [walletAddress]);

  const handleCopyEvm = () => {
    if (walletAddress) {
      navigator.clipboard.writeText(walletAddress);
      setCopiedEvm(true);
      setTimeout(() => setCopiedEvm(false), 2000);
    }
  };

  const handleCopySol = () => {
    if (userSolanaAddress) {
      navigator.clipboard.writeText(userSolanaAddress);
      setCopiedSol(true);
      setTimeout(() => setCopiedSol(false), 2000);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);
    setErrorMessage('');

    try {
      if (userRole === 'ISSUER') {
        await fetchApi('/users/profile/issuer', {
          method: 'PATCH',
          body: JSON.stringify({
            userId: user?.id,
            walletAddress: walletAddress,
            academyName: issuerData.academyName,
            slug: issuerData.slug || issuerData.academyName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
            website: issuerData.website,
            contactEmail: issuerData.contactEmail,
            description: issuerData.description,
          }),
        });
      } else {
        await fetchApi('/users/profile/student', {
          method: 'PATCH',
          body: JSON.stringify({
            userId: user?.id,
            walletAddress: walletAddress,
            fullName: studentData.fullName,
            headline: studentData.headline,
            bio: studentData.bio,
            linkedin: studentData.linkedin,
            github: studentData.github,
          }),
        });
      }

      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
      }, 4000);
    } catch (err: any) {
      console.error('Failed to update profile in database:', err);
      setErrorMessage(err.message || 'Failed to save changes');
    } finally {
      setIsSaving(false);
    }
  };

  const backLink = userRole === 'ISSUER' ? '/issuer' : '/student';

  return (
    <div className="container mx-auto px-4 py-10 max-w-3xl space-y-6">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <Link href={backLink}>
          <Button variant="ghost" size="sm" className="text-xs">
            <ArrowLeft className="mr-1.5 h-4 w-4" />
            Back to {userRole === 'ISSUER' ? 'Issuer Studio' : 'Student Vault'}
          </Button>
        </Link>

        <Button
          variant="destructive"
          size="sm"
          className="text-xs"
          onClick={() => logout()}
        >
          <LogOut className="mr-1.5 h-3.5 w-3.5" />
          Log Out
        </Button>
      </div>

      {/* Main Profile Card */}
      <Card className="border-border/80 shadow-md">
        <CardHeader className="border-b pb-4">
          <div className="flex items-center space-x-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
              {userRole === 'ISSUER' ? <Building2 className="h-6 w-6" /> : <GraduationCap className="h-6 w-6" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-xl font-bold">
                  {userRole === 'ISSUER' ? 'Institution Account Profile' : 'Student Account Profile'}
                </CardTitle>
                <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-semibold text-primary border border-primary/20">
                  {userRole === 'ISSUER' ? 'Issuer' : 'Student'}
                </span>
              </div>
              <CardDescription className="text-xs mt-1">
                Your multi-chain credentials stored permanently in MongoDB Atlas.
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-6 space-y-6">
          {/* Dual Multi-Chain Wallets */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Arbitrum EVM Wallet */}
            <div className="rounded-lg border bg-muted/40 p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-primary uppercase flex items-center gap-1.5 font-mono">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Arbitrum Sepolia (EVM)
                </span>
                <span className="font-mono text-xs font-bold">{truncateAddress(walletAddress)}</span>
              </div>
              <div className="flex items-center gap-2 pt-1">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs flex-1"
                  onClick={handleCopyEvm}
                >
                  {copiedEvm ? (
                    <>
                      <Check className="mr-1 h-3 w-3 text-green-500" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="mr-1 h-3 w-3" />
                      Copy EVM
                    </>
                  )}
                </Button>
                <a
                  href={`https://sepolia.arbiscan.io/address/${walletAddress}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center h-7 px-2.5 text-xs rounded-md border hover:bg-muted text-muted-foreground hover:text-foreground"
                >
                  Arbiscan
                  <ExternalLink className="ml-1 h-3 w-3" />
                </a>
              </div>
            </div>

            {/* Solana SVM Wallet */}
            {(() => {
              const activeSolAddress =
                userSolanaAddress ||
                solanaAddress ||
                (walletAddress ? deriveSolanaAddress(walletAddress) : '');

              return (
                <div className="rounded-lg border bg-muted/40 p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-purple-400 uppercase flex items-center gap-1.5 font-mono">
                      <Layers className="h-3.5 w-3.5" />
                      Solana Devnet (SVM)
                    </span>
                    <span className="font-mono text-xs font-bold truncate max-w-[130px]">
                      {activeSolAddress ? truncateAddress(activeSolAddress) : 'No Wallet Connected'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 pt-1">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-7 text-xs flex-1"
                      onClick={() => {
                        if (activeSolAddress) {
                          navigator.clipboard.writeText(activeSolAddress);
                          setCopiedSol(true);
                          setTimeout(() => setCopiedSol(false), 2000);
                        }
                      }}
                    >
                      {copiedSol ? (
                        <>
                          <Check className="mr-1 h-3 w-3 text-green-500" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy className="mr-1 h-3 w-3" />
                          Copy Solana
                        </>
                      )}
                    </Button>
                    <a
                      href={`https://explorer.solana.com/address/${activeSolAddress}?cluster=devnet`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center h-7 px-2.5 text-xs rounded-md border hover:bg-muted text-muted-foreground hover:text-foreground"
                    >
                      Explorer
                      <ExternalLink className="ml-1 h-3 w-3" />
                    </a>
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Line by Line Form */}
          <form onSubmit={handleSave} className="space-y-4">
            {userRole === 'ISSUER' ? (
              /* Issuer Line by Line Fields */
              <>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase text-muted-foreground flex items-center gap-1.5">
                    <Building2 className="h-3.5 w-3.5 text-primary" />
                    Academy / Organization Name
                  </label>
                  <input
                    required
                    type="text"
                    className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                    value={issuerData.academyName}
                    onChange={(e) => setIssuerData({ ...issuerData, academyName: e.target.value })}
                    placeholder="e.g. Xerty Educations"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase text-muted-foreground">
                    Public Handle / Slug
                  </label>
                  <input
                    type="text"
                    className="w-full rounded-md border bg-background px-3 py-2 text-sm font-mono lowercase focus:outline-none focus:ring-1 focus:ring-primary"
                    value={issuerData.slug}
                    onChange={(e) => setIssuerData({ ...issuerData, slug: e.target.value })}
                    placeholder="xerty-educations"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase text-muted-foreground flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5 text-primary" />
                    Official Contact Email
                  </label>
                  <input
                    required
                    type="email"
                    className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                    value={issuerData.contactEmail}
                    onChange={(e) => setIssuerData({ ...issuerData, contactEmail: e.target.value })}
                    placeholder="contact@xerty.edu"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase text-muted-foreground flex items-center gap-1.5">
                    <Globe className="h-3.5 w-3.5 text-primary" />
                    Official Website URL
                  </label>
                  <input
                    type="url"
                    className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                    value={issuerData.website}
                    onChange={(e) => setIssuerData({ ...issuerData, website: e.target.value })}
                    placeholder="https://academy.edu"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase text-muted-foreground">
                    Organization Bio / Description
                  </label>
                  <textarea
                    rows={3}
                    className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                    value={issuerData.description}
                    onChange={(e) => setIssuerData({ ...issuerData, description: e.target.value })}
                    placeholder="Describe your certification programs, university accreditation, or academy courses..."
                  />
                </div>
              </>
            ) : (
              /* Student Line by Line Fields */
              <>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase text-muted-foreground flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5 text-emerald-500" />
                    Full Legal Name
                  </label>
                  <input
                    required
                    type="text"
                    className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                    value={studentData.fullName}
                    onChange={(e) => setStudentData({ ...studentData, fullName: e.target.value })}
                    placeholder="e.g. Alice Doe"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase text-muted-foreground">
                    Professional Headline
                  </label>
                  <input
                    type="text"
                    className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                    value={studentData.headline}
                    onChange={(e) => setStudentData({ ...studentData, headline: e.target.value })}
                    placeholder="e.g. Full-Stack Web3 Developer & Researcher"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase text-muted-foreground flex items-center gap-1.5">
                    <Globe className="h-3.5 w-3.5 text-emerald-500" />
                    LinkedIn Profile URL
                  </label>
                  <input
                    type="url"
                    className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                    value={studentData.linkedin}
                    onChange={(e) => setStudentData({ ...studentData, linkedin: e.target.value })}
                    placeholder="https://linkedin.com/in/username"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase text-muted-foreground">
                    GitHub Profile URL
                  </label>
                  <input
                    type="url"
                    className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                    value={studentData.github}
                    onChange={(e) => setStudentData({ ...studentData, github: e.target.value })}
                    placeholder="https://github.com/username"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase text-muted-foreground">
                    Personal Bio
                  </label>
                  <textarea
                    rows={3}
                    className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                    value={studentData.bio}
                    onChange={(e) => setStudentData({ ...studentData, bio: e.target.value })}
                    placeholder="Brief description of your skills, achievements, and academic goals..."
                  />
                </div>
              </>
            )}

            {/* Save Success Alert */}
            {saveSuccess && (
              <div className="rounded-md bg-green-500/10 border border-green-500/30 p-3 text-xs text-green-500 flex items-center gap-2">
                <Check className="h-4 w-4 shrink-0" />
                <span>Changes saved successfully to MongoDB Atlas database!</span>
              </div>
            )}

            {/* Error Message */}
            {errorMessage && (
              <p className="text-xs text-destructive">{errorMessage}</p>
            )}

            {/* Submit Action */}
            <div className="pt-4 flex justify-end gap-3 border-t">
              <Link href={backLink}>
                <Button type="button" variant="ghost" size="sm">
                  Cancel
                </Button>
              </Link>
              <Button type="submit" size="sm" disabled={isSaving}>
                <Save className="mr-1.5 h-4 w-4" />
                {isSaving ? 'Saving to Database...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
