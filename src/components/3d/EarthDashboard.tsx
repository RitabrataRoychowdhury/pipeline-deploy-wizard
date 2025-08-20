import { useRef, useState, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Sphere, Text } from '@react-three/drei';
import { Mesh, Vector3 } from 'three';
import * as THREE from 'three';

interface EarthDashboardProps {
  onTransition: () => void;
  mousePosition: { x: number; y: number };
  isTransitioning: boolean;
}

export const EarthDashboard = ({ onTransition, mousePosition, isTransitioning }: EarthDashboardProps) => {
  const earthRef = useRef<Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const { size } = useThree();

  useFrame((state) => {
    if (!earthRef.current) return;
    
    const time = state.clock.getElapsedTime();
    
    // Base rotation - slower for dashboard
    earthRef.current.rotation.y = time * 0.05;
    earthRef.current.rotation.x = Math.sin(time * 0.02) * 0.1;

    // Mouse vibration effect
    if (hovered && size.width > 0 && !isTransitioning) {
      const mouseX = (mousePosition.x / size.width) * 2 - 1;
      const mouseY = -(mousePosition.y / size.height) * 2 + 1;
      
      const vibrationX = Math.sin(time * 15) * 0.03 * Math.abs(mouseX);
      const vibrationY = Math.sin(time * 18) * 0.03 * Math.abs(mouseY);
      const vibrationZ = Math.sin(time * 12) * 0.02;
      
      earthRef.current.position.x = vibrationX;
      earthRef.current.position.y = vibrationY;
      earthRef.current.position.z = vibrationZ;
    } else if (!isTransitioning) {
      // Smooth return to center
      earthRef.current.position.lerp(new Vector3(0, 0, 0), 0.05);
    }

    // Transition animation - scale down and move away
    if (isTransitioning) {
      earthRef.current.scale.lerp(new Vector3(0.1, 0.1, 0.1), 0.08);
      earthRef.current.position.lerp(new Vector3(-8, 6, -10), 0.08);
      earthRef.current.rotation.y += 0.02;
    } else {
      earthRef.current.scale.lerp(new Vector3(1.5, 1.5, 1.5), 0.05);
      earthRef.current.position.lerp(new Vector3(0, 0, 0), 0.05);
    }
  });

  return (
    <group>
      {/* Main Earth Sphere with Dashboard Texture */}
      <Sphere
        ref={earthRef}
        args={[3, 64, 64]}
        onClick={onTransition}
        onPointerEnter={() => setHovered(true)}
        onPointerLeave={() => setHovered(false)}
      >
        <meshPhongMaterial
          color={hovered ? "#2563eb" : "#1e40af"}
          transparent
          opacity={0.8}
          shininess={100}
          specular="#60a5fa"
        />
      </Sphere>

      {/* Inner glow */}
      <Sphere args={[2.8, 32, 32]}>
        <meshBasicMaterial
          color="#3b82f6"
          transparent
          opacity={0.2}
          side={THREE.BackSide}
        />
      </Sphere>

      {/* Outer atmosphere */}
      <Sphere args={[3.5, 16, 16]}>
        <meshBasicMaterial
          color="#60a5fa"
          transparent
          opacity={0.1}
          side={THREE.BackSide}
        />
      </Sphere>

      {/* Dashboard Text Inside Earth */}
      {!isTransitioning && (
        <Text
          position={[0, 0, 0]}
          fontSize={0.3}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
        >
          Dashboard
        </Text>
      )}

      {/* Floating particles around earth */}
      {Array.from({ length: 20 }).map((_, i) => {
        const angle = (i / 20) * Math.PI * 2;
        const radius = 4 + Math.sin(i) * 0.5;
        return (
          <Sphere
            key={i}
            args={[0.02, 8, 8]}
            position={[
              Math.cos(angle) * radius,
              Math.sin(angle * 0.7) * 2,
              Math.sin(angle) * radius
            ]}
          >
            <meshBasicMaterial color="#60a5fa" transparent opacity={0.6} />
          </Sphere>
        );
      })}
    </group>
  );
};