import { METADATA_KEY } from './schema';

export default function getEntireLocalStorage() {
  const data = new Map();
  Object.keys(localStorage)
    .filter((key) => key.startsWith(METADATA_KEY))
    .forEach((key) => {
      const value = localStorage.getItem(key);
      if (value !== null) {
        data.set(key, JSON.parse(value));
      }
    });
  return JSON.stringify(Object.fromEntries(data));
}

export function replaceEntireLocalStorage(jsonString: string) {
  const jsonObject = JSON.parse(jsonString);
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
}
