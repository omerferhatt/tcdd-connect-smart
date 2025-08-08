import { useState } from "react";

/**
 * useKV - React hook for localStorage-backed state (as a replacement for @github/spark/hooks useKV)
 * @param key string
 * @param initialValue T
 */
export function useKV<T>(key: string, initialValue: T): [T, (v: T | ((prev: T) => T)) => void] {
  const getStored = () => {
    try {
      const item = localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : initialValue;
    } catch {
      return initialValue;
    }
  };

  const [value, setValue] = useState<T>(getStored);

  const setAndStore = (v: T | ((prev: T) => T)) => {
    setValue(prev => {
      const next = typeof v === "function" ? (v as (prev: T) => T)(prev) : v;
      try {
        localStorage.setItem(key, JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  return [value, setAndStore];
}
