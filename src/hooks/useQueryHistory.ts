'use client';

import { useLocalStorage } from './useLocalStorage';
import { HistoryItem } from '@/lib/types';
import { generateInitialHistory } from '@/lib/mockData';

const HISTORY_KEY = 'analysis-history';
const MAX_HISTORY_ITEMS = 50;

export function useQueryHistory() {
  const [history, setHistory] = useLocalStorage<HistoryItem[]>(
    HISTORY_KEY,
    generateInitialHistory() // Pre-populated on first load
  );

  const addToHistory = (item: HistoryItem) => {
    setHistory(prev => {
      // Remove duplicate URLs (keep most recent)
      const filtered = prev.filter(h => h.url !== item.url);
      // Add new item to the beginning and limit to MAX_HISTORY_ITEMS
      return [item, ...filtered].slice(0, MAX_HISTORY_ITEMS);
    });
  };

  const clearHistory = () => {
    setHistory([]);
  };

  const removeFromHistory = (id: string) => {
    setHistory(prev => prev.filter(h => h.id !== id));
  };

  return {
    history,
    addToHistory,
    clearHistory,
    removeFromHistory
  };
}
