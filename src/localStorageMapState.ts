import { useState } from 'react';
import { METADATA_KEY } from './codeState';

export default function useLocalStorageMapState() {
  const data = new Map();
  if (typeof window !== 'undefined') {
    Object.keys(localStorage)
      .filter((key) => key.startsWith(METADATA_KEY))
      .forEach((key) => {
        const value = localStorage.getItem(key);
        if (value !== null) {
          data.set(key, JSON.parse(value));
        }
      });
  }

  const [localStorageMap, setLocalStorageMap] = useState(data);

  const setLocalStorageMapFromString = (jsonString: string) => {
    const jsonObject = JSON.parse(jsonString);
    if (typeof window === 'undefined') {
      return;
    }
    // Clear localStorage
    Object.keys(localStorage)
      .filter((key) => key.startsWith(METADATA_KEY))
      .forEach((key) => {
        localStorage.removeItem(key);
      });
    const newLocalStorageMap = new Map();
    // Update localStorage
    Object.keys(jsonObject).forEach((key) => {
      if (key.startsWith(METADATA_KEY)) {
        localStorage.setItem(key, JSON.stringify(jsonObject[key]));
        newLocalStorageMap.set(key, jsonObject[key]);
      }
    });
    setLocalStorageMap(newLocalStorageMap);
  };

  return {
    localStorageMap,
    setLocalStorageMapFromString,
  };
}
