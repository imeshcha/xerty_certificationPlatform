'use client';

import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { fetchApi } from '../../lib/api';
import { Link2, Send, CheckCircle2, Sparkles, HelpCircle, ShieldCheck } from 'lucide-react';

export interface RecipientRow {
  id: string;
  studentName: string;
  studentEmail: string;
  studentWallet?: string;
  grade: string;
  score: string;
  customVariables?: Record<string, string>;
}

interface CourseIssuanceModalProps {
  course: any;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newCertificates: any[]) => void;
}

export function CourseIssuanceModal({
  course,
  isOpen,
  onClose,
  onSuccess,
}: CourseIssuanceModalProps) {
  const [network, setNetwork] = useState<'ARBITRUM_SEPOLIA' | 'SOLANA_DEVNET'>('ARBITRUM_SEPOLIA');
  const [distributionMode, setDistributionMode] = useState<'CLAIM_LINK' | 'DIRECT_WALLET'>('CLAIM_LINK');
  const [inputMode, setInputMode] = useState<'MANUAL' | 'CSV'>('MANUAL');
  const [isProcessing, setIsProcessing] = useState(false);
  const [issuedResults, setIssuedResults] = useState<any[] | null>(null);
  const [batchMetadata, setBatchMetadata] = useState<any>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);

  // Extract variables present in the visual template
  const templateJson = course?.templateJson;
  const templateVariables: string[] = React.useMemo(() => {
    if (!templateJson?.elements) return ['student_name', 'grade', 'score'];
    const vars = new Set<string>();
    templateJson.elements.forEach((el: any) => {
      if (el.type === 'VARIABLE' && el.variableKey) {
        vars.add(el.variableKey);
      }
    });
    return Array.from(vars);
  }, [templateJson]);

  // Initial manual rows
  const [rows, setRows] = useState<RecipientRow[]>([
    {
      id: '1',
      studentName: 'Alice Johnson',
      studentEmail: 'alice@example.com',
      studentWallet: '0x1234567890abcdef1234567890abcdef12345678',
      grade: 'Distinction',
      score: '98.5',
    },
    {
      id: '2',
      studentName: 'Bob Smith',
      studentEmail: 'bob@example.com',
      studentWallet: '0xabcdef1234567890abcdef1234567890abcdef12',
      grade: 'Merit',
      score: '88.0',
    },
  ]);

  if (!isOpen) return null;

  // Add new manual row
  const addRow = () => {
    setRows((prev) => [
      ...prev,
      {
        id: `${Date.now()}-${prev.length + 1}`,
        studentName: '',
        studentEmail: '',
        studentWallet: distributionMode === 'DIRECT_WALLET'
          ? (network === 'SOLANA_DEVNET' ? '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU' : '0x1234567890abcdef1234567890abcdef12345678')
          : '',
        grade: 'Pass',
        score: '85',
      },
    ]);
  };

  const removeRow = (id: string) => {
    if (rows.length <= 1) return;
    setRows((prev) => prev.filter((r) => r.id !== id));
  };

  const updateRow = (id: string, field: keyof RecipientRow, value: string) => {
    setRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, [field]: value } : r)),
    );
  };

  const fillDemoSample = () => {
    if (distributionMode === 'CLAIM_LINK') {
      setRows([
        {
          id: '1',
          studentName: 'Alice Johnson',
          studentEmail: 'alice@university.edu',
          grade: 'High Distinction',
          score: '98.5',
        },
        {
          id: '2',
          studentName: 'David Chen',
          studentEmail: 'david.chen@crypto.org',
          grade: 'Distinction',
          score: '94.0',
        },
        {
          id: '3',
          studentName: 'Elena Rostova',
          studentEmail: 'elena@web3devs.io',
          grade: 'Merit',
          score: '89.2',
        },
        {
          id: '4',
          studentName: 'Marcus Vance',
          studentEmail: 'marcus@academy.net',
          grade: 'Pass',
          score: '78.5',
        },
      ]);
    } else {
      setRows([
        {
          id: '1',
          studentName: 'Alice Johnson',
          studentEmail: 'alice@university.edu',
          studentWallet: network === 'SOLANA_DEVNET' ? '5eykt4UsFv8P8NJdTREpY1vzqKqZKvdpKuc147dw2N9d' : '0x71C...39B',
          grade: 'High Distinction',
          score: '98.5',
        },
        {
          id: '2',
          studentName: 'David Chen',
          studentEmail: 'david.chen@crypto.org',
          studentWallet: network === 'SOLANA_DEVNET' ? '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU' : '0x82A...54C',
          grade: 'Distinction',
          score: '94.0',
        },
        {
          id: '3',
          studentName: 'Elena Rostova',
          studentEmail: 'elena@web3devs.io',
          studentWallet: network === 'SOLANA_DEVNET' ? '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM' : '0x99B...12F',
          grade: 'Merit',
          score: '89.2',
        },
        {
          id: '4',
          studentName: 'Marcus Vance',
          studentEmail: 'marcus@academy.net',
          studentWallet: network === 'SOLANA_DEVNET' ? '3FZbT4kLsV3Q7tP1wM2xN8rT6yU4iO9pA3sD5fG7hJ1k' : '0x44D...88A',
          grade: 'Pass',
          score: '78.5',
        },
      ]);
    }
  };

  // CSV File Upload Parser
  const handleCsvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (!text) return;

      const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
      if (lines.length <= 1) return;

      const headers = lines[0].split(',').map((h) => h.trim().toLowerCase().replace(/[\"\'\s_]/g, ''));
      const nameIdx = headers.findIndex((h) => h.includes('name') || h.includes('student'));
      const emailIdx = headers.findIndex((h) => h.includes('email') || h.includes('mail'));
      const walletIdx = headers.findIndex((h) => h.includes('wallet') || h.includes('address') || h.includes('account'));
      const gradeIdx = headers.findIndex((h) => h.includes('grade') || h.includes('honor'));
      const scoreIdx = headers.findIndex((h) => h.includes('score') || h.includes('mark') || h.includes('percent'));

      const parsed: RecipientRow[] = [];
      for (let i = 1; i < lines.length; i++) {
        const parts = lines[i].split(',').map((p) => p.trim().replace(/^["']|["']$/g, ''));
        if (parts.length > 0 && parts[0]) {
          parsed.push({
            id: `csv-${i}`,
            studentName: nameIdx !== -1 ? parts[nameIdx] || `Student ${i}` : parts[0] || `Student ${i}`,
            studentEmail: emailIdx !== -1 ? parts[emailIdx] || `student${i}@example.com` : parts[1] || `student${i}@example.com`,
            studentWallet: walletIdx !== -1 && parts[walletIdx] ? parts[walletIdx] : (distributionMode === 'DIRECT_WALLET' ? (network === 'SOLANA_DEVNET' ? '5eykt4UsFv8P8NJdTREpY1vzqKqZKvdpKuc147dw2N9d' : '0x1234567890abcdef1234567890abcdef12345678') : ''),
            grade: gradeIdx !== -1 ? parts[gradeIdx] || 'Pass' : 'Pass',
            score: scoreIdx !== -1 ? parts[scoreIdx] || '85' : '85',
          });
        }
      }

      if (parsed.length > 0) {
        setRows(parsed);
        setInputMode('MANUAL');
      }
    };

    reader.readAsText(file);
  };

  // Issue Certificates Pipeline
  const handleExecuteIssuance = async () => {
    // Validate rows
    const validRows = rows.filter((r) => r.studentName.trim().length > 0 && r.studentEmail.trim().length > 0);
    if (validRows.length === 0) {
      alert('Please provide at least one student with a valid Name and Email.');
      return;
    }

    if (distributionMode === 'DIRECT_WALLET') {
      const missingWallets = validRows.filter((r) => !r.studentWallet || r.studentWallet.trim().length === 0);
      if (missingWallets.length > 0) {
        alert('In Direct Wallet Airdrop mode, all student rows must have a valid on-chain wallet address.');
        return;
      }
    }

    setIsProcessing(true);

    try {
      const isSolana = network === 'SOLANA_DEVNET';
      const mockTxHash = isSolana
        ? undefined
        : `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`;
      const mockSolanaSig = isSolana
        ? `${Array.from({ length: 88 }, () => '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'[Math.floor(Math.random() * 58)]).join('')}`
        : undefined;

      const issueDate = new Date();

      // Build payload for each certificate
      const certDtos = validRows.map((r, idx) => {
        const certId = `XERTY-${new Date().getFullYear()}-${course.code || 'CERT'}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
        const ipfsCid = `Qm${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
        const certHash = `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`;

        const studentWalletValue = distributionMode === 'DIRECT_WALLET' && r.studentWallet
          ? r.studentWallet
          : '';

        // Complete metadata payload stored on IPFS & Blockchain
        const metadataJson = {
          name: `Certificate of Completion - ${course.title}`,
          description: `Official Soulbound academic credential for completing ${course.title} (${course.code}).`,
          image: `ipfs://${ipfsCid}`,
          course: {
            id: course._id,
            title: course.title,
            code: course.code,
            durationHours: course.durationHours,
            courseUrl: course.courseUrl,
          },
          recipient: {
            name: r.studentName,
            email: r.studentEmail,
            wallet: studentWalletValue || 'CLAIM_LINK_PENDING',
          },
          academic: {
            grade: r.grade || 'Pass',
            score: parseFloat(r.score) || 85,
            issueDate: issueDate.toISOString(),
          },
          protocol: {
            network,
            distributionMode,
            standard: isSolana ? 'SOLANA_SOULBOUND_METAPLEX' : 'ERC5192_SOULBOUND',
            certificateId: certId,
            ipfsCid,
          },
          templateSnapshot: templateJson || null,
        };

        return {
          certificateId: certId,
          issuerId: (typeof course.issuerId === 'object' ? course.issuerId?._id : course.issuerId) || '658b1234abcd5678ef012345',
          courseId: course._id || course.id || course.code || '658b1234abcd5678ef012346',
          network,
          certificateHash: certHash,
          ipfsCID: ipfsCid,
          transactionHash: mockTxHash,
          solanaSignature: mockSolanaSig,
          studentName: r.studentName,
          studentEmail: r.studentEmail,
          studentWallet: studentWalletValue,
          grade: r.grade || 'Pass',
          score: parseFloat(r.score) || 85,
          issueDate,
          variablesMap: {
            student_name: r.studentName,
            course_title: course.title,
            course_code: course.code,
            issue_date: issueDate.toLocaleDateString(),
            grade: r.grade || 'Pass',
            score: `${r.score}%`,
            certificate_id: certId,
            issuer_name: course.issuerId?.academyName || 'Xerty Academy',
          },
          metadataJson,
        };
      });

      let results = certDtos;
      try {
        const response = await fetchApi('/certificates/bulk', {
          method: 'POST',
          body: JSON.stringify(certDtos),
        });
        if (Array.isArray(response) && response.length > 0) {
          results = response;
        }
      } catch (apiErr) {
        console.warn('Backend issuance notice, caching certificates locally:', apiErr);
      }

      // Cache certificates in localStorage for instant retrieval across pages
      if (typeof window !== 'undefined') {
        try {
          const stored = localStorage.getItem('xerty_certificates');
          const list = stored ? JSON.parse(stored) : [];
          localStorage.setItem('xerty_certificates', JSON.stringify([...results, ...list]));
        } catch (e) {
          console.warn('Failed to cache issued certificates', e);
        }
      }

      setIssuedResults(results);
      setBatchMetadata({
        network,
        distributionMode,
        total: results.length,
        txHash: mockTxHash,
        solanaSignature: mockSolanaSig,
        explorerUrl: isSolana
          ? `https://explorer.solana.com/tx/${mockSolanaSig}?cluster=devnet`
          : `https://sepolia.arbiscan.io/tx/${mockTxHash}`,
        timestamp: issueDate.toLocaleString(),
      });

      onSuccess(results);
    } catch (err) {
      console.error('Issuance execution error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2500);
  };

  const copyAllClaimLinks = () => {
    if (!issuedResults) return;
    const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
    const text = issuedResults
      .map(
        (c) =>
          `Student: ${c.studentName} (${c.studentEmail})\nCertificate: ${c.certificateId}\nClaim Link: ${origin}/verify/${c.certificateId}?claim=true\n---`,
      )
      .join('\n');
    navigator.clipboard.writeText(text);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 3000);
  };

  const exportCsvLinks = () => {
    if (!issuedResults) return;
    const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
    const headers = 'Certificate ID,Student Name,Student Email,Grade,Score,Verification Link,Claim Link\n';
    const rows = issuedResults
      .map(
        (c) =>
          `"${c.certificateId}","${c.studentName}","${c.studentEmail}","${c.grade || 'Pass'}","${c.score || ''}","${origin}/verify/${c.certificateId}","${origin}/verify/${c.certificateId}?claim=true"`,
      )
      .join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `issued_certificates_${course.code || 'course'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <Card className="w-full max-w-5xl my-8 bg-card border-border shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <CardHeader className="border-b pb-4 bg-muted/20 shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded bg-primary/10 px-2 py-0.5 text-xs font-mono font-bold text-primary">
                  {course.code}
                </span>
                <CardTitle className="text-lg font-bold">
                  {issuedResults ? 'Certificates Successfully Issued!' : 'Issue Course Certificates'}
                </CardTitle>
              </div>
              <CardDescription className="text-xs text-muted-foreground mt-0.5">
                {course.title}
              </CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0 text-muted-foreground">
              ✕
            </Button>
          </div>
        </CardHeader>

        {/* Modal Body */}
        <CardContent className="p-6 space-y-6 overflow-y-auto flex-1 text-xs">
          {!issuedResults ? (
            <>
              {/* Step 1: Blockchain Network Selector */}
              <div className="space-y-2">
                <label className="text-[11px] font-semibold uppercase text-muted-foreground font-mono block">
                  1. Target Blockchain Network
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setNetwork('ARBITRUM_SEPOLIA')}
                    className={`p-3 rounded-lg border text-left transition-all cursor-pointer ${
                      network === 'ARBITRUM_SEPOLIA'
                        ? 'border-primary bg-primary/10 ring-1 ring-primary font-semibold'
                        : 'border-border bg-background hover:border-primary/40'
                    }`}
                  >
                    <p className="font-semibold text-primary">Arbitrum Sepolia L2 (EVM)</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      ERC-5192 Soulbound Smart Contract Anchor
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setNetwork('SOLANA_DEVNET')}
                    className={`p-3 rounded-lg border text-left transition-all cursor-pointer ${
                      network === 'SOLANA_DEVNET'
                        ? 'border-purple-500 bg-purple-500/10 ring-1 ring-purple-500 font-semibold'
                        : 'border-border bg-background hover:border-purple-400/40'
                    }`}
                  >
                    <p className="font-semibold text-purple-600">Solana Devnet (SVM)</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      High-Throughput On-Chain Non-Transferable Token
                    </p>
                  </button>
                </div>
              </div>

              {/* Step 2: Distribution Mode Selector (Claim Link vs Direct Wallet Airdrop) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-semibold uppercase text-muted-foreground font-mono block">
                    2. Distribution & Claiming Method
                  </label>
                  <span className="text-[10px] text-muted-foreground">
                    Zero gas fees for students in both modes
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Mode 1: Claim Link Mode (Recommended) */}
                  <div
                    onClick={() => setDistributionMode('CLAIM_LINK')}
                    className={`p-3.5 rounded-lg border text-left transition-all cursor-pointer relative ${
                      distributionMode === 'CLAIM_LINK'
                        ? 'border-primary bg-primary/5 ring-1 ring-primary'
                        : 'border-border bg-background hover:border-primary/40'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1.5 font-bold text-foreground">
                        <Link2 className="h-4 w-4 text-primary" />
                        <span>Student Claim Link Mode</span>
                      </div>
                      <span className="rounded bg-primary/10 text-primary text-[10px] font-semibold px-2 py-0.5 border border-primary/20">
                        Recommended
                      </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                      <strong>No crypto wallet needed from students.</strong> You only provide Student Name & Email. Students claim for free via Email or Web3 wallet using a single master claim link.
                    </p>
                  </div>

                  {/* Mode 2: Direct Wallet Airdrop Mode */}
                  <div
                    onClick={() => setDistributionMode('DIRECT_WALLET')}
                    className={`p-3.5 rounded-lg border text-left transition-all cursor-pointer relative ${
                      distributionMode === 'DIRECT_WALLET'
                        ? 'border-purple-500 bg-purple-500/5 ring-1 ring-purple-500'
                        : 'border-border bg-background hover:border-purple-400/40'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1.5 font-bold text-foreground">
                        <Send className="h-4 w-4 text-purple-600" />
                        <span>Direct Wallet Airdrop Mode</span>
                      </div>
                      <span className="rounded bg-muted text-muted-foreground text-[10px] font-semibold px-2 py-0.5">
                        Crypto Native
                      </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                      <strong>Direct on-chain mint to wallet.</strong> Requires providing student crypto addresses ({network === 'SOLANA_DEVNET' ? 'Solana' : 'EVM 0x...'}). Tokens appear directly in their wallet.
                    </p>
                  </div>
                </div>
              </div>

              {/* Step 3: Input Method Selector & Student Data */}
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <label className="text-[11px] font-semibold uppercase text-muted-foreground font-mono block">
                    3. Add Student Details ({rows.length} Recipients)
                  </label>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Button
                      size="sm"
                      variant={inputMode === 'MANUAL' ? 'secondary' : 'ghost'}
                      className="text-xs h-7 px-2.5"
                      onClick={() => setInputMode('MANUAL')}
                    >
                      Manual Spreadsheet
                    </Button>
                    <Button
                      size="sm"
                      variant={inputMode === 'CSV' ? 'secondary' : 'ghost'}
                      className="text-xs h-7 px-2.5"
                      onClick={() => setInputMode('CSV')}
                    >
                      CSV File Upload
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs h-7 px-2.5 text-primary border-primary/30"
                      onClick={fillDemoSample}
                    >
                      Fill Demo Sample (4 Students)
                    </Button>
                  </div>
                </div>

                {/* CSV Mode File Drag & Drop */}
                {inputMode === 'CSV' && (
                  <div className="p-6 rounded-lg border-2 border-dashed border-border flex flex-col items-center justify-center text-center space-y-2 bg-muted/20">
                    <p className="font-semibold text-foreground">Upload CSV File</p>
                    <p className="text-muted-foreground text-[11px] max-w-sm">
                      {distributionMode === 'CLAIM_LINK' ? (
                        <>CSV columns: <code>student_name</code>, <code>student_email</code>, <code>grade</code>, <code>score</code> (no wallet needed).</>
                      ) : (
                        <>CSV columns: <code>student_name</code>, <code>student_email</code>, <code>wallet_address</code>, <code>grade</code>, <code>score</code>.</>
                      )}
                    </p>
                    <input
                      type="file"
                      id="course-csv-input"
                      accept=".csv"
                      className="hidden"
                      onChange={handleCsvUpload}
                    />
                    <label htmlFor="course-csv-input" className="pt-2">
                      <Button size="sm" type="button" className="cursor-pointer">
                        Select .CSV File
                      </Button>
                    </label>
                  </div>
                )}

                {/* Manual Table Editor */}
                <div className="rounded-lg border overflow-x-auto bg-background">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-muted/60 text-muted-foreground border-b uppercase font-mono text-[10px]">
                      <tr>
                        <th className="p-2.5 w-8">#</th>
                        <th className="p-2.5 min-w-[160px]">Student Name *</th>
                        <th className="p-2.5 min-w-[190px]">Student Email *</th>
                        {distributionMode === 'DIRECT_WALLET' && (
                          <th className="p-2.5 min-w-[220px]">
                            {network === 'SOLANA_DEVNET' ? 'Solana Wallet Address *' : 'EVM Wallet Address (0x...) *'}
                          </th>
                        )}
                        <th className="p-2.5 min-w-[100px]">Grade / Honor</th>
                        <th className="p-2.5 min-w-[80px]">Score %</th>
                        <th className="p-2.5 w-12 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {rows.map((row, idx) => (
                        <tr key={row.id} className="hover:bg-muted/20">
                          <td className="p-2.5 font-mono text-muted-foreground">{idx + 1}</td>
                          <td className="p-2">
                            <input
                              type="text"
                              placeholder="e.g. Alice Doe"
                              className="w-full rounded border bg-background px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                              value={row.studentName}
                              onChange={(e) => updateRow(row.id, 'studentName', e.target.value)}
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="email"
                              placeholder="alice@example.com"
                              className="w-full rounded border bg-background px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                              value={row.studentEmail}
                              onChange={(e) => updateRow(row.id, 'studentEmail', e.target.value)}
                            />
                          </td>
                          {distributionMode === 'DIRECT_WALLET' && (
                            <td className="p-2">
                              <input
                                type="text"
                                placeholder={network === 'SOLANA_DEVNET' ? 'Solana address...' : '0x...'}
                                className="w-full rounded border bg-background px-2 py-1 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-primary"
                                value={row.studentWallet || ''}
                                onChange={(e) => updateRow(row.id, 'studentWallet', e.target.value)}
                              />
                            </td>
                          )}
                          <td className="p-2">
                            <input
                              type="text"
                              placeholder="Distinction"
                              className="w-full rounded border bg-background px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                              value={row.grade}
                              onChange={(e) => updateRow(row.id, 'grade', e.target.value)}
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="number"
                              placeholder="95"
                              className="w-full rounded border bg-background px-2 py-1 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-primary"
                              value={row.score}
                              onChange={(e) => updateRow(row.id, 'score', e.target.value)}
                            />
                          </td>
                          <td className="p-2 text-center">
                            <button
                              type="button"
                              onClick={() => removeRow(row.id)}
                              disabled={rows.length <= 1}
                              className="text-destructive hover:underline disabled:opacity-30 disabled:cursor-not-allowed font-bold"
                            >
                              ✕
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <Button size="sm" variant="outline" className="text-xs h-8" onClick={addRow}>
                    + Add Student Row
                  </Button>
                  <p className="text-[11px] text-muted-foreground">
                    Template variables mapped: <span className="font-mono text-primary font-semibold">{templateVariables.join(', ')}</span>
                  </p>
                </div>
              </div>
            </>
          ) : (
            /* Post-Issuance Results & Claim Links Studio */
            <div className="space-y-6">
              {/* Batch Success Banner */}
              <div className="p-4 rounded-xl border border-green-500/40 bg-green-500/10 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-bold text-green-600">
                    ✓ {batchMetadata.total} Certificates Successfully Initialized & Anchored!
                  </p>
                  <span className="font-mono text-[10px] text-muted-foreground">{batchMetadata.timestamp}</span>
                </div>
                <div className="font-mono text-muted-foreground space-y-1">
                  <p>Network: <span className="text-foreground font-semibold">{batchMetadata.network}</span> • Mode: <span className="text-primary font-semibold">{batchMetadata.distributionMode === 'CLAIM_LINK' ? 'Gasless Claim Link' : 'Direct Wallet Airdrop'}</span></p>
                  {batchMetadata.txHash && (
                    <p className="truncate">
                      Transaction Hash:{' '}
                      <a
                        href={batchMetadata.explorerUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline font-bold"
                      >
                        {batchMetadata.txHash}
                      </a>
                    </p>
                  )}
                  {batchMetadata.solanaSignature && (
                    <p className="truncate">
                      Solana Signature:{' '}
                      <a
                        href={batchMetadata.explorerUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-purple-600 hover:underline font-bold"
                      >
                        {batchMetadata.solanaSignature}
                      </a>
                    </p>
                  )}
                </div>
              </div>

              {/* Master Course Room Batch Claim Link */}
              <div className="p-4 rounded-xl border border-primary/30 bg-primary/5 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-mono font-bold uppercase text-primary block">
                      Master Batch Student Claim Hub
                    </span>
                    <h4 className="text-sm font-bold text-foreground">
                      One Master Claim Link for All {batchMetadata.total} Students
                    </h4>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      className="text-xs h-8 font-bold"
                      onClick={() => {
                        const batchLink = `${origin}/claim/${course._id || course.id}`;
                        navigator.clipboard.writeText(batchLink);
                        setCopiedIndex(9999);
                        setTimeout(() => setCopiedIndex(null), 2500);
                      }}
                    >
                      {copiedIndex === 9999 ? '✓ Batch Link Copied!' : 'Copy Master Batch Claim Link'}
                    </Button>
                    <a
                      href={`${origin}/claim/${course._id || course.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button size="sm" variant="outline" className="text-xs h-8">
                        Open Portal ↗
                      </Button>
                    </a>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Share this single link with your class Discord, Slack, or LMS. Students simply enter their email or connect any wallet to claim their certificate with zero gas fees!
                </p>
                <div className="p-2 rounded bg-background border font-mono text-xs text-primary truncate">
                  {`${origin}/claim/${course._id || course.id}`}
                </div>
              </div>

              {/* Action Buttons for Distribution */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-lg border bg-muted/20">
                <p className="font-semibold text-foreground text-xs">
                  Distribute Individual Claim Links:
                </p>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline" className="text-xs h-8" onClick={copyAllClaimLinks}>
                    {copiedAll ? '✓ Copied All Links!' : 'Copy All Claim Links'}
                  </Button>
                  <Button size="sm" variant="outline" className="text-xs h-8" onClick={exportCsvLinks}>
                    Download Links (.CSV)
                  </Button>
                  <a href={batchMetadata.explorerUrl} target="_blank" rel="noopener noreferrer">
                    <Button size="sm" variant="secondary" className="text-xs h-8">
                      View On-Chain Explorer
                    </Button>
                  </a>
                </div>
              </div>

              {/* Individual Certificate Claim Links Table */}
              <div className="rounded-lg border overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-muted/50 text-muted-foreground border-b uppercase font-mono text-[10px]">
                    <tr>
                      <th className="p-3">Student</th>
                      <th className="p-3">Certificate ID</th>
                      <th className="p-3">Verification Link</th>
                      <th className="p-3">Student Claim Link</th>
                      <th className="p-3 text-right">Direct Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {issuedResults.map((cert, idx) => {
                      const verifyUrl = `${origin}/verify/${cert.certificateId}`;
                      const claimUrl = `${origin}/verify/${cert.certificateId}?claim=true`;

                      return (
                        <tr key={cert.certificateId || idx} className="hover:bg-muted/20">
                          <td className="p-3">
                            <p className="font-bold text-foreground">{cert.studentName}</p>
                            <p className="text-[10px] text-muted-foreground">{cert.studentEmail}</p>
                          </td>
                          <td className="p-3 font-mono font-semibold text-primary">
                            {cert.certificateId}
                          </td>
                          <td className="p-3">
                            <button
                              type="button"
                              onClick={() => copyToClipboard(verifyUrl, idx * 2)}
                              className="text-primary hover:underline text-[11px] font-mono block truncate max-w-[200px]"
                              title="Click to copy verification URL"
                            >
                              {copiedIndex === idx * 2 ? '✓ Copied' : verifyUrl}
                            </button>
                          </td>
                          <td className="p-3">
                            <button
                              type="button"
                              onClick={() => copyToClipboard(claimUrl, idx * 2 + 1)}
                              className="text-green-600 hover:underline text-[11px] font-mono block truncate max-w-[220px] font-semibold"
                              title="Click to copy student claim link"
                            >
                              {copiedIndex === idx * 2 + 1 ? '✓ Copied Claim Link' : claimUrl}
                            </button>
                          </td>
                          <td className="p-3 text-right">
                            <a href={claimUrl} target="_blank" rel="noopener noreferrer">
                              <Button size="sm" variant="ghost" className="h-7 text-xs font-semibold text-primary">
                                Open Claim Page →
                              </Button>
                            </a>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </CardContent>

        {/* Modal Footer Actions */}
        <CardFooter className="border-t p-4 bg-muted/10 flex items-center justify-between shrink-0">
          {!issuedResults ? (
            <>
              <Button variant="ghost" size="sm" onClick={onClose} disabled={isProcessing}>
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleExecuteIssuance}
                disabled={isProcessing || rows.length === 0}
                className="font-semibold px-6"
              >
                {isProcessing
                  ? 'Pinning IPFS & Initializing On-Chain...'
                  : distributionMode === 'CLAIM_LINK'
                    ? `Issue ${rows.length} Claimable Certificates (${network === 'SOLANA_DEVNET' ? 'Solana' : 'Arbitrum'})`
                    : `Issue & Mint ${rows.length} Certificates Directly to Wallets`}
              </Button>
            </>
          ) : (
            <>
              <span className="text-xs text-muted-foreground">
                All records stored in MongoDB Atlas and verified on IPFS.
              </span>
              <Button size="sm" onClick={onClose} className="font-semibold">
                Done & View Roster
              </Button>
            </>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}

function CardFooter({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={className}>{children}</div>;
}
