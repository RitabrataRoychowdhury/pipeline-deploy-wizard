import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Cylinder } from '@react-three/drei';
import { Group, Mesh, RingGeometry } from 'three';

export const PipelineTunnel = () => {
  const groupRef = useRef<Group>(null);
  const ringsRef = useRef<Mesh[]>([]);

  useFrame((state) => {
    if (!groupRef.current) return;
    
    const time = state.clock.getElapsedTime();
    groupRef.current.rotation.z = time * 0.2;
    
    // Animate rings moving through the tunnel
    ringsRef.current.forEach((ring, index) => {
      if (ring) {
        const speed = 2;
        const initialZ = -5 + (index * 2);
        ring.position.z = ((time * speed + initialZ) % 12) - 6;
        ring.scale.setScalar(1 + Math.sin(time + index) * 0.1);
      }
    });
  });

  const rings = Array.from({ length: 6 }, (_, i) => (
    <mesh
      key={i}
      ref={(ref) => {
        if (ref) ringsRef.current[i] = ref;
      }}
      position={[0, 0, -5 + i * 2]}
    >
      <ringGeometry args={[1.2, 1.5, 32]} />
      <meshStandardMaterial
        color="#00ff88"
        transparent
        opacity={0.4}
        emissive="#00ff88"
        emissiveIntensity={0.2}
      />
    </mesh>
  ));

  return (
    <group ref={groupRef}>
      {rings}
      <Cylinder args={[1, 1, 12, 32, 1, true]} rotation={[Math.PI / 2, 0, 0]}>
        <meshStandardMaterial
          color="#1a1a2e"
          transparent
          opacity={0.1}
          side={2}
        />
      </Cylinder>
    </group>
  );
};