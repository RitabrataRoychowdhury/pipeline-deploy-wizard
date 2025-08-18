import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { RoundedBox } from '@react-three/drei';
import { Mesh } from 'three';

interface FloatingCubeProps {
  position: [number, number, number];
  color: string;
  speed?: number;
}

export const FloatingCube = ({ position, color, speed = 1 }: FloatingCubeProps) => {
  const meshRef = useRef<Mesh>(null);

  useFrame((state) => {
    if (!meshRef.current) return;
    
    const time = state.clock.getElapsedTime();
    meshRef.current.rotation.x = Math.sin(time * speed) * 0.3;
    meshRef.current.rotation.y = Math.cos(time * speed * 0.7) * 0.3;
    meshRef.current.position.y = position[1] + Math.sin(time * speed * 2) * 0.2;
  });

  return (
    <RoundedBox
      ref={meshRef}
      position={position}
      args={[0.8, 0.8, 0.8]}
      radius={0.1}
      smoothness={8}
    >
      <meshStandardMaterial 
        color={color}
        metalness={0.3}
        roughness={0.2}
        transparent
        opacity={0.8}
      />
    </RoundedBox>
  );
};