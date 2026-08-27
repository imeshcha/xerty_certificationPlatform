'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '../../../../components/ui/button';
import { CertificateDesigner, CertificateTemplateData } from '../../../../components/issuer/CertificateDesigner';
import { ArrowLeft, Sparkles, LayoutTemplate } from 'lucide-react';

export default function TemplatesPage() {
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (data: CertificateTemplateData) => {
    setIsSaving(true);
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('xerty_global_template', JSON.stringify(data));
      }
      await new Promise((resolve) => setTimeout(resolve, 600));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-6 max-w-7xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Link href="/issuer">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Issuer Studio
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Visual Certificate Design Studio</h1>
            <p className="text-sm text-muted-foreground">
              Drag-and-drop certificate designer with dynamic variables, logo imports, custom typography, and multi-chain anchoring.
            </p>
          </div>
        </div>
      </div>

      {/* Embedded Visual Canvas Designer */}
      <CertificateDesigner onSave={handleSave} isSaving={isSaving} />
    </div>
  );
}
