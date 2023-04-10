import { useState } from 'react';

export default function useLocalStorageMapState() {
  const data = new Map();
  if (typeof window !== 'undefined') {
    Object.keys(localStorage)
      .filter((key) => key.startsWith('pytamaro_web_'))
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
      .filter((key) => key.startsWith('pytamaro_web_'))
      .forEach((key) => {
        localStorage.removeItem(key);
      });
    const newLocalStorageMap = new Map();
    // Update localStorage
    Object.keys(jsonObject).forEach((key) => {
      if (key.startsWith('pytamaro_web_')) {
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
