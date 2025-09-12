import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { prefersReducedMotion, animationClasses, animationStyles, animateElement } from '../animations';

// Mock window.matchMedia
const mockMatchMedia = vi.fn();

beforeEach(() => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: mockMatchMedia,
  });
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('Animation System', () => {
  describe('prefersReducedMotion', () => {
    it('should return false when reduced motion is not preferred', () => {
      mockMatchMedia.mockReturnValue({
        matches: false,
      });

      expect(prefersReducedMotion()).toBe(false);
    });

    it('should return true when reduced motion is preferred', () => {
      mockMatchMedia.mockReturnValue({
        matches: true,
      });

      expect(prefersReducedMotion()).toBe(true);
    });

    it('should return false when window is undefined (SSR)', () => {
      const originalWindow = global.window;
      // @ts-ignore
      delete global.window;

      expect(prefersReducedMotion()).toBe(false);

      global.window = originalWindow;
    });
  });

  describe('animationClasses', () => {
    it('should have all required animation classes', () => {
      expect(animationClasses).toHaveProperty('buttonHover');
      expect(animationClasses).toHaveProperty('buttonClick');
      expect(animationClasses).toHaveProperty('cardHover');
      expect(animationClasses).toHaveProperty('inputFocus');
      expect(animationClasses).toHaveProperty('pageEnter');
      expect(animationClasses).toHaveProperty('pageExit');
      expect(animationClasses).toHaveProperty('modalEnter');
      expect(animationClasses).toHaveProperty('modalExit');
      expect(animationClasses).toHaveProperty('dragStart');
      expect(animationClasses).toHaveProperty('dragActive');
      expect(animationClasses).toHaveProperty('dragEnd');
    });

    it('should contain proper Tailwind classes', () => {
      expect(animationClasses.buttonHover).toContain('transition-all');
      expect(animationClasses.buttonHover).toContain('duration-200');
      expect(animationClasses.buttonHover).toContain('ease-out');
      expect(animationClasses.buttonHover).toContain('hover:scale-105');
      expect(animationClasses.buttonHover).toContain('hover:shadow-md');
    });

    it('should have performance optimizations', () => {
      expect(animationClasses.dragStart).toContain('will-change-transform');
      expect(animationClasses.buttonClick).toContain('active:duration-75');
    });
  });

  describe('animationStyles', () => {
    it('should have all required animation styles', () => {
      expect(animationStyles).toHaveProperty('slideInRight');
      expect(animationStyles).toHaveProperty('slideOutLeft');
      expect(animationStyles).toHaveProperty('fadeInScale');
      expect(animationStyles).toHaveProperty('fadeOutScale');
    });

    it('should contain proper CSS properties', () => {
      expect(animationStyles.slideInRight).toHaveProperty('transform');
      expect(animationStyles.slideInRight).toHaveProperty('animation');
      expect(animationStyles.fadeInScale).toHaveProperty('opacity');
      expect(animationStyles.fadeInScale).toHaveProperty('transform');
    });
  });

  describe('animateElement', () => {
    let mockElement: HTMLElement;
    let mockOnComplete: vi.Mock;

    beforeEach(() => {
      mockElement = {
        style: {},
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      } as unknown as HTMLElement;
      mockOnComplete = vi.fn();
    });

    it('should apply animation styles to element', () => {
      mockMatchMedia.mockReturnValue({ matches: false });

      animateElement(mockElement, 'fadeInScale', mockOnComplete);

      expect(mockElement.style).toMatchObject(animationStyles.fadeInScale);
      expect(mockElement.addEventListener).toHaveBeenCalledWith('animationend', expect.any(Function));
    });

    it('should call onComplete immediately when reduced motion is preferred', () => {
      mockMatchMedia.mockReturnValue({ matches: true });

      animateElement(mockElement, 'fadeInScale', mockOnComplete);

      expect(mockOnComplete).toHaveBeenCalled();
      expect(mockElement.addEventListener).not.toHaveBeenCalled();
    });

    it('should handle animation end event', () => {
      mockMatchMedia.mockReturnValue({ matches: false });
      let animationEndHandler: () => void;

      (mockElement.addEventListener as vi.Mock).mockImplementation((event, handler) => {
        if (event === 'animationend') {
          animationEndHandler = handler;
        }
      });

      animateElement(mockElement, 'fadeInScale', mockOnComplete);

      // Simulate animation end
      animationEndHandler!();

      expect(mockElement.removeEventListener).toHaveBeenCalledWith('animationend', animationEndHandler);
      expect(mockOnComplete).toHaveBeenCalled();
    });

    it('should work without onComplete callback', () => {
      mockMatchMedia.mockReturnValue({ matches: false });

      expect(() => {
        animateElement(mockElement, 'fadeInScale');
      }).not.toThrow();
    });
  });
});