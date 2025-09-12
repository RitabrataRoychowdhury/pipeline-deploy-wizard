// Browser compatibility utilities and polyfills

export interface BrowserInfo {
  name: string;
  version: string;
  isSupported: boolean;
  features: {
    css: {
      grid: boolean;
      flexbox: boolean;
      customProperties: boolean;
      backdropFilter: boolean;
    };
    js: {
      es6: boolean;
      modules: boolean;
      asyncAwait: boolean;
      fetch: boolean;
    };
    apis: {
      intersectionObserver: boolean;
      resizeObserver: boolean;
      webComponents: boolean;
      serviceWorker: boolean;
    };
  };
}

// Detect browser information
export const detectBrowser = (): BrowserInfo => {
  const userAgent = navigator.userAgent;
  let name = 'Unknown';
  let version = '0';

  // Detect browser name and version
  if (userAgent.includes('Chrome') && !userAgent.includes('Edg')) {
    name = 'Chrome';
    const match = userAgent.match(/Chrome\/(\d+)/);
    version = match ? match[1] : '0';
  } else if (userAgent.includes('Firefox')) {
    name = 'Firefox';
    const match = userAgent.match(/Firefox\/(\d+)/);
    version = match ? match[1] : '0';
  } else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
    name = 'Safari';
    const match = userAgent.match(/Version\/(\d+)/);
    version = match ? match[1] : '0';
  } else if (userAgent.includes('Edg')) {
    name = 'Edge';
    const match = userAgent.match(/Edg\/(\d+)/);
    version = match ? match[1] : '0';
  }

  // Check feature support
  const features = {
    css: {
      grid: CSS.supports('display', 'grid'),
      flexbox: CSS.supports('display', 'flex'),
      customProperties: CSS.supports('--test', 'value'),
      backdropFilter: CSS.supports('backdrop-filter', 'blur(1px)') || CSS.supports('-webkit-backdrop-filter', 'blur(1px)'),
    },
    js: {
      es6: typeof Symbol !== 'undefined',
      modules: 'noModule' in HTMLScriptElement.prototype,
      asyncAwait: (async () => {}).constructor === (async function() {}).constructor,
      fetch: typeof fetch !== 'undefined',
    },
    apis: {
      intersectionObserver: 'IntersectionObserver' in window,
      resizeObserver: 'ResizeObserver' in window,
      webComponents: 'customElements' in window,
      serviceWorker: 'serviceWorker' in navigator,
    },
  };

  // Determine if browser is supported
  const isSupported = 
    features.css.flexbox &&
    features.js.es6 &&
    features.js.fetch &&
    parseInt(version) >= getMinimumVersion(name);

  return {
    name,
    version,
    isSupported,
    features,
  };
};

// Get minimum supported version for each browser
const getMinimumVersion = (browserName: string): number => {
  const minimumVersions: Record<string, number> = {
    Chrome: 70,
    Firefox: 65,
    Safari: 12,
    Edge: 79,
  };
  return minimumVersions[browserName] || 0;
};

