'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../ui/button';
import { truncateAddress } from '../../lib/utils';
import { fetchApi } from '../../lib/api';
import {
  User,
  Building2,
  GraduationCap,
  Save,
  LogOut,
  X,
  Copy,
  Check,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ProfileModal({ isOpen, onClose }: ProfileModalProps) {
  const { user, walletAddress, userRole, logout } = useAuth();

  const [copied, setCopied] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

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

  // Load existing profile from backend when modal opens
  useEffect(() => {
    if (isOpen && walletAddress) {
      setSaveSuccess(false);
      setErrorMessage('');

      fetchApi(`/users/wallet/${walletAddress}`)
        .then((res: any) => {
          if (res) {
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
          console.warn('Could not load profile details:', err);
        });
    }
  }, [isOpen, walletAddress]);

  if (!isOpen) return null;

  const handleCopyWallet = () => {
    if (walletAddress) {
      navigator.clipboard.writeText(walletAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);
    setErrorMessage('');

    try {
      if (userRole === 'ISSUER') {
        await fetchApi('/issuers/profile', {
          method: 'POST',
          body: JSON.stringify({
            userId: user?.id || 'current_user',
            academyName: issuerData.academyName,
            slug: issuerData.slug || issuerData.academyName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
            onchainIssuerAddress: walletAddress,
            organizationInfo: {
              description: issuerData.description,
              website: issuerData.website,
              contactEmail: issuerData.contactEmail,
            },
          }),
        });
      } else {
        await fetchApi('/students/profile', {
          method: 'POST',
          body: JSON.stringify({
            userId: user?.id || 'current_user',
            fullName: studentData.fullName,
            headline: studentData.headline,
            bio: studentData.bio,
            socialLinks: {
              linkedin: studentData.linkedin,
              github: studentData.github,
            },
          }),
        });
      }

      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);
    } catch (err: any) {
      console.error('Failed to update profile in database:', err);
      setErrorMessage(err.message || 'Failed to save changes');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-lg rounded-xl border bg-card p-6 shadow-2xl text-card-foreground space-y-5 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b pb-3">
          <div className="flex items-center space-x-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
              {userRole === 'ISSUER' ? <Building2 className="h-5 w-5" /> : <GraduationCap className="h-5 w-5" />}
            </div>
            <div>
              <h2 className="text-base font-bold tracking-tight">Account & Profile Settings</h2>
              <p className="text-xs text-muted-foreground">
                Manage your credentials and institutional data stored in MongoDB.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Wallet & Identity Summary */}
        <div className="rounded-lg border bg-muted/40 p-3 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground font-medium flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-primary" />
              MPC Wallet (Arbitrum Sepolia)
            </span>
            <span className="font-mono text-[11px] font-semibold">{truncateAddress(walletAddress)}</span>
          </div>

          <div className="flex items-center justify-between gap-2 pt-1">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-7 text-xs w-full"
              onClick={handleCopyWallet}
            >
              {copied ? (
                <>
                  <Check className="mr-1.5 h-3.5 w-3.5 text-green-500" />
                  Copied Address
                </>
              ) : (
                <>
                  <Copy className="mr-1.5 h-3.5 w-3.5" />
                  Copy Full Address
                </>
              )}
            </Button>
            <a
              href={`https://sepolia.arbiscan.io/address/${walletAddress}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center h-7 px-3 text-xs rounded-md border hover:bg-muted transition-colors text-muted-foreground hover:text-foreground shrink-0"
            >
              Arbiscan
              <ExternalLink className="ml-1 h-3 w-3" />
            </a>
          </div>
        </div>

        {/* Profile Edit Form */}
        <form onSubmit={handleSave} className="space-y-4">
          {userRole === 'ISSUER' ? (
            /* Issuer Fields */
            <>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase text-muted-foreground">
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

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase text-muted-foreground">Public Handle (Slug)</label>
                  <input
                    type="text"
                    className="w-full rounded-md border bg-background px-3 py-2 text-xs font-mono lowercase focus:outline-none focus:ring-1 focus:ring-primary"
                    value={issuerData.slug}
                    onChange={(e) => setIssuerData({ ...issuerData, slug: e.target.value })}
                    placeholder="xerty-educations"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase text-muted-foreground">Official Website</label>
                  <input
                    type="url"
                    className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                    value={issuerData.website}
                    onChange={(e) => setIssuerData({ ...issuerData, website: e.target.value })}
                    placeholder="https://academy.edu"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase text-muted-foreground">Contact Email</label>
                <input
                  required
                  type="email"
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                  value={issuerData.contactEmail}
                  onChange={(e) => setIssuerData({ ...issuerData, contactEmail: e.target.value })}
                  placeholder="contact@academy.edu"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase text-muted-foreground">Description / Bio</label>
                <textarea
                  rows={2}
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                  value={issuerData.description}
                  onChange={(e) => setIssuerData({ ...issuerData, description: e.target.value })}
                  placeholder="Brief description of your certification programs..."
                />
              </div>
            </>
          ) : (
            /* Student Fields */
            <>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase text-muted-foreground">Full Legal Name</label>
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
                <label className="text-xs font-semibold uppercase text-muted-foreground">Professional Headline</label>
                <input
                  type="text"
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                  value={studentData.headline}
                  onChange={(e) => setStudentData({ ...studentData, headline: e.target.value })}
                  placeholder="e.g. Web3 Developer & Researcher"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase text-muted-foreground">LinkedIn URL</label>
                  <input
                    type="url"
                    className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                    value={studentData.linkedin}
                    onChange={(e) => setStudentData({ ...studentData, linkedin: e.target.value })}
                    placeholder="https://linkedin.com/in/username"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase text-muted-foreground">GitHub URL</label>
                  <input
                    type="url"
                    className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                    value={studentData.github}
                    onChange={(e) => setStudentData({ ...studentData, github: e.target.value })}
                    placeholder="https://github.com/username"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase text-muted-foreground">Personal Bio</label>
                <textarea
                  rows={2}
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                  value={studentData.bio}
                  onChange={(e) => setStudentData({ ...studentData, bio: e.target.value })}
                  placeholder="Brief overview of your skills and background..."
                />
              </div>
            </>
          )}

          {/* Feedback Alerts */}
          {saveSuccess && (
            <div className="rounded-md bg-green-500/10 border border-green-500/30 p-2.5 text-xs text-green-500 flex items-center gap-1.5">
              <Check className="h-4 w-4 shrink-0" />
              Profile updated successfully in MongoDB Atlas!
            </div>
          )}

          {errorMessage && (
            <p className="text-xs text-destructive">{errorMessage}</p>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between pt-2 border-t">
            <Button
              type="button"
              variant="destructive"
              size="sm"
              className="text-xs"
              onClick={() => {
                onClose();
                logout();
              }}
            >
              <LogOut className="mr-1.5 h-3.5 w-3.5" />
              Log Out
            </Button>

            <div className="flex items-center gap-2">
              <Button type="button" variant="ghost" size="sm" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" size="sm" disabled={isSaving}>
                <Save className="mr-1.5 h-3.5 w-3.5" />
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
