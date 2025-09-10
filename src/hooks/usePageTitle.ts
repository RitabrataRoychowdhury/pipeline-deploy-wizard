import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const pageTitles: Record<string, string> = {
  '/': 'Welcome - RustCI',
  '/dashboard': 'Dashboard - RustCI',
  '/pipelines': 'Pipelines - RustCI',
  '/pipelines/builder': 'Pipeline Builder - RustCI',
  '/repositories': 'Repositories - RustCI',
  '/settings': 'Settings - RustCI'
};

export const usePageTitle = (customTitle?: string) => {
  const location = useLocation();

  useEffect(() => {
    const title = customTitle || pageTitles[location.pathname] || 'RustCI';
    document.title = title;
  }, [location.pathname, customTitle]);
};

export const setPageTitle = (title: string) => {
  document.title = title;
};