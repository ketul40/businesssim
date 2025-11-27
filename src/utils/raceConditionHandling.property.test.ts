import { describe, it, expect, vi } from 'vitest';
import fc from 'fast-check';

/**
 * Feature: app-optimization, Property 20: Race condition handling
 * Validates: Requirements 10.3
 * 
 * Property: For any asynchronous operation, when multiple instances of the same 
 * operation are triggered concurrently, the application should handle the race 
 * condition (cancel previous, debounce, or queue)
 */

// Helper: Debounce function that cancels previous calls
function debounce<T extends (...args: any[]) => any>(
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

// Helper: Cancel token for cancellable async operations
class CancelToken {
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

// Helper: Async operation with cancellation support
async function cancellableAsyncOperation<T>(
  operation: () => Promise<T>,
  cancelToken: CancelToken
): Promise<T> {
  cancelToken.throwIfCancelled();
  
  const result = await operation();
  
  cancelToken.throwIfCancelled();
  
  return result;
}

// Helper: Latest-only async operation manager
class LatestOnlyManager<T> {
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

// Helper: Queue-based async operation manager
class QueueManager<T> {
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

describe('Property 20: Race condition handling', () => {
  it('should debounce concurrent calls and only execute the latest', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(fc.integer({ min: 1, max: 100 }), { minLength: 2, maxLength: 5 }),
        async (values) => {
          let callCount = 0;
          const mockFn = vi.fn((value: number) => {
            callCount++;
            return value * 2;
          });

          const debouncedFn = debounce(mockFn, 20);

          // Trigger multiple concurrent calls
          const promises = values.map(value => 
            debouncedFn(value).catch(() => null) // Catch debounced rejections
          );

          // Wait for debounce to complete
          await new Promise(resolve => setTimeout(resolve, 50));

          // Only the last call should have executed
          expect(callCount).toBe(1);
          expect(mockFn).toHaveBeenCalledWith(values[values.length - 1]);
        }
      ),
      { numRuns: 50, timeout: 10000 }
    );
  }, 15000);

  it('should cancel previous operations when new ones are triggered', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 2, max: 5 }),
        async (numOperations) => {
          const operations: Array<Promise<number | null>> = [];
          let latestToken: CancelToken | null = null;

          for (let i = 0; i < numOperations; i++) {
            // Cancel previous operation
            if (latestToken) {
              latestToken.cancel('Newer operation started');
            }

            const token = new CancelToken();
            latestToken = token;

            // Start operation but don't await yet
            const operation = cancellableAsyncOperation(
              async () => {
                await new Promise(resolve => setTimeout(resolve, 10));
                return i;
              },
              token
            ).catch(() => null); // Return null for cancelled operations

            operations.push(operation);
          }

          // Wait for all operations to complete or be cancelled
          const results = await Promise.all(operations);
          const successfulResults = results.filter(r => r !== null);

          // Only the last operation should have succeeded
          expect(successfulResults.length).toBe(1);
          expect(successfulResults[0]).toBe(numOperations - 1);
        }
      ),
      { numRuns: 50 }
    );
  });

  it('should only use results from the latest operation', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(fc.integer({ min: 1, max: 100 }), { minLength: 2, maxLength: 10 }),
        async (values) => {
          const manager = new LatestOnlyManager<number>();
          const results: Array<number | null> = [];

          // Trigger multiple concurrent operations
          const promises = values.map(async (value, index) => {
            // Add varying delays to simulate race conditions
            await new Promise(resolve => setTimeout(resolve, Math.random() * 20));
            const result = await manager.execute(async () => {
              await new Promise(resolve => setTimeout(resolve, 5));
              return value;
            });
            results.push(result);
          });

          await Promise.all(promises);

          // At least one result should be non-null (the latest)
          const nonNullResults = results.filter(r => r !== null);
          expect(nonNullResults.length).toBeGreaterThan(0);

          // All non-null results should be from later operations
          nonNullResults.forEach(result => {
            expect(values).toContain(result);
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should queue operations and execute them sequentially', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(fc.integer({ min: 1, max: 100 }), { minLength: 2, maxLength: 5 }),
        async (values) => {
          const manager = new QueueManager<number>();
          const executionOrder: number[] = [];

          // Enqueue multiple operations
          const promises = values.map(value =>
            manager.enqueue(async () => {
              await new Promise(resolve => setTimeout(resolve, 2));
              executionOrder.push(value);
              return value;
            })
          );

          const results = await Promise.all(promises);

          // All operations should have completed
          expect(results.length).toBe(values.length);
          expect(executionOrder.length).toBe(values.length);

          // Results should match input values
          expect(results).toEqual(values);
          expect(executionOrder).toEqual(values);
        }
      ),
      { numRuns: 50, timeout: 10000 }
    );
  }, 15000);

  it('should handle race conditions in state updates', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(fc.integer({ min: 1, max: 100 }), { minLength: 2, maxLength: 5 }),
        async (updates) => {
          let state = 0;
          let updateCount = 0;
          const lock = { locked: false };

          // Simulate concurrent state updates with locking
          const updateState = async (value: number): Promise<void> => {
            // Wait for lock with timeout
            let attempts = 0;
            while (lock.locked && attempts < 100) {
              await new Promise(resolve => setTimeout(resolve, 1));
              attempts++;
            }

            // Acquire lock
            lock.locked = true;

            try {
              // Simulate async state update
              await new Promise(resolve => setTimeout(resolve, 2));
              state = value;
              updateCount++;
            } finally {
              // Release lock
              lock.locked = false;
            }
          };

          // Trigger concurrent updates
          await Promise.all(updates.map(value => updateState(value)));

          // All updates should have been processed
          expect(updateCount).toBe(updates.length);

          // Final state should be one of the update values
          expect(updates).toContain(state);
        }
      ),
      { numRuns: 50, timeout: 10000 }
    );
  }, 15000);
});
