'use client';

import { useState } from 'react';
import { validateUrl } from '@/lib/urlValidator';
import { generateMockAnalysis, delay } from '@/lib/mockData';
import { AnalysisResult } from '@/lib/types';
import * as Sentry from '@sentry/nextjs';

// Request counter to simulate failures every third request
let requestCounter = 0;

export function useAnalysis() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyzeUrl = async (url: string): Promise<AnalysisResult> => {
    const startTime = Date.now();
    setIsLoading(true);
    setError(null);

    // Log analysis start
    Sentry.logger.info('URL analysis started', {
      extra: {
        url,
        requestCount: requestCounter + 1,
      },
    });

    // Increment analysis request counter metric
    Sentry.metrics.increment('analysis.request', 1, {
      tags: { status: 'started' },
    });

    try {
      // Validate URL
      const validation = validateUrl(url);
      if (!validation.isValid) {
        // Log validation failure
        Sentry.logger.warn('URL validation failed', {
          extra: {
            url,
            error: validation.error,
          },
        });

        // Track validation failure metric
        Sentry.metrics.increment('analysis.validation_failed', 1, {
          tags: { reason: 'invalid_url' },
        });

        throw new Error(validation.error);
      }

      // Simulate API delay (300-800ms for realistic feel)
      const delayMs = Math.random() * 500 + 300;
      await delay(delayMs);

      // Track API delay metric
      Sentry.metrics.distribution('analysis.api_delay_ms', delayMs, {
        unit: 'millisecond',
        tags: { type: 'mock_delay' },
      });

      // Increment counter and fail every third request
      requestCounter++;
      if (requestCounter % 3 === 0) {
        // Log simulated failure
        Sentry.logger.error('Simulated analysis service failure', {
          extra: {
            url,
            requestCount: requestCounter,
            reason: 'every_third_request',
          },
        });

        // Explicitly capture exception with full context
        const error = new Error('Analysis service temporarily unavailable. Please try again.');
        Sentry.captureException(error, {
          tags: {
            feature: 'url-analysis',
            error_type: 'simulated_failure',
          },
          contexts: {
            analysis: {
              url,
              requestCount: requestCounter,
              pattern: 'every_third_request',
            },
          },
          level: 'error',
        });

        // Track simulated failure metric
        Sentry.metrics.increment('analysis.simulated_failure', 1, {
          tags: { pattern: 'third_request' },
        });

        throw error;
      }

      // Generate consistent mock data
      const result = generateMockAnalysis(validation.normalized!);

      const duration = Date.now() - startTime;

      // Log successful analysis
      Sentry.logger.info('URL analysis completed successfully', {
        extra: {
          url: result.url,
          companyName: result.firmographics.companyName,
          duration,
          metrics: {
            yoyGrowth: result.metrics.yoyGrowth,
            nrr: result.metrics.nrr,
            dau: result.metrics.dau,
          },
        },
      });

      // Track success metrics
      Sentry.metrics.increment('analysis.success', 1, {
        tags: { status: 'completed' },
      });

      Sentry.metrics.distribution('analysis.duration_ms', duration, {
        unit: 'millisecond',
        tags: { status: 'success' },
      });

      // Track business metrics
      Sentry.metrics.gauge('analysis.yoy_growth', result.metrics.yoyGrowth, {
        tags: { company: result.firmographics.companyName },
      });

      Sentry.metrics.gauge('analysis.nrr', result.metrics.nrr, {
        tags: { company: result.firmographics.companyName },
      });

      Sentry.metrics.gauge('analysis.dau', result.metrics.dau, {
        tags: { company: result.firmographics.companyName },
      });

      setIsLoading(false);
      return result;
    } catch (err) {
      const duration = Date.now() - startTime;
      const errorMessage = err instanceof Error ? err.message : 'An error occurred while analyzing the URL';
      setError(errorMessage);
      setIsLoading(false);

      // Log error with full context
      Sentry.logger.error('URL analysis failed', {
        extra: {
          url,
          error: errorMessage,
          duration,
          requestCount: requestCounter,
        },
      });

      // Explicitly capture exception with comprehensive context
      Sentry.captureException(err, {
        tags: {
          feature: 'url-analysis',
          url: url,
          error_type: err instanceof Error ? err.name : 'unknown',
        },
        contexts: {
          analysis: {
            url,
            requestCount: requestCounter,
            duration,
            phase: 'analysis',
          },
        },
        level: 'error',
        fingerprint: ['analysis-error', url],
      });

      // Track failure metrics
      Sentry.metrics.increment('analysis.failed', 1, {
        tags: {
          error_type: err instanceof Error ? err.name : 'unknown',
        },
      });

      Sentry.metrics.distribution('analysis.failure_duration_ms', duration, {
        unit: 'millisecond',
        tags: { status: 'failed' },
      });

      throw err;
    }
  };

  const clearError = () => {
    setError(null);
  };

  return {
    analyzeUrl,
    isLoading,
    error,
    clearError
  };
}
