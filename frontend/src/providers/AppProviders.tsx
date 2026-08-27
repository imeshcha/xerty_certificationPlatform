'use client';

import React from 'react';
import { PrivyAuthProvider } from './PrivyAuthProvider';
import { Web3Provider } from './Web3Provider';

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <PrivyAuthProvider>
      <Web3Provider>
        {children}
      </Web3Provider>
    </PrivyAuthProvider>
  );
}
