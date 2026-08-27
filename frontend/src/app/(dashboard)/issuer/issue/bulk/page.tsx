'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../../../components/ui/card';
import { Button } from '../../../../../components/ui/button';
import {
  ArrowLeft,
  Upload,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Send,
  ArrowRight,
  Layers,
  ExternalLink,
} from 'lucide-react';

interface ParsedRow {
  rowIndex: number;
  studentName: string;
  studentEmail: string;
  studentWallet: string;
  grade?: string;
  score?: number;
  isValid: boolean;
  validationError?: string | null;
}

export default function BulkIssuePage() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [file, setFile] = useState<File | null>(null);
  const [network, setNetwork] = useState<'ARBITRUM_SEPOLIA' | 'SOLANA_DEVNET'>('ARBITRUM_SEPOLIA');
  const [batchName, setBatchName] = useState('Fall 2026 Graduating Cohort');
  const [parsedRows, setParsedRows] = useState<ParsedRow[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedResult, setProcessedResult] = useState<any>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);

      // Simulate client-side / server parser preview
      const sampleMockRows: ParsedRow[] = [
        {
          rowIndex: 1,
          studentName: 'Alice Doe',
          studentEmail: 'alice@example.com',
          studentWallet: network === 'SOLANA_DEVNET' ? '5eykt4UsFv8P8NJdTREpY1vzqKqZKvdpKuc147dw2N9d' : '0x1234567890abcdef1234567890abcdef12345678',
          grade: 'Distinction',
          score: 98.5,
          isValid: true,
        },
        {
          rowIndex: 2,
          studentName: 'Bob Smith',
          studentEmail: 'bob@example.com',
          studentWallet: network === 'SOLANA_DEVNET' ? '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU' : '0xabcdef1234567890abcdef1234567890abcdef12',
          grade: 'Merit',
          score: 87.0,
          isValid: true,
        },
        {
          rowIndex: 3,
          studentName: 'Charlie Brown',
          studentEmail: 'charlie@example.com',
          studentWallet: network === 'SOLANA_DEVNET' ? '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM' : '0x9876543210fedcba9876543210fedcba98765432',
          grade: 'Pass',
          score: 75.0,
          isValid: true,
        },
      ];

      setParsedRows(sampleMockRows);
      setStep(2);
    }
  };

  const executeBatch = () => {
    setIsProcessing(true);
    setStep(3);

    const isSolana = network === 'SOLANA_DEVNET';
    const txHash = isSolana
      ? undefined
      : '0x7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069';
    const solanaSig = isSolana
      ? '5UfDfvS8o8hRkZ8FvN92bY4kLsV3Q7tP1wM2xN8rT6yU4iO9pA3sD5fG7hJ1kL'
      : undefined;

    setTimeout(() => {
      setIsProcessing(false);
      setProcessedResult({
        total: parsedRows.length,
        successful: parsedRows.length,
        failed: 0,
        network,
        txHash,
        solanaSignature: solanaSig,
        explorerUrl: isSolana
          ? `https://explorer.solana.com/tx/${solanaSig}?cluster=devnet`
          : `https://sepolia.arbiscan.io/tx/${txHash}`,
        merkleRoot: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
        timestamp: new Date().toISOString(),
      });
    }, 2000);
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Link href="/issuer">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Bulk Certificate Issuance</h1>
            <p className="text-sm text-muted-foreground">
              Ingest student rosters via CSV or Excel and anchor whole cohorts across Arbitrum or Solana.
            </p>
          </div>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
          <span className={`px-2.5 py-1 rounded-full ${step === 1 ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
            1. Upload
          </span>
          <span>→</span>
          <span className={`px-2.5 py-1 rounded-full ${step === 2 ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
            2. Validate
          </span>
          <span>→</span>
          <span className={`px-2.5 py-1 rounded-full ${step === 3 ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
            3. Execute
          </span>
        </div>
      </div>

      {/* Step 1: Upload File & Select Network */}
      {step === 1 && (
        <div className="space-y-6">
          {/* Target Network Picker */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Layers className="h-4 w-4 text-primary" />
                Select Target Blockchain
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setNetwork('ARBITRUM_SEPOLIA')}
                  className={`p-3.5 rounded-lg border text-left transition-all cursor-pointer ${
                    network === 'ARBITRUM_SEPOLIA'
                      ? 'border-primary bg-primary/10 text-foreground ring-1 ring-primary'
                      : 'border-border bg-muted/40 text-muted-foreground hover:border-primary/40'
                  }`}
                >
                  <p className="font-semibold text-xs text-primary">Arbitrum Sepolia L2</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">ERC-5192 Merkle Batch Pipeline</p>
                </button>

                <button
                  type="button"
                  onClick={() => setNetwork('SOLANA_DEVNET')}
                  className={`p-3.5 rounded-lg border text-left transition-all cursor-pointer ${
                    network === 'SOLANA_DEVNET'
                      ? 'border-purple-500 bg-purple-500/10 text-foreground ring-1 ring-purple-500'
                      : 'border-border bg-muted/40 text-muted-foreground hover:border-purple-400/40'
                  }`}
                >
                  <p className="font-semibold text-xs text-purple-400">Solana Devnet SVM</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">High-Throughput Soulbound Batch</p>
                </button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-dashed border-2">
            <CardContent className="p-12 flex flex-col items-center justify-center text-center space-y-4">
              <div className="p-4 rounded-full bg-primary/10 text-primary">
                <FileSpreadsheet className="h-10 w-10" />
              </div>
              <div>
                <h3 className="text-base font-semibold">Upload CSV or Excel Spreadsheet</h3>
                <p className="text-xs text-muted-foreground mt-1 max-w-md">
                  Supported formats: <code>.csv</code>, <code>.xlsx</code>, <code>.xls</code>. File must contain columns for <strong>name</strong>, <strong>email</strong>, and optional <strong>wallet</strong>, <strong>grade</strong>, <strong>score</strong>.
                </p>
              </div>

              <input
                type="file"
                id="bulk-upload"
                className="hidden"
                accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                onChange={handleFileUpload}
              />

              <label htmlFor="bulk-upload">
                <Button size="lg" className="cursor-pointer" type="button">
                  <Upload className="mr-2 h-4 w-4" />
                  Select Spreadsheet File
                </Button>
              </label>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Step 2: Validate Data Table */}
      {step === 2 && (
        <div className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Batch Configuration & Data Preview</CardTitle>
                <CardDescription>
                  Review parsed rows from <span className="font-mono text-foreground">{file?.name || 'spreadsheet.csv'}</span> on <span className="font-bold text-primary">{network}</span>
                </CardDescription>
              </div>
              <div className="space-y-1.5 w-72">
                <label className="text-[10px] uppercase font-semibold text-muted-foreground">Batch / Cohort Name</label>
                <input
                  type="text"
                  className="w-full rounded border bg-background px-2.5 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                  value={batchName}
                  onChange={(e) => setBatchName(e.target.value)}
                />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-md border overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-muted/50 text-muted-foreground border-b uppercase font-mono text-[10px]">
                    <tr>
                      <th className="p-2.5">Row</th>
                      <th className="p-2.5">Student Name</th>
                      <th className="p-2.5">Email</th>
                      <th className="p-2.5">Wallet Address</th>
                      <th className="p-2.5">Grade</th>
                      <th className="p-2.5">Score</th>
                      <th className="p-2.5 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {parsedRows.map((row) => (
                      <tr key={row.rowIndex} className="hover:bg-muted/30">
                        <td className="p-2.5 font-mono text-muted-foreground">{row.rowIndex}</td>
                        <td className="p-2.5 font-medium">{row.studentName}</td>
                        <td className="p-2.5 text-muted-foreground">{row.studentEmail}</td>
                        <td className="p-2.5 font-mono text-[11px] text-muted-foreground truncate max-w-[150px]">
                          {row.studentWallet}
                        </td>
                        <td className="p-2.5">{row.grade || '-'}</td>
                        <td className="p-2.5 font-mono">{row.score ? `${row.score}%` : '-'}</td>
                        <td className="p-2.5 text-right">
                          {row.isValid ? (
                            <span className="inline-flex items-center text-green-500 font-medium">
                              <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                              Valid
                            </span>
                          ) : (
                            <span className="inline-flex items-center text-destructive font-medium">
                              <AlertCircle className="h-3.5 w-3.5 mr-1" />
                              {row.validationError}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex items-center justify-between pt-4 border-t">
                <Button variant="outline" size="sm" onClick={() => setStep(1)}>
                  Upload Different File
                </Button>
                <Button size="sm" onClick={executeBatch}>
                  <Send className="mr-2 h-4 w-4" />
                  Process & Mint Batch ({parsedRows.length} Certificates on {network === 'SOLANA_DEVNET' ? 'Solana' : 'Arbitrum'})
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Step 3: Execution Progress & Results */}
      {step === 3 && (
        <Card>
          <CardHeader>
            <CardTitle>Batch Processing Pipeline</CardTitle>
            <CardDescription>Anchoring cohort credentials to IPFS and {network === 'SOLANA_DEVNET' ? 'Solana Devnet' : 'Arbitrum Sepolia'}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {isProcessing ? (
              <div className="py-12 flex flex-col items-center justify-center space-y-4 text-center">
                <RefreshCw className="h-10 w-10 text-primary animate-spin" />
                <div className="space-y-1">
                  <p className="font-semibold text-sm">Executing Batch Pipeline on {network}...</p>
                  <p className="text-xs text-muted-foreground">
                    1. Generating certificate payloads → 2. Pinning to IPFS → 3. Minting on {network === 'SOLANA_DEVNET' ? 'Solana SVM' : 'Arbitrum Layer 2'}
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="p-4 rounded-xl border border-green-500/40 bg-green-500/10 space-y-3">
                  <div className="flex items-center gap-2 text-green-400 font-semibold">
                    <CheckCircle2 className="h-5 w-5" />
                    Batch Successfully Anchored to {network === 'SOLANA_DEVNET' ? 'Solana Devnet' : 'Arbitrum Sepolia'}!
                  </div>
                  <div className="text-xs font-mono space-y-1 text-muted-foreground">
                    <p>Total Processed: <span className="text-foreground">{processedResult.total}</span></p>
                    <p>Successful: <span className="text-green-400">{processedResult.successful}</span></p>
                    <p>Network: <span className="text-foreground font-semibold">{processedResult.network}</span></p>
                    {processedResult.txHash && <p className="truncate">Transaction Hash: <span className="text-foreground">{processedResult.txHash}</span></p>}
                    {processedResult.solanaSignature && <p className="truncate">Solana Signature: <span className="text-foreground">{processedResult.solanaSignature}</span></p>}
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3">
                  {processedResult.explorerUrl && (
                    <a
                      href={processedResult.explorerUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button variant="outline" size="sm">
                        {network === 'SOLANA_DEVNET' ? 'View on Solana Explorer' : 'View on Arbiscan'}
                        <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
                      </Button>
                    </a>
                  )}
                  <Link href="/issuer/certificates">
                    <Button>
                      View Issued Certificates
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
