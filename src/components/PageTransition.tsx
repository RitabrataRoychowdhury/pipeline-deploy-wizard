import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

interface PageTransitionProps {
  children: React.ReactNode;
}

export const PageTransition = ({ children }: PageTransitionProps) => {
  const location = useLocation();
  const [isEntering, setIsEntering] = useState(false);
  const [displayChildren, setDisplayChildren] = useState(children);

  useEffect(() => {
    if (displayChildren !== children) {
      setIsEntering(false);
      
      const exitTimer = setTimeout(() => {
        setDisplayChildren(children);
        setIsEntering(true);
      }, 200);

      return () => clearTimeout(exitTimer);
    } else {
      setIsEntering(true);
    }
  }, [children, displayChildren]);

  return (
    <div 
      className={`transition-all duration-300 ease-out ${
        isEntering 
          ? 'opacity-100 translate-y-0 scale-100' 
          : 'opacity-0 translate-y-4 scale-95'
      }`}
      style={{
        transformOrigin: 'center top',
      }}
    >
      {displayChildren}
    </div>
  );
};