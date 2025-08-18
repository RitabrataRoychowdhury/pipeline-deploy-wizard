import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, Text } from '@react-three/drei';
import { Mesh, Vector3 } from 'three';

interface CodeSphereProps {
  position: [number, number, number];
  text: string;
  color: string;
}

export const CodeSphere = ({ position, text, color }: CodeSphereProps) => {
  const sphereRef = useRef<Mesh>(null);
  const textRef = useRef<Mesh>(null);

  useFrame((state) => {
    if (!sphereRef.current || !textRef.current) return;
    
    const time = state.clock.getElapsedTime();
    sphereRef.current.rotation.y = time * 0.5;
    
    // Gentle bobbing motion
    const bobbing = Math.sin(time * 2) * 0.1;
    sphereRef.current.position.y = position[1] + bobbing;
    textRef.current.position.y = position[1] + bobbing;
  });

  return (
    <group position={position}>
      <Sphere ref={sphereRef} args={[0.6, 32, 32]}>
        <meshStandardMaterial
          color={color}
          transparent
          opacity={0.3}
          metalness={0.1}
          roughness={0.1}
        />
      </Sphere>
      <Text
        ref={textRef}
        fontSize={0.2}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
        position={[0, 0, 0.65]}
      >
        {text}
      </Text>
    </group>
  );
};