import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

interface PageTransitionProps {
  children: React.ReactNode;
}

export const PageTransition = ({ children }: PageTransitionProps) => {
  const location = useLocation();
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    setIsTransitioning(true);
    const timer = setTimeout(() => {
      setIsTransitioning(false);
    }, 100);

    return () => clearTimeout(timer);
  }, [location.pathname]);

  return (
    <div 
      className={`page-transition ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}
      style={{
        transition: 'opacity 0.3s ease-in-out',
      }}
    >
      {children}
    </div>
  );
};