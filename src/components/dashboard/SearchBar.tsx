'use client';

import { useState, FormEvent } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAnalysisContext } from '@/context/AnalysisContext';
import * as Sentry from '@sentry/nextjs';

export function SearchBar() {
  const [url, setUrl] = useState('');
  const { analyzeUrl, isLoading, error } = useAnalysisContext();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!url.trim() || isLoading) return;

    const trimmedUrl = url.trim();

    // Log search submission
    Sentry.logger.info('Search form submitted', {
      extra: {
        url: trimmedUrl,
        urlLength: trimmedUrl.length,
        hasProtocol: trimmedUrl.startsWith('http'),
      },
    });

    // Track search metric
    Sentry.metrics.increment('search.submitted', 1, {
      tags: {
        has_protocol: trimmedUrl.startsWith('http') ? 'yes' : 'no',
      },
    });

    try {
      await analyzeUrl(trimmedUrl);

      // Clear input on success
      setUrl('');

      // Track successful search
      Sentry.metrics.increment('search.completed', 1, {
        tags: { status: 'success' },
      });
    } catch (err) {
      // Track failed search
      Sentry.metrics.increment('search.completed', 1, {
        tags: { status: 'failed' },
      });

      Sentry.logger.error('Search submission failed', {
        extra: {
          url: trimmedUrl,
          error: err instanceof Error ? err.message : 'unknown',
        },
      });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUrl(e.target.value);

    // Track input interaction (throttled by metrics)
    if (e.target.value.length > 0 && e.target.value.length % 10 === 0) {
      Sentry.metrics.gauge('search.input_length', e.target.value.length, {
        tags: { milestone: 'every_10_chars' },
      });
    }
  };

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Enter customer URL (e.g., salesforce.com)"
            value={url}
            onChange={handleInputChange}
            disabled={isLoading}
            className={`pl-10 ${error ? 'border-red-500' : ''}`}
          />
        </div>
        <Button type="submit" disabled={isLoading || !url.trim()}>
          {isLoading ? 'Analyzing...' : 'Analyze'}
        </Button>
      </form>
      {error && (
        <p className="mt-2 text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
