/**
 * Race condition handling utilities
 * Implements race condition handling as per Requirements 10.3
 */

/**
 * Debounce function that cancels previous calls
 * Useful for search inputs, resize handlers, etc.
 */
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => Promise<ReturnType<T>> {
  let timeoutId: NodeJS.Timeout | null = null;
  let latestResolve: ((value: any) => void) | null = null;
  let latestReject: ((reason: any) => void) | null = null;

  return (...args: Parameters<T>): Promise<ReturnType<T>> => {
    // Cancel previous timeout
    if (timeoutId) {
      clearTimeout(timeoutId);
      if (latestReject) {
        latestReject(new Error('Debounced: newer call made'));
      }
    }

    return new Promise((resolve, reject) => {
      latestResolve = resolve;
      latestReject = reject;

      timeoutId = setTimeout(() => {
        try {
          const result = fn(...args);
          if (latestResolve) {
            latestResolve(result);
          }
        } catch (error) {
          if (latestReject) {
            latestReject(error);
          }
        }
      }, delay);
    });
  };
}

/**
 * Cancel token for cancellable async operations
 */
export class CancelToken {
  private _cancelled = false;
  private _reason: string | null = null;

  cancel(reason: string = 'Operation cancelled'): void {
    this._cancelled = true;
    this._reason = reason;
  }

  get isCancelled(): boolean {
    return this._cancelled;
  }

  get reason(): string | null {
    return this._reason;
  }

  throwIfCancelled(): void {
    if (this._cancelled) {
      throw new Error(this._reason || 'Operation cancelled');
    }
  }
}

/**
 * Executes an async operation with cancellation support
 */
export async function cancellableAsyncOperation<T>(
  operation: () => Promise<T>,
  cancelToken: CancelToken
): Promise<T> {
  cancelToken.throwIfCancelled();
  
  const result = await operation();
  
  cancelToken.throwIfCancelled();
  
  return result;
}

/**
 * Latest-only async operation manager
 * Ensures only the latest operation's result is used
 */
export class LatestOnlyManager<T> {
  private latestId = 0;
  private completedId = 0;

  async execute(operation: () => Promise<T>): Promise<T | null> {
    const currentId = ++this.latestId;
    
    const result = await operation();
    
    // Only return result if this is still the latest operation
    if (currentId > this.completedId) {
      this.completedId = currentId;
      return result;
    }
    
    return null; // Stale result, discard
  }

  isLatest(id: number): boolean {
    return id === this.latestId;
  }
}

/**
 * Queue-based async operation manager
 * Ensures operations execute sequentially
 */
export class QueueManager<T> {
  private queue: Array<() => Promise<T>> = [];
  private processing = false;

  async enqueue(operation: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          const result = await operation();
          resolve(result);
          return result;
        } catch (error) {
          reject(error);
          throw error;
        }
      });

      this.processQueue();
    });
  }

  private async processQueue(): Promise<void> {
    if (this.processing || this.queue.length === 0) {
      return;
    }

    this.processing = true;

    while (this.queue.length > 0) {
      const operation = this.queue.shift();
      if (operation) {
        try {
          await operation();
        } catch (error) {
          // Error already handled in enqueue
        }
      }
    }

    this.processing = false;
  }
}
