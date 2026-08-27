'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Building2, GraduationCap, ArrowRight, Check, Sparkles, ArrowUpRight } from 'lucide-react';
import { fetchApi } from '../../../lib/api';

export default function OnboardingPage() {
  const router = useRouter();
  const { user, walletAddress } = useAuth();

  const [selectedRole, setSelectedRole] = useState<'ISSUER' | 'STUDENT' | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Issuer Form Data
  const [issuerForm, setIssuerForm] = useState({
    academyName: '',
    slug: '',
    website: '',
    contactEmail: user?.email?.address || '',
    description: '',
  });

  // Student Form Data
  const [studentForm, setStudentForm] = useState({
    fullName: user?.google?.name || user?.apple?.email || '',
    headline: 'Web3 Learner & Developer',
    bio: '',
    linkedin: '',
  });

  const handleRoleSelection = (role: 'ISSUER' | 'STUDENT') => {
    setSelectedRole(role);
    setErrorMessage('');
  };

  const handleSkipStudent = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('xerty_user_role', 'STUDENT');
      localStorage.setItem('xerty_onboarding_completed', 'true');
    }
    router.push('/student');
  };

  const handleIssuerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const generatedSlug =
        issuerForm.slug ||
        issuerForm.academyName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

      await fetchApi('/issuers/profile', {
        method: 'POST',
        body: JSON.stringify({
          userId: user?.id || 'temp_user_id',
          academyName: issuerForm.academyName,
          slug: generatedSlug,
          onchainIssuerAddress: walletAddress || '0x0000000000000000000000000000000000000000',
          organizationInfo: {
            description: issuerForm.description,
            website: issuerForm.website,
            contactEmail: issuerForm.contactEmail,
          },
        }),
      });

      // Save role locally & route
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
      await fetchApi('/students/profile', {
        method: 'POST',
        body: JSON.stringify({
          userId: user?.id || 'temp_user_id',
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
        <h1 className="text-3xl font-bold tracking-tight">Select Account Type</h1>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          Choose whether you are an Educational Institution issuing credentials or a Student viewing credentials.
        </p>
      </div>

      {/* Step 1: Role Selection Cards */}
      {!selectedRole && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
          {/* Issuer Option */}
          <Card
            onClick={() => handleRoleSelection('ISSUER')}
            className="cursor-pointer hover:border-primary transition-all hover:shadow-lg relative overflow-hidden group"
          >
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary to-blue-400 opacity-0 group-hover:opacity-100 transition-opacity" />
            <CardHeader className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <Building2 className="h-6 w-6" />
              </div>
              <div>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">Institution / Issuer</CardTitle>
                  <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-primary/15 text-primary">Mandatory</span>
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
                  Create academic courses & curricula
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500 shrink-0" />
                  Design & upload certificate templates
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500 shrink-0" />
                  Issue single or bulk CSV credentials
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500 shrink-0" />
                  On-chain revocation management
                </li>
              </ul>
              <Button className="w-full mt-2" variant="outline">
                Register as Issuer
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>

          {/* Student Option */}
          <Card
            onClick={() => handleRoleSelection('STUDENT')}
            className="cursor-pointer hover:border-emerald-500 transition-all hover:shadow-lg relative overflow-hidden group"
          >
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 to-teal-400 opacity-0 group-hover:opacity-100 transition-opacity" />
            <CardHeader className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                <GraduationCap className="h-6 w-6" />
              </div>
              <div>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">Student / Recipient</CardTitle>
                  <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-500">Optional</span>
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
                  Zero account required to view & verify
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500 shrink-0" />
                  1-click claim credentials by email
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500 shrink-0" />
                  Add credentials directly to LinkedIn
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500 shrink-0" />
                  Download PDF & verified on-chain proofs
                </li>
              </ul>
              <div className="space-y-2 pt-2">
                <Button className="w-full" variant="outline">
                  Setup Student Profile
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSkipStudent();
                  }}
                  className="w-full text-xs text-muted-foreground hover:text-foreground"
                  variant="ghost"
                  size="sm"
                >
                  Skip & Go Directly to Vault
                  <ArrowUpRight className="ml-1.5 h-3.5 w-3.5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Step 2: Form for Issuer */}
      {selectedRole === 'ISSUER' && (
        <Card className="max-w-xl mx-auto">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Institution Profile Setup (Mandatory)</CardTitle>
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
                <label className="text-xs font-semibold uppercase text-muted-foreground">
                  Academy / Organization Name
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
                  <label className="text-xs font-semibold uppercase text-muted-foreground">Public Handle / Slug</label>
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
                  <label className="text-xs font-semibold uppercase text-muted-foreground">Official Website</label>
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
                <label className="text-xs font-semibold uppercase text-muted-foreground">Official Contact Email</label>
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
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? 'Creating Profile...' : 'Complete Issuer Registration'}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Form for Student (Optional) */}
      {selectedRole === 'STUDENT' && (
        <Card className="max-w-xl mx-auto">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Student Profile Setup (Optional)</CardTitle>
                <CardDescription>Personalize your portfolio, or skip directly to your vault.</CardDescription>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setSelectedRole(null)}>
                Change Role
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleStudentSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase text-muted-foreground">Full Legal Name</label>
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
                <label className="text-xs font-semibold uppercase text-muted-foreground">LinkedIn Profile URL</label>
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

              <div className="flex items-center justify-between pt-2 gap-3">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleSkipStudent}
                >
                  Skip Setup
                </Button>
                <Button type="submit" size="sm" disabled={isSubmitting}>
                  {isSubmitting ? 'Saving Profile...' : 'Save Student Profile'}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
