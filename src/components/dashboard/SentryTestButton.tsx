'use client';

import { Button } from '@/components/ui/button';
import * as Sentry from '@sentry/nextjs';

export function SentryTestButton() {
  const testSentry = () => {
    // Check if Sentry is initialized
    const client = Sentry.getClient();
    const dsn = client?.getDsn();

    console.log('=== Sentry Debug Info ===');
    console.log('Client exists:', !!client);
    console.log('DSN configured:', !!dsn);
    console.log('DSN value:', dsn?.toString());
    console.log('========================');

    if (!client || !dsn) {
      alert('⚠️ Sentry is NOT initialized! Check console for details.');
      console.error('Sentry client or DSN not found. Check your configuration.');
      return;
    }

    try {
      // Trigger a test error
      throw new Error('This is a test error for Sentry!');
    } catch (error) {
      // Capture the error with Sentry
      const eventId = Sentry.captureException(error);

      // Also log to console for verification
      console.log('✅ Test error sent to Sentry');
      console.log('Event ID:', eventId);
      console.error('Error details:', error);

      alert(`✅ Test error sent to Sentry!\nEvent ID: ${eventId}\n\nCheck your Sentry dashboard at:\nhttps://sentry.io`);
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
