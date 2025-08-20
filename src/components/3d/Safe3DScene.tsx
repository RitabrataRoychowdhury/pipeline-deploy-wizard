import { Suspense, Component, ReactNode } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, PerspectiveCamera } from '@react-three/drei';
import { InteractiveEarth } from './InteractiveEarth';
import { Dashboard3D } from './Dashboard3D';

interface Safe3DSceneProps {
  className?: string;
  onSphereClick: () => void;
  mousePosition: { x: number; y: number };
  showDashboard: boolean;
  stats: {
    totalPipelines: number;
    successfulBuilds: number;
    runningBuilds: number;
    uptime: string;
  };
}

// Error boundary component for 3D rendering
class Scene3DErrorBoundary extends Component<
  { children: ReactNode; fallback?: ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: ReactNode; fallback?: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.warn('3D Scene error caught:', error.message);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/5 to-secondary/5 rounded-lg">
          <div className="text-center p-8">
            <div className="w-16 h-16 mx-auto mb-4 bg-primary/20 rounded-full flex items-center justify-center">
              <div className="w-8 h-8 bg-primary/40 rounded animate-pulse"></div>
            </div>
            <p className="text-muted-foreground">3D Experience Loading...</p>
            <p className="text-xs text-muted-foreground mt-2">Click anywhere to continue</p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Fallback component for when 3D fails
const Fallback3D = ({ onSphereClick, showDashboard }: { onSphereClick: () => void; showDashboard: boolean }) => (
  <div 
    className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-secondary/10 cursor-pointer group"
    onClick={onSphereClick}
  >
    <div className="text-center p-8 transition-transform group-hover:scale-105">
      <div className="w-32 h-32 mx-auto mb-6 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/30 to-secondary/30 animate-pulse"></div>
        <div className="relative z-10 text-2xl font-bold text-foreground">
          {showDashboard ? "3D" : "🌍"}
        </div>
      </div>
      <p className="text-lg font-semibold mb-2">
        {showDashboard ? "3D Dashboard View" : "Interactive Earth"}
      </p>
      <p className="text-muted-foreground text-sm">
        {showDashboard ? "Viewing dashboard in 3D mode" : "Click to explore 3D dashboard"}
      </p>
    </div>
  </div>
);

export const Safe3DScene = ({ 
  className = "", 
  onSphereClick, 
  mousePosition, 
  showDashboard, 
  stats 
}: Safe3DSceneProps) => {
  try {
    return (
      <div className={`w-full h-full ${className}`}>
        <Scene3DErrorBoundary 
          fallback={<Fallback3D onSphereClick={onSphereClick} showDashboard={showDashboard} />}
        >
          <Canvas
            gl={{ 
              antialias: true, 
              alpha: true,
              powerPreference: "high-performance",
              failIfMajorPerformanceCaveat: false
            }}
            onCreated={({ gl }) => {
              try {
                gl.setClearColor('#000000', 0);
              } catch (error) {
                console.warn('WebGL setup warning:', error);
              }
            }}
            fallback={<Fallback3D onSphereClick={onSphereClick} showDashboard={showDashboard} />}
          >
            <PerspectiveCamera makeDefault position={[0, 0, 8]} />
            
            {/* Lighting */}
            <ambientLight intensity={0.6} />
            <pointLight position={[10, 10, 10]} intensity={1.5} />
            <pointLight position={[-10, -10, -10]} intensity={0.8} color="#00ff88" />
            <pointLight position={[0, 10, -10]} intensity={1} color="#ff6b35" />
            
            <Suspense fallback={null}>
              <Environment preset="city" />
              
              <InteractiveEarth 
                onSphereClick={onSphereClick}
                mousePosition={mousePosition}
                showDashboard={showDashboard}
              />
              
              <Dashboard3D 
                visible={showDashboard}
                stats={stats}
              />
              
              <OrbitControls
                enableZoom={false}
                enablePan={false}
                autoRotate={!showDashboard}
                autoRotateSpeed={showDashboard ? 0 : 0.3}
                maxPolarAngle={Math.PI / 2}
                minPolarAngle={Math.PI / 2}
              />
            </Suspense>
          </Canvas>
        </Scene3DErrorBoundary>
      </div>
    );
  } catch (error) {
    console.warn('Safe3DScene render error:', error);
    return <Fallback3D onSphereClick={onSphereClick} showDashboard={showDashboard} />;
  }
};