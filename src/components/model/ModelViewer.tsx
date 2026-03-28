'use client';

import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { HandModelControls } from './HandModelControls';
import type { ModelGroupHandle } from './HandModelControls';

/**
 * Simplified Influenza A virion — optimized for real-time hand tracking.
 * Reduced mesh count (~120 vs ~800) and uses meshStandardMaterial.
 */

const ENVELOPE_RADIUS = 2.4;
const M1_RADIUS = 2.15;

function fibonacciSphere(count: number, radius: number): THREE.Vector3[] {
  const points: THREE.Vector3[] = [];
  const goldenAngle = Math.PI * (3 - Math.sqrt(5));

  for (let i = 0; i < count; i++) {
    const y = 1 - (i / (count - 1)) * 2;
    const radiusAtY = Math.sqrt(1 - y * y);
    const theta = goldenAngle * i;

    points.push(
      new THREE.Vector3(
        Math.cos(theta) * radiusAtY * radius,
        y * radius,
        Math.sin(theta) * radiusAtY * radius,
      ),
    );
  }
  return points;
}

function orientationFromNormal(normal: THREE.Vector3): THREE.Quaternion {
  const quat = new THREE.Quaternion();
  quat.setFromUnitVectors(new THREE.Vector3(0, 1, 0), normal.clone().normalize());
  return quat;
}

// HA spike — stalk + glossy head
function HASpike({ position, quaternion }: {
  position: THREE.Vector3;
  quaternion: THREE.Quaternion;
}) {
  return (
    <group position={position} quaternion={quaternion}>
      <mesh position={[0, 0.275, 0]}>
        <cylinderGeometry args={[0.025, 0.035, 0.55, 8]} />
        <meshPhysicalMaterial color="#5c9e5c" roughness={0.35} metalness={0.05} clearcoat={0.5} clearcoatRoughness={0.3} />
      </mesh>
      <mesh position={[0, 0.61, 0]}>
        <sphereGeometry args={[0.09, 12, 12]} />
        <meshPhysicalMaterial color="#4caf50" roughness={0.25} metalness={0.08} clearcoat={0.7} clearcoatRoughness={0.15} emissive="#2e7d32" emissiveIntensity={0.08} />
      </mesh>
    </group>
  );
}

// NA spike — stalk + glossy box head
function NASpike({ position, quaternion }: {
  position: THREE.Vector3;
  quaternion: THREE.Quaternion;
}) {
  return (
    <group position={position} quaternion={quaternion}>
      <mesh position={[0, 0.175, 0]}>
        <cylinderGeometry args={[0.015, 0.02, 0.35, 8]} />
        <meshPhysicalMaterial color="#e65100" roughness={0.35} metalness={0.05} clearcoat={0.4} />
      </mesh>
      <mesh position={[0, 0.39, 0]}>
        <boxGeometry args={[0.1, 0.06, 0.1]} />
        <meshPhysicalMaterial color="#ff6d00" roughness={0.25} metalness={0.1} clearcoat={0.6} emissive="#e65100" emissiveIntensity={0.06} />
      </mesh>
    </group>
  );
}

// M2 ion channel
function M2Channel({ position, quaternion }: {
  position: THREE.Vector3;
  quaternion: THREE.Quaternion;
}) {
  return (
    <mesh position={position} quaternion={quaternion}>
      <cylinderGeometry args={[0.025, 0.025, 0.16, 8]} />
      <meshPhysicalMaterial color="#7986cb" roughness={0.4} metalness={0.1} clearcoat={0.4} transparent opacity={0.85} />
    </mesh>
  );
}

// RNP segment — glossy tube
function RNPSegment({ curvePoints, color }: {
  curvePoints: THREE.Vector3[];
  color: string;
}) {
  const tubeGeometry = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3(curvePoints, false, 'catmullrom', 0.5);
    return new THREE.TubeGeometry(curve, 24, 0.06, 8, false);
  }, [curvePoints]);

  return (
    <mesh geometry={tubeGeometry}>
      <meshPhysicalMaterial
        color={color}
        roughness={0.4}
        metalness={0.05}
        clearcoat={0.5}
        clearcoatRoughness={0.3}
        emissive={color}
        emissiveIntensity={0.05}
      />
    </mesh>
  );
}

function generateRNPCurves(): THREE.Vector3[][] {
  const segments: THREE.Vector3[][] = [];
  const segmentLengths = [1.8, 1.6, 1.5, 1.4, 1.3, 1.1, 1.0, 0.8];

  for (let s = 0; s < 8; s++) {
    const points: THREE.Vector3[] = [];
    const pointCount = 6;
    const len = segmentLengths[s];
    const baseAngle = (s / 8) * Math.PI * 2;
    const tilt = 0.3 + Math.random() * 0.4;
    const radialOffset = 0.15 + (s % 3) * 0.2;

    for (let i = 0; i < pointCount; i++) {
      const t = (i / (pointCount - 1)) - 0.5;
      const helixAngle = baseAngle + t * 1.8;
      const r = radialOffset + Math.sin(t * Math.PI) * 0.3;

      points.push(new THREE.Vector3(
        Math.cos(helixAngle) * r,
        t * len + Math.sin(helixAngle * 2) * 0.08,
        Math.sin(helixAngle) * r + Math.cos(t * Math.PI) * tilt * 0.2,
      ));
    }
    segments.push(points);
  }
  return segments;
}

