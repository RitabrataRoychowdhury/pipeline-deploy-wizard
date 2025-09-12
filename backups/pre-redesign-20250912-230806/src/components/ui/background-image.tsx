import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { getImageLoadingStrategy } from '@/lib/image-optimization';

interface BackgroundImageProps {
  src: string;
  alt: string;
  className?: string;
  overlayClassName?: string;
  children?: React.ReactNode;
  priority?: boolean;
}

export function BackgroundImage({
  src,
  alt,
  className,
  overlayClassName,
  children,
  priority = false
}: BackgroundImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const img = new Image();
    
    // Preload the image
    img.onload = () => {
      setIsLoaded(true);
    };
    
    img.onerror = () => {
      setHasError(true);
    };
    
    img.src = src;
    
    // Set loading strategy based on priority and connection
    if (priority) {
      img.loading = 'eager';
    } else {
      img.loading = getImageLoadingStrategy();
    }
  }, [src, priority]);

  return (
    <div className={cn("relative overflow-hidden", className)}>
      {/* Background Image */}
      <div
        className={cn(
          "absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-700",
          isLoaded ? "opacity-100" : "opacity-0",
          hasError && "bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900"
        )}
        style={{
          backgroundImage: !hasError ? `url(${src})` : undefined,
        }}
        role="img"
        aria-label={alt}
        aria-hidden="true"
      />
      
      {/* Fallback gradient if image fails to load */}
      {hasError && (
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900" />
      )}
      
      {/* Overlay */}
      <div
        className={cn(
          "absolute inset-0 bg-gradient-to-br from-slate-900/80 via-blue-900/60 to-slate-900/80",
          overlayClassName
        )}
      />
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}

// Responsive image component for different screen sizes
interface ResponsiveBackgroundImageProps {
  images: {
    mobile: string;
    tablet: string;
    desktop: string;
  };
  alt: string;
  className?: string;
  overlayClassName?: string;
  children?: React.ReactNode;
  priority?: boolean;
}

export function ResponsiveBackgroundImage({
  images,
  alt,
  className,
  overlayClassName,
  children,
  priority = false
}: ResponsiveBackgroundImageProps) {
  const [currentImage, setCurrentImage] = useState(images.desktop);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const updateImage = () => {
      const width = window.innerWidth;
      if (width < 768) {
        setCurrentImage(images.mobile);
      } else if (width < 1024) {
        setCurrentImage(images.tablet);
      } else {
        setCurrentImage(images.desktop);
      }
    };

    updateImage();
    window.addEventListener('resize', updateImage);
    return () => window.removeEventListener('resize', updateImage);
  }, [images]);

  useEffect(() => {
    setIsLoaded(false);
    setHasError(false);
    
    const img = new Image();
    
    img.onload = () => {
      setIsLoaded(true);
    };
    
    img.onerror = () => {
      setHasError(true);
    };
    
    img.src = currentImage;
    
    if (priority) {
      img.loading = 'eager';
    } else {
      img.loading = getImageLoadingStrategy();
    }
  }, [currentImage, priority]);

  return (
    <div className={cn("relative overflow-hidden", className)}>
      {/* Background Image */}
      <div
        className={cn(
          "absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-700",
          isLoaded ? "opacity-100" : "opacity-0",
          hasError && "bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900"
        )}
        style={{
          backgroundImage: !hasError ? `url(${currentImage})` : undefined,
        }}
        role="img"
        aria-label={alt}
        aria-hidden="true"
      />
      
      {/* Fallback gradient if image fails to load */}
      {hasError && (
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900" />
      )}
      
      {/* Overlay for better text readability */}
      <div
        className={cn(
          "absolute inset-0 bg-gradient-to-br from-slate-900/85 via-blue-900/70 to-slate-900/85",
          overlayClassName
        )}
      />
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}