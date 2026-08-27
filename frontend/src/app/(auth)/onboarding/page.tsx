'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { usePrivy } from '@privy-io/react-auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import {
  Building2,
  GraduationCap,
  ArrowRight,
  Check,
  Sparkles,
  Lock,
  Globe,
  Mail,
  User as UserIcon,
  CheckCircle2,
} from 'lucide-react';
import { fetchApi } from '../../../lib/api';

export default function OnboardingPage() {
  const router = useRouter();
  const privy = usePrivy();
  const ready = privy?.ready ?? false;
  const authenticated = privy?.authenticated ?? false;
  const user = privy?.user ?? null;

  const [selectedRole, setSelectedRole] = useState<'ISSUER' | 'STUDENT' | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

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
    headline: 'Web3 Learner & Developer',
    bio: '',
    linkedin: '',
  });

  // Pre-fill email/name if logged in
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

  const handleRoleSelection = async (role: 'ISSUER' | 'STUDENT') => {
    setSelectedRole(role);
    setErrorMessage('');

    // If not authenticated, prompt login options immediately
    if (!authenticated) {
      try {
        if (privy?.login) {
          await privy.login();
        }
      } catch (err: any) {
        console.warn('Privy login modal closed:', err?.message || err);
      }
    }
  };

  const handleIssuerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const generatedSlug =
        issuerForm.slug ||
        issuerForm.academyName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

      const walletAddr = user?.wallet?.address || '0x0000000000000000000000000000000000000000';
      const userId = user?.id || 'temp_user_id';

      // 1. Sync role as ISSUER
      await fetchApi('/auth/sync', {
        method: 'POST',
        body: JSON.stringify({
          privyUserId: userId,
          walletAddress: walletAddr,
          authProvider: user?.linkedAccounts?.[0]?.type?.toUpperCase() || 'WALLET',
          role: 'ISSUER',
          email: issuerForm.contactEmail || user?.email?.address,
        }),
      });

      // 2. Create Issuer profile in MongoDB
      await fetchApi('/issuers/profile', {
        method: 'POST',
        body: JSON.stringify({
          userId: userId,
          academyName: issuerForm.academyName,
          slug: generatedSlug,
          onchainIssuerAddress: walletAddr,
          organizationInfo: {
            description: issuerForm.description,
            website: issuerForm.website,
            contactEmail: issuerForm.contactEmail || user?.email?.address,
          },
        }),
      });

      if (typeof window !== 'undefined') {
        localStorage.setItem('xerty_user_role', 'ISSUER');
        localStorage.setItem('xerty_onboarding_completed', 'true');
      }

      router.push('/issuer');
    } catch (err: any) {
      console.error('Failed to create issuer profile:', err);
      if (typeof window !== 'undefined') {
        localStorage.setItem('xerty_user_role', 'ISSUER');
        localStorage.setItem('xerty_onboarding_completed', 'true');
      }
      router.push('/issuer');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStudentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const walletAddr = user?.wallet?.address || '0x0000000000000000000000000000000000000000';
      const userId = user?.id || 'temp_user_id';

      // 1. Sync role as STUDENT
      await fetchApi('/auth/sync', {
        method: 'POST',
        body: JSON.stringify({
          privyUserId: userId,
          walletAddress: walletAddr,
          authProvider: user?.linkedAccounts?.[0]?.type?.toUpperCase() || 'WALLET',
          role: 'STUDENT',
          email: user?.email?.address,
          fullName: studentForm.fullName,
        }),
      });

      // 2. Create Student profile in MongoDB
      await fetchApi('/students/profile', {
        method: 'POST',
        body: JSON.stringify({
          userId: userId,
          fullName: studentForm.fullName,
          headline: studentForm.headline,
          bio: studentForm.bio,
          socialLinks: {
            linkedin: studentForm.linkedin,
          },
        }),
      });

      if (typeof window !== 'undefined') {
        localStorage.setItem('xerty_user_role', 'STUDENT');
        localStorage.setItem('xerty_onboarding_completed', 'true');
      }

      router.push('/student');
    } catch (err: any) {
      console.error('Failed to create student profile:', err);
      if (typeof window !== 'undefined') {
        localStorage.setItem('xerty_user_role', 'STUDENT');
        localStorage.setItem('xerty_onboarding_completed', 'true');
      }
      router.push('/student');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider">
          <Sparkles className="h-3.5 w-3.5" />
          Welcome to Xerty
        </div>
        <h1 className="text-3xl font-bold tracking-tight">
          {!selectedRole
            ? 'Select Account Type'
            : !authenticated
            ? 'Sign In to Proceed'
            : selectedRole === 'ISSUER'
            ? 'Complete Institution Account Information'
            : 'Complete Student Account Information'}
        </h1>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          {!selectedRole && 'Select whether you are issuing academic credentials or receiving certificates.'}
          {selectedRole && !authenticated && 'Choose your login method (Web3 wallet, Email, or Social account).'}
          {selectedRole && authenticated && 'Fill in your profile details to complete account creation.'}
        </p>
      </div>

      {/* Step 1: Role Selection Cards */}
      {!selectedRole && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          {/* Issuer Option */}
          <Card
            onClick={() => handleRoleSelection('ISSUER')}
            className="cursor-pointer hover:border-primary transition-all hover:shadow-lg relative overflow-hidden group border-2"
          >
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary to-blue-400 opacity-0 group-hover:opacity-100 transition-opacity" />
            <CardHeader className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <Building2 className="h-6 w-6" />
              </div>
              <div>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">Institution / Issuer</CardTitle>
                  <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-primary/15 text-primary flex items-center gap-1">
                    <Lock className="h-3 w-3" /> Issuer Only
                  </span>
                </div>
                <CardDescription className="text-xs mt-1">
                  For Academies, Universities, Bootcamps, and Organizations
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="text-xs text-muted-foreground space-y-2">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500 shrink-0" />
                  Create academic course rooms & curricula
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500 shrink-0" />
                  Design & edit custom certificate templates
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500 shrink-0" />
                  Issue single or batch CSV credentials
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500 shrink-0" />
                  Generate unified batch claim links
                </li>
              </ul>
              <Button className="w-full mt-2" variant="default">
                Select Issuer & Sign In
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>

          {/* Student Option */}
          <Card
            onClick={() => handleRoleSelection('STUDENT')}
            className="cursor-pointer hover:border-emerald-500 transition-all hover:shadow-lg relative overflow-hidden group border-2"
          >
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 to-teal-400 opacity-0 group-hover:opacity-100 transition-opacity" />
            <CardHeader className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                <GraduationCap className="h-6 w-6" />
              </div>
              <div>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">Student / Recipient</CardTitle>
                  <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-500 flex items-center gap-1">
                    <Lock className="h-3 w-3" /> Student Only
                  </span>
                </div>
                <CardDescription className="text-xs mt-1">
                  View, claim, download, and share your Soulbound tokens
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="text-xs text-muted-foreground space-y-2">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500 shrink-0" />
                  Hold credentials in personal student vault
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500 shrink-0" />
                  1-click claim credentials via email or wallet
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500 shrink-0" />
                  Add verified badges directly to LinkedIn
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500 shrink-0" />
                  Download verifiable on-chain proofs & PDF
                </li>
              </ul>
              <div className="space-y-2 pt-2">
                <Button className="w-full" variant="outline">
                  Select Student & Sign In
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Step 2 Prompt: If role selected but not logged in */}
      {selectedRole && !authenticated && (
        <Card className="max-w-md mx-auto text-center p-6 space-y-4 border-2">
          <div className="space-y-2">
            <h3 className="font-bold text-lg">Sign In to Continue</h3>
            <p className="text-xs text-muted-foreground">
              Please authenticate to set up your {selectedRole === 'ISSUER' ? 'Institution' : 'Student'} account.
            </p>
          </div>
          <Button onClick={() => privy?.login()} className="w-full">
            Choose Login Option →
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setSelectedRole(null)} className="text-xs">
            ← Change Role
          </Button>
        </Card>
      )}

      {/* Step 3: Form for Issuer (After Login Initialized) */}
      {selectedRole === 'ISSUER' && authenticated && (
        <Card className="max-w-xl mx-auto border-2 border-primary/40">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="flex items-center gap-1 text-[11px] text-green-500 font-medium bg-green-500/10 px-2 py-0.5 rounded-full">
                    <CheckCircle2 className="h-3 w-3" /> Authenticated
                  </span>
                </div>
                <CardTitle className="text-lg">Institution Account Setup</CardTitle>
                <CardDescription>Enter details about your academy or organization.</CardDescription>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setSelectedRole(null)}>
                Change Role
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleIssuerSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase text-muted-foreground flex items-center gap-1">
                  <Building2 className="h-3.5 w-3.5 text-primary" />
                  Academy / Organization Name <span className="text-destructive">*</span>
                </label>
                <input
                  required
                  type="text"
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="e.g. Global Blockchain Academy"
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

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase text-muted-foreground">
                    Public Handle / Slug <span className="text-destructive">*</span>
                  </label>
                  <input
                    required
                    type="text"
                    className="w-full rounded-md border bg-background px-3 py-2 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-primary lowercase"
                    placeholder="e.g. global-blockchain-academy"
                    value={issuerForm.slug}
                    onChange={(e) => setIssuerForm({ ...issuerForm, slug: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase text-muted-foreground flex items-center gap-1">
                    <Globe className="h-3.5 w-3.5 text-primary" /> Official Website
                  </label>
                  <input
                    type="url"
                    className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                    placeholder="https://academy.edu"
                    value={issuerForm.website}
                    onChange={(e) => setIssuerForm({ ...issuerForm, website: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase text-muted-foreground flex items-center gap-1">
                  <Mail className="h-3.5 w-3.5 text-primary" />
                  Official Contact Email <span className="text-destructive">*</span>
                </label>
                <input
                  required
                  type="email"
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="contact@academy.edu"
                  value={issuerForm.contactEmail}
                  onChange={(e) => setIssuerForm({ ...issuerForm, contactEmail: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase text-muted-foreground">Organization Bio</label>
                <textarea
                  rows={3}
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="Brief description of your certification programs..."
                  value={issuerForm.description}
                  onChange={(e) => setIssuerForm({ ...issuerForm, description: e.target.value })}
                />
              </div>

              {errorMessage && <p className="text-xs text-destructive">{errorMessage}</p>}

              <div className="pt-2">
                <Button type="submit" className="w-full font-bold h-11" disabled={isSubmitting}>
                  {isSubmitting ? 'Saving & Creating Profile...' : 'Save & Complete Issuer Account Creation →'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Form for Student (After Login Initialized) */}
      {selectedRole === 'STUDENT' && authenticated && (
        <Card className="max-w-xl mx-auto border-2 border-emerald-500/40">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="flex items-center gap-1 text-[11px] text-green-500 font-medium bg-green-500/10 px-2 py-0.5 rounded-full">
                    <CheckCircle2 className="h-3 w-3" /> Authenticated
                  </span>
                </div>
                <CardTitle className="text-lg">Student Profile Setup</CardTitle>
                <CardDescription>Personalize your recipient portfolio.</CardDescription>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setSelectedRole(null)}>
                Change Role
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleStudentSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase text-muted-foreground flex items-center gap-1">
                  <UserIcon className="h-3.5 w-3.5 text-emerald-500" />
                  Full Legal Name <span className="text-destructive">*</span>
                </label>
                <input
                  required
                  type="text"
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="e.g. Alice Doe"
                  value={studentForm.fullName}
                  onChange={(e) => setStudentForm({ ...studentForm, fullName: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase text-muted-foreground">Professional Headline</label>
                <input
                  type="text"
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="e.g. Full-Stack Web3 Developer"
                  value={studentForm.headline}
                  onChange={(e) => setStudentForm({ ...studentForm, headline: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase text-muted-foreground flex items-center gap-1">
                  <Globe className="h-3.5 w-3.5 text-emerald-500" />
                  LinkedIn Profile URL
                </label>
                <input
                  type="url"
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="https://linkedin.com/in/alicedoe"
                  value={studentForm.linkedin}
                  onChange={(e) => setStudentForm({ ...studentForm, linkedin: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase text-muted-foreground">Short Bio (Optional)</label>
                <textarea
                  rows={2}
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="Tell potential employers or academies about your goals..."
                  value={studentForm.bio}
                  onChange={(e) => setStudentForm({ ...studentForm, bio: e.target.value })}
                />
              </div>

              {errorMessage && <p className="text-xs text-destructive">{errorMessage}</p>}

              <div className="pt-2">
                <Button
                  type="submit"
                  className="w-full font-bold h-11 bg-emerald-600 hover:bg-emerald-700 text-white"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Saving & Finalizing...' : 'Save & Complete Student Account Creation →'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
