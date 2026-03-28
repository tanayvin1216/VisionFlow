'use client';

import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { HandModelControls } from './HandModelControls';
import type { ModelGroupHandle } from './HandModelControls';

/**
 * Scientifically accurate Influenza A virion model.
 *
 * Structures modeled:
 * - Lipid bilayer envelope (outer translucent membrane)
 * - Hemagglutinin (HA) spike glycoproteins — trimer stalks with globular heads
 * - Neuraminidase (NA) spike glycoproteins — shorter, tetrameric mushroom heads
 * - M2 ion channel proteins — small transmembrane pores
 * - M1 matrix protein layer — inner shell beneath envelope
 * - 8 RNP segments — ribonucleoprotein complexes (viral RNA genome)
 *
 * Reference: ~80-120nm diameter spherical/pleomorphic virion.
 * HA:NA ratio approximately 4:1 on surface.
 */

const ENVELOPE_RADIUS = 2.4;
const M1_RADIUS = 2.15;
const RNP_CORE_RADIUS = 1.4;

// Fibonacci sphere sampling for even distribution on a sphere surface
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

// --- Hemagglutinin (HA) spike protein ---
// Trimer: 3 stalks converging into a globular head domain
function HASpikeProtein({ position, quaternion }: {
  position: THREE.Vector3;
  quaternion: THREE.Quaternion;
}) {
  const stalkHeight = 0.55;
  const headRadius = 0.09;
  const stalkRadius = 0.02;

  return (
    <group position={position} quaternion={quaternion}>
      {/* Trimer stalks — 3 slightly spread helical stems */}
      {[0, 1, 2].map((i) => {
        const angle = (i / 3) * Math.PI * 2;
        const spread = 0.03;
        return (
          <mesh
            key={`ha-stalk-${i}`}
            position={[Math.cos(angle) * spread, stalkHeight / 2, Math.sin(angle) * spread]}
          >
            <cylinderGeometry args={[stalkRadius, stalkRadius * 1.3, stalkHeight, 8]} />
            <meshPhysicalMaterial
              color="#5c9e5c"
              roughness={0.35}
              metalness={0.05}
              clearcoat={0.6}
              clearcoatRoughness={0.3}
            />
          </mesh>
        );
      })}
      {/* Globular head domain — receptor binding site */}
      <mesh position={[0, stalkHeight + headRadius * 0.6, 0]}>
        <sphereGeometry args={[headRadius, 16, 16]} />
        <meshPhysicalMaterial
          color="#4caf50"
          roughness={0.25}
          metalness={0.08}
          clearcoat={0.7}
          clearcoatRoughness={0.15}
          emissive="#2e7d32"
          emissiveIntensity={0.08}
        />
      </mesh>
      {/* Secondary lobes on head — antigenic sites */}
      {[0, 1, 2].map((i) => {
        const a = (i / 3) * Math.PI * 2 + 0.3;
        return (
          <mesh
            key={`ha-lobe-${i}`}
            position={[
              Math.cos(a) * headRadius * 0.6,
              stalkHeight + headRadius * 0.5,
              Math.sin(a) * headRadius * 0.6,
            ]}
          >
            <sphereGeometry args={[headRadius * 0.45, 10, 10]} />
            <meshPhysicalMaterial
              color="#66bb6a"
              roughness={0.3}
              metalness={0.05}
              clearcoat={0.5}
            />
          </mesh>
        );
      })}
    </group>
  );
}

// --- Neuraminidase (NA) spike protein ---
// Shorter mushroom shape with a tetrameric box-like head
function NASpikeProtein({ position, quaternion }: {
  position: THREE.Vector3;
  quaternion: THREE.Quaternion;
}) {
  const stalkHeight = 0.35;

  return (
    <group position={position} quaternion={quaternion}>
      {/* Thin stalk */}
      <mesh position={[0, stalkHeight / 2, 0]}>
        <cylinderGeometry args={[0.015, 0.02, stalkHeight, 8]} />
        <meshPhysicalMaterial
          color="#e65100"
          roughness={0.35}
          metalness={0.05}
          clearcoat={0.5}
        />
      </mesh>
      {/* Tetrameric head — 4 subunits forming the enzymatic active site */}
      {[0, 1, 2, 3].map((i) => {
        const angle = (i / 4) * Math.PI * 2;
        const offset = 0.04;
        return (
          <mesh
            key={`na-head-${i}`}
            position={[
              Math.cos(angle) * offset,
              stalkHeight + 0.04,
              Math.sin(angle) * offset,
            ]}
          >
            <boxGeometry args={[0.055, 0.045, 0.055]} />
            <meshPhysicalMaterial
              color="#ff6d00"
              roughness={0.25}
              metalness={0.1}
              clearcoat={0.6}
              emissive="#e65100"
              emissiveIntensity={0.06}
            />
          </mesh>
        );
      })}
    </group>
  );
}

