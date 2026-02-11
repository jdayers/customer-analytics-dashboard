'use client';

import { useEffect } from 'react';
import { Sidebar } from "@/components/sidebar/Sidebar";
import { SearchBar } from "@/components/dashboard/SearchBar";
import { AnalysisView } from "@/components/dashboard/AnalysisView";
import { SentryTestButton } from "@/components/dashboard/SentryTestButton";
import * as Sentry from '@sentry/nextjs';
import { sentryMetrics, sentryLogger } from '@/lib/sentryMetrics';

export default function Home() {
  useEffect(() => {
    // Log page view
    sentryLogger.info('Dashboard page viewed', {
      extra: {
        timestamp: new Date().toISOString(),
        userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'unknown',
      },
    });

    // Track page view metric
    sentryMetrics.increment('page.view', 1, {
      tags: {
        page: 'dashboard',
        route: '/',
      },
    });

    // Track session start
    sentryMetrics.increment('session.started', 1, {
      tags: {
        page: 'dashboard',
      },
    });

    // Log viewport information
    if (typeof window !== 'undefined') {
      sentryLogger.debug('Viewport information', {
        extra: {
          width: window.innerWidth,
          height: window.innerHeight,
          devicePixelRatio: window.devicePixelRatio,
        },
      });

      sentryMetrics.gauge('viewport.width', window.innerWidth, {
        tags: { page: 'dashboard' },
      });
    }
  }, []);

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar - hidden on mobile, visible on md+ */}
      <aside className="hidden md:flex md:w-80 lg:w-96">
        <Sidebar />
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto bg-white">
        <div className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8">
          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold mb-2">Customer URL Analysis</h1>
              <p className="text-muted-foreground">
                Enter a customer URL to analyze key performance indicators and firmographic data
              </p>
            </div>
            <SentryTestButton />
          </div>

          {/* Search Bar */}
          <div className="mb-6">
            <SearchBar />
          </div>

          {/* Analysis Results */}
          <AnalysisView />
        </div>
      </main>
    </div>
  );
}
