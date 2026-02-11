'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { AnalysisResult, HistoryItem } from '@/lib/types';
import { useAnalysis } from '@/hooks/useAnalysis';
import { useQueryHistory } from '@/hooks/useQueryHistory';
import * as Sentry from '@sentry/nextjs';
import { sentryMetrics, sentryLogger } from '@/lib/sentryMetrics';

interface AnalysisContextType {
  // Current analysis state
  currentAnalysis: AnalysisResult | null;
  isLoading: boolean;
  error: string | null;

  // History
  history: HistoryItem[];

  // Actions
  analyzeUrl: (url: string) => Promise<void>;
  selectHistoryItem: (item: HistoryItem) => void;
  clearError: () => void;
  clearHistory: () => void;
}

const AnalysisContext = createContext<AnalysisContextType | undefined>(undefined);

export function AnalysisProvider({ children }: { children: ReactNode }) {
  const [currentAnalysis, setCurrentAnalysis] = useState<AnalysisResult | null>(null);
  const { analyzeUrl: performAnalysis, isLoading, error, clearError } = useAnalysis();
  const { history, addToHistory, clearHistory: clearHistoryStorage } = useQueryHistory();

  // Log context initialization
  useEffect(() => {
    sentryLogger.info('AnalysisContext initialized', {
      extra: {
        historyCount: history.length,
        hasCurrentAnalysis: !!currentAnalysis,
      },
    });

    // Track history size metric
    sentryMetrics.gauge('history.size', history.length, {
      tags: { context: 'initialization' },
    });
  }, []);

  // Analyze a new URL
  const analyzeUrl = async (url: string) => {
    sentryLogger.info('Starting new URL analysis from context', {
      extra: { url },
    });

    try {
      const result = await performAnalysis(url);
      setCurrentAnalysis(result);

      // Add to history
      const historyItem: HistoryItem = {
        id: result.id,
        url: result.url,
        timestamp: result.timestamp,
        status: result.status,
        preview: result.firmographics.companyName
      };
      addToHistory(historyItem);

      // Log successful addition to history
      sentryLogger.info('Analysis added to history', {
        extra: {
          url: result.url,
          companyName: result.firmographics.companyName,
          historySize: history.length + 1,
        },
      });

      // Track history addition metric
      sentryMetrics.increment('history.item_added', 1, {
        tags: { status: 'success' },
      });

      // Update history size gauge
      sentryMetrics.gauge('history.size', history.length + 1, {
        tags: { action: 'added' },
      });
    } catch (err) {
      // Add failed analysis to history
      const errorMessage = err instanceof Error ? err.message : 'Analysis failed';
      const failedHistoryItem: HistoryItem = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        url: url,
        timestamp: new Date(),
        status: 'error',
        preview: errorMessage
      };
      addToHistory(failedHistoryItem);

      // Log error addition to history
      sentryLogger.warn('Failed analysis added to history', {
        extra: {
          url,
          error: errorMessage,
          historySize: history.length + 1,
        },
      });

      // Track failed history addition
      sentryMetrics.increment('history.item_added', 1, {
        tags: { status: 'error' },
      });

      console.error('Analysis error:', err);
    }
  };

  // Select an item from history
  const selectHistoryItem = (item: HistoryItem) => {
    sentryLogger.info('History item selected', {
      extra: {
        url: item.url,
        status: item.status,
        preview: item.preview,
        age: Date.now() - new Date(item.timestamp).getTime(),
      },
    });

    // Track history selection metric
    sentryMetrics.increment('history.item_selected', 1, {
      tags: {
        status: item.status,
        source: 'sidebar',
      },
    });

    // For history items, we regenerate the analysis
    // In a real app, you might cache the full analysis
    const result = {
      id: item.id,
      url: item.url,
      timestamp: item.timestamp,
      status: item.status,
      metrics: {
        yoyGrowth: 0,
        nrr: 0,
        dau: 0,
        csat: 0,
        nps: 0,
        currentCustomers: 0
      },
      firmographics: {
        companyName: item.preview || '',
        industry: '',
        employeeCount: '',
        website: item.url
      },
      errorMessage: item.status === 'error' ? 'Previous analysis failed' : undefined
    } as AnalysisResult;

    // Re-analyze to get fresh data
    analyzeUrl(item.url);
  };

  // Clear history with logging
  const clearHistory = () => {
    const previousSize = history.length;

    sentryLogger.warn('History cleared', {
      extra: {
        itemsCleared: previousSize,
      },
    });

    // Track history clear metric
    sentryMetrics.increment('history.cleared', 1, {
      tags: { items_cleared: previousSize.toString() },
    });

    // Update history size gauge
    sentryMetrics.gauge('history.size', 0, {
      tags: { action: 'cleared' },
    });

    clearHistoryStorage();
  };

  const value: AnalysisContextType = {
    currentAnalysis,
    isLoading,
    error,
    history,
    analyzeUrl,
    selectHistoryItem,
    clearError,
    clearHistory
  };

  return (
    <AnalysisContext.Provider value={value}>
      {children}
    </AnalysisContext.Provider>
  );
}

export function useAnalysisContext() {
  const context = useContext(AnalysisContext);
  if (context === undefined) {
    throw new Error('useAnalysisContext must be used within an AnalysisProvider');
  }
  return context;
}
