import * as Sentry from '@sentry/nextjs';

/**
 * Enhanced error context for Sentry Seer AI analysis
 * Provides rich context to help AI understand and suggest fixes
 */

export interface ErrorContext {
  feature?: string;
  action?: string;
  userId?: string;
  sessionId?: string;
  userAgent?: string;
  viewport?: { width: number; height: number };
  url?: string;
  previousUrl?: string;
  timestamp?: string;
}

/**
 * Capture error with enhanced context for Seer
 */
export function captureErrorWithContext(
  error: Error,
  context: ErrorContext,
  additionalData?: Record<string, any>
) {
  // Set user context if available
  if (context.userId) {
    Sentry.setUser({
      id: context.userId,
    });
  }

  // Set tags for filtering and AI analysis
  const tags: Record<string, string> = {
    feature: context.feature || 'unknown',
    action: context.action || 'unknown',
  };

  // Build context for AI analysis
  const errorContext: Record<string, any> = {
    environment: {
      userAgent: context.userAgent || (typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown'),
      viewport: context.viewport || (typeof window !== 'undefined' ? { width: window.innerWidth, height: window.innerHeight } : undefined),
    },
    navigation: {
      currentUrl: context.url || (typeof window !== 'undefined' ? window.location.href : 'unknown'),
      previousUrl: context.previousUrl,
    },
    timing: {
      timestamp: context.timestamp || new Date().toISOString(),
    },
    additional: additionalData || {},
  };

  // Add breadcrumb trail for better context
  Sentry.addBreadcrumb({
    category: 'error',
    message: `Error in ${context.feature}: ${error.message}`,
    level: 'error',
    data: {
      action: context.action,
      ...additionalData,
    },
  });

  // Capture with full context
  return Sentry.captureException(error, {
    tags,
    contexts: {
      app: errorContext,
    },
    level: 'error',
    // Fingerprint for intelligent grouping
    fingerprint: [
      context.feature || 'unknown',
      context.action || 'unknown',
      error.name,
    ],
  });
}

/**
 * Set user context for the session
 */
export function setUserContext(userId: string, email?: string, username?: string) {
  Sentry.setUser({
    id: userId,
    email,
    username,
  });
}

/**
 * Clear user context (e.g., on logout)
 */
export function clearUserContext() {
  Sentry.setUser(null);
}

/**
 * Add custom context that persists for the session
 */
export function setCustomContext(key: string, data: Record<string, any>) {
  Sentry.setContext(key, data);
}

/**
 * Track performance for Seer insights
 */
export function trackPerformance(
  operation: string,
  startTime: number,
  metadata?: Record<string, any>
) {
  const duration = Date.now() - startTime;

  Sentry.addBreadcrumb({
    category: 'performance',
    message: `${operation} completed`,
    level: 'info',
    data: {
      duration,
      ...metadata,
    },
  });

  // Create span for performance monitoring
  const span = Sentry.startInactiveSpan({
    name: operation,
    op: 'function',
  });

  if (span) {
    span.end();
  }

  return duration;
}
