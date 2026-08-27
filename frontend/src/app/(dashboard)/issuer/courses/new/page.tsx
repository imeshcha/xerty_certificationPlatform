'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../../../hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../../../components/ui/card';
import { Button } from '../../../../../components/ui/button';
import { fetchApi } from '../../../../../lib/api';

export default function NewCoursePage() {
  const router = useRouter();
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    title: '',
    code: '',
    courseUrl: '',
    description: '',
    durationHours: 40,
    skills: 'Solidity, Arbitrum, Smart Contracts',
    templateTitle: 'Certificate of Completion',
    signatureTitle: 'Program Director',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const skillsArray = formData.skills
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      const payload = {
        issuerId: user?.id || '658b1234abcd5678ef012345',
        title: formData.title,
        code: formData.code.toUpperCase(),
        courseUrl: formData.courseUrl,
        description: formData.description,
        durationHours: Number(formData.durationHours) || 0,
        skills: skillsArray,
        certificateTemplate: 'GOLD_CLASSIC',
        templateTitle: formData.templateTitle,
        signatureTitle: formData.signatureTitle,
      };

      const res: any = await fetchApi('/courses', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      const courseId = res?._id || res?.id;
      if (courseId) {
        router.push(`/issuer/courses/${courseId}`);
      } else {
        router.push('/issuer/courses');
      }
    } catch (err: any) {
      console.error('Failed to create course:', err);
      setErrorMessage(err.message || 'Failed to save course room.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl space-y-6">
      <div className="flex items-center space-x-3">
        <Link href="/issuer/courses">
          <Button variant="ghost" size="sm" className="text-xs font-semibold">
            ← Back to Courses
          </Button>
        </Link>
        <div>
          <h1 className="text-xl font-bold tracking-tight">Create New Course Room</h1>
          <p className="text-xs text-muted-foreground">
            Set up a dedicated certification room for course cohorts and certificate issuance.
          </p>
        </div>
      </div>

      <Card className="border-border shadow-sm bg-card">
        <CardHeader>
          <CardTitle className="text-base">Course Details & Certification Setup</CardTitle>
          <CardDescription className="text-xs">
            Define course metadata and external curriculum link. You can visually design the certificate inside the course room.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase text-muted-foreground">Course Name / Title</label>
              <input
                required
                type="text"
                className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="e.g. Advanced Arbitrum Engineering"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase text-muted-foreground">Course Code / ID</label>
                <input
                  required
                  type="text"
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm uppercase font-mono focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="e.g. ARB-401"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase text-muted-foreground">Duration (Hours)</label>
                <input
                  required
                  type="number"
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                  value={formData.durationHours}
                  onChange={(e) => setFormData({ ...formData, durationHours: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase text-muted-foreground">
                External Curriculum / Course Content URL
              </label>
              <input
                type="url"
                className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="https://academy.edu/courses/arb-401 (e.g. LMS or website)"
                value={formData.courseUrl}
                onChange={(e) => setFormData({ ...formData, courseUrl: e.target.value })}
              />
              <p className="text-[11px] text-muted-foreground">
                Xerty serves as your certificate issuance & verification hub; learners access your external course portal.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase text-muted-foreground">Description</label>
              <textarea
                rows={3}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="Course overview, curriculum topics, and learning objectives..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase text-muted-foreground">Skills (Comma-separated)</label>
              <input
                type="text"
                className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="Solidity, Arbitrum, ERC-5192, Cryptography"
                value={formData.skills}
                onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
              />
            </div>

            {errorMessage && (
              <p className="text-xs text-destructive font-semibold">{errorMessage}</p>
            )}

            <div className="pt-4 flex justify-end gap-3 border-t">
              <Link href="/issuer/courses">
                <Button variant="ghost" type="button" className="text-xs font-semibold">
                  Cancel
                </Button>
              </Link>
              <Button type="submit" disabled={isSubmitting} className="text-xs font-bold px-5">
                {isSubmitting ? 'Creating Course Room...' : 'Create Course Room'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
