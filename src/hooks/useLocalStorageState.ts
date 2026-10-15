import { useState, useEffect, useCallback } from 'react';

export function useLocalStorageState<T>(
  key: string,
  defaultValue: T
): [T, (value: T | ((val: T) => T)) => void] {
  const [state, setState] = useState<T>(() => {
    try {
      const item = localStorage.getItem(key);
      if (item !== null) {
        return JSON.parse(item) as T;
      }
    } catch (error) {
      console.warn(`[useLocalStorageState] Error reading key "${key}":`, error);
    }
    return defaultValue;
  });

  const setLocalStorageState = useCallback(
    (valueOrFn: T | ((val: T) => T)) => {
      setState((prev) => {
        const nextValue = typeof valueOrFn === 'function' ? (valueOrFn as (val: T) => T)(prev) : valueOrFn;
        try {
          localStorage.setItem(key, JSON.stringify(nextValue));
        } catch (error) {
          console.warn(`[useLocalStorageState] Error writing key "${key}":`, error);
        }
        return nextValue;
      });
    },
    [key]
  );

  return [state, setLocalStorageState];
}
