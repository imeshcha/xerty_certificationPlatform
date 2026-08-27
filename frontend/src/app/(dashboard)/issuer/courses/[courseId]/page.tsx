'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../../../components/ui/card';
import { Button } from '../../../../../components/ui/button';
import { fetchApi } from '../../../../../lib/api';
import {
  CertificateDesigner,
  CertificateTemplateData,
} from '../../../../../components/issuer/CertificateDesigner';
import { CourseIssuanceModal } from '../../../../../components/issuer/CourseIssuanceModal';
import { Trash2 } from 'lucide-react';

export default function CourseRoomPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.courseId as string;

  const [course, setCourse] = useState<any>(null);
  const [certificates, setCertificates] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'ISSUANCE' | 'TEMPLATE' | 'SETTINGS'>('ISSUANCE');
  const [isLoading, setIsLoading] = useState(true);
  const [isIssuanceModalOpen, setIsIssuanceModalOpen] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  // Template Customizer State
  const [templateJson, setTemplateJson] = useState<CertificateTemplateData | null>(null);
  const [isSavingTemplate, setIsSavingTemplate] = useState(false);

  // Settings State
  const [settingsForm, setSettingsForm] = useState({
    title: '',
    code: '',
    courseUrl: '',
    durationHours: 40,
    description: '',
    skills: '',
  });
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [settingsSaved, setSettingsSaved] = useState(false);

  const applyCourseData = (courseData: any) => {
    if (!courseData) return;
    setCourse(courseData);
    if (courseData.templateJson) {
      setTemplateJson(courseData.templateJson);
    }
    setSettingsForm({
      title: courseData.title || '',
      code: courseData.code || '',
      courseUrl: courseData.courseUrl || '',
      durationHours: courseData.durationHours || 40,
      description: courseData.description || '',
      skills: Array.isArray(courseData.skills) ? courseData.skills.join(', ') : '',
    });
  };

  const loadCourseData = () => {
    if (!courseId) return;
    setIsLoading(true);

    // 1. Instantly check local cache for immediate display
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('xerty_courses');
        if (stored) {
          const list = JSON.parse(stored);
          const found = list.find((c: any) => (c._id || c.id) === courseId || c.code === courseId);
          if (found) {
            applyCourseData(found);
            setIsLoading(false);
          }
        }
      } catch (e) {
        console.warn('Failed to parse local course cache', e);
      }
    }

    // 2. Fetch from backend
    fetchApi(`/courses/${courseId}`)
      .then((courseData: any) => {
        if (courseData) {
          applyCourseData(courseData);
        }
      })
      .catch((err) => {
        console.warn('Could not load course from backend directly:', err);
      })
      .finally(() => {
        setIsLoading(false);
      });

    // 3. Fetch certificates separately so failure doesn't block the course room
    fetchApi(`/certificates/course/${courseId}`)
      .then((certsData: any) => {
        if (Array.isArray(certsData)) {
          setCertificates(certsData);
        }
      })
      .catch((err) => {
        console.warn('Could not load certificates list:', err);
      });
  };

  // Load Course & Its Issued Certificates
  useEffect(() => {
    loadCourseData();
  }, [courseId]);

  const handleSaveTemplate = async (data: CertificateTemplateData) => {
    setIsSavingTemplate(true);
    try {
      await fetchApi(`/courses/${courseId}`, {
        method: 'PATCH',
        body: JSON.stringify({
          templateJson: data,
        }),
      });
    } catch (err) {
      console.warn('Backend template save sync notice:', err);
    }

    setTemplateJson(data);
    setCourse((prev: any) => {
      const updated = { ...prev, templateJson: data };
      if (typeof window !== 'undefined') {
        try {
          const stored = localStorage.getItem('xerty_courses');
          if (stored) {
            const list = JSON.parse(stored);
            const idx = list.findIndex((c: any) => (c._id || c.id) === courseId || c.code === course?.code);
            if (idx >= 0) {
              list[idx] = updated;
              localStorage.setItem('xerty_courses', JSON.stringify(list));
            }
          }
        } catch (e) {}
      }
      return updated;
    });
    setIsSavingTemplate(false);
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingSettings(true);
    setSettingsSaved(false);

    const skillsArray = settingsForm.skills
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    try {
      await fetchApi(`/courses/${courseId}`, {
        method: 'PATCH',
        body: JSON.stringify({
          title: settingsForm.title,
          courseUrl: settingsForm.courseUrl,
          durationHours: Number(settingsForm.durationHours) || 0,
          description: settingsForm.description,
          skills: skillsArray,
        }),
      });
    } catch (err) {
      console.warn('Backend settings update notice:', err);
    }

    setCourse((prev: any) => {
      const updated = {
        ...prev,
        ...settingsForm,
        skills: skillsArray,
      };
      if (typeof window !== 'undefined') {
        try {
          const stored = localStorage.getItem('xerty_courses');
          if (stored) {
            const list = JSON.parse(stored);
            const idx = list.findIndex((c: any) => (c._id || c.id) === courseId || c.code === prev?.code);
            if (idx >= 0) {
              list[idx] = updated;
              localStorage.setItem('xerty_courses', JSON.stringify(list));
            }
          }
        } catch (e) {}
      }
      return updated;
    });

    setSettingsSaved(true);
    setIsSavingSettings(false);
    setTimeout(() => setSettingsSaved(false), 3000);
  };

  const copyClaimLink = (certId: string, idx: number) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
    const link = `${origin}/verify/${certId}?claim=true`;
    navigator.clipboard.writeText(link);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2500);
  };

  const copyBatchClaimLink = () => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
    const link = `${origin}/claim/${courseId}`;
    navigator.clipboard.writeText(link);
    setCopiedIndex(8888);
    setTimeout(() => setCopiedIndex(null), 2500);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-24 text-center space-y-3 max-w-xl">
        <h2 className="text-lg font-bold">Loading Course Room...</h2>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="container mx-auto px-4 py-16 text-center space-y-4 max-w-md">
        <h2 className="text-xl font-bold">Course Room Not Found</h2>
        <p className="text-xs text-muted-foreground">The requested course room does not exist.</p>
        <Link href="/issuer/courses">
          <Button variant="outline" size="sm">
            Back to Courses
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6 max-w-7xl">
      {/* Back Nav */}
      <div className="flex items-center justify-between">
        <Link href="/issuer/courses">
          <Button variant="ghost" size="sm" className="text-xs font-semibold">
            ← Back to Courses
          </Button>
        </Link>

        {course.courseUrl && (
          <a
            href={course.courseUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center text-xs font-semibold text-primary hover:underline gap-1.5"
          >
            Access External Curriculum / Course Portal →
          </a>
        )}
      </div>

      {/* Course Room Header Banner */}
      <Card className="border-border bg-card shadow-sm">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="rounded bg-primary/10 px-2.5 py-0.5 text-xs font-mono font-bold text-primary">
                  {course.code}
                </span>
                <span className="text-xs text-muted-foreground font-medium">
                  {course.durationHours} Hours Curriculum
                </span>
              </div>
              <h1 className="text-2xl font-extrabold tracking-tight text-foreground">
                {course.title}
              </h1>
              <p className="text-xs text-muted-foreground max-w-2xl">
                {course.description || 'Certification program cohort workspace for designing diplomas and issuing Soulbound credentials.'}
              </p>
            </div>

            {/* Quick Metrics */}
            <div className="flex items-center gap-3 shrink-0">
              <div className="rounded-xl border bg-muted/30 p-3 text-center min-w-[90px]">
                <p className="text-2xl font-bold text-primary">{certificates.length}</p>
                <p className="text-[10px] text-muted-foreground uppercase font-semibold">Students</p>
              </div>
              <div className="rounded-xl border bg-muted/30 p-3 text-center min-w-[90px]">
                <p className="text-2xl font-bold text-emerald-600">
                  {certificates.filter((c) => c.status !== 'REVOKED').length}
                </p>
                <p className="text-[10px] text-muted-foreground uppercase font-semibold">Active Tokens</p>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 pt-6 border-t mt-6">
            <Button
              variant={activeTab === 'ISSUANCE' ? 'default' : 'ghost'}
              size="sm"
              className="text-xs font-semibold"
              onClick={() => setActiveTab('ISSUANCE')}
            >
              Issuance & Students ({certificates.length})
            </Button>
            <Button
              variant={activeTab === 'TEMPLATE' ? 'default' : 'ghost'}
              size="sm"
              className="text-xs font-semibold"
              onClick={() => setActiveTab('TEMPLATE')}
            >
              Visual Template Designer
            </Button>
            <Button
              variant={activeTab === 'SETTINGS' ? 'default' : 'ghost'}
              size="sm"
              className="text-xs font-semibold"
              onClick={() => setActiveTab('SETTINGS')}
            >
              Course Room Settings
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* TAB 1: ISSUANCE & STUDENTS ROSTER */}
      {activeTab === 'ISSUANCE' && (
        <div className="space-y-6">
          {/* Action Bar with Unified Master Batch Claim Link */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border bg-muted/20">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold">Issue Credentials for {course.code}</h3>
                <span className="text-[10px] bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded font-mono font-semibold">
                  Batch Claim Hub Ready
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Add students manually or upload CSV. Anchors to IPFS and Arbitrum Sepolia or Solana Devnet.
              </p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Button
                variant="outline"
                size="sm"
                className="text-xs font-semibold"
                onClick={copyBatchClaimLink}
              >
                {copiedIndex === 8888 ? '✓ Batch Claim Link Copied!' : 'Copy Batch Claim Link'}
              </Button>
              <Link href={`/claim/${courseId}`} target="_blank">
                <Button variant="secondary" size="sm" className="text-xs font-semibold">
                  Student Claim Portal ↗
                </Button>
              </Link>
              <Button
                size="sm"
                className="text-xs font-bold"
                onClick={() => setIsIssuanceModalOpen(true)}
              >
                + Issue Course Certificates
              </Button>
            </div>
          </div>

          {/* Students Roster Table */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center justify-between">
                <span>Certified Students Roster ({certificates.length})</span>
                <span className="text-xs font-normal text-muted-foreground">
                  Program: <span className="font-mono text-primary font-semibold">{course.code}</span>
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {certificates.length === 0 ? (
                <div className="p-12 text-center space-y-4 rounded-lg border border-dashed">
                  <div className="space-y-1">
                    <h4 className="text-sm font-semibold">No Certificates Issued Yet</h4>
                    <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                      Design your diploma layout and issue verifiable certificates for students completing {course.title}.
                    </p>
                  </div>
                  <div className="pt-2 flex flex-wrap justify-center gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs font-semibold"
                      onClick={() => setActiveTab('TEMPLATE')}
                    >
                      Design / Edit Certificate Template
                    </Button>
                    <Button
                      size="sm"
                      className="text-xs font-bold"
                      onClick={() => setIsIssuanceModalOpen(true)}
                    >
                      + Issue First Certificate
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="rounded-md border overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-muted/50 text-muted-foreground border-b uppercase font-mono text-[10px]">
                      <tr>
                        <th className="p-3">Certificate ID</th>
                        <th className="p-3">Student Name</th>
                        <th className="p-3">Network</th>
                        <th className="p-3">Grade</th>
                        <th className="p-3">Score</th>
                        <th className="p-3">Issue Date</th>
                        <th className="p-3">Claim Link</th>
                        <th className="p-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {certificates.map((cert, idx) => (
                        <tr key={cert._id || cert.certificateId || idx} className="hover:bg-muted/30">
                          <td className="p-3 font-mono font-semibold text-primary">{cert.certificateId}</td>
                          <td className="p-3">
                            <p className="font-semibold text-foreground">{cert.studentName}</p>
                            <p className="text-[10px] text-muted-foreground">{cert.studentEmail}</p>
                          </td>
                          <td className="p-3">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold ${
                                cert.network === 'SOLANA_DEVNET'
                                    ? 'bg-purple-500/10 text-purple-600 border border-purple-500/20'
                                  : 'bg-primary/10 text-primary border border-primary/20'
                              }`}
                            >
                              {cert.network === 'SOLANA_DEVNET' ? 'Solana' : 'Arbitrum'}
                            </span>
                          </td>
                          <td className="p-3">{cert.grade || 'Pass'}</td>
                          <td className="p-3 font-mono">{cert.score ? `${cert.score}%` : '-'}</td>
                          <td className="p-3 text-muted-foreground font-mono">
                            {cert.issueDate ? new Date(cert.issueDate).toLocaleDateString() : '-'}
                          </td>
                          <td className="p-3">
                            <button
                              type="button"
                              onClick={() => copyClaimLink(cert.certificateId, idx)}
                              className="text-[11px] font-semibold text-green-600 hover:underline font-mono"
                              title="Click to copy student claim link"
                            >
                              {copiedIndex === idx ? '✓ Copied' : 'Copy Claim Link'}
                            </button>
                          </td>
                          <td className="p-3 text-right">
                            <Link href={`/verify/${cert.certificateId}`} target="_blank">
                              <Button variant="ghost" size="sm" className="h-7 text-xs font-semibold">
                                Verify →
                              </Button>
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* TAB 2: VISUAL CERTIFICATE DESIGNER */}
      {activeTab === 'TEMPLATE' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/20">
            <div className="space-y-0.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-primary">
                Custom Course Diploma Canvas
              </h3>
              <p className="text-xs text-muted-foreground">
                Drag, drop, add custom logos, change fonts, and arrange elements. Changes are saved directly to this course room.
              </p>
            </div>
            <Button
              size="sm"
              className="text-xs font-bold"
              onClick={() => setIsIssuanceModalOpen(true)}
            >
              + Issue Using This Template
            </Button>
          </div>

          <CertificateDesigner
            initialData={templateJson}
            courseTitle={course.title}
            courseCode={course.code}
            onSave={handleSaveTemplate}
            isSaving={isSavingTemplate}
          />
        </div>
      )}

      {/* TAB 3: COURSE SETTINGS */}
      {activeTab === 'SETTINGS' && (
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-base">Course Room Metadata & External Link</CardTitle>
            <CardDescription className="text-xs">
              Update course naming, external curriculum URL, duration, or skill tags.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSaveSettings} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase text-muted-foreground">Course Title</label>
                <input
                  required
                  type="text"
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                  value={settingsForm.title}
                  onChange={(e) => setSettingsForm({ ...settingsForm, title: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase text-muted-foreground">Course Code</label>
                  <input
                    disabled
                    type="text"
                    className="w-full rounded-md border bg-muted/60 px-3 py-2 text-sm font-mono uppercase text-muted-foreground cursor-not-allowed"
                    value={settingsForm.code}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase text-muted-foreground">Duration (Hours)</label>
                  <input
                    required
                    type="number"
                    className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                    value={settingsForm.durationHours}
                    onChange={(e) => setSettingsForm({ ...settingsForm, durationHours: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase text-muted-foreground">
                  External Course Content Link / LMS Portal
                </label>
                <input
                  type="url"
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                  value={settingsForm.courseUrl}
                  onChange={(e) => setSettingsForm({ ...settingsForm, courseUrl: e.target.value })}
                  placeholder="https://academy.edu/courses/..."
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase text-muted-foreground">Description</label>
                <textarea
                  rows={3}
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                  value={settingsForm.description}
                  onChange={(e) => setSettingsForm({ ...settingsForm, description: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase text-muted-foreground">Skills (Comma-separated)</label>
                <input
                  type="text"
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                  value={settingsForm.skills}
                  onChange={(e) => setSettingsForm({ ...settingsForm, skills: e.target.value })}
                />
              </div>

              {settingsSaved && (
                <div className="rounded-md bg-green-500/10 border border-green-500/30 p-2.5 text-xs text-green-600 flex items-center gap-2">
                  <span>Course settings updated successfully!</span>
                </div>
              )}

              <div className="pt-2 flex justify-end">
                <Button type="submit" disabled={isSavingSettings} className="font-semibold">
                  {isSavingSettings ? 'Saving Settings...' : 'Save Settings'}
                </Button>
              </div>
            </form>

            {/* Danger Zone: Delete Course Room */}
            <div className="mt-8 pt-6 border-t border-destructive/20 space-y-3">
              <div className="flex items-center justify-between p-4 rounded-lg border border-destructive/30 bg-destructive/5">
                <div className="space-y-1">
                  <h4 className="text-xs font-bold uppercase text-destructive flex items-center gap-1.5">
                    <Trash2 className="h-3.5 w-3.5" /> Danger Zone: Delete Course Room
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    Permanently deletes this course room, certificate template design, and cohort workspace.
                  </p>
                </div>
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="text-xs font-bold shrink-0 ml-4"
                  onClick={async () => {
                    const confirmed = window.confirm(
                      `Are you sure you want to delete "${course.title}" (${course.code})? This action cannot be undone.`
                    );
                    if (!confirmed) return;

                    try {
                      await fetchApi(`/courses/${courseId}`, {
                        method: 'DELETE',
                      });
                    } catch (e) {
                      console.warn('Backend delete sync note:', e);
                    }

                    if (typeof window !== 'undefined') {
                      try {
                        const stored = localStorage.getItem('xerty_courses');
                        if (stored) {
                          const list = JSON.parse(stored);
                          const updated = list.filter((c: any) => (c._id || c.id) !== courseId && c.code !== course.code);
                          localStorage.setItem('xerty_courses', JSON.stringify(updated));
                        }
                      } catch (e) {
                        console.warn('Failed to remove from local cache', e);
                      }
                    }

                    router.push('/issuer/courses');
                  }}
                >
                  <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                  Delete Course Room
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Course Issuance Modal (Manual List + CSV) */}
      <CourseIssuanceModal
        course={course}
        isOpen={isIssuanceModalOpen}
        onClose={() => {
          setIsIssuanceModalOpen(false);
          loadCourseData();
        }}
        onSuccess={(newCerts) => {
          setCertificates((prev) => [...newCerts, ...prev]);
        }}
      />
    </div>
  );
}
