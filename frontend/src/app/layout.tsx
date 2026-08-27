import type { Metadata } from 'next';
import './globals.css';
import { AppProviders } from '../providers/AppProviders';
import { Navbar } from '../components/common/Navbar';
import { Footer } from '../components/common/Footer';

export const metadata: Metadata = {
  title: 'Xerty — Decentralized Certificate Issuance Platform',
  description:
    'Issue, manage, and verify tamper-proof academic credentials on Arbitrum Sepolia and Solana with zero friction onboarding.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col font-sans antialiased bg-background text-foreground">
        <AppProviders>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </AppProviders>
      </body>
    </html>
  );
}
