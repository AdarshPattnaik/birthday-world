'use client';

import { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

export default function FollowCamera() {
  const { camera } = useThree();
  const targetPosition = useRef(new THREE.Vector3(0, 8, -12));
  const targetLookAt = useRef(new THREE.Vector3(0, 0, 0));

  useFrame((_, delta) => {
    // We use the global state ref provided by Car.tsx
    const carStateRef = (window as any).__carState;
    if (!carStateRef || !carStateRef.current) return;

    const state = carStateRef.current;
    const carPosition = new THREE.Vector3(state.x, state.y, state.z);
    
    // Create quaternion from the car's yaw
    const carQuat = new THREE.Quaternion();
    carQuat.setFromAxisAngle(new THREE.Vector3(0, 1, 0), state.yaw);

    // Camera offset behind and above the car
    const offset = new THREE.Vector3(0, 6, -10);
    offset.applyQuaternion(carQuat);
    const desiredPosition = carPosition.clone().add(offset);

    // Look-at point slightly ahead of car
    const lookOffset = new THREE.Vector3(0, 1.5, 5);
    lookOffset.applyQuaternion(carQuat);
    const desiredLookAt = carPosition.clone().add(lookOffset);

    // Smooth damping based on delta time to prevent lagging behind at high speeds
    // clamp delta just in case of lag spikes
    const dt = Math.min(delta, 0.1);
    targetPosition.current.lerp(desiredPosition, 4.5 * dt);
    targetLookAt.current.lerp(desiredLookAt, 7 * dt);

    camera.position.copy(targetPosition.current);
    camera.lookAt(targetLookAt.current);
  });

  return null;
}