// Polyfills for missing features
export const polyfills = {
  // Fetch polyfill
  fetch: () => {
    if (!window.fetch) {
      // Simple fetch polyfill for older browsers
      window.fetch = function(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
        return new Promise((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          const url = typeof input === 'string' ? input : input.toString();
          
          xhr.open(init?.method || 'GET', url);
          
          if (init?.headers) {
            Object.entries(init.headers).forEach(([key, value]) => {
              xhr.setRequestHeader(key, value as string);
            });
          }
          
          xhr.onload = () => {
            const response = new Response(xhr.responseText, {
              status: xhr.status,
              statusText: xhr.statusText,
            });
            resolve(response);
          };
          
          xhr.onerror = () => reject(new Error('Network error'));
          xhr.send(init?.body as any);
        });
      };
    }
    return Promise.resolve();
  },

  // IntersectionObserver polyfill
  intersectionObserver: () => {
    if (!('IntersectionObserver' in window)) {
      // Simple IntersectionObserver polyfill
      (window as any).IntersectionObserver = class {
        constructor(callback: any) {
          this.callback = callback;
        }
        observe() {}
        unobserve() {}
        disconnect() {}
      };
    }
    return Promise.resolve();
  },

  // ResizeObserver polyfill
  resizeObserver: () => {
    if (!('ResizeObserver' in window)) {
      // Simple ResizeObserver polyfill
      (window as any).ResizeObserver = class {
        constructor(callback: any) {
          this.callback = callback;
        }
        observe() {}
        unobserve() {}
        disconnect() {}
      };
    }
    return Promise.resolve();
  },

  // CSS custom properties polyfill for IE
  customProperties: () => {
    if (!CSS.supports('--test', 'value')) {
      // Simple CSS custom properties support check
      console.warn('CSS custom properties not supported in this browser');
    }
    return Promise.resolve();
  },

  // Object.assign polyfill
  objectAssign: () => {
    if (!Object.assign) {
      Object.assign = function(target: any, ...sources: any[]) {
        if (target == null) {
          throw new TypeError('Cannot convert undefined or null to object');
        }
        const to = Object(target);
        for (let index = 0; index < sources.length; index++) {
          const nextSource = sources[index];
          if (nextSource != null) {
            for (const nextKey in nextSource) {
              if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
                to[nextKey] = nextSource[nextKey];
              }
            }
          }
        }
        return to;
      };
    }
  },

  // Array.from polyfill
  arrayFrom: () => {
    if (!Array.from) {
      Array.from = function(arrayLike: any, mapFn?: any, thisArg?: any) {
        const C = this;
        const items = Object(arrayLike);
        if (arrayLike == null) {
          throw new TypeError('Array.from requires an array-like object - not null or undefined');
        }
        const mapFunction = mapFn === undefined ? undefined : mapFn;
        if (typeof mapFunction !== 'undefined' && typeof mapFunction !== 'function') {
          throw new TypeError('Array.from: when provided, the second argument must be a function');
        }
        const len = parseInt(items.length);
        const A = typeof C === 'function' ? Object(new C(len)) : new Array(len);
        let k = 0;
        let kValue;
        while (k < len) {
          kValue = items[k];
          if (mapFunction) {
            A[k] = typeof thisArg === 'undefined' ? mapFunction(kValue, k) : mapFunction.call(thisArg, kValue, k);
          } else {
            A[k] = kValue;
          }
          k += 1;
        }
        A.length = len;
        return A;
      };
    }
  },

  // Promise polyfill
  promise: () => {
    if (!window.Promise) {
      // Simple Promise polyfill for very old browsers
      console.warn('Promise not supported in this browser');
    }
    return Promise.resolve();
  },
};

// CSS fallbacks
export const cssSupport = {
  // Check if CSS Grid is supported
  supportsGrid: (): boolean => {
    return CSS.supports('display', 'grid');
  },

  // Check if CSS Flexbox is supported
  supportsFlexbox: (): boolean => {
    return CSS.supports('display', 'flex');
  },

  // Check if CSS custom properties are supported
  supportsCustomProperties: (): boolean => {
    return CSS.supports('--test', 'value');
  },

  // Check if backdrop-filter is supported
  supportsBackdropFilter: (): boolean => {
    return CSS.supports('backdrop-filter', 'blur(1px)') || 
           CSS.supports('-webkit-backdrop-filter', 'blur(1px)');
  },

  // Apply CSS fallbacks
  applyFallbacks: () => {
    const root = document.documentElement;

    // Grid fallback
    if (!cssSupport.supportsGrid()) {
      root.classList.add('no-grid');
    }

    // Flexbox fallback
    if (!cssSupport.supportsFlexbox()) {
      root.classList.add('no-flexbox');
    }

    // Custom properties fallback
    if (!cssSupport.supportsCustomProperties()) {
      root.classList.add('no-custom-properties');
    }

    // Backdrop filter fallback
    if (!cssSupport.supportsBackdropFilter()) {
      root.classList.add('no-backdrop-filter');
    }
  },
};

// JavaScript feature detection
export const jsSupport = {
  // Check if ES6 modules are supported
  supportsModules: (): boolean => {
    return 'noModule' in HTMLScriptElement.prototype;
  },

  // Check if async/await is supported
  supportsAsyncAwait: (): boolean => {
    try {
      return (async () => {}).constructor === (async function() {}).constructor;
    } catch {
      return false;
    }
  },

  // Check if Promises are supported
  supportsPromises: (): boolean => {
    return typeof Promise !== 'undefined';
  },

  // Check if fetch is supported
  supportsFetch: (): boolean => {
    return typeof fetch !== 'undefined';
  },
};