// --- M2 ion channel protein ---
// Small transmembrane tetramer forming a proton channel
function M2Channel({ position, quaternion }: {
  position: THREE.Vector3;
  quaternion: THREE.Quaternion;
}) {
  return (
    <group position={position} quaternion={quaternion}>
      <mesh position={[0, 0.08, 0]}>
        <cylinderGeometry args={[0.025, 0.025, 0.16, 6]} />
        <meshPhysicalMaterial
          color="#7986cb"
          roughness={0.4}
          metalness={0.1}
          clearcoat={0.4}
          transparent
          opacity={0.85}
        />
      </mesh>
      {/* Pore opening */}
      <mesh position={[0, 0.17, 0]}>
        <torusGeometry args={[0.018, 0.005, 8, 12]} />
        <meshPhysicalMaterial
          color="#5c6bc0"
          roughness={0.3}
          metalness={0.15}
        />
      </mesh>
    </group>
  );
}

// --- Single RNP segment ---
// Ribonucleoprotein: RNA wrapped around NP (nucleoprotein) in a helical structure
function RNPSegment({ curvePoints, color }: {
  curvePoints: THREE.Vector3[];
  color: string;
}) {
  const tubeGeometry = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3(curvePoints, false, 'catmullrom', 0.5);
    return new THREE.TubeGeometry(curve, 40, 0.045, 8, false);
  }, [curvePoints]);

  const npBeads = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3(curvePoints, false, 'catmullrom', 0.5);
    const beadPositions: THREE.Vector3[] = [];
    const beadCount = 12;
    for (let i = 0; i < beadCount; i++) {
      beadPositions.push(curve.getPointAt(i / (beadCount - 1)));
    }
    return beadPositions;
  }, [curvePoints]);

  return (
    <group>
      {/* RNA backbone */}
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
      {/* NP (nucleoprotein) beads wrapping the RNA */}
      {npBeads.map((pos, i) => (
        <mesh key={`np-${i}`} position={pos}>
          <sphereGeometry args={[0.055, 10, 10]} />
          <meshPhysicalMaterial
            color="#b39ddb"
            roughness={0.35}
            metalness={0.08}
            clearcoat={0.4}
          />
        </mesh>
      ))}
    </group>
  );
}

