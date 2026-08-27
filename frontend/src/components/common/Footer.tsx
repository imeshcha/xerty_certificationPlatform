import React from 'react';

export function Footer() {
  return (
    <footer className="border-t py-6 md:py-8 bg-muted/20">
      <div className="container mx-auto flex flex-col items-center justify-between gap-4 px-4 md:flex-row text-xs text-muted-foreground">
        <p>
          &copy; {new Date().getFullYear()} Xerty. Decentralized Certificate Issuance Platform.
        </p>
        <div className="flex items-center space-x-4">
          <span>Network: Arbitrum Sepolia (Chain ID: 421614)</span>
          <span>•</span>
          <span>IPFS: Pinata Cluster</span>
          <span>•</span>
          <span>MPC: Privy Embedded Wallets</span>
        </div>
      </div>
    </footer>
  );
}
