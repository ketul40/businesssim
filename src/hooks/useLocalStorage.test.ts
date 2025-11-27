import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useLocalStorage } from './useLocalStorage';

describe('useLocalStorage', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should return initial value when localStorage is empty', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', 'initial'));
    expect(result.current[0]).toBe('initial');
  });

  it('should return stored value from localStorage', () => {
    localStorage.setItem('test-key', JSON.stringify('stored-value'));
    
    const { result } = renderHook(() => useLocalStorage('test-key', 'initial'));
    expect(result.current[0]).toBe('stored-value');
  });

  it('should update localStorage when value changes', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', 'initial'));
    
    act(() => {
      result.current[1]('updated');
    });

    expect(result.current[0]).toBe('updated');
    expect(localStorage.getItem('test-key')).toBe(JSON.stringify('updated'));
  });

  it('should work with function updater', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', 5));
    
    act(() => {
      result.current[1]((prev) => prev + 10);
    });

    expect(result.current[0]).toBe(15);
    expect(localStorage.getItem('test-key')).toBe(JSON.stringify(15));
  });

  it('should work with complex objects', () => {
    const initialObj = { name: 'John', age: 30 };
    const { result } = renderHook(() => useLocalStorage('test-key', initialObj));
    
    expect(result.current[0]).toEqual(initialObj);

    const updatedObj = { name: 'Jane', age: 25 };
    act(() => {
      result.current[1](updatedObj);
    });

    expect(result.current[0]).toEqual(updatedObj);
    expect(JSON.parse(localStorage.getItem('test-key')!)).toEqual(updatedObj);
  });

  it('should sync across storage events', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', 'initial'));
    
    // Simulate storage event from another tab
    act(() => {
      const storageEvent = new StorageEvent('storage', {
        key: 'test-key',
        newValue: JSON.stringify('from-another-tab'),
      });
      window.dispatchEvent(storageEvent);
    });

    expect(result.current[0]).toBe('from-another-tab');
  });

  it('should handle custom storage events from same tab', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', 'initial'));
    
    act(() => {
      const customEvent = new CustomEvent('local-storage', {
        detail: { key: 'test-key', value: 'custom-update' },
      });
      window.dispatchEvent(customEvent);
    });

    expect(result.current[0]).toBe('custom-update');
  });

  it('should handle corrupted localStorage data gracefully', () => {
    localStorage.setItem('test-key', 'invalid-json{');
    
    const { result } = renderHook(() => useLocalStorage('test-key', 'fallback'));
    expect(result.current[0]).toBe('fallback');
  });

  it('should cleanup event listeners on unmount', () => {
    const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');
    
    const { unmount } = renderHook(() => useLocalStorage('test-key', 'initial'));
    
    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith('storage', expect.any(Function));
    expect(removeEventListenerSpy).toHaveBeenCalledWith('local-storage', expect.any(Function));
  });
});
