'use client';

import React from 'react';
import { PrivyProvider } from '@privy-io/react-auth';
import { arbitrumSepolia } from 'viem/chains';

const PRIVY_APP_ID =
  process.env.NEXT_PUBLIC_PRIVY_APP_ID &&
  process.env.NEXT_PUBLIC_PRIVY_APP_ID !== 'your-privy-app-id' &&
  !process.env.NEXT_PUBLIC_PRIVY_APP_ID.includes('placeholder')
    ? process.env.NEXT_PUBLIC_PRIVY_APP_ID
    : 'cl0000000000000000000000000';

export function PrivyAuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <PrivyProvider
      appId={PRIVY_APP_ID}
      config={{
        appearance: {
          theme: 'dark',
          accentColor: '#3b82f6',
          logo: 'https://xerty.app/logo.png',
        },
        loginMethods: ['google', 'apple', 'telegram', 'linkedin', 'wallet'],
        embeddedWallets: {
          createOnLogin: 'all-users',
        },
        defaultChain: arbitrumSepolia,
        supportedChains: [arbitrumSepolia],
      }}
    >
      {children}
    </PrivyProvider>
  );
}
