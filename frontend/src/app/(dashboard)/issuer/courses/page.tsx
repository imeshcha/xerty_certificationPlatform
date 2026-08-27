'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../../components/ui/card';
import { Button } from '../../../../components/ui/button';
import { fetchApi } from '../../../../lib/api';
import {
  BookOpen,
  PlusCircle,
  ArrowLeft,
  Clock,
  Tag,
  ExternalLink,
  Globe,
  FolderOpen,
  Send,
  Sparkles,
  Layers,
  ArrowRight,
} from 'lucide-react';

interface CourseRecord {
  _id?: string;
  id?: string;
  title: string;
  code: string;
  courseUrl?: string;
  durationHours: number;
  skills: string[];
  certificateTemplate?: string;
  isActive?: boolean;
}

export default function CoursesPage() {
  const [courses, setCourses] = useState<CourseRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load courses from backend
  useEffect(() => {
    setIsLoading(true);
    fetchApi('/courses')
      .then((res: any) => {
        if (Array.isArray(res)) {
          setCourses(res);
        }
      })
      .catch((err) => {
        console.warn('Could not fetch courses:', err);
      })
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="container mx-auto px-4 py-8 space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Link href="/issuer">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Course Rooms & Issuance Cohorts</h1>
            <p className="text-sm text-muted-foreground">
              Manage your course rooms, certificate templates, external curriculum links, and student issuances.
            </p>
          </div>
        </div>
        <Link href="/issuer/courses/new">
          <Button size="sm">
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Course Room
          </Button>
        </Link>
      </div>

      {courses.length === 0 ? (
        <div className="rounded-xl border border-dashed p-12 text-center space-y-3">
          <FolderOpen className="h-10 w-10 text-muted-foreground mx-auto opacity-50" />
          <h3 className="text-sm font-semibold">No Course Rooms Found</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            Create your first course room (e.g. Course A, Course B) to set up custom certificate templates and issue credentials.
          </p>
          <div className="pt-2">
            <Link href="/issuer/courses/new">
              <Button size="sm">
                <PlusCircle className="mr-1.5 h-3.5 w-3.5" />
                Create First Course Room
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {courses.map((course) => {
            const courseId = course._id || course.id;
            return (
              <Card
                key={courseId || course.code}
                className="border-border/60 hover:border-primary/50 transition-all flex flex-col justify-between"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <span className="rounded bg-primary/10 px-2.5 py-0.5 text-xs font-mono font-bold text-primary">
                      {course.code}
                    </span>
                    <span className="flex items-center text-xs text-muted-foreground font-medium">
                      <Clock className="h-3.5 w-3.5 mr-1" />
                      {course.durationHours} Hours
                    </span>
                  </div>
                  <Link href={`/issuer/courses/${courseId}`}>
                    <CardTitle className="text-base mt-2 hover:text-primary transition-colors cursor-pointer">
                      {course.title}
                    </CardTitle>
                  </Link>
                </CardHeader>
                <CardContent className="space-y-4 flex-grow">
                  <div className="flex flex-wrap gap-1.5">
                    {course.skills?.map((skill) => (
                      <span
                        key={skill}
                        className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-[11px] text-muted-foreground"
                      >
                        <Tag className="h-2.5 w-2.5 mr-1 opacity-70" />
                        {skill}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t text-xs">
                    {course.courseUrl ? (
                      <a
                        href={course.courseUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-muted-foreground hover:text-primary transition-colors text-[11px]"
                      >
                        <Globe className="h-3.5 w-3.5 mr-1" />
                        Curriculum Material
                        <ExternalLink className="h-3 w-3 ml-1" />
                      </a>
                    ) : (
                      <span className="text-[11px] text-muted-foreground">No external link set</span>
                    )}

                    <span className="text-[11px] font-mono text-muted-foreground">
                      Template: {course.certificateTemplate || 'Gold Classic'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <Link href={`/issuer/courses/${courseId}`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full text-xs">
                        Open Course Room
                        <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
                      </Button>
                    </Link>
                    <Link href={`/issuer/issue/single?courseId=${courseId}`}>
                      <Button size="sm" className="text-xs">
                        <Send className="h-3.5 w-3.5 mr-1" />
                        Issue
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
