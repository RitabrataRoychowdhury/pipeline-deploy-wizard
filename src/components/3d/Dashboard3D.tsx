import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, RoundedBox } from '@react-three/drei';
import { Group } from 'three';

interface Dashboard3DProps {
  visible: boolean;
  stats: {
    totalPipelines: number;
    successfulBuilds: number;
    runningBuilds: number;
    uptime: string;
  };
}

export const Dashboard3D = ({ visible, stats }: Dashboard3DProps) => {
  const groupRef = useRef<Group>(null);
  const statsCardsRef = useRef<Group>(null);

  useFrame((state) => {
    if (!groupRef.current || !statsCardsRef.current) return;
    
    const time = state.clock.getElapsedTime();
    
    if (visible) {
      // Float animation for dashboard elements
      groupRef.current.position.y = Math.sin(time * 0.5) * 0.1;
      
      // Gentle rotation for stats cards
      statsCardsRef.current.rotation.y = Math.sin(time * 0.3) * 0.1;
    }
  });

  if (!visible) return null;

  return (
    <group ref={groupRef}>
      {/* Dashboard Title */}
      <Text
        position={[0, 3, 0]}
        fontSize={0.5}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
      >
        RustCI Dashboard
      </Text>

      {/* Stats Cards in 3D */}
      <group ref={statsCardsRef} position={[0, 1, 0]}>
        {/* Pipelines Card */}
        <group position={[-2, 0, 0]}>
          <RoundedBox args={[1.5, 1, 0.1]} radius={0.05}>
            <meshStandardMaterial color="#1e293b" transparent opacity={0.9} />
          </RoundedBox>
          <Text
            position={[0, 0.2, 0.06]}
            fontSize={0.15}
            color="#00d2ff"
            anchorX="center"
          >
            Pipelines
          </Text>
          <Text
            position={[0, -0.1, 0.06]}
            fontSize={0.3}
            color="#ffffff"
            anchorX="center"
          >
            {stats.totalPipelines}
          </Text>
        </group>

        {/* Success Card */}
        <group position={[0, 0, 0]}>
          <RoundedBox args={[1.5, 1, 0.1]} radius={0.05}>
            <meshStandardMaterial color="#1e293b" transparent opacity={0.9} />
          </RoundedBox>
          <Text
            position={[0, 0.2, 0.06]}
            fontSize={0.15}
            color="#10b981"
            anchorX="center"
          >
            Success
          </Text>
          <Text
            position={[0, -0.1, 0.06]}
            fontSize={0.3}
            color="#ffffff"
            anchorX="center"
          >
            {stats.successfulBuilds}
          </Text>
        </group>

        {/* Running Card */}
        <group position={[2, 0, 0]}>
          <RoundedBox args={[1.5, 1, 0.1]} radius={0.05}>
            <meshStandardMaterial color="#1e293b" transparent opacity={0.9} />
          </RoundedBox>
          <Text
            position={[0, 0.2, 0.06]}
            fontSize={0.15}
            color="#f59e0b"
            anchorX="center"
          >
            Running
          </Text>
          <Text
            position={[0, -0.1, 0.06]}
            fontSize={0.3}
            color="#ffffff"
            anchorX="center"
          >
            {stats.runningBuilds}
          </Text>
        </group>
      </group>

      {/* Floating Pipeline Elements */}
      <group position={[0, -1, 0]}>
        <RoundedBox 
          args={[3, 0.5, 0.1]} 
          radius={0.05}
          position={[-1, 0, 0]}
        >
          <meshStandardMaterial color="#374151" transparent opacity={0.8} />
        </RoundedBox>
        <Text
          position={[-1, 0, 0.06]}
          fontSize={0.12}
          color="#ffffff"
          anchorX="center"
        >
          RustCI Deploy Pipeline
        </Text>

        <RoundedBox 
          args={[3, 0.5, 0.1]} 
          radius={0.05}
          position={[1, 0.5, 0]}
        >
          <meshStandardMaterial color="#374151" transparent opacity={0.8} />
        </RoundedBox>
        <Text
          position={[1, 0.5, 0.06]}
          fontSize={0.12}
          color="#ffffff"
          anchorX="center"
        >
          Test Pipeline
        </Text>
      </group>
    </group>
  );
};