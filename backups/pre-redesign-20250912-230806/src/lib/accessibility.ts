// Accessibility utilities for better user experience

export interface AccessibilityOptions {
  respectReducedMotion?: boolean;
  highContrast?: boolean;
  largeText?: boolean;
  screenReaderOptimized?: boolean;
}

// Check user preferences
export const getUserPreferences = (): AccessibilityOptions => {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const prefersHighContrast = window.matchMedia('(prefers-contrast: high)').matches;
  const prefersLargeText = window.matchMedia('(prefers-reduced-data: reduce)').matches;
  
  return {
    respectReducedMotion: prefersReducedMotion,
    highContrast: prefersHighContrast,
    largeText: prefersLargeText,
    screenReaderOptimized: false, // This would be set based on user settings
  };
};

// Focus management utilities
export const focusManagement = {
  // Trap focus within an element
  trapFocus: (element: HTMLElement) => {
    const focusableElements = element.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            lastElement.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === lastElement) {
            firstElement.focus();
            e.preventDefault();
          }
        }
      }
    };

    element.addEventListener('keydown', handleTabKey);
    firstElement?.focus();

    return () => {
      element.removeEventListener('keydown', handleTabKey);
    };
  },

  // Restore focus to previous element
  restoreFocus: (previousElement: HTMLElement | null) => {
    if (previousElement && document.contains(previousElement)) {
      previousElement.focus();
    }
  },

  // Get next focusable element
  getNextFocusableElement: (currentElement: HTMLElement, direction: 'next' | 'previous' = 'next') => {
    const focusableElements = Array.from(
      document.querySelectorAll(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )
    ) as HTMLElement[];

    const currentIndex = focusableElements.indexOf(currentElement);
    if (currentIndex === -1) return null;

    const nextIndex = direction === 'next' 
      ? (currentIndex + 1) % focusableElements.length
      : (currentIndex - 1 + focusableElements.length) % focusableElements.length;

    return focusableElements[nextIndex];
  }
};

// Keyboard navigation utilities
export const keyboardNavigation = {
  // Handle arrow key navigation
  handleArrowKeys: (
    event: KeyboardEvent,
    elements: HTMLElement[],
    currentIndex: number,
    onIndexChange: (newIndex: number) => void
  ) => {
    switch (event.key) {
      case 'ArrowDown':
      case 'ArrowRight':
        event.preventDefault();
        const nextIndex = (currentIndex + 1) % elements.length;
        onIndexChange(nextIndex);
        elements[nextIndex]?.focus();
        break;
      case 'ArrowUp':
      case 'ArrowLeft':
        event.preventDefault();
        const prevIndex = (currentIndex - 1 + elements.length) % elements.length;
        onIndexChange(prevIndex);
        elements[prevIndex]?.focus();
        break;
      case 'Home':
        event.preventDefault();
        onIndexChange(0);
        elements[0]?.focus();
        break;
      case 'End':
        event.preventDefault();
        const lastIndex = elements.length - 1;
        onIndexChange(lastIndex);
        elements[lastIndex]?.focus();
        break;
    }
  },

  // Handle escape key
  handleEscape: (callback: () => void) => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        callback();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }
};

// Screen reader utilities
export const screenReader = {
  // Announce message to screen readers
  announce: (message: string, priority: 'polite' | 'assertive' = 'polite') => {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', priority);
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;

    document.body.appendChild(announcement);

    // Remove after announcement
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  },

  // Create accessible description
  createDescription: (id: string, text: string) => {
    const existing = document.getElementById(id);
    if (existing) {
      existing.textContent = text;
      return id;
    }

    const description = document.createElement('div');
    description.id = id;
    description.className = 'sr-only';
    description.textContent = text;
    document.body.appendChild(description);

    return id;
  },

  // Remove accessible description
  removeDescription: (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      document.body.removeChild(element);
    }
  }
};

// Color contrast utilities
export const colorContrast = {
  // Calculate contrast ratio between two colors
  getContrastRatio: (color1: string, color2: string): number => {
    const getLuminance = (color: string): number => {
      // Convert hex to RGB
      const hex = color.replace('#', '');
      const r = parseInt(hex.substr(0, 2), 16) / 255;
      const g = parseInt(hex.substr(2, 2), 16) / 255;
      const b = parseInt(hex.substr(4, 2), 16) / 255;

      // Calculate relative luminance
      const sRGB = [r, g, b].map(c => {
        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
      });

      return 0.2126 * sRGB[0] + 0.7152 * sRGB[1] + 0.0722 * sRGB[2];
    };

    const lum1 = getLuminance(color1);
    const lum2 = getLuminance(color2);
    const brightest = Math.max(lum1, lum2);
    const darkest = Math.min(lum1, lum2);

    return (brightest + 0.05) / (darkest + 0.05);
  },

  // Check if contrast meets WCAG standards
  meetsWCAG: (color1: string, color2: string, level: 'AA' | 'AAA' = 'AA'): boolean => {
    const ratio = colorContrast.getContrastRatio(color1, color2);
    return level === 'AA' ? ratio >= 4.5 : ratio >= 7;
  }
};

