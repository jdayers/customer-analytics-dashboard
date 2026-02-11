// localStorage utilities with type safety and error handling

export function getFromStorage<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') {
    return defaultValue;
  }

  try {
    const item = window.localStorage.getItem(key);
    if (!item) {
      return defaultValue;
    }

    // Parse and handle Date objects
    return JSON.parse(item, (key, value) => {
      // Convert ISO date strings back to Date objects
      if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/.test(value)) {
        return new Date(value);
      }
      return value;
    });
  } catch (error) {
    console.error(`Error reading from localStorage (${key}):`, error);
    return defaultValue;
  }
}

export function saveToStorage<T>(key: string, value: T): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error saving to localStorage (${key}):`, error);
  }
}

export function removeFromStorage(key: string): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage.removeItem(key);
  } catch (error) {
    console.error(`Error removing from localStorage (${key}):`, error);
  }
}

export function clearStorage(): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage.clear();
  } catch (error) {
    console.error('Error clearing localStorage:', error);
  }
}
