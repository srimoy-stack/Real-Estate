'use client';

import { createContext, useContext, type ReactNode } from 'react';
import type { WebsiteConfig } from '@repo/types';

/**
 * Holds the resolved WebsiteConfig for the current tenant.
 * Populated on the server in root layout, consumed anywhere with useWebsite().
 */
const WebsiteContext = createContext<WebsiteConfig | null>(null);

/* ─── Provider ───────────────────────────────────── */
interface WebsiteProviderProps {
  website: WebsiteConfig;
  children: ReactNode;
}

export function WebsiteProvider({ website, children }: WebsiteProviderProps) {
  return (
    <WebsiteContext.Provider value={website}>
      {children}
    </WebsiteContext.Provider>
  );
}

/* ─── Hook ───────────────────────────────────────── */
/**
 * Access the current tenant website config.
 * Must be used inside a <WebsiteProvider>.
 */
export function useWebsite(): WebsiteConfig {
  const ctx = useContext(WebsiteContext);
  if (!ctx) {
    throw new Error(
      'useWebsite() must be used within a <WebsiteProvider>. ' +
      'Ensure the root layout wraps children with <WebsiteProvider>.'
    );
  }
  return ctx;
}
