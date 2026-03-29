'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { RigidBody, CuboidCollider } from '@react-three/rapier';
import type { RapierRigidBody } from '@react-three/rapier';
import { useGameStore } from '@/store/gameStore';
import * as THREE from 'three';

export default function Car() {
  const bodyRef = useRef<RapierRigidBody>(null);
  const groupRef = useRef<THREE.Group>(null);
  const wheelFLRef = useRef<THREE.Mesh>(null);
  const wheelFRRef = useRef<THREE.Mesh>(null);
  const wheelBLRef = useRef<THREE.Mesh>(null);
  const wheelBRRef = useRef<THREE.Mesh>(null);

  const headLightLRef = useRef<THREE.SpotLight>(null);
  const headLightRRef = useRef<THREE.SpotLight>(null);

  // Car state refs (persistent across frames)
  const carState = useRef({
    x: 0,
    y: 0.5,
    z: 0,
    yaw: 0,        // rotation around Y axis
    speed: 0,
    wheelRot: 0,
  });

  // Expose car position globally for camera
  const carPosRef = useRef({ x: 0, y: 0.5, z: 0, yaw: 0 });
  
  // Store on window for FollowCamera to read
  if (typeof window !== 'undefined') {
    (window as any).__carState = carPosRef;
  }

  const carColors = useMemo(
    () => ({
      body: new THREE.Color('#e74c3c'),
      roof: new THREE.Color('#c0392b'),
      wheel: new THREE.Color('#333333'),
      wheelHub: new THREE.Color('#bdc3c7'),
      bumper: new THREE.Color('#7f8c8d'),
      window: new THREE.Color('#2c3e50'), // Dark Glass
      headlight: new THREE.Color('#f1c40f'), // Warm glowing light
    }),
    []
  );

  // Pre-allocate reusable objects to avoid GC stutters 
  const _quat = useMemo(() => new THREE.Quaternion(), []);
  const _forward = useMemo(() => new THREE.Vector3(), []);
  const _euler = useMemo(() => new THREE.Euler(), []);

  useFrame((_, delta) => {
    const controls = useGameStore.getState().controls;
    const state = carState.current;

    // Clamp delta to avoid huge jumps
    const dt = Math.min(delta, 0.05);

    // --- Acceleration / Deceleration ---
    const maxSpeed = 14;
    const accel = 12;
    const decel = 10;
    const brakeDecel = 20;

    if (controls.forward) {
      state.speed = Math.min(maxSpeed, state.speed + accel * dt);
    } else if (controls.backward) {
      state.speed = Math.max(-maxSpeed * 0.4, state.speed - brakeDecel * dt);
    } else {
      // Coast to a stop
      if (state.speed > 0) {
        state.speed = Math.max(0, state.speed - decel * dt);
      } else if (state.speed < 0) {
        state.speed = Math.min(0, state.speed + decel * dt);
      }
    }

    // --- Steering (Angular Velocity) ---
    const turnRate = 2.5;
    let targetAngVel = 0;
    if (Math.abs(state.speed) > 0.5) {
      if (controls.left) targetAngVel = turnRate * Math.sign(state.speed);
      if (controls.right) targetAngVel = -turnRate * Math.sign(state.speed);
    }

    const rb = bodyRef.current;
    if (rb) {
      // Get physical orientation - reuse pre-allocated objects
      const currentRot = rb.rotation();
      _quat.set(currentRot.x, currentRot.y, currentRot.z, currentRot.w);
      
      // Which way is the car facing?
      _forward.set(0, 0, 1).applyQuaternion(_quat);

      // Apply linear velocity along the true forward vector
      const currentVel = rb.linvel();
      rb.setLinvel({
        x: _forward.x * state.speed,
        y: currentVel.y, // Maintain gravity / bounce
        z: _forward.z * state.speed
      }, true);

      // Apply angular velocity for steering, maintaining roll/pitch physics
      const currentAngVel = rb.angvel();
      rb.setAngvel({
        x: currentAngVel.x,
        y: targetAngVel,
        z: currentAngVel.z
      }, true);

      // Extract properties to share with Camera
      const currentPos = rb.translation();
      state.x = currentPos.x;
      state.y = currentPos.y;
      state.z = currentPos.z;

      _euler.setFromQuaternion(_quat, 'YXZ');
      state.yaw = _euler.y;

      // Ensure headlights always target the area directly in front of the car in World Space
      if (headLightLRef.current && headLightRRef.current) {
        // Place target 10 units forward, pointing slightly down
        const targetPos = new THREE.Vector3(currentPos.x, currentPos.y - 0.5, currentPos.z).addScaledVector(_forward, 10);
        headLightLRef.current.target.position.copy(targetPos);
        headLightLRef.current.target.updateMatrixWorld();
        
        headLightRRef.current.target.position.copy(targetPos);
        headLightRRef.current.target.updateMatrixWorld();
      }
    }

    // --- Update shared position for camera ---
    carPosRef.current.x = state.x;
    carPosRef.current.y = state.y;
    carPosRef.current.z = state.z;
    carPosRef.current.yaw = state.yaw;

    // Also expose via __carBody for backward compat with FollowCamera
    if (typeof window !== 'undefined') {
      (window as any).__carBody = rb;
    }

    // --- Wheel animation ---
    if (Math.abs(state.speed) > 0.1) {
      carState.current.wheelRot += Math.abs(state.speed) * dt * 3;
    }
    [wheelFLRef, wheelFRRef, wheelBLRef, wheelBRRef].forEach((ref) => {
      if (ref.current) ref.current.rotation.x = carState.current.wheelRot;
    });
  });

  return (
    <RigidBody
      ref={bodyRef}
      colliders={false}
      position={[0, 3, 0]}
      type="dynamic"
      friction={1.5}
      restitution={0.2}
      name="car"
      // Added strong angular damping to help it stop rolling wildly
      angularDamping={2.5}
      linearDamping={0.5}
    >
      {/* Visual/Main Collider (10% of weight) */}
      <CuboidCollider args={[0.9, 0.5, 1.6]} position={[0, 0.4, 0]} mass={20} />
      
      {/* Keel / Heavy Bottom (90% of weight). This forces the center of mass very low, 
          making it nearly impossible for the car to stay flipped upside down. */}
      {/* We make it a sensor so it acts as an invisible, non-colliding weight,
          preventing it from dragging on the ground and getting stuck on ramps! */}
      <CuboidCollider args={[0.8, 0.1, 1.4]} position={[0, -0.6, 0]} mass={150} sensor={true} />

      <group>
        {/* Car body */}
        <mesh position={[0, 0.4, 0]} castShadow>
          <boxGeometry args={[1.8, 0.6, 3.2]} />
          <meshStandardMaterial color={carColors.body} />
        </mesh>

        {/* Roof / cabin */}
        <mesh position={[0, 0.85, -0.2]} castShadow>
          <boxGeometry args={[1.5, 0.5, 1.6]} />
          <meshStandardMaterial color={carColors.roof} />
        </mesh>

        {/* Windshield */}
        <mesh position={[0, 0.85, 0.61]} rotation={[0.2, 0, 0]}>
          <planeGeometry args={[1.3, 0.4]} />
          <meshStandardMaterial color={carColors.window} />
        </mesh>

        {/* Front bumper */}
        <mesh position={[0, 0.2, 1.65]} castShadow>
          <boxGeometry args={[1.7, 0.3, 0.15]} />
          <meshStandardMaterial color={carColors.bumper} />
        </mesh>

        {/* Rear bumper */}
        <mesh position={[0, 0.2, -1.65]} castShadow>
          <boxGeometry args={[1.7, 0.3, 0.15]} />
          <meshStandardMaterial color={carColors.bumper} />
        </mesh>

        {/* Headlights */}
        <group position={[0.6, 0.4, 1.62]}>
          <mesh>
            <boxGeometry args={[0.3, 0.2, 0.1]} />
            <meshStandardMaterial
              color={carColors.headlight}
              emissive={carColors.headlight}
              emissiveIntensity={2}
            />
          </mesh>
          <spotLight
            ref={headLightLRef}
            position={[0, 0, 0]}
            angle={0.5}
            penumbra={0.8}
            intensity={20}
            distance={60}
            decay={1}
            color="#ffeedd"
            castShadow
          />
        </group>

        <group position={[-0.6, 0.4, 1.62]}>
          <mesh>
            <boxGeometry args={[0.3, 0.2, 0.1]} />
            <meshStandardMaterial
              color={carColors.headlight}
              emissive={carColors.headlight}
              emissiveIntensity={2}
            />
          </mesh>
          <spotLight
            ref={headLightRRef}
            position={[0, 0, 0]}
            angle={0.5}
            penumbra={0.8}
            intensity={20}
            distance={60}
            decay={1}
            color="#ffeedd"
            castShadow
          />
        </group>

        {/* Tail lights */}
        <mesh position={[0.65, 0.4, -1.62]}>
          <boxGeometry args={[0.25, 0.15, 0.1]} />
          <meshStandardMaterial color="#ff4444" emissive="#ff4444" emissiveIntensity={0.4} />
        </mesh>
        <mesh position={[-0.65, 0.4, -1.62]}>
          <boxGeometry args={[0.25, 0.15, 0.1]} />
          <meshStandardMaterial color="#ff4444" emissive="#ff4444" emissiveIntensity={0.4} />
        </mesh>

        {/* Wheels */}
        {[
          { ref: wheelFLRef, pos: [1.0, 0.2, 1.0] },
          { ref: wheelFRRef, pos: [-1.0, 0.2, 1.0] },
          { ref: wheelBLRef, pos: [1.0, 0.2, -1.0] },
          { ref: wheelBRRef, pos: [-1.0, 0.2, -1.0] },
        ].map((wheel, i) => (
          <group key={i} position={wheel.pos as [number, number, number]} ref={wheel.ref}>
            <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
              <cylinderGeometry args={[0.4, 0.4, 0.3, 16]} />
              <meshStandardMaterial color={carColors.wheel} />
            </mesh>
            <mesh rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.2, 0.2, 0.32, 12]} />
              <meshStandardMaterial color={carColors.wheelHub} />
            </mesh>
          </group>
        ))}
      </group>
    </RigidBody>
  );
}
