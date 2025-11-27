/**
 * Storage quota error handling utilities
 * Implements storage quota handling as per Requirements 10.4
 */

export interface StorageQuotaInfo {
  usage: number;
  quota: number;
  percentUsed: number;
  available: number;
}

/**
 * Checks if an error is a storage quota exceeded error
 */
export function isQuotaExceededError(error: any): boolean {
  return (
    error instanceof DOMException &&
    (
      error.name === 'QuotaExceededError' ||
      error.name === 'NS_ERROR_DOM_QUOTA_REACHED' ||
      error.code === 22 || // Legacy code for QuotaExceededError
      error.code === 1014 // Firefox
    )
  );
}

/**
 * Gets current storage quota information
 */
export async function getStorageQuotaInfo(): Promise<StorageQuotaInfo | null> {
  if ('storage' in navigator && 'estimate' in navigator.storage) {
    try {
      const estimate = await navigator.storage.estimate();
      const usage = estimate.usage || 0;
      const quota = estimate.quota || 0;
      const percentUsed = quota > 0 ? (usage / quota) * 100 : 0;
      const available = quota - usage;

      return {
        usage,
        quota,
        percentUsed,
        available,
      };
    } catch (error) {
      console.error('Failed to get storage quota info:', error);
      return null;
    }
  }

  return null;
}

/**
 * Checks if storage is nearly full (>90% used)
 */
export async function isStorageNearlyFull(): Promise<boolean> {
  const info = await getStorageQuotaInfo();
  return info ? info.percentUsed > 90 : false;
}

/**
 * Attempts to free up storage space by clearing old data
 */
export async function clearOldStorageData(keysToPreserve: string[] = []): Promise<number> {
  let clearedBytes = 0;

  try {
    // Clear old localStorage items (except preserved keys)
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && !keysToPreserve.includes(key)) {
        // Check if it's an old item (you can implement your own logic here)
        // For now, we'll just collect all non-preserved keys
        keysToRemove.push(key);
      }
    }

    // Remove old items
    keysToRemove.forEach(key => {
      const item = localStorage.getItem(key);
      if (item) {
        clearedBytes += item.length * 2; // Rough estimate (UTF-16)
        localStorage.removeItem(key);
      }
    });

    // Clear old cache entries if Cache API is available
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      for (const cacheName of cacheNames) {
        // Only clear old caches (you can implement versioning logic)
        if (cacheName.includes('old') || cacheName.includes('v1')) {
          await caches.delete(cacheName);
        }
      }
    }

    return clearedBytes;
  } catch (error) {
    console.error('Failed to clear old storage data:', error);
    return clearedBytes;
  }
}

/**
 * Handles storage quota exceeded errors with user-friendly messages
 */
export function handleStorageQuotaError(error: any): {
  isQuotaError: boolean;
  message: string;
  action: 'clear_data' | 'upgrade_storage' | 'contact_support' | null;
} {
  if (isQuotaExceededError(error)) {
    return {
      isQuotaError: true,
      message: 'Storage is full. Please clear some browser data or try again later.',
      action: 'clear_data',
    };
  }

  return {
    isQuotaError: false,
    message: 'An error occurred while saving data.',
    action: null,
  };
}

/**
 * Safe localStorage setItem with quota error handling
 */
export function safeLocalStorageSetItem(
  key: string,
  value: string,
  onQuotaExceeded?: () => void
): boolean {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch (error) {
    if (isQuotaExceededError(error)) {
      console.warn('Storage quota exceeded:', error);
      if (onQuotaExceeded) {
        onQuotaExceeded();
      }
      return false;
    }
    throw error;
  }
}

/**
 * Safe localStorage getItem with error handling
 */
export function safeLocalStorageGetItem(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch (error) {
    console.error('Failed to get item from localStorage:', error);
    return null;
  }
}

/**
 * Safe localStorage removeItem with error handling
 */
export function safeLocalStorageRemoveItem(key: string): boolean {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error('Failed to remove item from localStorage:', error);
    return false;
  }
}
