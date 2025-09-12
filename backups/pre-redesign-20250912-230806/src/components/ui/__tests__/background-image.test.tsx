import { describe, it, expect, vi } from 'vitest';
import { getBackgroundImage, preloadBackgroundImages, backgroundImages } from '../../../lib/background-images';

// Mock Image constructor for testing
const mockImage = {
  onload: null as (() => void) | null,
  onerror: null as (() => void) | null,
  src: '',
  loading: 'lazy' as 'eager' | 'lazy'
};

global.Image = vi.fn(() => mockImage) as any;

describe('Background Images', () => {
  describe('backgroundImages', () => {
    it('should have landing background images for all screen sizes', () => {
      expect(backgroundImages.landing).toBeDefined();
      expect(backgroundImages.landing.desktop).toBeDefined();
      expect(backgroundImages.landing.tablet).toBeDefined();
      expect(backgroundImages.landing.mobile).toBeDefined();
    });

    it('should have circuit background images', () => {
      expect(backgroundImages.circuit).toBeDefined();
      expect(backgroundImages.circuit.desktop).toBeDefined();
    });

    it('should use data URLs for images', () => {
      expect(backgroundImages.landing.desktop).toMatch(/^data:image\/svg\+xml/);
      expect(backgroundImages.landing.tablet).toMatch(/^data:image\/svg\+xml/);
      expect(backgroundImages.landing.mobile).toMatch(/^data:image\/svg\+xml/);
    });
  });

  describe('getBackgroundImage', () => {
    it('should return landing images by default', () => {
      const images = getBackgroundImage();
      expect(images).toBe(backgroundImages.landing);
    });

    it('should return specific image type when requested', () => {
      const circuitImages = getBackgroundImage('circuit');
      expect(circuitImages).toBe(backgroundImages.circuit);
    });

    it('should return landing images for unknown type', () => {
      const images = getBackgroundImage('unknown' as any);
      expect(images).toBe(backgroundImages.landing);
    });
  });

  describe('preloadBackgroundImages', () => {
    it('should create Image objects for all background images', () => {
      const imageSpy = vi.spyOn(global, 'Image');
      
      preloadBackgroundImages();
      
      // Should create images for landing (3) + circuit (1) = 4 images
      expect(imageSpy).toHaveBeenCalledTimes(4);
    });

    it('should set src for each image', () => {
      preloadBackgroundImages();
      
      // Check that mockImage.src was set (last call)
      expect(mockImage.src).toBeTruthy();
      expect(mockImage.src).toMatch(/^data:image\/svg\+xml/);
    });
  });

  describe('SVG content validation', () => {
    it('should have valid SVG structure in desktop image', () => {
      const desktopImage = backgroundImages.landing.desktop;
      const decodedSvg = decodeURIComponent(desktopImage.replace('data:image/svg+xml,', ''));
      
      expect(decodedSvg).toContain('<svg');
      expect(decodedSvg).toContain('</svg>');
      expect(decodedSvg).toContain('width="1920"');
      expect(decodedSvg).toContain('height="1080"');
    });

    it('should have gradients and patterns in desktop image', () => {
      const desktopImage = backgroundImages.landing.desktop;
      const decodedSvg = decodeURIComponent(desktopImage.replace('data:image/svg+xml,', ''));
      
      expect(decodedSvg).toContain('radialGradient');
      expect(decodedSvg).toContain('pattern');
      expect(decodedSvg).toContain('defs');
    });

    it('should have appropriate dimensions for different screen sizes', () => {
      const mobileImage = backgroundImages.landing.mobile;
      const tabletImage = backgroundImages.landing.tablet;
      const desktopImage = backgroundImages.landing.desktop;
      
      const decodedMobile = decodeURIComponent(mobileImage.replace('data:image/svg+xml,', ''));
      const decodedTablet = decodeURIComponent(tabletImage.replace('data:image/svg+xml,', ''));
      const decodedDesktop = decodeURIComponent(desktopImage.replace('data:image/svg+xml,', ''));
      
      expect(decodedMobile).toContain('width="375"');
      expect(decodedTablet).toContain('width="1024"');
      expect(decodedDesktop).toContain('width="1920"');
    });
  });
});