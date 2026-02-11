import * as Sentry from '@sentry/nextjs';

/**
 * Safe wrapper for Sentry metrics API
 * Falls back gracefully if metrics API is not available
 */

export const sentryMetrics = {
  increment: (name: string, value: number = 1, options?: { tags?: Record<string, string> }) => {
    try {
      if (typeof Sentry.metrics?.increment === 'function') {
        Sentry.metrics.increment(name, value, options);
      } else {
        // Fallback: log as breadcrumb
        Sentry.addBreadcrumb({
          category: 'metric.increment',
          message: name,
          level: 'info',
          data: { value, ...options?.tags },
        });
      }
    } catch (error) {
      console.warn('Sentry metrics not available:', error);
    }
  },

  distribution: (
    name: string,
    value: number,
    options?: { unit?: string; tags?: Record<string, string> }
  ) => {
    try {
      if (typeof Sentry.metrics?.distribution === 'function') {
        Sentry.metrics.distribution(name, value, options);
      } else {
        // Fallback: log as breadcrumb
        Sentry.addBreadcrumb({
          category: 'metric.distribution',
          message: name,
          level: 'info',
          data: { value, unit: options?.unit, ...options?.tags },
        });
      }
    } catch (error) {
      console.warn('Sentry metrics not available:', error);
    }
  },

  gauge: (name: string, value: number, options?: { tags?: Record<string, string> }) => {
    try {
      if (typeof Sentry.metrics?.gauge === 'function') {
        Sentry.metrics.gauge(name, value, options);
      } else {
        // Fallback: log as breadcrumb
        Sentry.addBreadcrumb({
          category: 'metric.gauge',
          message: name,
          level: 'info',
          data: { value, ...options?.tags },
        });
      }
    } catch (error) {
      console.warn('Sentry metrics not available:', error);
    }
  },
};

/**
 * Safe wrapper for Sentry logger API
 */
export const sentryLogger = {
  debug: (message: string, extra?: { extra?: Record<string, any> }) => {
    try {
      if (typeof Sentry.logger?.debug === 'function') {
        Sentry.logger.debug(message, extra);
      } else {
        Sentry.addBreadcrumb({
          category: 'log',
          message,
          level: 'debug',
          data: extra?.extra,
        });
      }
    } catch (error) {
      console.debug(message, extra);
    }
  },

  info: (message: string, extra?: { extra?: Record<string, any> }) => {
    try {
      if (typeof Sentry.logger?.info === 'function') {
        Sentry.logger.info(message, extra);
      } else {
        Sentry.addBreadcrumb({
          category: 'log',
          message,
          level: 'info',
          data: extra?.extra,
        });
      }
    } catch (error) {
      console.info(message, extra);
    }
  },

  warn: (message: string, extra?: { extra?: Record<string, any> }) => {
    try {
      if (typeof Sentry.logger?.warn === 'function') {
        Sentry.logger.warn(message, extra);
      } else {
        Sentry.addBreadcrumb({
          category: 'log',
          message,
          level: 'warning',
          data: extra?.extra,
        });
      }
    } catch (error) {
      console.warn(message, extra);
    }
  },

  error: (message: string, extra?: { extra?: Record<string, any> }) => {
    try {
      if (typeof Sentry.logger?.error === 'function') {
        Sentry.logger.error(message, extra);
      } else {
        Sentry.captureMessage(message, {
          level: 'error',
          extra: extra?.extra,
        });
      }
    } catch (error) {
      console.error(message, extra);
    }
  },
};
