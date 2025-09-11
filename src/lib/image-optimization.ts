// Image optimization utilities for better performance

export interface ImageOptimizationOptions {
  quality?: number;
  format?: 'webp' | 'avif' | 'jpeg' | 'png';
  lazy?: boolean;
  priority?: boolean;
  sizes?: string;
}

// Check if browser supports modern image formats
export function supportsWebP(): boolean {
  if (typeof window === 'undefined') return false;
  
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  
  return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
}

export function supportsAVIF(): boolean {
  if (typeof window === 'undefined') return false;
  
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  
  return canvas.toDataURL('image/avif').indexOf('data:image/avif') === 0;
}

// Get optimal image format based on browser support
export function getOptimalImageFormat(): 'avif' | 'webp' | 'jpeg' {
  if (supportsAVIF()) return 'avif';
  if (supportsWebP()) return 'webp';
  return 'jpeg';
}

// Create responsive image sizes string
export function createResponsiveSizes(breakpoints: { [key: string]: number }): string {
  const sizes = Object.entries(breakpoints)
    .sort(([, a], [, b]) => b - a) // Sort by breakpoint size descending
    .map(([size, width]) => `(max-width: ${width}px) ${size}`)
    .join(', ');
  
  return sizes;
}

// Preload critical images with intersection observer
export function preloadImageWithIntersection(
  src: string, 
  options: { threshold?: number; rootMargin?: string } = {}
): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      resolve();
      return;
    }

    // Create a dummy element to observe
    const target = document.createElement('div');
    target.style.position = 'absolute';
    target.style.top = '0';
    target.style.left = '0';
    target.style.width = '1px';
    target.style.height = '1px';
    target.style.opacity = '0';
    target.style.pointerEvents = 'none';
    
    document.body.appendChild(target);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = new Image();
            img.onload = () => {
              observer.disconnect();
              document.body.removeChild(target);
              resolve();
            };
            img.onerror = () => {
              observer.disconnect();
              document.body.removeChild(target);
              reject(new Error(`Failed to load image: ${src}`));
            };
            img.src = src;
          }
        });
      },
      {
        threshold: options.threshold || 0.1,
        rootMargin: options.rootMargin || '50px'
      }
    );

    observer.observe(target);
  });
}

// Optimize image loading based on connection speed
export function getImageLoadingStrategy(): 'eager' | 'lazy' {
  if (typeof navigator === 'undefined') return 'lazy';
  
  // Check for slow connection
  const connection = (navigator as any).connection;
  if (connection) {
    const slowConnections = ['slow-2g', '2g', '3g'];
    if (slowConnections.includes(connection.effectiveType)) {
      return 'lazy';
    }
  }
  
  return 'eager';
}

// Create optimized image URL (for future use with image CDN)
export function createOptimizedImageUrl(
  baseUrl: string, 
  options: ImageOptimizationOptions = {}
): string {
  const params = new URLSearchParams();
  
  if (options.quality) {
    params.append('q', options.quality.toString());
  }
  
  if (options.format) {
    params.append('f', options.format);
  }
  
  const queryString = params.toString();
  return queryString ? `${baseUrl}?${queryString}` : baseUrl;
}

// Measure image loading performance
export function measureImageLoadTime(src: string): Promise<number> {
  return new Promise((resolve, reject) => {
    const startTime = performance.now();
    const img = new Image();
    
    img.onload = () => {
      const loadTime = performance.now() - startTime;
      resolve(loadTime);
    };
    
    img.onerror = () => {
      reject(new Error(`Failed to load image: ${src}`));
    };
    
    img.src = src;
  });
}