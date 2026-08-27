'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { usePrivy } from '@privy-io/react-auth';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { fetchApi } from '../../lib/api';
import {
  Building2,
  GraduationCap,
  ArrowRight,
  ArrowLeft,
  Check,
  Sparkles,
  ShieldAlert,
  Lock,
  X,
  Globe,
  Mail,
  User,
  ShieldCheck,
  ExternalLink,
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultRole?: 'ISSUER' | 'STUDENT' | null;
}

export function AuthModal({ isOpen, onClose, defaultRole = null }: AuthModalProps) {
  const router = useRouter();
  const privy = usePrivy();

  const [step, setStep] = useState<'SELECT_ROLE' | 'ISSUER_FORM' | 'STUDENT_FORM'>(
    defaultRole === 'ISSUER' ? 'ISSUER_FORM' : defaultRole === 'STUDENT' ? 'STUDENT_FORM' : 'SELECT_ROLE'
  );
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
    headline: '',
    bio: '',
    linkedin: '',
  });

  if (!isOpen) return null;

  const handleSelectRole = (role: 'ISSUER' | 'STUDENT') => {
    setErrorMessage('');
    if (role === 'ISSUER') {
      setStep('ISSUER_FORM');
    } else {
      setStep('STUDENT_FORM');
    }
  };

  const handleQuickLogin = async () => {
    try {
      onClose();
      if (privy?.login) {
        await privy.login();
      }
    } catch (err: any) {
      console.warn('Quick login notice:', err?.message || err);
    }
  };

  const handleIssuerSubmitAndConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const generatedSlug =
        issuerForm.slug ||
        issuerForm.academyName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

      // Store pending registration info in localStorage for after Privy connects
      if (typeof window !== 'undefined') {
        localStorage.setItem('xerty_pending_role', 'ISSUER');
        localStorage.setItem(
          'xerty_pending_issuer_data',
          JSON.stringify({
            ...issuerForm,
            slug: generatedSlug,
          })
        );
        localStorage.setItem('xerty_user_role', 'ISSUER');
        localStorage.setItem('xerty_onboarding_completed', 'true');
      }

      onClose();

      // Launch Privy login / signup modal
      if (privy?.login) {
        await privy.login();
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to initialize issuer registration');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStudentSubmitAndConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');

    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('xerty_pending_role', 'STUDENT');
        localStorage.setItem(
          'xerty_pending_student_data',
          JSON.stringify({
            ...studentForm,
          })
        );
        localStorage.setItem('xerty_user_role', 'STUDENT');
        localStorage.setItem('xerty_onboarding_completed', 'true');
      }

      onClose();

      // Launch Privy login / signup modal
      if (privy?.login) {
        await privy.login();
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to initialize student registration');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 sm:p-6 animate-in fade-in duration-200 overflow-y-auto">
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

        {/* Modal Top Header */}
        <div className="text-center space-y-2 mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="h-3.5 w-3.5" />
            Xerty Web3 Platform Access
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {step === 'SELECT_ROLE' && 'Choose Your Permanent Account Type'}
            {step === 'ISSUER_FORM' && 'Register Educational Institution Account'}
            {step === 'STUDENT_FORM' && 'Register Student & Learner Account'}
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-lg mx-auto">
            {step === 'SELECT_ROLE' &&
              'Select whether you are issuing academic credentials or receiving certificates.'}
            {step === 'ISSUER_FORM' &&
              'Fill in your academy information. Once created, you will be taken to the Issuer Studio.'}
            {step === 'STUDENT_FORM' &&
              'Set up your student portfolio. Once created, you will be taken to your Student Vault.'}
          </p>
        </div>

        {/* Strict Role Policy Warning */}
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-3.5 sm:p-4 mb-6 flex items-start gap-3 text-xs">
          <ShieldAlert className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold text-foreground">Strict Account Separation Policy:</p>
            <p className="text-muted-foreground">
              • <strong>Issuer accounts</strong> can create courses and issue certificates, but <u>cannot</u> create a student account or access student vault.<br />
              • <strong>Student accounts</strong> can hold and claim credentials, but <u>cannot</u> create an issuer account or access the issuer studio.
            </p>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* STEP 1: ROLE SELECTION CARDS (2 COLUMNS)                                   */}
        {/* ========================================================================= */}
        {step === 'SELECT_ROLE' && (
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
                    Register as Institution / Issuer
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
                  <Button className="w-full font-bold border-emerald-500/30 text-emerald-600 hover:bg-emerald-500/10" variant="outline" size="default">
                    Register as Student
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Quick Login Footer for Returning Users */}
            <div className="text-center pt-2 border-t">
              <button
                type="button"
                onClick={handleQuickLogin}
                className="text-xs text-muted-foreground hover:text-foreground font-semibold inline-flex items-center gap-1.5 transition-colors"
              >
                Already have an account? <span className="text-primary underline">Quick Sign In with Wallet / Email →</span>
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 2A: ISSUER REGISTRATION FORM                                         */}
        {/* ========================================================================= */}
        {step === 'ISSUER_FORM' && (
          <div className="max-w-xl mx-auto space-y-5">
            <div className="flex items-center justify-between border-b pb-3">
              <button
                type="button"
                onClick={() => setStep('SELECT_ROLE')}
                className="inline-flex items-center text-xs font-semibold text-muted-foreground hover:text-foreground gap-1"
              >
                <ArrowLeft className="h-3.5 w-3.5" /> Back to Role Selection
              </button>
              <span className="text-xs font-bold text-primary flex items-center gap-1.5 font-mono">
                <Building2 className="h-3.5 w-3.5" /> Issuer Portal Setup
              </span>
            </div>

            <form onSubmit={handleIssuerSubmitAndConnect} className="space-y-4">
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
                  Organization Bio / Curriculum Overview
                </label>
                <textarea
                  rows={2}
                  className="w-full rounded-lg border bg-background px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Describe your certification programs, university accreditation, or courses..."
                  value={issuerForm.description}
                  onChange={(e) => setIssuerForm({ ...issuerForm, description: e.target.value })}
                />
              </div>

              {errorMessage && <p className="text-xs text-destructive">{errorMessage}</p>}

              <div className="pt-2">
                <Button type="submit" className="w-full font-bold h-11 text-sm shadow-lg" disabled={isSubmitting}>
                  {isSubmitting ? 'Initializing Account...' : 'Continue to Connect Wallet & Create Issuer Account →'}
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 2B: STUDENT REGISTRATION FORM                                         */}
        {/* ========================================================================= */}
        {step === 'STUDENT_FORM' && (
          <div className="max-w-xl mx-auto space-y-5">
            <div className="flex items-center justify-between border-b pb-3">
              <button
                type="button"
                onClick={() => setStep('SELECT_ROLE')}
                className="inline-flex items-center text-xs font-semibold text-muted-foreground hover:text-foreground gap-1"
              >
                <ArrowLeft className="h-3.5 w-3.5" /> Back to Role Selection
              </button>
              <span className="text-xs font-bold text-emerald-600 flex items-center gap-1.5 font-mono">
                <GraduationCap className="h-3.5 w-3.5" /> Student Vault Setup
              </span>
            </div>

            <form onSubmit={handleStudentSubmitAndConnect} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase text-muted-foreground flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5 text-emerald-500" />
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
                  placeholder="e.g. Full-Stack Web3 Developer & Researcher"
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
                  {isSubmitting ? 'Initializing Account...' : 'Continue to Connect Wallet & Create Student Account →'}
                </Button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
