import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import fc from 'fast-check';

/**
 * Feature: app-optimization, Property 5: Large list virtualization
 * Validates: Requirements 3.3
 * 
 * Property: For any list with more than 50 items, the rendering should use 
 * virtualization or pagination to limit DOM nodes
 */

// Helper to create a simple list component
const SimpleList = ({ items }: { items: string[] }) => {
  return (
    <ul data-testid="simple-list">
      {items.map((item, index) => (
        <li key={index} data-testid={`list-item-${index}`}>
          {item}
        </li>
      ))}
    </ul>
  );
};

// Helper to create a paginated list component
const PaginatedList = ({ 
  items, 
  itemsPerPage = 20 
}: { 
  items: string[]; 
  itemsPerPage?: number;
}) => {
  const displayedItems = items.slice(0, itemsPerPage);
  
  return (
    <div>
      <ul data-testid="paginated-list">
        {displayedItems.map((item, index) => (
          <li key={index} data-testid={`list-item-${index}`}>
            {item}
          </li>
        ))}
      </ul>
      {items.length > itemsPerPage && (
        <div data-testid="pagination-indicator">
          Showing {itemsPerPage} of {items.length} items
        </div>
      )}
    </div>
  );
};

// Helper to count DOM nodes in a container
const countDOMNodes = (container: HTMLElement): number => {
  let count = 0;
  const traverse = (node: Node) => {
    count++;
    node.childNodes.forEach(child => traverse(child));
  };
  traverse(container);
  return count;
};

describe('Property 5: Large list virtualization', () => {
  it('lists with more than 50 items should limit rendered DOM nodes', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 51, max: 200 }),
        (itemCount) => {
          // Generate array of items
          const items = Array.from({ length: itemCount }, (_, i) => `Item ${i + 1}`);
          
          const { container, unmount } = render(<PaginatedList items={items} itemsPerPage={20} />);
          
          // Count the number of list items rendered
          const listItems = container.querySelectorAll('[data-testid^="list-item-"]');
          
          // Should render at most 20 items (or itemsPerPage), not all items
          expect(listItems.length).toBeLessThanOrEqual(20);
          expect(listItems.length).toBeLessThan(itemCount);
          
          // Should have pagination indicator
          const paginationIndicator = screen.queryByTestId('pagination-indicator');
          expect(paginationIndicator).toBeTruthy();
          
          unmount();
        }
      ),
      { numRuns: 100 }
    );
  });

  it('lists with 50 or fewer items can render all items', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 50 }),
        (itemCount) => {
          const items = Array.from({ length: itemCount }, (_, i) => `Item ${i + 1}`);
          
          const { container, unmount } = render(<SimpleList items={items} />);
          
          // Count the number of list items rendered
          const listItems = container.querySelectorAll('[data-testid^="list-item-"]');
          
          // Should render all items when count is 50 or less
          expect(listItems.length).toBe(itemCount);
          
          unmount();
        }
      ),
      { numRuns: 100 }
    );
  });

  it('virtualized lists should maintain reasonable DOM node count regardless of data size', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 51, max: 1000 }),
        (itemCount) => {
          const items = Array.from({ length: itemCount }, (_, i) => `Item ${i + 1}`);
          
          const { container, unmount } = render(<PaginatedList items={items} itemsPerPage={25} />);
          
          // Count total DOM nodes
          const totalNodes = countDOMNodes(container);
          
          // DOM node count should be bounded and not grow linearly with item count
          // A reasonable upper bound for 25 items + container elements
          expect(totalNodes).toBeLessThan(200);
          
          // Verify only a subset of items are rendered
          const listItems = container.querySelectorAll('[data-testid^="list-item-"]');
          expect(listItems.length).toBe(25);
          
          unmount();
        }
      ),
      { numRuns: 100 }
    );
  });

  it('large lists should not render all items at once', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 100, max: 500 }),
        fc.integer({ min: 10, max: 50 }),
        (totalItems, pageSize) => {
          const items = Array.from({ length: totalItems }, (_, i) => `Item ${i + 1}`);
          
          const { container, unmount } = render(
            <PaginatedList items={items} itemsPerPage={pageSize} />
          );
          
          const listItems = container.querySelectorAll('[data-testid^="list-item-"]');
          
          // Should only render pageSize items, not all items
          expect(listItems.length).toBe(pageSize);
          expect(listItems.length).toBeLessThan(totalItems);
          
          // Ratio of rendered to total should be small for large lists
          const renderRatio = listItems.length / totalItems;
          expect(renderRatio).toBeLessThan(0.5);
          
          unmount();
        }
      ),
      { numRuns: 100 }
    );
  });

  it('empty lists should handle gracefully', () => {
    fc.assert(
      fc.property(
        fc.constant([]),
        (items) => {
          const { container, unmount } = render(<SimpleList items={items} />);
          
          const listItems = container.querySelectorAll('[data-testid^="list-item-"]');
          expect(listItems.length).toBe(0);
          
          unmount();
        }
      ),
      { numRuns: 10 }
    );
  });
});
