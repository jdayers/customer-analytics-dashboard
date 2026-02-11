'use client';

import { useEffect } from 'react';
import { MetricCard } from './MetricCard';
import { CustomerMetrics } from '@/lib/types';
import {
  TrendingUp,
  RefreshCw,
  Users,
  Smile,
  ThumbsUp,
  Building2
} from 'lucide-react';
import * as Sentry from '@sentry/nextjs';

interface MetricsGridProps {
  metrics: CustomerMetrics;
}

export function MetricsGrid({ metrics }: MetricsGridProps) {
  // Log metrics display
  useEffect(() => {
    Sentry.logger.info('Metrics grid displayed', {
      extra: {
        metrics: {
          yoyGrowth: metrics.yoyGrowth,
          nrr: metrics.nrr,
          dau: metrics.dau,
          csat: metrics.csat,
          nps: metrics.nps,
          currentCustomers: metrics.currentCustomers,
        },
      },
    });

    // Track metric value distributions
    Sentry.metrics.distribution('metrics.yoy_growth_displayed', metrics.yoyGrowth, {
      tags: { component: 'metrics_grid' },
    });

    Sentry.metrics.distribution('metrics.nrr_displayed', metrics.nrr, {
      tags: { component: 'metrics_grid' },
    });

    Sentry.metrics.distribution('metrics.dau_displayed', metrics.dau, {
      tags: { component: 'metrics_grid' },
    });

    Sentry.metrics.distribution('metrics.csat_displayed', metrics.csat, {
      tags: { component: 'metrics_grid' },
    });

    Sentry.metrics.distribution('metrics.nps_displayed', metrics.nps, {
      tags: { component: 'metrics_grid' },
    });

    // Track health indicators
    const healthScore = (
      (metrics.yoyGrowth > 50 ? 1 : 0) +
      (metrics.nrr >= 100 ? 1 : 0) +
      (metrics.csat >= 80 ? 1 : 0) +
      (metrics.nps > 30 ? 1 : 0)
    ) / 4 * 100;

    Sentry.metrics.gauge('metrics.health_score', healthScore, {
      tags: { component: 'metrics_grid' },
    });

    Sentry.logger.debug('Metrics health score calculated', {
      extra: { healthScore: healthScore.toFixed(2) + '%' },
    });
  }, [metrics]);

  // Determine trend based on metric value
  const getGrowthTrend = (value: number) => {
    if (value > 100) return 'up';
    if (value < 50) return 'down';
    return 'neutral';
  };

  const getNRRTrend = (value: number) => {
    if (value >= 100) return 'up';
    if (value < 90) return 'down';
    return 'neutral';
  };

  const getNPSTrend = (value: number) => {
    if (value > 30) return 'up';
    if (value < 0) return 'down';
    return 'neutral';
  };

  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">Key Performance Indicators</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <MetricCard
          title="YoY Growth"
          value={`${metrics.yoyGrowth}%`}
          icon={TrendingUp}
          trend={getGrowthTrend(metrics.yoyGrowth)}
          subtitle="Year over year growth"
        />
        <MetricCard
          title="Net Revenue Retention"
          value={`${metrics.nrr}%`}
          icon={RefreshCw}
          trend={getNRRTrend(metrics.nrr)}
          subtitle="Customer revenue retention"
        />
        <MetricCard
          title="Daily Active Users"
          value={metrics.dau.toLocaleString()}
          icon={Users}
          trend="neutral"
          subtitle="Average daily engagement"
        />
        <MetricCard
          title="Customer Satisfaction"
          value={`${metrics.csat}/100`}
          icon={Smile}
          trend={metrics.csat >= 80 ? 'up' : metrics.csat < 70 ? 'down' : 'neutral'}
          subtitle="CSAT score"
        />
        <MetricCard
          title="Net Promoter Score"
          value={metrics.nps}
          icon={ThumbsUp}
          trend={getNPSTrend(metrics.nps)}
          subtitle="Customer loyalty metric"
        />
        <MetricCard
          title="Current Customers"
          value={metrics.currentCustomers.toLocaleString()}
          icon={Building2}
          trend="neutral"
          subtitle="Active customer base"
        />
      </div>
    </div>
  );
}
