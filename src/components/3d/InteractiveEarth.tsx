import { useRef, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Sphere } from '@react-three/drei';
import { Mesh, Vector3 } from 'three';
import * as THREE from 'three';

interface InteractiveEarthProps {
  onSphereClick: () => void;
  mousePosition: { x: number; y: number };
  showDashboard: boolean;
}

export const InteractiveEarth = ({ onSphereClick, mousePosition, showDashboard }: InteractiveEarthProps) => {
  const earthRef = useRef<Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const { size } = useThree();

  useFrame((state) => {
    if (!earthRef.current) return;
    
    const time = state.clock.getElapsedTime();
    
    // Base rotation
    earthRef.current.rotation.y = time * 0.1;

    // Mouse vibration effect
    if (hovered && size.width > 0) {
      const mouseX = (mousePosition.x / size.width) * 2 - 1;
      const mouseY = -(mousePosition.y / size.height) * 2 + 1;
      
      const vibrationX = Math.sin(time * 10) * 0.02 * Math.abs(mouseX);
      const vibrationY = Math.sin(time * 12) * 0.02 * Math.abs(mouseY);
      const vibrationZ = Math.sin(time * 8) * 0.01;
      
      earthRef.current.position.x = vibrationX;
      earthRef.current.position.y = vibrationY;
      earthRef.current.position.z = vibrationZ;
    } else {
      // Smooth return to center
      earthRef.current.position.lerp(new Vector3(0, 0, 0), 0.05);
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
        args={[2, 32, 32]}
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

      {/* Atmosphere Glow */}
      <Sphere args={[2.3, 16, 16]}>
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