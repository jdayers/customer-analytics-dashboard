'use client';

import { BarChart3 } from 'lucide-react';
import { HistoryList } from './HistoryList';

export function Sidebar() {
  return (
    <div className="flex flex-col h-full bg-slate-50 border-r">
      {/* Header */}
      <div className="p-6 border-b bg-white">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-6 w-6 text-primary" />
          <div>
            <h1 className="text-lg font-bold">Customer Analytics</h1>
            <p className="text-xs text-muted-foreground">Account Intelligence</p>
          </div>
        </div>
      </div>

      {/* History */}
      <div className="flex-1 overflow-auto">
        <div className="p-4">
          <h2 className="text-sm font-semibold text-muted-foreground mb-3 px-2">
            Recent Analyses
          </h2>
          <HistoryList />
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t bg-white">
        <p className="text-xs text-muted-foreground text-center">
          Powered by Customer Insights
        </p>
      </div>
    </div>
  );
}