const RNP_COLORS = [
  '#7e57c2', '#5e35b1', '#9575cd', '#673ab7',
  '#8e6fc9', '#6a3fb5', '#7c4dff', '#6200ea',
];

function InfluenzaVirion() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((_state, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.08;
    }
  });

  // Reduced counts: 35 HA, 10 NA, 6 M2
  const haPositions = useMemo(() => fibonacciSphere(35, ENVELOPE_RADIUS), []);
  const naPositions = useMemo(() => fibonacciSphere(10, ENVELOPE_RADIUS), []);
  const m2Positions = useMemo(() => fibonacciSphere(6, ENVELOPE_RADIUS), []);
  const rnpCurves = useMemo(() => generateRNPCurves(), []);

  const naOffset = useMemo(() => {
    return naPositions.map((p) => {
      const rotated = p.clone();
      rotated.applyAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI * 0.37);
      rotated.applyAxisAngle(new THREE.Vector3(1, 0, 0), Math.PI * 0.23);
      return rotated;
    });
  }, [naPositions]);

  const m2Offset = useMemo(() => {
    return m2Positions.map((p) => {
      const rotated = p.clone();
      rotated.applyAxisAngle(new THREE.Vector3(0, 0, 1), Math.PI * 0.61);
      return rotated;
    });
  }, [m2Positions]);

  return (
    <group ref={groupRef}>
      {/* Lipid bilayer envelope */}
      <mesh>
        <sphereGeometry args={[ENVELOPE_RADIUS, 48, 48]} />
        <meshPhysicalMaterial
          color="#c8b89a"
          roughness={0.5}
          metalness={0.02}
          transparent
          opacity={0.18}
          clearcoat={0.3}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>

      {/* M1 matrix protein layer */}
      <mesh>
        <sphereGeometry args={[M1_RADIUS, 32, 32]} />
        <meshPhysicalMaterial
          color="#78909c"
          roughness={0.45}
          metalness={0.08}
          transparent
          opacity={0.12}
          wireframe
          depthWrite={false}
        />
      </mesh>

      {/* HA spike proteins */}
      {haPositions.map((pos, i) => (
        <HASpike
          key={`ha-${i}`}
          position={pos}
          quaternion={orientationFromNormal(pos)}
        />
      ))}

      {/* NA spike proteins */}
      {naOffset.map((pos, i) => (
        <NASpike
          key={`na-${i}`}
          position={pos}
          quaternion={orientationFromNormal(pos)}
        />
      ))}

      {/* M2 ion channels */}
      {m2Offset.map((pos, i) => (
        <M2Channel
          key={`m2-${i}`}
          position={pos}
          quaternion={orientationFromNormal(pos)}
        />
      ))}

      {/* 8 RNP segments */}
      {rnpCurves.map((curve, i) => (
        <RNPSegment
          key={`rnp-${i}`}
          curvePoints={curve}
          color={RNP_COLORS[i]}
        />
      ))}

      {/* Polymerase complexes at RNP ends */}
      {rnpCurves.map((curve, i) => {
        const endPoint = curve[curve.length - 1];
        return (
          <mesh key={`pol-${i}`} position={endPoint}>
            <dodecahedronGeometry args={[0.07, 0]} />
            <meshPhysicalMaterial
              color="#f06292"
              roughness={0.3}
              metalness={0.1}
              clearcoat={0.5}
              emissive="#c2185b"
              emissiveIntensity={0.08}
            />
          </mesh>
        );
      })}
    </group>
  );
}

export function ModelViewer() {
  const controlsRef = useRef<ModelGroupHandle>(null);

  return (
    <Canvas
      camera={{ position: [0, 0, 8], fov: 45 }}
      style={{ background: '#080c14', width: '100%', height: '100%' }}
      gl={{ antialias: true, alpha: false, preserveDrawingBuffer: true }}
      frameloop="always"
    >
      <ambientLight intensity={0.7} />
      <directionalLight position={[5, 6, 4]} intensity={2.0} color="#ffffff" />
      <directionalLight position={[-6, 2, -2]} intensity={1.4} color="#b3e5fc" />
      <pointLight position={[2, -5, 3]} intensity={1.2} color="#ffcc80" />
      <pointLight position={[0, 0, -6]} intensity={0.9} color="#ce93d8" />

      <HandModelControls ref={controlsRef}>
        <InfluenzaVirion />
      </HandModelControls>
    </Canvas>
  );
}
