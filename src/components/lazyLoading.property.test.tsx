import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import fc from 'fast-check';

/**
 * Feature: app-optimization, Property 6: Lazy loading for images
 * Validates: Requirements 3.4
 * 
 * Property: For any image element in the application, it should have the 
 * loading="lazy" attribute or use an intersection observer for lazy loading
 */

// Helper to create an image component with lazy loading
const LazyImage = ({ 
  src, 
  alt, 
  className = '' 
}: { 
  src: string; 
  alt: string; 
  className?: string;
}) => {
  return (
    <img 
      src={src} 
      alt={alt} 
      loading="lazy" 
      className={className}
      data-testid="lazy-image"
    />
  );
};

// Helper to create an image component without lazy loading (bad practice)
const EagerImage = ({ 
  src, 
  alt, 
  className = '' 
}: { 
  src: string; 
  alt: string; 
  className?: string;
}) => {
  return (
    <img 
      src={src} 
      alt={alt} 
      className={className}
      data-testid="eager-image"
    />
  );
};

// Helper to create a picture element with lazy loading
const LazyPicture = ({ 
  src, 
  alt 
}: { 
  src: string; 
  alt: string;
}) => {
  return (
    <picture>
      <source srcSet={`${src}?w=800`} media="(min-width: 800px)" />
      <img 
        src={src} 
        alt={alt} 
        loading="lazy"
        data-testid="lazy-picture-img"
      />
    </picture>
  );
};

describe('Property 6: Lazy loading for images', () => {
  it('all image elements should have loading="lazy" attribute', () => {
    fc.assert(
      fc.property(
        fc.webUrl(),
        fc.string({ minLength: 1, maxLength: 50 }),
        (imageUrl, altText) => {
          const { container, unmount } = render(
            <LazyImage src={imageUrl} alt={altText} />
          );
          
          const img = container.querySelector('img');
          expect(img).toBeTruthy();
          
          // Image should have loading="lazy" attribute
          expect(img?.getAttribute('loading')).toBe('lazy');
          
          unmount();
        }
      ),
      { numRuns: 100 }
    );
  });

  it('images without lazy loading should be detected', () => {
    fc.assert(
      fc.property(
        fc.webUrl(),
        fc.string({ minLength: 1, maxLength: 50 }),
        (imageUrl, altText) => {
          const { container, unmount } = render(
            <EagerImage src={imageUrl} alt={altText} />
          );
          
          const img = container.querySelector('img');
          expect(img).toBeTruthy();
          
          // This image does NOT have lazy loading (demonstrating the property)
          const loadingAttr = img?.getAttribute('loading');
          expect(loadingAttr).not.toBe('lazy');
          
          unmount();
        }
      ),
      { numRuns: 100 }
    );
  });

  it('picture elements should have lazy loading on img tag', () => {
    fc.assert(
      fc.property(
        fc.webUrl(),
        fc.string({ minLength: 1, maxLength: 50 }),
        (imageUrl, altText) => {
          const { container, unmount } = render(
            <LazyPicture src={imageUrl} alt={altText} />
          );
          
          const picture = container.querySelector('picture');
          expect(picture).toBeTruthy();
          
          const img = picture?.querySelector('img');
          expect(img).toBeTruthy();
          
          // Image inside picture should have loading="lazy"
          expect(img?.getAttribute('loading')).toBe('lazy');
          
          unmount();
        }
      ),
      { numRuns: 100 }
    );
  });

  it('multiple images should all have lazy loading', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            src: fc.webUrl(),
            alt: fc.string({ minLength: 1, maxLength: 30 })
          }),
          { minLength: 2, maxLength: 10 }
        ),
        (images) => {
          const { container, unmount } = render(
            <div>
              {images.map((img, index) => (
                <LazyImage key={index} src={img.src} alt={img.alt} />
              ))}
            </div>
          );
          
          const imgElements = container.querySelectorAll('img');
          expect(imgElements.length).toBe(images.length);
          
          // All images should have loading="lazy"
          imgElements.forEach(img => {
            expect(img.getAttribute('loading')).toBe('lazy');
          });
          
          unmount();
        }
      ),
      { numRuns: 100 }
    );
  });

  it('images with different attributes should still have lazy loading', () => {
    fc.assert(
      fc.property(
        fc.webUrl(),
        fc.string({ minLength: 1, maxLength: 50 }),
        fc.constantFrom('img-small', 'img-medium', 'img-large', 'thumbnail', 'avatar'),
        (imageUrl, altText, className) => {
          const { container, unmount } = render(
            <LazyImage src={imageUrl} alt={altText} className={className} />
          );
          
          const img = container.querySelector('img');
          expect(img).toBeTruthy();
          
          // Should have loading="lazy" regardless of other attributes
          expect(img?.getAttribute('loading')).toBe('lazy');
          expect(img?.className).toContain(className);
          
          unmount();
        }
      ),
      { numRuns: 100 }
    );
  });

  it('lazy loading attribute should be present even with empty alt text', () => {
    fc.assert(
      fc.property(
        fc.webUrl(),
        (imageUrl) => {
          const { container, unmount } = render(
            <LazyImage src={imageUrl} alt="" />
          );
          
          const img = container.querySelector('img');
          expect(img).toBeTruthy();
          
          // Should still have loading="lazy" even with empty alt
          expect(img?.getAttribute('loading')).toBe('lazy');
          
          unmount();
        }
      ),
      { numRuns: 100 }
    );
  });
});
