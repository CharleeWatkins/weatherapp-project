import { useState, useEffect, useCallback } from 'react';
import { getItem, setItem } from '../services/storage';

export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => void, () => void] {
  const [value, setValue] = useState<T>(() => {
    const stored = getItem<T | undefined>(key, undefined);
    return stored !== undefined ? stored : initialValue;
  });

  useEffect(() => {
    setItem(key, value);
  }, [key, value]);

  const reset = useCallback(() => setValue(initialValue), [initialValue]);

  return [value, setValue, reset];
}