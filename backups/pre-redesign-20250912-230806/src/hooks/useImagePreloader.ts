import { useState, useEffect } from 'react';

interface UseImagePreloaderOptions {
  priority?: boolean;
  onLoad?: () => void;
  onError?: () => void;
}

export function useImagePreloader(src: string, options: UseImagePreloaderOptions = {}) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!src) {
      setIsLoading(false);
      setHasError(true);
      return;
    }

    setIsLoading(true);
    setIsLoaded(false);
    setHasError(false);

    const img = new Image();
    
    img.onload = () => {
      setIsLoaded(true);
      setIsLoading(false);
      options.onLoad?.();
    };
    
    img.onerror = () => {
      setHasError(true);
      setIsLoading(false);
      options.onError?.();
    };
    
    // Set loading priority
    if (options.priority) {
      img.loading = 'eager';
    }
    
    img.src = src;

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [src, options.priority]);

  return { isLoaded, hasError, isLoading };
}

// Hook for preloading multiple images
export function useMultipleImagePreloader(sources: string[], options: UseImagePreloaderOptions = {}) {
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());
  const [errorImages, setErrorImages] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!sources.length) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setLoadedImages(new Set());
    setErrorImages(new Set());

    let loadedCount = 0;
    let errorCount = 0;

    const checkComplete = () => {
      if (loadedCount + errorCount === sources.length) {
        setIsLoading(false);
        if (loadedCount > 0) {
          options.onLoad?.();
        }
        if (errorCount === sources.length) {
          options.onError?.();
        }
      }
    };

    sources.forEach((src) => {
      const img = new Image();
      
      img.onload = () => {
        loadedCount++;
        setLoadedImages(prev => new Set(prev).add(src));
        checkComplete();
      };
      
      img.onerror = () => {
        errorCount++;
        setErrorImages(prev => new Set(prev).add(src));
        checkComplete();
      };
      
      if (options.priority) {
        img.loading = 'eager';
      }
      
      img.src = src;
    });
  }, [sources, options.priority]);

  return {
    loadedImages,
    errorImages,
    isLoading,
    allLoaded: loadedImages.size === sources.length,
    hasErrors: errorImages.size > 0
  };
}