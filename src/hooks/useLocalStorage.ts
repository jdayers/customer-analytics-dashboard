'use client';

import { useState, useEffect } from 'react';
import { getFromStorage, saveToStorage } from '@/lib/storage';

export function useLocalStorage<T>(key: string, defaultValue: T): [T, (value: T | ((prev: T) => T)) => void] {
  // Initialize state with value from localStorage or default
  const [value, setValue] = useState<T>(() => {
    return getFromStorage(key, defaultValue);
  });

  // Update localStorage when value changes
  useEffect(() => {
    saveToStorage(key, value);
  }, [key, value]);

  return [value, setValue];
}
