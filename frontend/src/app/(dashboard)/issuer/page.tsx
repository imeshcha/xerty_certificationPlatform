'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { fetchApi } from '../../../lib/api';
import { Award, BookOpen, Layers, PlusCircle, Upload, CheckCircle2, History, ArrowRight, ShieldAlert } from 'lucide-react';

export default function IssuerDashboardPage() {
  const router = useRouter();
  const { userRole, isReady, isAuthenticated } = useAuth();
  const [issuedCount, setIssuedCount] = useState<number>(0);
  const [coursesCount, setCoursesCount] = useState<number>(0);

  useEffect(() => {
    if (isReady && isAuthenticated && userRole === 'STUDENT') {
      router.push('/student');
    }
  }, [isReady, isAuthenticated, userRole, router]);

  useEffect(() => {
    fetchApi('/certificates')
      .then((res: any) => {
        if (Array.isArray(res)) {
          setIssuedCount(res.length);
        }
      })
      .catch(() => {});

    fetchApi('/courses')
      .then((res: any) => {
        if (Array.isArray(res)) {
          setCoursesCount(res.length);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Issuer Studio</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Manage academic programs, design templates, and issue verifiable Soulbound credentials.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/issuer/issue/single">
            <Button variant="outline" size="sm">
              <PlusCircle className="mr-2 h-4 w-4" />
              Single Issue
            </Button>
          </Link>
          <Link href="/issuer/issue/bulk">
            <Button size="sm">
              <Upload className="mr-2 h-4 w-4" />
              Bulk Issue (CSV/Excel)
            </Button>
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Issued Credentials</CardTitle>
            <Award className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{issuedCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Live from MongoDB</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{coursesCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Configured programs</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Certificate Templates</CardTitle>
            <Layers className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground mt-1">Standard SVG/IPFS templates</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Blockchain Status</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">Live</div>
            <p className="text-xs text-muted-foreground mt-1">Arbitrum Sepolia L2</p>
          </CardContent>
        </Card>
      </div>

      {/* Action Hub */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="hover:border-primary/50 transition-colors">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Course & Program Management</CardTitle>
              <BookOpen className="h-5 w-5 text-primary" />
            </div>
            <CardDescription>
              Create certification programs, define skill tags, and configure course codes.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Define your curriculum standards before issuing credentials to students.
            </p>
            <div className="flex items-center gap-3">
              <Link href="/issuer/courses">
                <Button variant="secondary" size="sm">
                  View Courses
                  <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                </Button>
              </Link>
              <Link href="/issuer/courses/new">
                <Button variant="outline" size="sm">
                  + Add Course
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:border-primary/50 transition-colors">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Templates & Custom Designs</CardTitle>
              <Layers className="h-5 w-5 text-primary" />
            </div>
            <CardDescription>
              Choose standard certificate styles or upload custom high-resolution branding.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Designs are automatically rendered at 300 DPI and pinned permanently to IPFS.
            </p>
            <Link href="/issuer/templates">
              <Button variant="secondary" size="sm">
                Manage Templates
                <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Quick Access to History */}
      <div className="flex items-center justify-between p-6 rounded-xl border bg-card/60">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-lg bg-primary/10 text-primary">
            <History className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-semibold">Issued Certificate History & Verification Logs</h3>
            <p className="text-sm text-muted-foreground">
              Search past issuance cohorts, check Arbiscan transactions, or perform on-chain revocations.
            </p>
          </div>
        </div>
        <Link href="/issuer/certificates">
          <Button variant="outline">
            View All Records
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
