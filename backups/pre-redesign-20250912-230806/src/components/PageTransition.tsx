import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useAnimations } from '../hooks/useAnimations';

interface PageTransitionProps {
  children: React.ReactNode;
}

export const PageTransition = ({ children }: PageTransitionProps) => {
  const location = useLocation();
  const [isEntering, setIsEntering] = useState(false);
  const [displayChildren, setDisplayChildren] = useState(children);
  const { isEnabled, getClass } = useAnimations();

  useEffect(() => {
    if (displayChildren !== children) {
      setIsEntering(false);
      
      const exitTimer = setTimeout(() => {
        setDisplayChildren(children);
        setIsEntering(true);
      }, isEnabled ? 300 : 0);

      return () => clearTimeout(exitTimer);
    } else {
      setIsEntering(true);
    }
  }, [children, displayChildren, isEnabled]);

  if (!isEnabled) {
    return <div>{children}</div>;
  }

  return (
    <div 
      className={`transition-all duration-300 ease-out ${
        isEntering 
          ? 'opacity-100 translate-y-0 scale-100' 
          : 'opacity-0 translate-y-6 scale-95'
      }`}
      style={{
        transformOrigin: 'center top',
        willChange: isEntering ? 'auto' : 'transform, opacity',
      }}
    >
      {displayChildren}
    </div>
  );
};