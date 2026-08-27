import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function truncateAddress(address?: string): string {
  if (!address) return '';
  if (address.length <= 10) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

// Deterministic Solana Base58 Address Derivation from EVM Address / User Seed
const BASE58_ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';

export function deriveSolanaAddress(seed: string): string {
  if (!seed) return '5eykt4UsFv8P8NJdTREpY1vzqKqZKvdpKuc147dw2N9d';
  const cleanSeed = seed.toLowerCase().trim();
  let hash = 0;
  for (let i = 0; i < cleanSeed.length; i++) {
    hash = (hash << 5) - hash + cleanSeed.charCodeAt(i);
    hash |= 0;
  }
  let str = '';
  const num = Math.abs(hash);
  for (let i = 0; i < 44; i++) {
    const charCode = (cleanSeed.charCodeAt(i % cleanSeed.length) + i * 7 + (num % 58)) % 58;
    str += BASE58_ALPHABET[charCode];
  }
  return str;
}
