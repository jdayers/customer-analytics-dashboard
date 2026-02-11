'use client';

import { useState } from 'react';
import { validateUrl } from '@/lib/urlValidator';
import { generateMockAnalysis, delay } from '@/lib/mockData';
import { AnalysisResult } from '@/lib/types';
import * as Sentry from '@sentry/nextjs';
import { sentryMetrics, sentryLogger } from '@/lib/sentryMetrics';

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
    sentryLogger.info('URL analysis started', {
      extra: {
        url,
        requestCount: requestCounter + 1,
      },
    });

    // Increment analysis request counter metric
    sentryMetrics.increment('analysis.request', 1, {
      tags: { status: 'started' },
    });

    try {
      // Validate URL
      const validation = validateUrl(url);
      if (!validation.isValid) {
        // Log validation failure
        sentryLogger.warn('URL validation failed', {
          extra: {
            url,
            error: validation.error,
          },
        });

        // Track validation failure metric
        sentryMetrics.increment('analysis.validation_failed', 1, {
          tags: { reason: 'invalid_url' },
        });

        throw new Error(validation.error);
      }

      // Simulate API delay with 80% chance of being wicked slow
      const isSlowRequest = Math.random() < 0.8; // 80% chance
      let delayMs: number;

      if (isSlowRequest) {
        // Wicked slow: 5-10 seconds
        delayMs = Math.random() * 5000 + 5000;

        console.warn(
          `🐌 SLOW REQUEST TRIGGERED! This request will take ${(delayMs / 1000).toFixed(1)}s (80% chance)`
        );

        sentryLogger.warn('Slow request detected', {
          extra: {
            url,
            delayMs,
            slowRequestPattern: '80_percent_random',
          },
        });

        // Track slow request metric
        sentryMetrics.increment('analysis.slow_request', 1, {
          tags: { pattern: 'random_80_percent' },
        });
      } else {
        // Normal speed: 300-800ms
        delayMs = Math.random() * 500 + 300;
        console.log(`⚡ Normal request speed: ${delayMs.toFixed(0)}ms`);
      }

      await delay(delayMs);

      // Track API delay metric
      sentryMetrics.distribution('analysis.api_delay_ms', delayMs, {
        unit: 'millisecond',
        tags: {
          type: isSlowRequest ? 'slow_request' : 'normal_request',
          is_slow: isSlowRequest ? 'yes' : 'no',
        },
      });

      // Increment counter and fail every third request
      requestCounter++;
      if (requestCounter % 3 === 0) {
        // Log simulated failure
        sentryLogger.error('Simulated analysis service failure', {
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
        sentryMetrics.increment('analysis.simulated_failure', 1, {
          tags: { pattern: 'third_request' },
        });

        throw error;
      }

      // Generate consistent mock data
      const result = generateMockAnalysis(validation.normalized!);

      const duration = Date.now() - startTime;

      // Log successful analysis
      sentryLogger.info('URL analysis completed successfully', {
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
      sentryMetrics.increment('analysis.success', 1, {
        tags: { status: 'completed' },
      });

      sentryMetrics.distribution('analysis.duration_ms', duration, {
        unit: 'millisecond',
        tags: { status: 'success' },
      });

      // Track business metrics
      sentryMetrics.gauge('analysis.yoy_growth', result.metrics.yoyGrowth, {
        tags: { company: result.firmographics.companyName },
      });

      sentryMetrics.gauge('analysis.nrr', result.metrics.nrr, {
        tags: { company: result.firmographics.companyName },
      });

      sentryMetrics.gauge('analysis.dau', result.metrics.dau, {
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
      sentryLogger.error('URL analysis failed', {
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
      sentryMetrics.increment('analysis.failed', 1, {
        tags: {
          error_type: err instanceof Error ? err.name : 'unknown',
        },
      });

      sentryMetrics.distribution('analysis.failure_duration_ms', duration, {
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
