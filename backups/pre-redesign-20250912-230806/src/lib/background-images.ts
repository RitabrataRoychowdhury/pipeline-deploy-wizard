// Professional background images for the landing page
// Using high-quality gradients and patterns that work well with the CI/CD theme

export const backgroundImages = {
  // Main landing page background - sophisticated tech pattern
  landing: {
    desktop: `data:image/svg+xml,${encodeURIComponent(`
      <svg width="1920" height="1080" viewBox="0 0 1920 1080" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="bg1" cx="0.3" cy="0.2" r="0.8">
            <stop offset="0%" stop-color="#1e293b"/>
            <stop offset="50%" stop-color="#0f172a"/>
            <stop offset="100%" stop-color="#020617"/>
          </radialGradient>
          <radialGradient id="bg2" cx="0.7" cy="0.8" r="0.6">
            <stop offset="0%" stop-color="#1e40af"/>
            <stop offset="70%" stop-color="#0f172a"/>
            <stop offset="100%" stop-color="#020617"/>
          </radialGradient>
          <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
            <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#334155" stroke-width="0.5" opacity="0.3"/>
          </pattern>
          <pattern id="dots" width="40" height="40" patternUnits="userSpaceOnUse">
            <circle cx="20" cy="20" r="1" fill="#475569" opacity="0.4"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#bg1)"/>
        <rect width="100%" height="100%" fill="url(#bg2)" opacity="0.7"/>
        <rect width="100%" height="100%" fill="url(#grid)"/>
        <rect width="100%" height="100%" fill="url(#dots)"/>
        <!-- Floating geometric shapes for tech feel -->
        <circle cx="300" cy="200" r="80" fill="#1e40af" opacity="0.1"/>
        <circle cx="1600" cy="300" r="120" fill="#7c3aed" opacity="0.08"/>
        <circle cx="800" cy="800" r="100" fill="#0ea5e9" opacity="0.1"/>
        <rect x="1400" y="700" width="60" height="60" fill="#06b6d4" opacity="0.08" transform="rotate(45 1430 730)"/>
        <rect x="200" y="600" width="40" height="40" fill="#8b5cf6" opacity="0.1" transform="rotate(30 220 620)"/>
      </svg>
    `)}`,
    tablet: `data:image/svg+xml,${encodeURIComponent(`
      <svg width="1024" height="768" viewBox="0 0 1024 768" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="bg1" cx="0.3" cy="0.2" r="0.8">
            <stop offset="0%" stop-color="#1e293b"/>
            <stop offset="50%" stop-color="#0f172a"/>
            <stop offset="100%" stop-color="#020617"/>
          </radialGradient>
          <radialGradient id="bg2" cx="0.7" cy="0.8" r="0.6">
            <stop offset="0%" stop-color="#1e40af"/>
            <stop offset="70%" stop-color="#0f172a"/>
            <stop offset="100%" stop-color="#020617"/>
          </radialGradient>
          <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
            <path d="M 50 0 L 0 0 0 50" fill="none" stroke="#334155" stroke-width="0.5" opacity="0.3"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#bg1)"/>
        <rect width="100%" height="100%" fill="url(#bg2)" opacity="0.7"/>
        <rect width="100%" height="100%" fill="url(#grid)"/>
        <circle cx="200" cy="150" r="60" fill="#1e40af" opacity="0.1"/>
        <circle cx="800" cy="200" r="80" fill="#7c3aed" opacity="0.08"/>
        <circle cx="400" cy="500" r="70" fill="#0ea5e9" opacity="0.1"/>
      </svg>
    `)}`,
    mobile: `data:image/svg+xml,${encodeURIComponent(`
      <svg width="375" height="667" viewBox="0 0 375 667" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="bg1" cx="0.3" cy="0.2" r="0.8">
            <stop offset="0%" stop-color="#1e293b"/>
            <stop offset="50%" stop-color="#0f172a"/>
            <stop offset="100%" stop-color="#020617"/>
          </radialGradient>
          <radialGradient id="bg2" cx="0.7" cy="0.8" r="0.6">
            <stop offset="0%" stop-color="#1e40af"/>
            <stop offset="70%" stop-color="#0f172a"/>
            <stop offset="100%" stop-color="#020617"/>
          </radialGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#bg1)"/>
        <rect width="100%" height="100%" fill="url(#bg2)" opacity="0.7"/>
        <circle cx="100" cy="100" r="40" fill="#1e40af" opacity="0.1"/>
        <circle cx="300" cy="300" r="50" fill="#7c3aed" opacity="0.08"/>
        <circle cx="150" cy="500" r="45" fill="#0ea5e9" opacity="0.1"/>
      </svg>
    `)}`
  },
  
  // Alternative background with circuit board pattern
  circuit: {
    desktop: `data:image/svg+xml,${encodeURIComponent(`
      <svg width="1920" height="1080" viewBox="0 0 1920 1080" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="circuitBg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#0f172a"/>
            <stop offset="50%" stop-color="#1e293b"/>
            <stop offset="100%" stop-color="#020617"/>
          </linearGradient>
          <pattern id="circuit" width="100" height="100" patternUnits="userSpaceOnUse">
            <rect width="100" height="100" fill="none"/>
            <path d="M20,20 L80,20 L80,80 L20,80 Z" fill="none" stroke="#334155" stroke-width="1" opacity="0.3"/>
            <circle cx="20" cy="20" r="2" fill="#475569" opacity="0.5"/>
            <circle cx="80" cy="20" r="2" fill="#475569" opacity="0.5"/>
            <circle cx="80" cy="80" r="2" fill="#475569" opacity="0.5"/>
            <circle cx="20" cy="80" r="2" fill="#475569" opacity="0.5"/>
            <path d="M20,50 L80,50" stroke="#334155" stroke-width="0.5" opacity="0.4"/>
            <path d="M50,20 L50,80" stroke="#334155" stroke-width="0.5" opacity="0.4"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#circuitBg)"/>
        <rect width="100%" height="100%" fill="url(#circuit)"/>
        <circle cx="400" cy="250" r="100" fill="#1e40af" opacity="0.08"/>
        <circle cx="1500" cy="400" r="150" fill="#7c3aed" opacity="0.06"/>
        <circle cx="900" cy="700" r="120" fill="#0ea5e9" opacity="0.08"/>
      </svg>
    `)}`
  }
};

// Utility function to get the appropriate background image
export function getBackgroundImage(type: keyof typeof backgroundImages = 'landing') {
  return backgroundImages[type] || backgroundImages.landing;
}

// Preload background images for better performance
export function preloadBackgroundImages() {
  Object.values(backgroundImages).forEach(imageSet => {
    Object.values(imageSet).forEach(imageSrc => {
      const img = new Image();
      img.src = imageSrc;
    });
  });
}