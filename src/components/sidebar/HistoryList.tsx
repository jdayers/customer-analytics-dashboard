'use client';

import { useAnalysisContext } from '@/context/AnalysisContext';
import { HistoryItem } from '@/lib/types';
import { formatDistanceToNow } from 'date-fns';
import { CheckCircle2, XCircle, ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import * as Sentry from '@sentry/nextjs';
import { useEffect, useState } from 'react';
import { sentryMetrics, sentryLogger } from '@/lib/sentryMetrics';

export function HistoryList() {
  const { history, selectHistoryItem, currentAnalysis } = useAnalysisContext();
  const [isMounted, setIsMounted] = useState(false);

  // Only render timestamps after client-side mount to avoid hydration mismatch
  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    // Log history list render with statistics
    if (history.length > 0) {
      const successCount = history.filter(h => h.status === 'success').length;
      const errorCount = history.filter(h => h.status === 'error').length;

      sentryLogger.debug('History list rendered', {
        extra: {
          totalItems: history.length,
          successCount,
          errorCount,
          successRate: (successCount / history.length * 100).toFixed(2) + '%',
        },
      });

      // Track history statistics
      sentryMetrics.gauge('history.success_count', successCount, {
        tags: { component: 'history_list' },
      });

      sentryMetrics.gauge('history.error_count', errorCount, {
        tags: { component: 'history_list' },
      });
    }
  }, [history.length]);

  if (history.length === 0) {
    sentryLogger.info('History list empty', {
      extra: { component: 'history_list' },
    });

    return (
      <div className="text-center py-8 px-4">
        <p className="text-sm text-muted-foreground">
          No analyses yet. Start by entering a URL above.
        </p>
      </div>
    );
  }

  const handleClick = (item: HistoryItem) => {
    sentryLogger.info('History item clicked', {
      extra: {
        url: item.url,
        status: item.status,
        isActive: currentAnalysis?.url === item.url,
        position: history.findIndex(h => h.id === item.id),
      },
    });

    // Track history item click metric
    sentryMetrics.increment('history.item_clicked', 1, {
      tags: {
        status: item.status,
        is_active: currentAnalysis?.url === item.url ? 'yes' : 'no',
      },
    });

    selectHistoryItem(item);
  };

  return (
    <div className="space-y-2">
      {history.map((item) => {
        const isActive = currentAnalysis?.url === item.url;

        return (
          <button
            key={item.id}
            onClick={() => handleClick(item)}
            className={`
              w-full text-left p-3 rounded-lg border transition-all
              hover:shadow-md hover:border-primary/50
              ${isActive ? 'bg-primary/5 border-primary' : 'bg-white border-slate-200'}
            `}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  {item.status === 'success' ? (
                    <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-600 flex-shrink-0" />
                  )}
                  <p className="font-medium text-sm truncate">
                    {item.preview || 'Unknown'}
                  </p>
                </div>
                <p className="text-xs text-muted-foreground truncate">
                  {item.url}
                </p>
                <p className="text-xs text-muted-foreground mt-1" suppressHydrationWarning>
                  {isMounted ? formatDistanceToNow(new Date(item.timestamp), { addSuffix: true }) : 'Just now'}
                </p>
              </div>
              {isActive && (
                <Badge variant="secondary" className="text-xs">
                  Active
                </Badge>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}
