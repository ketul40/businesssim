import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useDebounce } from './useDebounce';

describe('useDebounce', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should return initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('initial', 500));
    expect(result.current).toBe('initial');
  });

  it('should debounce value changes', async () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'initial', delay: 500 } }
    );

    expect(result.current).toBe('initial');

    // Update value
    rerender({ value: 'updated', delay: 500 });

    // Value should not change immediately
    expect(result.current).toBe('initial');

    // Fast-forward time and run all timers
    await vi.advanceTimersByTimeAsync(500);

    // Value should now be updated
    expect(result.current).toBe('updated');
  });

  it('should cancel previous timeout on rapid changes', async () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'first', delay: 500 } }
    );

    expect(result.current).toBe('first');

    // Rapid updates
    rerender({ value: 'second', delay: 500 });
    await vi.advanceTimersByTimeAsync(200);
    
    rerender({ value: 'third', delay: 500 });
    await vi.advanceTimersByTimeAsync(200);
    
    rerender({ value: 'fourth', delay: 500 });

    // Should still be initial value
    expect(result.current).toBe('first');

    // Fast-forward full delay
    await vi.advanceTimersByTimeAsync(500);

    // Should only update to the last value
    expect(result.current).toBe('fourth');
  });

  it('should work with different delay values', async () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'initial', delay: 1000 } }
    );

    rerender({ value: 'updated', delay: 1000 });
    
    await vi.advanceTimersByTimeAsync(500);
    expect(result.current).toBe('initial');

    await vi.advanceTimersByTimeAsync(500);
    
    expect(result.current).toBe('updated');
  });

  it('should work with different data types', async () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: { count: 0 }, delay: 300 } }
    );

    expect(result.current).toEqual({ count: 0 });

    rerender({ value: { count: 5 }, delay: 300 });
    await vi.advanceTimersByTimeAsync(300);

    expect(result.current).toEqual({ count: 5 });
  });
});
