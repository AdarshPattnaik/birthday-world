'use client';

import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Physics } from '@react-three/rapier';
import { Sky } from '@react-three/drei';
import { Suspense, Component, useRef, useMemo, type ReactNode } from 'react';
import * as THREE from 'three';
import Car from './Car';
import FollowCamera from './FollowCamera';
import Ground from './Ground';
import Road from './Road';
import Ocean from './Ocean';
import Decorations from './Decorations';
import BirthdayTriggers from './BirthdayTrigger';
import FloatingText from './FloatingText';
import Confetti from './Confetti';
import InteractiveObjects from './InteractiveObjects';
import Park from './Park';
import CampSite from './CampSite';
import TrainStation from './TrainStation';
import WaterPark from './WaterPark';

// Error boundary to catch 3D rendering failures
class SceneErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean; error: string }
> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: '' };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error: error.message };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)',
            color: 'white',
            fontFamily: '"Segoe UI", system-ui, sans-serif',
            textAlign: 'center',
            padding: '20px',
          }}
        >
          <div>
            <div style={{ fontSize: '3rem', marginBottom: '16px' }}>😢</div>
            <div style={{ fontSize: '1.2rem', marginBottom: '8px' }}>
              Oops! The 3D scene had trouble loading.
            </div>
            <div style={{ fontSize: '0.9rem', opacity: 0.6, marginBottom: '16px' }}>
              {this.state.error}
            </div>
            <button
              onClick={() => window.location.reload()}
              style={{
                padding: '12px 32px',
                fontSize: '1rem',
                background: 'linear-gradient(135deg, #e74c3c, #9b59b6)',
                border: 'none',
                borderRadius: '25px',
                color: 'white',
                cursor: 'pointer',
              }}
            >
              🔄 Try Again
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function DayNightCycle() {
  const ambientRef = useRef<THREE.AmbientLight>(null);
  const dirLightRef = useRef<THREE.DirectionalLight>(null);
  const moonLightRef = useRef<THREE.DirectionalLight>(null);
  const hemiLightRef = useRef<THREE.HemisphereLight>(null);
  const skyRef = useRef<any>(null);

  const { scene } = useThree();

  const daySkyColor = useMemo(() => new THREE.Color('#87ceeb'), []);
  const nightSkyColor = useMemo(() => new THREE.Color('#020111'), []);
  const dayFogColor = useMemo(() => new THREE.Color('#c8e6ff'), []);
  const nightFogColor = useMemo(() => new THREE.Color('#0b0b1a'), []);

  // Update loop
  useFrame(({ clock }) => {
    // 120 seconds cycle
    const cycleDuration = 120;
    const elapsedTime = clock.getElapsedTime();
    // 0 to 1 over the cycle
    const progress = (elapsedTime % cycleDuration) / cycleDuration;
    
    // Progress 0 = noon (angle 0)
    // Progress 0.5 = midnight (angle PI)
    const sunAngle = progress * Math.PI * 2;
    const dayRatio = (Math.cos(sunAngle) + 1) / 2;

    const sunX = Math.sin(sunAngle) * 100;
    const sunY = Math.cos(sunAngle) * 100;
    const sunZ = 30; // some static offset so it's not perfectly overhead

    // Direct lighting updates
    if (ambientRef.current) {
      ambientRef.current.intensity = THREE.MathUtils.lerp(0.1, 0.5, dayRatio);
      ambientRef.current.color.lerpColors(new THREE.Color('#2C3E50'), new THREE.Color('#ffeedd'), dayRatio);
    }

    if (dirLightRef.current) {
      dirLightRef.current.position.set(sunX, sunY, sunZ);
      // Smooth fade out when sun goes below horizon
      dirLightRef.current.intensity = Math.max(0, sunY / 100) * 1.5;
    }
    
    if (moonLightRef.current) {
       moonLightRef.current.position.set(-sunX, -sunY, -sunZ);
       // Moon is dimmer than sun
       moonLightRef.current.intensity = Math.max(0, -sunY / 100) * 0.3;
    }

    if (hemiLightRef.current) {
       hemiLightRef.current.intensity = THREE.MathUtils.lerp(0.05, 0.3, dayRatio);
    }

    if (skyRef.current && dirLightRef.current) {
      // Set the @react-three/drei sky uniform shader position
      const material = skyRef.current.material;
      if (material && material.uniforms && material.uniforms.sunPosition) {
        material.uniforms.sunPosition.value.copy(dirLightRef.current.position);
      }
    }

    // Sky colors for the scene background and fog
    if (!scene.background) scene.background = new THREE.Color();
    (scene.background as THREE.Color).lerpColors(nightSkyColor, daySkyColor, dayRatio);
    
    if (scene.fog) {
      (scene.fog as THREE.Fog).color.lerpColors(nightFogColor, dayFogColor, dayRatio);
    }
  });

  return (
    <>
      <Sky
        ref={skyRef}
        sunPosition={[0, 100, 30]} // Initial position
        turbidity={8}
        rayleigh={2}
        mieCoefficient={0.005}
        mieDirectionalG={0.8}
      />

      <ambientLight ref={ambientRef} />
      
      {/* Sun Light */}
      <directionalLight 
        ref={dirLightRef} 
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={200}
        shadow-camera-left={-100}
        shadow-camera-right={100}
        shadow-camera-top={100}
        shadow-camera-bottom={-100}
      />
      
      {/* Moon Light */}
      <directionalLight 
        ref={moonLightRef} 
        castShadow
        color="#a2b9bc"
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-far={200}
        shadow-camera-left={-100}
        shadow-camera-right={100}
        shadow-camera-top={100}
        shadow-camera-bottom={-100}
      />

      <hemisphereLight ref={hemiLightRef} groundColor="#7ec850" />
      <fog attach="fog" args={['#c8e6ff', 80, 250]} />
    </>
  );
}

function SceneContent() {
  return (
    <>
      <DayNightCycle />

      <Physics gravity={[0, -9.81, 0]} debug={false}>
        <Ground />
        <Road />
        <Car />
        <Decorations />
        <BirthdayTriggers />
        <InteractiveObjects />
        <Park />
        <CampSite />
        <TrainStation />
        <WaterPark />
      </Physics>

      <Ocean />
      <FloatingText />
      <Confetti />
      <FollowCamera />
    </>
  );
}

function CanvasLoader() {
  return (
    <mesh>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#9b59b6" wireframe />
    </mesh>
  );
}

export default function Scene() {
  return (
    <SceneErrorBoundary>
      <div style={{ position: 'fixed', inset: 0 }}>
        <Canvas
          shadows
          camera={{ position: [0, 10, -15], fov: 60, near: 0.1, far: 500 }}
          style={{ background: '#87ceeb' }}
        >
          <Suspense fallback={<CanvasLoader />}>
            <SceneContent />
          </Suspense>
        </Canvas>
      </div>
    </SceneErrorBoundary>
  );
}
