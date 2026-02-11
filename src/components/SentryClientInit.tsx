'use client';

// Import Sentry client config at module level to ensure it initializes
// This must be imported in a client component that's always rendered
import '../../sentry.client.config';

/**
 * This component ensures Sentry client-side initialization happens
 * The import above triggers Sentry.init() when this module loads
 */
export function SentryClientInit() {
  return null;
}
