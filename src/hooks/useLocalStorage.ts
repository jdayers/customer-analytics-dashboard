'use client';

import { useState, useEffect } from 'react';
import { getFromStorage, saveToStorage } from '@/lib/storage';

export function useLocalStorage<T>(key: string, defaultValue: T): [T, (value: T | ((prev: T) => T)) => void] {
  // Always initialize with default value to avoid hydration mismatch
  const [value, setValue] = useState<T>(defaultValue);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load from localStorage after mount (client-only)
  useEffect(() => {
    if (!isInitialized) {
      const storedValue = getFromStorage(key, defaultValue);
      setValue(storedValue);
      setIsInitialized(true);
    }
  }, [key, defaultValue, isInitialized]);

  // Update localStorage when value changes (skip initial load)
  useEffect(() => {
    if (isInitialized) {
      saveToStorage(key, value);
    }
  }, [key, value, isInitialized]);

  return [value, setValue];
}
