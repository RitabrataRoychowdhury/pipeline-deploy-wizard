import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, PerspectiveCamera } from '@react-three/drei';
import { FloatingCube } from './FloatingCube';
import { CodeSphere } from './CodeSphere';
import { PipelineTunnel } from './PipelineTunnel';

interface Scene3DProps {
  className?: string;
  showTunnel?: boolean;
}

export const Scene3D = ({ className = "", showTunnel = false }: Scene3DProps) => {
  return (
    <div className={`w-full h-full ${className}`}>
      <Canvas>
        <PerspectiveCamera makeDefault position={[0, 0, 8]} />
        
        {/* Lighting */}
        <ambientLight intensity={0.4} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#00ff88" />
        
        <Suspense fallback={null}>
          {/* Environment for reflections */}
          <Environment preset="city" />
          
          {showTunnel ? (
            <PipelineTunnel />
          ) : (
            <>
              {/* Floating elements */}
              <FloatingCube position={[-2, 1, 0]} color="#ff6b6b" speed={0.8} />
              <FloatingCube position={[2, -1, -1]} color="#4ecdc4" speed={1.2} />
              <FloatingCube position={[0, 2, -2]} color="#45b7d1" speed={1.0} />
              
              {/* Code spheres */}
              <CodeSphere position={[-3, -1, 1]} text="RUST" color="#ff6b35" />
              <CodeSphere position={[3, 1, 1]} text="CI/CD" color="#00d2ff" />
              <CodeSphere position={[0, -2, 0]} text="DEPLOY" color="#ff0080" />
            </>
          )}
          
          {/* Interactive controls */}
          <OrbitControls
            enableZoom={false}
            enablePan={false}
            autoRotate
            autoRotateSpeed={0.5}
            maxPolarAngle={Math.PI / 2}
            minPolarAngle={Math.PI / 2}
          />
        </Suspense>
      </Canvas>
    </div>
  );
};