// Generate 8 RNP segment curves inside the virion core
function generateRNPCurves(): THREE.Vector3[][] {
  const segments: THREE.Vector3[][] = [];
  const segmentLengths = [1.8, 1.6, 1.5, 1.4, 1.3, 1.1, 1.0, 0.8];

  for (let s = 0; s < 8; s++) {
    const points: THREE.Vector3[] = [];
    const pointCount = 8;
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

  const haPositions = useMemo(() => fibonacciSphere(80, ENVELOPE_RADIUS), []);
  const naPositions = useMemo(() => fibonacciSphere(20, ENVELOPE_RADIUS), []);
  const m2Positions = useMemo(() => fibonacciSphere(12, ENVELOPE_RADIUS), []);
  const rnpCurves = useMemo(() => generateRNPCurves(), []);

  // Offset NA and M2 positions to avoid overlap with HA
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
      rotated.applyAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI * 0.47);
      return rotated;
    });
  }, [m2Positions]);

  return (
    <group ref={groupRef}>
      {/* === LIPID BILAYER ENVELOPE === */}
      {/* Outer leaflet */}
      <mesh>
        <sphereGeometry args={[ENVELOPE_RADIUS, 64, 64]} />
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
      {/* Inner leaflet — slight color shift for bilayer appearance */}
      <mesh>
        <sphereGeometry args={[ENVELOPE_RADIUS - 0.03, 48, 48]} />
        <meshPhysicalMaterial
          color="#b8a080"
          roughness={0.6}
          metalness={0.02}
          transparent
          opacity={0.1}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>

      {/* === M1 MATRIX PROTEIN LAYER === */}
      {/* Dense protein shell lining the inner envelope */}
      <mesh>
        <sphereGeometry args={[M1_RADIUS, 48, 48]} />
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
      {/* Solid inner matrix showing protein density */}
      <mesh>
        <sphereGeometry args={[M1_RADIUS - 0.02, 32, 32]} />
        <meshPhysicalMaterial
          color="#90a4ae"
          roughness={0.55}
          metalness={0.05}
          transparent
          opacity={0.06}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>

      {/* === HEMAGGLUTININ (HA) SPIKE PROTEINS === */}
      {/* ~80 trimeric spikes — primary surface antigen, receptor binding */}
      {haPositions.map((pos, i) => (
        <HASpikeProtein
          key={`ha-${i}`}
          position={pos}
          quaternion={orientationFromNormal(pos)}
        />
      ))}

      {/* === NEURAMINIDASE (NA) SPIKE PROTEINS === */}
      {/* ~20 tetrameric spikes — enzyme that cleaves sialic acid for viral release */}
      {naOffset.map((pos, i) => (
        <NASpikeProtein
          key={`na-${i}`}
          position={pos}
          quaternion={orientationFromNormal(pos)}
        />
      ))}

      {/* === M2 ION CHANNEL PROTEINS === */}
      {/* ~12 proton channels — target of amantadine antiviral drugs */}
      {m2Offset.map((pos, i) => (
        <M2Channel
          key={`m2-${i}`}
          position={pos}
          quaternion={orientationFromNormal(pos)}
        />
      ))}

      {/* === 8 RNP SEGMENTS (VIRAL GENOME) === */}
      {/* Each segment: negative-sense ssRNA wrapped in NP, with polymerase complex */}
      {rnpCurves.map((curve, i) => (
        <RNPSegment
          key={`rnp-${i}`}
          curvePoints={curve}
          color={RNP_COLORS[i]}
        />
      ))}

      {/* === POLYMERASE COMPLEXES === */}
      {/* PB1, PB2, PA subunits at the ends of RNP segments */}
      {rnpCurves.map((curve, i) => {
        const endPoint = curve[curve.length - 1];
        return (
          <group key={`pol-${i}`}>
            <mesh position={endPoint}>
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
          </group>
        );
      })}

      {/* === NEP/NS2 NUCLEAR EXPORT PROTEINS === */}
      {/* Small proteins scattered in the interior */}
      {[...Array(6)].map((_, i) => {
        const angle = (i / 6) * Math.PI * 2;
        const r = 0.6 + (i % 2) * 0.3;
        const y = (i % 3 - 1) * 0.5;
        return (
          <mesh
            key={`nep-${i}`}
            position={[Math.cos(angle) * r, y, Math.sin(angle) * r]}
          >
            <octahedronGeometry args={[0.05, 0]} />
            <meshPhysicalMaterial
              color="#ffab91"
              roughness={0.35}
              metalness={0.08}
              clearcoat={0.3}
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
      gl={{ antialias: true, alpha: false }}
    >
      {/* Strong ambient — everything visible */}
      <ambientLight intensity={0.7} />

      {/* Bright key light — makes proteins pop */}
      <directionalLight position={[5, 6, 4]} intensity={2.0} color="#ffffff" />

      {/* Cool fill from left — highlights HA spikes */}
      <directionalLight position={[-6, 2, -2]} intensity={1.4} color="#b3e5fc" />

      {/* Warm accent from below — subsurface feel on envelope */}
      <pointLight position={[2, -5, 3]} intensity={1.2} color="#ffcc80" />

      {/* Back rim — separates from background */}
      <pointLight position={[0, 0, -6]} intensity={0.9} color="#ce93d8" />

      {/* Top fill — illuminates HA heads */}
      <pointLight position={[0, 6, 0]} intensity={0.8} color="#e0e0e0" />

      <HandModelControls ref={controlsRef}>
        <InfluenzaVirion />
      </HandModelControls>
    </Canvas>
  );
}
