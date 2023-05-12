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

export function clearEntireLocalStorage() {
  Object.keys(localStorage)
    .filter((key) => key.startsWith(METADATA_KEY))
    .forEach((key) => {
      localStorage.removeItem(key);
    });
}

export function replaceEntireLocalStorage(jsonString: string) {
  clearEntireLocalStorage();
  const jsonObject = JSON.parse(jsonString);
  const newLocalStorageMap = new Map();
  Object.keys(jsonObject).forEach((key) => {
    if (key.startsWith(METADATA_KEY)) {
      localStorage.setItem(key, JSON.stringify(jsonObject[key]));
      newLocalStorageMap.set(key, jsonObject[key]);
    }
  });
}
