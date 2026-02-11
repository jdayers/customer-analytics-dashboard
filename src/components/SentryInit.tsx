'use client';

import { useEffect } from 'react';

export function SentryInit() {
  useEffect(() => {
    // Sentry is automatically initialized via sentry.client.config.ts
    // This component ensures it runs on the client
    import('@/../../sentry.client.config');
  }, []);

  return null;
}
