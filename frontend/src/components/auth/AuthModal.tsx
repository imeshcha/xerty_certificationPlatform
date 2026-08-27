'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { usePrivy } from '@privy-io/react-auth';
import { Button } from '../ui/button';
import { fetchApi } from '../../lib/api';
import {
  Building2,
  GraduationCap,
  ArrowRight,
  Sparkles,
  Lock,
  X,
  Globe,
  Mail,
  User as UserIcon,
  Wallet,
  CheckCircle2,
  Check,
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultRole?: 'ISSUER' | 'STUDENT' | null;
}

export function AuthModal({ isOpen, onClose, defaultRole = null }: AuthModalProps) {
  const router = useRouter();
  const privy = usePrivy();
  const ready = privy?.ready ?? false;
  const authenticated = privy?.authenticated ?? false;
  const user = privy?.user ?? null;

  const [selectedRole, setSelectedRole] = useState<'ISSUER' | 'STUDENT' | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Read role from prop or localStorage
  useEffect(() => {
    if (defaultRole) {
      setSelectedRole(defaultRole);
    } else if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('xerty_selected_role') as 'ISSUER' | 'STUDENT' | null;
      if (stored) {
        setSelectedRole(stored);
      }
    }
  }, [defaultRole, isOpen]);

  // Issuer Form Data
  const [issuerForm, setIssuerForm] = useState({
    academyName: '',
    slug: '',
    website: '',
    contactEmail: '',
    description: '',
  });

  // Student Form Data
  const [studentForm, setStudentForm] = useState({
    fullName: '',
    headline: '',
    bio: '',
    linkedin: '',
  });

  // Pre-fill email or name if Privy authenticated
  useEffect(() => {
    if (authenticated && user) {
      if (user.email?.address && !issuerForm.contactEmail) {
        setIssuerForm((prev) => ({ ...prev, contactEmail: user.email?.address || '' }));
      }
      if ((user.google?.name || user.apple?.email) && !studentForm.fullName) {
        setStudentForm((prev) => ({ ...prev, fullName: user.google?.name || '' }));
      }
    }
  }, [authenticated, user]);

  if (!isOpen) return null;

  // Step 1: User selects role -> Trigger Privy Login options
  const handleSelectRole = async (role: 'ISSUER' | 'STUDENT') => {
    setSelectedRole(role);
    setErrorMessage('');

    if (typeof window !== 'undefined') {
      localStorage.setItem('xerty_selected_role', role);
      localStorage.setItem('xerty_user_role', role);
    }

    // If not yet authenticated, launch Privy login immediately
    if (!authenticated) {
      try {
        if (privy?.login) {
          await privy.login();
        }
      } catch (err: any) {
        console.warn('Privy login popup closed or failed:', err?.message || err);
      }
    }
  };

  const handleQuickSignIn = async () => {
    try {
      if (privy?.login) {
        await privy.login();
      }
    } catch (err: any) {
      console.warn('Quick sign-in error:', err);
    }
  };

  // Step 3: User fills account information & completes account creation
  const handleCompleteIssuerAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const generatedSlug =
        issuerForm.slug ||
        issuerForm.academyName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

      const walletAddr = user?.wallet?.address || '0x0000000000000000000000000000000000000000';
      const userId = user?.id || 'temp_user_id';

      // Call dedicated complete-registration API
      await fetchApi('/auth/complete-registration', {
        method: 'POST',
        body: JSON.stringify({
          privyUserId: userId,
          walletAddress: walletAddr,
          role: 'ISSUER',
          email: issuerForm.contactEmail || user?.email?.address,
          issuerProfile: {
            academyName: issuerForm.academyName,
            slug: generatedSlug,
            website: issuerForm.website,
            contactEmail: issuerForm.contactEmail || user?.email?.address,
            description: issuerForm.description,
          },
        }),
      });

      if (typeof window !== 'undefined') {
        localStorage.setItem('xerty_user_role', 'ISSUER');
        localStorage.setItem('xerty_onboarding_completed', 'true');
        localStorage.removeItem('xerty_selected_role');
      }

      onClose();
      // Hard navigation to ensure all layout guards re-evaluate role
      window.location.href = '/issuer';
    } catch (err: any) {
      console.error('Failed to complete issuer registration:', err);
      if (typeof window !== 'undefined') {
        localStorage.setItem('xerty_user_role', 'ISSUER');
        localStorage.setItem('xerty_onboarding_completed', 'true');
      }
      onClose();
      window.location.href = '/issuer';
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCompleteStudentAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const walletAddr = user?.wallet?.address || '0x0000000000000000000000000000000000000000';
      const userId = user?.id || 'temp_user_id';

      // Call dedicated complete-registration API
      await fetchApi('/auth/complete-registration', {
        method: 'POST',
        body: JSON.stringify({
          privyUserId: userId,
          walletAddress: walletAddr,
          role: 'STUDENT',
          email: user?.email?.address,
          fullName: studentForm.fullName,
          studentProfile: {
            fullName: studentForm.fullName,
            headline: studentForm.headline,
            bio: studentForm.bio,
            linkedin: studentForm.linkedin,
          },
        }),
      });

      if (typeof window !== 'undefined') {
        localStorage.setItem('xerty_user_role', 'STUDENT');
        localStorage.setItem('xerty_onboarding_completed', 'true');
        localStorage.removeItem('xerty_selected_role');
      }

      onClose();
      window.location.href = '/student';
    } catch (err: any) {
      console.error('Failed to complete student registration:', err);
      if (typeof window !== 'undefined') {
        localStorage.setItem('xerty_user_role', 'STUDENT');
        localStorage.setItem('xerty_onboarding_completed', 'true');
      }
      onClose();
      window.location.href = '/student';
    } finally {
      setIsSubmitting(false);
    }
  };

  const showRoleSelection = !selectedRole;
  const showLoginPrompt = selectedRole && !authenticated;
  const showInfoForm = selectedRole && authenticated;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 sm:p-6 animate-in fade-in duration-200 overflow-y-auto">
      <div
        className="relative w-full max-w-4xl rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-2xl text-card-foreground my-8 max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Top Header */}
        <div className="text-center space-y-2 mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="h-3.5 w-3.5" />
            Xerty Web3 Platform Access
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {showRoleSelection && 'Select Your Account Type'}
            {showLoginPrompt && `Sign In to Continue as ${selectedRole === 'ISSUER' ? 'Institution' : 'Student'}`}
            {showInfoForm &&
              (selectedRole === 'ISSUER'
                ? 'Complete Institution Account Information'
                : 'Complete Student Account Information')}
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-lg mx-auto">
            {showRoleSelection &&
              'Choose whether you are issuing academic credentials or receiving certificates.'}
            {showLoginPrompt && 'Connect with your Web3 wallet, Email, or Social account.'}
            {showInfoForm &&
              'Fill in your profile details to finalize your account and access your dashboard.'}
          </p>
        </div>

        {/* ========================================================================= */}
        {/* STEP 1: ROLE SELECTION CARDS                                              */}
        {/* ========================================================================= */}
        {showRoleSelection && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* CARD 1: ISSUER */}
              <div
                onClick={() => handleSelectRole('ISSUER')}
                className="cursor-pointer rounded-2xl border-2 border-border/80 bg-card hover:border-primary transition-all hover:shadow-xl p-6 relative overflow-hidden group flex flex-col justify-between"
              >
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary to-blue-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                      <Building2 className="h-6 w-6" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded bg-primary/15 text-primary flex items-center gap-1">
                      <Lock className="h-3 w-3" /> Issuer Only
                    </span>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold">Educational Institution / Issuer</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      For Universities, Academies, Bootcamps, and Instructors.
                    </p>
                  </div>

                  <ul className="text-xs text-muted-foreground space-y-2 pt-2 border-t">
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500 shrink-0" />
                      Create course rooms & curricula
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500 shrink-0" />
                      Visual diploma canvas designer
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500 shrink-0" />
                      Multi-student spreadsheet & CSV batch issuance
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500 shrink-0" />
                      Generate master batch student claim links
                    </li>
                  </ul>
                </div>

                <div className="pt-6">
                  <Button className="w-full font-bold shadow-md" size="default">
                    Select Issuer & Sign In
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* CARD 2: STUDENT */}
              <div
                onClick={() => handleSelectRole('STUDENT')}
                className="cursor-pointer rounded-2xl border-2 border-border/80 bg-card hover:border-emerald-500 transition-all hover:shadow-xl p-6 relative overflow-hidden group flex flex-col justify-between"
              >
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 to-teal-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                      <GraduationCap className="h-6 w-6" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded bg-emerald-500/15 text-emerald-600 border border-emerald-500/20 flex items-center gap-1">
                      <Lock className="h-3 w-3" /> Student Only
                    </span>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold">Student / Recipient</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      For Learners, Course Graduates, and Credential Holders.
                    </p>
                  </div>

                  <ul className="text-xs text-muted-foreground space-y-2 pt-2 border-t">
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500 shrink-0" />
                      Claim and store credentials in Student Vault
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500 shrink-0" />
                      1-click claim with email or Web3 wallet
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500 shrink-0" />
                      Add verified diplomas directly to LinkedIn
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500 shrink-0" />
                      Download on-chain cryptographic proofs & PDF
                    </li>
                  </ul>
                </div>

                <div className="pt-6">
                  <Button
                    className="w-full font-bold border-emerald-500/30 text-emerald-600 hover:bg-emerald-500/10"
                    variant="outline"
                    size="default"
                  >
                    Select Student & Sign In
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Quick Login Footer */}
            <div className="text-center pt-2 border-t">
              <button
                type="button"
                onClick={handleQuickSignIn}
                className="text-xs text-muted-foreground hover:text-foreground font-semibold inline-flex items-center gap-1.5 transition-colors"
              >
                Already registered? <span className="text-primary underline">Sign In with Wallet / Email →</span>
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 2: PROMPT LOGIN (IF POPUP WAS CLOSED)                                */}
        {/* ========================================================================= */}
        {showLoginPrompt && (
          <div className="max-w-md mx-auto text-center space-y-6 py-6">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary mx-auto flex items-center justify-center">
              <Wallet className="h-8 w-8" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-bold">
                Initialize Login for {selectedRole === 'ISSUER' ? 'Issuer' : 'Student'} Account
              </h3>
              <p className="text-xs text-muted-foreground">
                Click below to select your login method (Web3 Wallet, Google, Apple, or Email).
              </p>
            </div>
            <div className="space-y-3">
              <Button onClick={() => privy?.login()} className="w-full h-11 font-bold shadow-md">
                Select Login Option & Authenticate →
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSelectedRole(null);
                  if (typeof window !== 'undefined') localStorage.removeItem('xerty_selected_role');
                }}
                className="text-xs text-muted-foreground"
              >
                ← Change Selected Role
              </Button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 3A: ISSUER INFORMATION FORM (AFTER LOGIN INITIALIZED)                */}
        {/* ========================================================================= */}
        {showInfoForm && selectedRole === 'ISSUER' && (
          <div className="max-w-xl mx-auto space-y-5">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1.5 text-xs text-green-500 font-medium bg-green-500/10 px-2.5 py-1 rounded-full border border-green-500/20">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Authenticated
                </span>
                <span className="text-xs text-muted-foreground font-mono truncate max-w-[200px]">
                  {user?.wallet?.address ? `${user.wallet.address.slice(0, 6)}...${user.wallet.address.slice(-4)}` : user?.email?.address}
                </span>
              </div>
              <span className="text-xs font-bold text-primary flex items-center gap-1.5 font-mono">
                <Building2 className="h-3.5 w-3.5" /> Issuer Profile
              </span>
            </div>

            <form onSubmit={handleCompleteIssuerAccount} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase text-muted-foreground flex items-center gap-1.5">
                  <Building2 className="h-3.5 w-3.5 text-primary" />
                  Academy / Organization Name <span className="text-destructive">*</span>
                </label>
                <input
                  required
                  type="text"
                  className="w-full rounded-lg border bg-background px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="e.g. Stanford Web3 Academy"
                  value={issuerForm.academyName}
                  onChange={(e) =>
                    setIssuerForm({
                      ...issuerForm,
                      academyName: e.target.value,
                      slug: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
                    })
                  }
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase text-muted-foreground">
                    Public Handle / Slug <span className="text-destructive">*</span>
                  </label>
                  <input
                    required
                    type="text"
                    className="w-full rounded-lg border bg-background px-3.5 py-2.5 text-xs font-mono lowercase focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="e.g. stanford-web3"
                    value={issuerForm.slug}
                    onChange={(e) => setIssuerForm({ ...issuerForm, slug: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase text-muted-foreground flex items-center gap-1">
                    <Globe className="h-3.5 w-3.5 text-primary" /> Official Website
                  </label>
                  <input
                    type="url"
                    className="w-full rounded-lg border bg-background px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="https://academy.edu"
                    value={issuerForm.website}
                    onChange={(e) => setIssuerForm({ ...issuerForm, website: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase text-muted-foreground flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5 text-primary" />
                  Official Contact Email <span className="text-destructive">*</span>
                </label>
                <input
                  required
                  type="email"
                  className="w-full rounded-lg border bg-background px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="admin@academy.edu"
                  value={issuerForm.contactEmail}
                  onChange={(e) => setIssuerForm({ ...issuerForm, contactEmail: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase text-muted-foreground">
                  Organization Bio / Description
                </label>
                <textarea
                  rows={2}
                  className="w-full rounded-lg border bg-background px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Describe your certification programs..."
                  value={issuerForm.description}
                  onChange={(e) => setIssuerForm({ ...issuerForm, description: e.target.value })}
                />
              </div>

              {errorMessage && <p className="text-xs text-destructive">{errorMessage}</p>}

              <div className="pt-2">
                <Button type="submit" className="w-full font-bold h-11 text-sm shadow-lg" disabled={isSubmitting}>
                  {isSubmitting ? 'Saving & Finalizing...' : 'Save & Complete Issuer Account Creation →'}
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 3B: STUDENT INFORMATION FORM (AFTER LOGIN INITIALIZED)               */}
        {/* ========================================================================= */}
        {showInfoForm && selectedRole === 'STUDENT' && (
          <div className="max-w-xl mx-auto space-y-5">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1.5 text-xs text-green-500 font-medium bg-green-500/10 px-2.5 py-1 rounded-full border border-green-500/20">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Authenticated
                </span>
                <span className="text-xs text-muted-foreground font-mono truncate max-w-[200px]">
                  {user?.wallet?.address ? `${user.wallet.address.slice(0, 6)}...${user.wallet.address.slice(-4)}` : user?.email?.address}
                </span>
              </div>
              <span className="text-xs font-bold text-emerald-600 flex items-center gap-1.5 font-mono">
                <GraduationCap className="h-3.5 w-3.5" /> Student Vault Profile
              </span>
            </div>

            <form onSubmit={handleCompleteStudentAccount} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase text-muted-foreground flex items-center gap-1.5">
                  <UserIcon className="h-3.5 w-3.5 text-emerald-500" />
                  Full Legal Name <span className="text-destructive">*</span>
                </label>
                <input
                  required
                  type="text"
                  className="w-full rounded-lg border bg-background px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="e.g. Alice Doe"
                  value={studentForm.fullName}
                  onChange={(e) => setStudentForm({ ...studentForm, fullName: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase text-muted-foreground">
                  Professional Headline
                </label>
                <input
                  type="text"
                  className="w-full rounded-lg border bg-background px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="e.g. Full-Stack Web3 Developer"
                  value={studentForm.headline}
                  onChange={(e) => setStudentForm({ ...studentForm, headline: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase text-muted-foreground flex items-center gap-1.5">
                  <Globe className="h-3.5 w-3.5 text-emerald-500" />
                  LinkedIn Profile URL
                </label>
                <input
                  type="url"
                  className="w-full rounded-lg border bg-background px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="https://linkedin.com/in/alicedoe"
                  value={studentForm.linkedin}
                  onChange={(e) => setStudentForm({ ...studentForm, linkedin: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase text-muted-foreground">
                  Personal Bio / Goals
                </label>
                <textarea
                  rows={2}
                  className="w-full rounded-lg border bg-background px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="Brief description of your skills, achievements, and academic goals..."
                  value={studentForm.bio}
                  onChange={(e) => setStudentForm({ ...studentForm, bio: e.target.value })}
                />
              </div>

              {errorMessage && <p className="text-xs text-destructive">{errorMessage}</p>}

              <div className="pt-2">
                <Button
                  type="submit"
                  className="w-full font-bold h-11 text-sm bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Saving & Finalizing...' : 'Save & Complete Student Account Creation →'}
                </Button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