// Performance optimizations for older browsers
export const performanceOptimizations = {
  // Debounce function for older browsers
  debounce: <T extends (...args: any[]) => any>(
    func: T,
    wait: number,
    immediate?: boolean
  ): ((...args: Parameters<T>) => void) => {
    let timeout: NodeJS.Timeout | null;
    return function executedFunction(...args: Parameters<T>) {
      const later = () => {
        timeout = null;
        if (!immediate) func(...args);
      };
      const callNow = immediate && !timeout;
      if (timeout) clearTimeout(timeout);
      timeout = setTimeout(later, wait);
      if (callNow) func(...args);
    };
  },

  // Throttle function for older browsers
  throttle: <T extends (...args: any[]) => any>(
    func: T,
    limit: number
  ): ((...args: Parameters<T>) => void) => {
    let inThrottle: boolean;
    return function executedFunction(...args: Parameters<T>) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  },

  // RequestAnimationFrame polyfill
  requestAnimationFrame: () => {
    if (!window.requestAnimationFrame) {
      window.requestAnimationFrame = (callback: FrameRequestCallback): number => {
        return window.setTimeout(callback, 1000 / 60);
      };
    }
  },

  // Optimize images for older browsers
  optimizeImages: () => {
    const images = document.querySelectorAll('img[data-src]');
    images.forEach((img) => {
      const imageElement = img as HTMLImageElement;
      imageElement.src = imageElement.dataset.src || '';
      imageElement.removeAttribute('data-src');
    });
  },
};

// Browser-specific fixes
export const browserFixes = {
  // Fix for Safari's 100vh issue
  fixSafariViewportHeight: () => {
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    if (isSafari) {
      const setViewportHeight = () => {
        const vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
      };
      
      setViewportHeight();
      window.addEventListener('resize', performanceOptimizations.throttle(setViewportHeight, 100));
    }
  },

  // Fix for IE11 flexbox bugs
  fixIEFlexbox: () => {
    const isIE = navigator.userAgent.indexOf('Trident') !== -1;
    if (isIE) {
      document.documentElement.classList.add('ie11');
    }
  },

  // Fix for Firefox focus outline
  fixFirefoxFocus: () => {
    const isFirefox = navigator.userAgent.toLowerCase().indexOf('firefox') > -1;
    if (isFirefox) {
      document.documentElement.classList.add('firefox');
    }
  },
};

// Initialize all compatibility features
export const initializeBrowserCompatibility = async () => {
  const browserInfo = detectBrowser();
  
  // Show warning for unsupported browsers
  if (!browserInfo.isSupported) {
    showUnsupportedBrowserWarning(browserInfo);
  }

  // Apply CSS fallbacks
  cssSupport.applyFallbacks();

  // Apply browser-specific fixes
  browserFixes.fixSafariViewportHeight();
  browserFixes.fixIEFlexbox();
  browserFixes.fixFirefoxFocus();

  // Load necessary polyfills
  const polyfillPromises = [];
  
  if (!browserInfo.features.js.fetch) {
    polyfillPromises.push(polyfills.fetch());
  }
  
  if (!browserInfo.features.apis.intersectionObserver) {
    polyfillPromises.push(polyfills.intersectionObserver());
  }
  
  if (!browserInfo.features.apis.resizeObserver) {
    polyfillPromises.push(polyfills.resizeObserver());
  }
  
  if (!browserInfo.features.css.customProperties) {
    polyfillPromises.push(polyfills.customProperties());
  }

  // Apply JavaScript polyfills
  polyfills.objectAssign();
  polyfills.arrayFrom();
  performanceOptimizations.requestAnimationFrame();

  // Wait for all polyfills to load
  await Promise.all(polyfillPromises);

  return browserInfo;
};

// Show warning for unsupported browsers
const showUnsupportedBrowserWarning = (browserInfo: BrowserInfo) => {
  const warningDiv = document.createElement('div');
  warningDiv.innerHTML = `
    <div style="
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      background: #f59e0b;
      color: white;
      padding: 12px;
      text-align: center;
      z-index: 10000;
      font-family: system-ui, -apple-system, sans-serif;
    ">
      <strong>Browser Not Fully Supported:</strong> 
      You're using ${browserInfo.name} ${browserInfo.version}. 
      Some features may not work correctly. 
      Please update to a newer version for the best experience.
      <button onclick="this.parentElement.parentElement.remove()" style="
        margin-left: 12px;
        background: rgba(255,255,255,0.2);
        border: none;
        color: white;
        padding: 4px 8px;
        border-radius: 4px;
        cursor: pointer;
      ">×</button>
    </div>
  `;
  document.body.appendChild(warningDiv);
};

// Export browser info for use in components
export const getBrowserInfo = detectBrowser;

// Export all utilities
export default {
  detectBrowser,
  polyfills,
  cssSupport,
  jsSupport,
  performanceOptimizations,
  browserFixes,
  initializeBrowserCompatibility,
  getBrowserInfo,
};