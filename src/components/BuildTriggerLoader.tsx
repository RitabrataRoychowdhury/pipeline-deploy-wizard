import React from 'react';
import { Rocket, Zap, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BuildTriggerLoaderProps {
  isVisible: boolean;
  onComplete?: () => void;
}

export const BuildTriggerLoader: React.FC<BuildTriggerLoaderProps> = ({ 
  isVisible, 
  onComplete 
}) => {
  const [stage, setStage] = React.useState(0);

  React.useEffect(() => {
    if (!isVisible) {
      setStage(0);
      return;
    }

    const timer = setTimeout(() => {
      if (stage < 3) {
        setStage(stage + 1);
      } else {
        onComplete?.();
      }
    }, stage === 0 ? 800 : stage === 1 ? 600 : stage === 2 ? 500 : 400);

    return () => clearTimeout(timer);
  }, [isVisible, stage, onComplete]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-background/95 backdrop-blur-sm" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}>
      <div className="relative">
        {/* Animated rings */}
        <div className="absolute inset-0 -m-20">
          <div className={cn(
            "absolute inset-0 rounded-full border-2 border-primary/30",
            "animate-ping"
          )} style={{ animationDuration: '1.5s' }} />
          <div className={cn(
            "absolute inset-0 rounded-full border-2 border-primary/20",
            "animate-ping"
          )} style={{ animationDuration: '2s', animationDelay: '0.3s' }} />
        </div>

        {/* Center icon */}
        <div className="relative z-10 flex flex-col items-center gap-6">
          <div className={cn(
            "relative h-24 w-24 rounded-full bg-gradient-to-br from-primary to-primary/50",
            "flex items-center justify-center shadow-2xl shadow-primary/50",
            "transition-all duration-500",
            stage >= 1 && "scale-110",
            stage >= 3 && "scale-100 bg-green-500"
          )}>
            {stage < 3 ? (
              <Rocket className={cn(
                "h-12 w-12 text-white transition-all duration-500",
                stage >= 1 && "animate-bounce"
              )} />
            ) : (
              <CheckCircle className="h-12 w-12 text-white animate-in zoom-in duration-300" />
            )}
            
            {/* Speed lines */}
            {stage >= 1 && stage < 3 && (
              <div className="absolute inset-0">
                {[...Array(8)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute h-0.5 w-8 bg-gradient-to-r from-primary to-transparent"
                    style={{
                      top: '50%',
                      left: '50%',
                      transform: `rotate(${i * 45}deg) translateX(-20px)`,
                      animation: 'speed-line 0.5s ease-out infinite',
                      animationDelay: `${i * 0.1}s`,
                    }}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Status text */}
          <div className="text-center space-y-2">
            <p className="text-lg font-semibold text-foreground">
              {stage === 0 && 'Initializing Build...'}
              {stage === 1 && 'Spinning Up Runner...'}
              {stage === 2 && 'Triggering Pipeline...'}
              {stage === 3 && 'Build Started!'}
            </p>
            <div className="flex items-center gap-2 justify-center">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    "h-2 w-2 rounded-full transition-all duration-300",
                    i <= stage ? "bg-primary scale-100" : "bg-muted scale-75"
                  )}
                />
              ))}
            </div>
          </div>

          {/* Lightning bolt animation */}
          {stage >= 1 && stage < 3 && (
            <Zap className="absolute -top-8 -right-8 h-6 w-6 text-yellow-400 animate-pulse" />
          )}
        </div>
      </div>

      <style>{`
        @keyframes speed-line {
          0% {
            opacity: 0;
            width: 0px;
          }
          50% {
            opacity: 1;
          }
          100% {
            opacity: 0;
            width: 32px;
          }
        }
      `}</style>
    </div>
  );
};
