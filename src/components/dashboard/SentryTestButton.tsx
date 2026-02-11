'use client';

import { Button } from '@/components/ui/button';
import * as Sentry from '@sentry/nextjs';

export function SentryTestButton() {
  const testSentry = () => {
    try {
      // Trigger a test error
      throw new Error('This is a test error for Sentry!');
    } catch (error) {
      // Capture the error with Sentry
      Sentry.captureException(error);

      // Also log to console for verification
      console.error('Test error sent to Sentry:', error);

      alert('Test error sent to Sentry! Check your Sentry dashboard.');
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={testSentry}
      className="ml-2"
    >
      Test Sentry
    </Button>
  );
}