// Animation utilities that respect user preferences
export const accessibleAnimation = {
  // Get animation duration based on user preferences
  getDuration: (defaultDuration: number): number => {
    const preferences = getUserPreferences();
    return preferences.respectReducedMotion ? 0 : defaultDuration;
  },

  // Create CSS transition that respects reduced motion
  createTransition: (property: string, duration: number, easing = 'ease'): string => {
    const actualDuration = accessibleAnimation.getDuration(duration);
    return actualDuration > 0 ? `${property} ${actualDuration}ms ${easing}` : 'none';
  },

  // Apply reduced motion styles
  applyReducedMotion: () => {
    const preferences = getUserPreferences();
    if (preferences.respectReducedMotion) {
      const style = document.createElement('style');
      style.textContent = `
        *, *::before, *::after {
          animation-duration: 0.01ms !important;
          animation-iteration-count: 1 !important;
          transition-duration: 0.01ms !important;
          scroll-behavior: auto !important;
        }
      `;
      document.head.appendChild(style);
    }
  }
};

// Form accessibility utilities
export const formAccessibility = {
  // Associate label with input
  associateLabel: (input: HTMLInputElement, label: HTMLLabelElement) => {
    const id = input.id || `input-${Date.now()}`;
    input.id = id;
    label.setAttribute('for', id);
  },

  // Add error message to input
  addErrorMessage: (input: HTMLInputElement, message: string) => {
    const errorId = `${input.id}-error`;
    let errorElement = document.getElementById(errorId);

    if (!errorElement) {
      errorElement = document.createElement('div');
      errorElement.id = errorId;
      errorElement.className = 'error-message';
      errorElement.setAttribute('role', 'alert');
      input.parentNode?.insertBefore(errorElement, input.nextSibling);
    }

    errorElement.textContent = message;
    input.setAttribute('aria-describedby', errorId);
    input.setAttribute('aria-invalid', 'true');
  },

  // Remove error message from input
  removeErrorMessage: (input: HTMLInputElement) => {
    const errorId = `${input.id}-error`;
    const errorElement = document.getElementById(errorId);
    
    if (errorElement) {
      errorElement.remove();
    }
    
    input.removeAttribute('aria-describedby');
    input.removeAttribute('aria-invalid');
  }
};

// High contrast mode utilities
export const highContrast = {
  // Apply high contrast styles
  apply: () => {
    document.documentElement.classList.add('high-contrast');
  },

  // Remove high contrast styles
  remove: () => {
    document.documentElement.classList.remove('high-contrast');
  },

  // Toggle high contrast mode
  toggle: () => {
    document.documentElement.classList.toggle('high-contrast');
  }
};

// Text scaling utilities
export const textScaling = {
  // Apply large text styles
  applyLargeText: () => {
    document.documentElement.classList.add('large-text');
  },

  // Remove large text styles
  removeLargeText: () => {
    document.documentElement.classList.remove('large-text');
  },

  // Set text scale
  setScale: (scale: number) => {
    document.documentElement.style.fontSize = `${scale * 100}%`;
  }
};

// Accessibility testing utilities
export const accessibilityTest = {
  // Check for missing alt text
  checkAltText: (): string[] => {
    const images = document.querySelectorAll('img');
    const issues: string[] = [];

    images.forEach((img, index) => {
      if (!img.alt && !img.getAttribute('aria-label')) {
        issues.push(`Image ${index + 1} is missing alt text`);
      }
    });

    return issues;
  },

  // Check for proper heading hierarchy
  checkHeadingHierarchy: (): string[] => {
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    const issues: string[] = [];
    let previousLevel = 0;

    headings.forEach((heading, index) => {
      const level = parseInt(heading.tagName.charAt(1));
      
      if (index === 0 && level !== 1) {
        issues.push('Page should start with h1');
      }
      
      if (level > previousLevel + 1) {
        issues.push(`Heading level jumps from h${previousLevel} to h${level}`);
      }
      
      previousLevel = level;
    });

    return issues;
  },

  // Check for keyboard accessibility
  checkKeyboardAccess: (): string[] => {
    const interactive = document.querySelectorAll('button, a, input, select, textarea');
    const issues: string[] = [];

    interactive.forEach((element, index) => {
      const tabIndex = element.getAttribute('tabindex');
      if (tabIndex && parseInt(tabIndex) < 0 && element.tagName !== 'A') {
        issues.push(`Interactive element ${index + 1} is not keyboard accessible`);
      }
    });

    return issues;
  }
};

// Initialize accessibility features
export const initializeAccessibility = () => {
  const preferences = getUserPreferences();
  
  if (preferences.respectReducedMotion) {
    accessibleAnimation.applyReducedMotion();
  }
  
  if (preferences.highContrast) {
    highContrast.apply();
  }
  
  if (preferences.largeText) {
    textScaling.applyLargeText();
  }
};

// Export all utilities
export default {
  getUserPreferences,
  focusManagement,
  keyboardNavigation,
  screenReader,
  colorContrast,
  accessibleAnimation,
  formAccessibility,
  highContrast,
  textScaling,
  accessibilityTest,
  initializeAccessibility
};