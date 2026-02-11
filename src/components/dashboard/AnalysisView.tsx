'use client';

import { useAnalysisContext } from '@/context/AnalysisContext';
import { MetricsGrid } from './MetricsGrid';
import { FirmographicData } from './FirmographicData';
import { Loader2, AlertCircle, BarChart3 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export function AnalysisView() {
  const { currentAnalysis, isLoading, error } = useAnalysisContext();

  // Loading state
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-lg text-muted-foreground">Analyzing customer data...</p>
      </div>
    );
  }

  // Error state
  if (error && !currentAnalysis) {
    return (
      <div className="py-12">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="ml-2">
            {error}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Empty state
  if (!currentAnalysis) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <BarChart3 className="h-16 w-16 text-muted-foreground mb-4" />
        <h3 className="text-xl font-semibold mb-2">Ready to Analyze</h3>
        <p className="text-muted-foreground max-w-md">
          Enter a customer URL above to view their key performance indicators, metrics, and firmographic data.
        </p>
      </div>
    );
  }

  // Success state - display analysis results
  return (
    <div className="space-y-6 py-6">
      {/* Company header */}
      <div className="border-b pb-4">
        <h2 className="text-3xl font-bold">{currentAnalysis.firmographics.companyName}</h2>
        <p className="text-muted-foreground mt-1">{currentAnalysis.url}</p>
        <p className="text-sm text-muted-foreground mt-1">
          Analyzed on {currentAnalysis.timestamp.toLocaleDateString()} at{' '}
          {currentAnalysis.timestamp.toLocaleTimeString()}
        </p>
      </div>

      {/* Metrics Grid */}
      <MetricsGrid metrics={currentAnalysis.metrics} />

      {/* Firmographic Data */}
      <FirmographicData data={currentAnalysis.firmographics} />
    </div>
  );
}
