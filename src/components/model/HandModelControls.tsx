'use client';

import { useRef, forwardRef, useImperativeHandle } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useAppStore } from '@/lib/store/app-store';
import { computeHandDistance, computeMidpoint, lerpValue } from './model-utils';
import type { HandData } from '@/types/hand-tracking';
import type { ReactNode } from 'react';

export interface ModelGroupHandle {
  group: THREE.Group | null;
}

const ROTATION_SENSITIVITY = 5.0;
const SCALE_MIN = 0.3;
const SCALE_MAX = 6;
const SMOOTHING = 0.35;
const VELOCITY_DECAY = 0.85;
const VELOCITY_THRESHOLD = 0.0001;

interface PreviousHandState {
  singleX: number;
  singleY: number;
  twoDistance: number;
  twoMidX: number;
  twoMidY: number;
}

interface Velocity {
  rotX: number;
  rotY: number;
  posX: number;
  posY: number;
}

function isInteracting(hand: HandData): boolean {
  const g = hand.gesture.type;
  return g === 'grab' || g === 'pinch' || g === 'pointing';
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

interface HandModelControlsProps {
  children?: ReactNode;
}

export const HandModelControls = forwardRef<ModelGroupHandle, HandModelControlsProps>(
  ({ children }, ref) => {
    const groupRef = useRef<THREE.Group>(null);
    const prevState = useRef<PreviousHandState | null>(null);

    const targetRotation = useRef(new THREE.Euler());
    const targetPosition = useRef(new THREE.Vector3());
    const targetScale = useRef(1);
    const velocity = useRef<Velocity>({ rotX: 0, rotY: 0, posX: 0, posY: 0 });
    const isGrabbing = useRef(false);

    useImperativeHandle(ref, () => ({
      get group() {
        return groupRef.current;
      },
    }));

    function applySmoothing(group: THREE.Group) {
      group.rotation.x = lerpValue(group.rotation.x, targetRotation.current.x, SMOOTHING);
      group.rotation.y = lerpValue(group.rotation.y, targetRotation.current.y, SMOOTHING);
      group.position.x = lerpValue(group.position.x, targetPosition.current.x, SMOOTHING);
      group.position.y = lerpValue(group.position.y, targetPosition.current.y, SMOOTHING);
      group.scale.setScalar(lerpValue(group.scale.x, targetScale.current, SMOOTHING));
    }

    function applyInertia() {
      // When no hand is grabbing, apply decaying velocity for momentum
      velocity.current.rotX *= VELOCITY_DECAY;
      velocity.current.rotY *= VELOCITY_DECAY;
      velocity.current.posX *= VELOCITY_DECAY;
      velocity.current.posY *= VELOCITY_DECAY;

      if (Math.abs(velocity.current.rotX) > VELOCITY_THRESHOLD) {
        targetRotation.current.x += velocity.current.rotX;
      }
      if (Math.abs(velocity.current.rotY) > VELOCITY_THRESHOLD) {
        targetRotation.current.y += velocity.current.rotY;
      }
    }

    useFrame(() => {
      const group = groupRef.current;
      if (!group) return;

      const { hands, interactionMode } = useAppStore.getState();

      if (interactionMode !== 'annotate') {
        const activeHands = hands.filter(isInteracting);

        if (activeHands.length === 1) {
          applyOneHandRotation(activeHands[0]);
          isGrabbing.current = true;
        } else if (activeHands.length >= 2) {
          applyTwoHandTransform(activeHands[0], activeHands[1]);
          isGrabbing.current = true;
        } else {
          if (isGrabbing.current) {
            isGrabbing.current = false;
          }
          prevState.current = null;
          applyInertia();
        }
      } else {
        prevState.current = null;
        isGrabbing.current = false;
        applyInertia();
      }

      applySmoothing(group);
    });

    function applyOneHandRotation(hand: HandData) {
      const pos = hand.fingertipPosition;
      if (!pos) return;

      if (prevState.current) {
        // Negate dx because webcam mirrors X — moving right in real life decreases pos.x
        const dx = -(pos.x - prevState.current.singleX);
        const dy = pos.y - prevState.current.singleY;

        const cappedDx = clamp(dx, -0.05, 0.05);
        const cappedDy = clamp(dy, -0.05, 0.05);

        velocity.current.rotY = cappedDx * ROTATION_SENSITIVITY;
        velocity.current.rotX = cappedDy * ROTATION_SENSITIVITY;

        targetRotation.current.y += velocity.current.rotY;
        targetRotation.current.x += velocity.current.rotX;
      }

      prevState.current = {
        singleX: pos.x,
        singleY: pos.y,
        twoDistance: 0,
        twoMidX: 0,
        twoMidY: 0,
      };
    }

    function applyTwoHandTransform(handA: HandData, handB: HandData) {
      const posA = handA.fingertipPosition;
      const posB = handB.fingertipPosition;
      if (!posA || !posB) return;

      const distance = computeHandDistance(posA, posB);
      const midpoint = computeMidpoint(posA, posB);

      if (prevState.current && prevState.current.twoDistance > 0) {
        const scaleRatio = distance / prevState.current.twoDistance;
        targetScale.current = clamp(targetScale.current * scaleRatio, SCALE_MIN, SCALE_MAX);

        // Negate X for webcam mirror, negate Y for screen-to-3D coordinate flip
        const panX = -(midpoint.x - prevState.current.twoMidX) * 5;
        const panY = -(midpoint.y - prevState.current.twoMidY) * 5;
        velocity.current.posX = panX;
        velocity.current.posY = panY;
        targetPosition.current.x += panX;
        targetPosition.current.y += panY;
      }

      prevState.current = {
        singleX: 0,
        singleY: 0,
        twoDistance: distance,
        twoMidX: midpoint.x,
        twoMidY: midpoint.y,
      };
    }

    return <group ref={groupRef}>{children}</group>;
  },
);

HandModelControls.displayName = 'HandModelControls';
