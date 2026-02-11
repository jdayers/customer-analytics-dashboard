// This file configures the initialization of Sentry on the client.
// The config you add here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Adjust this value in production, or use tracesSampler for greater control
  tracesSampleRate: 1.0,

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: true, // Enable debug mode to see Sentry logs

  // Replay settings (may not be available in all SDK versions)
  replaysOnErrorSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,

  // Enable custom metrics
  enableMetrics: true,

  // Initialize with default integrations
  // Replay integration may not be available in this SDK version
  integrations: function(integrations) {
    // Filter out problematic integrations if needed
    return integrations.filter(integration => integration.name !== 'Replay');
  },
});
