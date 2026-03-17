/**
 * Generic localStorage service for typed CRUD operations.
 * All domain services build on top of this.
 */

export function getItem<T>(key: string, fallback: T): T {
  try {
    const item = window.localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
  }
}

export function setItem<T>(key: string, value: T): void {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn(`Error writing localStorage key "${key}":`, error);
  }
}

export function updateItem<T>(key: string, fallback: T, updater: (prev: T) => T): T {
  const current = getItem(key, fallback);
  const updated = updater(current);
  setItem(key, updated);
  return updated;
}
