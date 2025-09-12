import { useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

interface NavigationGuardOptions {
  hasUnsavedChanges: boolean;
  message?: string;
  onNavigateAway?: () => void;
  onStay?: () => void;
}

export const useNavigationGuard = ({
  hasUnsavedChanges,
  message = 'You have unsaved changes. Are you sure you want to leave?',
  onNavigateAway,
  onStay
}: NavigationGuardOptions) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Handle browser back/forward buttons and page refresh
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = message;
        return message;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges, message]);

  // Create a guarded navigation function
  const guardedNavigate = useCallback((to: string | number, options?: { replace?: boolean }) => {
    if (hasUnsavedChanges) {
      const confirmed = window.confirm(message);
      if (confirmed) {
        onNavigateAway?.();
        if (typeof to === 'string') {
          navigate(to, options);
        } else {
          navigate(to);
        }
      } else {
        onStay?.();
      }
    } else {
      if (typeof to === 'string') {
        navigate(to, options);
      } else {
        navigate(to);
      }
    }
  }, [hasUnsavedChanges, message, navigate, onNavigateAway, onStay]);

  return { guardedNavigate };
};