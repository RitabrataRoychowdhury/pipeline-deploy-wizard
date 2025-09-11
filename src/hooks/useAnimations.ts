import { useEffect, useState } from 'react';
import { animationClasses, animationStyles, prefersReducedMotion } from '../lib/animations';

/**
 * Hook for managing animations throughout the application
 * Respects user's reduced motion preferences
 */
export const useAnimations = () => {
  const [isReducedMotion, setIsReducedMotion] = useState(false);

  useEffect(() => {
    // Check initial preference
    setIsReducedMotion(prefersReducedMotion());

    // Listen for changes in motion preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handleChange = (e: MediaQueryListEvent) => {
      setIsReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const getAnimationClass = (animationType: keyof typeof animationClasses) => {
    return isReducedMotion ? '' : animationClasses[animationType];
  };

  const getAnimationStyle = (animationType: keyof typeof animationStyles) => {
    return isReducedMotion ? {} : animationStyles[animationType];
  };

  const animateElement = (
    element: HTMLElement,
    animation: keyof typeof animationStyles,
    onComplete?: () => void
  ) => {
    if (isReducedMotion) {
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

  return {
    isEnabled: !isReducedMotion,
    isReducedMotion,
    classes: animationClasses,
    styles: animationStyles,
    getClass: getAnimationClass,
    getStyle: getAnimationStyle,
    animate: animateElement,
  };
};