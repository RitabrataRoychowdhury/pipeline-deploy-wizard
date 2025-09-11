/**
 * Performance-optimized animation utilities
 * Provides consistent animations across the application with GPU acceleration
 */

export interface AnimationConfig {
  duration: number;
  easing: string;
  delay?: number;
  enabled: boolean;
}

export interface UIAnimations {
  microInteractions: AnimationConfig;
  pageTransitions: AnimationConfig;
  modalAnimations: AnimationConfig;
  dragFeedback: AnimationConfig;
}

// Default animation configurations
export const defaultAnimations: UIAnimations = {
  microInteractions: {
    duration: 200,
    easing: 'ease-out',
    enabled: true,
  },
  pageTransitions: {
    duration: 300,
    easing: 'ease-in-out',
    enabled: true,
  },
  modalAnimations: {
    duration: 250,
    easing: 'ease-out',
    enabled: true,
  },
  dragFeedback: {
    duration: 0,
    easing: 'linear',
    enabled: true,
  },
};

// Check for reduced motion preference
export const prefersReducedMotion = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

// Animation class names for Tailwind CSS
export const animationClasses = {
  // Micro-interactions
  buttonHover: 'transition-all duration-200 ease-out hover:scale-105 hover:shadow-md',
  buttonClick: 'active:scale-95 active:transition-transform active:duration-75',
  cardHover: 'transition-all duration-200 ease-out hover:shadow-lg hover:-translate-y-1',
  inputFocus: 'transition-all duration-200 ease-out focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
  
  // Page transitions
  pageEnter: 'animate-in fade-in slide-in-from-right-4 duration-300',
  pageExit: 'animate-out fade-out slide-out-to-left-4 duration-300',
  
  // Modal animations
  modalEnter: 'animate-in fade-in zoom-in-95 duration-250',
  modalExit: 'animate-out fade-out zoom-out-95 duration-250',
  overlayEnter: 'animate-in fade-in duration-250',
  overlayExit: 'animate-out fade-out duration-250',
  
  // Drag feedback
  dragStart: 'transition-transform duration-0 will-change-transform',
  dragActive: 'scale-105 rotate-2 shadow-xl z-50',
  dragEnd: 'transition-all duration-200 ease-out',
};

// CSS-in-JS animation styles for complex animations
export const animationStyles = {
  slideInRight: {
    transform: 'translateX(100%)',
    animation: 'slideInRight 0.3s ease-out forwards',
  },
  slideOutLeft: {
    transform: 'translateX(-100%)',
    animation: 'slideOutLeft 0.3s ease-out forwards',
  },
  fadeInScale: {
    opacity: 0,
    transform: 'scale(0.95)',
    animation: 'fadeInScale 0.25s ease-out forwards',
  },
  fadeOutScale: {
    opacity: 1,
    transform: 'scale(1)',
    animation: 'fadeOutScale 0.25s ease-out forwards',
  },
};

// Keyframe definitions to be added to CSS
export const keyframes = `
@keyframes slideInRight {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes slideOutLeft {
  from {
    transform: translateX(0);
    opacity: 1;
  }
  to {
    transform: translateX(-100%);
    opacity: 0;
  }
}

@keyframes fadeInScale {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes fadeOutScale {
  from {
    opacity: 1;
    transform: scale(1);
  }
  to {
    opacity: 0;
    transform: scale(0.95);
  }
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

@keyframes bounce {
  0%, 20%, 53%, 80%, 100% {
    transform: translate3d(0, 0, 0);
  }
  40%, 43% {
    transform: translate3d(0, -30px, 0);
  }
  70% {
    transform: translate3d(0, -15px, 0);
  }
  90% {
    transform: translate3d(0, -4px, 0);
  }
}
`;

// Utility functions for programmatic animations
export const animateElement = (
  element: HTMLElement,
  animation: keyof typeof animationStyles,
  onComplete?: () => void
) => {
  if (prefersReducedMotion()) {
    onComplete?.();
    return;
  }

  const style = animationStyles[animation];
  Object.assign(element.style, style);

  const handleAnimationEnd = () => {
    element.removeEventListener('animationend', handleAnimationEnd);
    onComplete?.();
  };

  element.addEventListener('animationend', handleAnimationEnd);
};

// Hook for managing animation state
export const useAnimations = () => {
  const isReducedMotion = prefersReducedMotion();
  
  return {
    isEnabled: !isReducedMotion,
    classes: animationClasses,
    styles: animationStyles,
    animate: animateElement,
  };
};