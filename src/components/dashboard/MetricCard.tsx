'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: 'up' | 'down' | 'neutral';
  subtitle?: string;
}

export function MetricCard({ title, value, icon: Icon, trend = 'neutral', subtitle }: MetricCardProps) {
  const getTrendColor = () => {
    switch (trend) {
      case 'up':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getTrendIcon = () => {
    if (trend === 'up') return <TrendingUp className="h-4 w-4" />;
    if (trend === 'down') return <TrendingDown className="h-4 w-4" />;
    return null;
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline gap-2">
          <div className="text-2xl font-bold">{value}</div>
          {trend !== 'neutral' && (
            <div className={`flex items-center ${getTrendColor()}`}>
              {getTrendIcon()}
            </div>
          )}
        </div>
        {subtitle && (
          <p className="text-xs text-muted-foreground mt-1">
            {subtitle}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
