import { useRef, useState, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Sphere, Points, PointMaterial } from '@react-three/drei';
import { Mesh, Vector3, BufferGeometry, Float32BufferAttribute } from 'three';
import * as THREE from 'three';

interface InteractiveEarthProps {
  onSphereClick: () => void;
  mousePosition: { x: number; y: number };
  showDashboard: boolean;
}

export const InteractiveEarth = ({ onSphereClick, mousePosition, showDashboard }: InteractiveEarthProps) => {
  const earthRef = useRef<Mesh>(null);
  const dotsRef = useRef<THREE.Points>(null);
  const trianglesRef = useRef<THREE.Points>(null);
  const [hovered, setHovered] = useState(false);
  const { size } = useThree();

  // Generate random points for earth surface
  const earthPoints = new Float32Array(500 * 3);
  const trianglePoints = new Float32Array(100 * 3);
  
  for (let i = 0; i < 500; i++) {
    const phi = Math.acos(-1 + (2 * i) / 500);
    const theta = Math.sqrt(500 * Math.PI) * phi;
    const radius = 2.1;
    
    earthPoints[i * 3] = radius * Math.cos(theta) * Math.sin(phi);
    earthPoints[i * 3 + 1] = radius * Math.sin(theta) * Math.sin(phi);
    earthPoints[i * 3 + 2] = radius * Math.cos(phi);
  }

  for (let i = 0; i < 100; i++) {
    const phi = Math.acos(-1 + (2 * i) / 100);
    const theta = Math.sqrt(100 * Math.PI) * phi;
    const radius = 2.2;
    
    trianglePoints[i * 3] = radius * Math.cos(theta) * Math.sin(phi);
    trianglePoints[i * 3 + 1] = radius * Math.sin(theta) * Math.sin(phi);
    trianglePoints[i * 3 + 2] = radius * Math.cos(phi);
  }

  useFrame((state) => {
    if (!earthRef.current || !dotsRef.current || !trianglesRef.current) return;
    
    const time = state.clock.getElapsedTime();
    
    // Base rotation
    earthRef.current.rotation.y = time * 0.1;
    dotsRef.current.rotation.y = time * 0.15;
    trianglesRef.current.rotation.y = time * 0.08;

    // Mouse vibration effect
    if (hovered) {
      const mouseX = (mousePosition.x / size.width) * 2 - 1;
      const mouseY = -(mousePosition.y / size.height) * 2 + 1;
      
      const vibrationX = Math.sin(time * 10) * 0.02 * Math.abs(mouseX);
      const vibrationY = Math.sin(time * 12) * 0.02 * Math.abs(mouseY);
      const vibrationZ = Math.sin(time * 8) * 0.01;
      
      earthRef.current.position.x = vibrationX;
      earthRef.current.position.y = vibrationY;
      earthRef.current.position.z = vibrationZ;
      
      dotsRef.current.position.x = vibrationX * 1.1;
      dotsRef.current.position.y = vibrationY * 1.1;
      dotsRef.current.position.z = vibrationZ * 1.1;
    } else {
      // Smooth return to center
      earthRef.current.position.lerp(new Vector3(0, 0, 0), 0.05);
      dotsRef.current.position.lerp(new Vector3(0, 0, 0), 0.05);
    }

    // Dashboard transformation
    if (showDashboard) {
      earthRef.current.scale.lerp(new Vector3(0.1, 0.1, 0.1), 0.1);
      earthRef.current.position.lerp(new Vector3(-3, 2, -1), 0.1);
    } else {
      earthRef.current.scale.lerp(new Vector3(1, 1, 1), 0.1);
      earthRef.current.position.lerp(new Vector3(0, 0, 0), 0.1);
    }
  });

  return (
    <group>
      {/* Main Earth Sphere */}
      <Sphere
        ref={earthRef}
        args={[2, 64, 64]}
        onClick={onSphereClick}
        onPointerEnter={() => setHovered(true)}
        onPointerLeave={() => setHovered(false)}
      >
        <meshPhongMaterial
          color="#1a365d"
          transparent
          opacity={0.7}
          shininess={100}
          specular="#4299e1"
        />
      </Sphere>

      {/* Glowing Dots */}
      <Points ref={dotsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={earthPoints.length / 3}
            array={earthPoints}
            itemSize={3}
          />
        </bufferGeometry>
        <PointMaterial
          size={0.05}
          color="#00d2ff"
          transparent
          opacity={0.8}
          sizeAttenuation
        />
      </Points>

      {/* Flying Triangles */}
      <Points ref={trianglesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={trianglePoints.length / 3}
            array={trianglePoints}
            itemSize={3}
          />
        </bufferGeometry>
        <PointMaterial
          size={0.08}
          color="#ff6b35"
          transparent
          opacity={0.6}
          sizeAttenuation
        />
      </Points>

      {/* Atmosphere Glow */}
      <Sphere args={[2.3, 32, 32]}>
        <meshBasicMaterial
          color="#00d2ff"
          transparent
          opacity={0.1}
          side={THREE.BackSide}
        />
      </Sphere>
    </group>
  );
};