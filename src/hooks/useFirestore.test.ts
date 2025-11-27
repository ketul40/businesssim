import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useFirestore } from './useFirestore';
import { collection, getDocs, onSnapshot } from 'firebase/firestore';

// Mock Firebase
vi.mock('firebase/firestore', () => ({
  collection: vi.fn(),
  query: vi.fn((...args) => args),
  getDocs: vi.fn(),
  onSnapshot: vi.fn(),
}));

vi.mock('../firebase/config', () => ({
  db: {},
}));

describe('useFirestore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch data successfully', async () => {
    const mockData = [
      { id: '1', name: 'Item 1' },
      { id: '2', name: 'Item 2' },
    ];

    const mockDocs = mockData.map((data) => ({
      id: data.id,
      data: () => ({ name: data.name }),
    }));

    vi.mocked(getDocs).mockResolvedValue({
      docs: mockDocs,
    } as any);

    const { result } = renderHook(() =>
      useFirestore({
        collectionName: 'test-collection',
      })
    );

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toEqual(mockData);
    expect(result.current.error).toBeNull();
  });

  it('should handle errors gracefully', async () => {
    const mockError = new Error('Firestore error');
    vi.mocked(getDocs).mockRejectedValue(mockError);

    const { result } = renderHook(() =>
      useFirestore({
        collectionName: 'error-test-collection',
        cacheTime: 0, // Disable caching for this test
      })
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBeTruthy();
    expect(result.current.error?.message).toBe('Firestore error');
    expect(result.current.data).toEqual([]);
  });

  it('should refetch data when refetch is called', async () => {
    const mockData = [{ id: '1', name: 'Item 1' }];
    const mockDocs = mockData.map((data) => ({
      id: data.id,
      data: () => ({ name: data.name }),
    }));

    vi.mocked(getDocs).mockResolvedValue({
      docs: mockDocs,
    } as any);

    const { result } = renderHook(() =>
      useFirestore({
        collectionName: 'test-collection',
      })
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Clear mock and set new data
    vi.mocked(getDocs).mockClear();
    const newMockData = [{ id: '2', name: 'Item 2' }];
    const newMockDocs = newMockData.map((data) => ({
      id: data.id,
      data: () => ({ name: data.name }),
    }));

    vi.mocked(getDocs).mockResolvedValue({
      docs: newMockDocs,
    } as any);

    // Refetch
    await result.current.refetch();

    await waitFor(() => {
      expect(result.current.data).toEqual(newMockData);
    });

    expect(getDocs).toHaveBeenCalledTimes(1);
  });

  it('should setup realtime listener when realtime is true', async () => {
    const mockData = [{ id: '1', name: 'Item 1' }];
    const mockUnsubscribe = vi.fn();

    vi.mocked(onSnapshot).mockImplementation((query, onNext) => {
      const mockDocs = mockData.map((data) => ({
        id: data.id,
        data: () => ({ name: data.name }),
      }));

      onNext({
        docs: mockDocs,
      } as any);

      return mockUnsubscribe;
    });

    const { result, unmount } = renderHook(() =>
      useFirestore({
        collectionName: 'test-collection',
        realtime: true,
      })
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toEqual(mockData);
    expect(onSnapshot).toHaveBeenCalled();

    // Cleanup should call unsubscribe
    unmount();
    expect(mockUnsubscribe).toHaveBeenCalled();
  });

  it('should cleanup listener on unmount', async () => {
    const mockUnsubscribe = vi.fn();

    vi.mocked(onSnapshot).mockImplementation(() => {
      return mockUnsubscribe;
    });

    const { unmount } = renderHook(() =>
      useFirestore({
        collectionName: 'test-collection',
        realtime: true,
      })
    );

    unmount();

    expect(mockUnsubscribe).toHaveBeenCalled();
  });
});
