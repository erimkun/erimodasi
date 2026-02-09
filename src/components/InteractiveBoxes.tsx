import { useRef, useState, useEffect, memo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { BoxLightConfig } from '../types/scene';

// Detect touch device
function isTouchDevice() {
    if (typeof window === 'undefined') return false;
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
}

interface InteractiveBoxProps {
    light: BoxLightConfig;
    isMobile: boolean;
}

// Memoized individual box component
const InteractiveBox = memo(function InteractiveBox({ light, isMobile }: InteractiveBoxProps) {
    const [hovered, setHovered] = useState(false);
    const [tapped, setTapped] = useState(false);
    const lightRef = useRef<THREE.PointLight>(null);
    const currentIntensity = useRef(isMobile ? light.hoverIntensity * 0.5 : light.baseIntensity);
    const isAnimating = useRef(false);

    // On mobile, use a "breathing" pulse animation to draw attention
    const pulsePhase = useRef(Math.random() * Math.PI * 2); // random start phase per box

    // On mobile: base intensity is higher so lights are always visible
    const mobileBaseIntensity = light.hoverIntensity * 0.5;
    const effectiveBaseIntensity = isMobile ? mobileBaseIntensity : light.baseIntensity;

    // Active state: hovered on desktop, tapped on mobile
    const isActive = isMobile ? tapped : hovered;

    // Frame counter for mobile throttling
    const frameCount = useRef(0);

    useFrame((state) => {
        if (!lightRef.current) return;

        // Mobile: update every 3rd frame for pulse animation to save GPU
        if (isMobile && !isActive) {
            frameCount.current++;
            if (frameCount.current % 3 !== 0) return;
            const time = state.clock.elapsedTime;
            const pulse = Math.sin(time * 1.5 + pulsePhase.current) * 0.3 + 0.7;
            const pulseIntensity = effectiveBaseIntensity * pulse;
            lightRef.current.intensity = pulseIntensity;
            return;
        }

        const targetIntensity = isActive ? light.hoverIntensity : effectiveBaseIntensity;
        const diff = Math.abs(currentIntensity.current - targetIntensity);

        // Stop animating when close enough to target
        if (diff < 0.01) {
            if (isAnimating.current) {
                lightRef.current.intensity = targetIntensity;
                currentIntensity.current = targetIntensity;
                isAnimating.current = false;
            }
            return;
        }

        isAnimating.current = true;
        currentIntensity.current = THREE.MathUtils.lerp(
            currentIntensity.current,
            targetIntensity,
            0.12
        );
        lightRef.current.intensity = currentIntensity.current;
    });

    // Auto-dismiss tapped state after 2 seconds on mobile
    useEffect(() => {
        if (!tapped) return;
        const timer = setTimeout(() => setTapped(false), 2000);
        return () => clearTimeout(timer);
    }, [tapped]);

    // Hitbox size: larger on mobile for easier tapping
    const hitboxSize: [number, number, number] = isMobile ? [0.25, 0.25, 0.25] : [0.15, 0.15, 0.15];

    return (
        <group position={light.position}>
            {/* Invisible hitbox for hover/tap detection */}
            <mesh
                onPointerOver={isMobile ? undefined : (e) => {
                    e.stopPropagation();
                    setHovered(true);
                    document.body.style.cursor = 'pointer';
                }}
                onPointerOut={isMobile ? undefined : () => {
                    setHovered(false);
                    document.body.style.cursor = 'default';
                }}
                onClick={isMobile ? (e) => {
                    e.stopPropagation();
                    setTapped(prev => !prev);
                } : undefined}
            >
                <boxGeometry args={hitboxSize} />
                <meshBasicMaterial transparent opacity={0} />
            </mesh>

            {/* Visible glowing sphere on mobile so users can see the lights */}
            {isMobile && (
                <mesh>
                    <sphereGeometry args={[0.03, 8, 8]} />
                    <meshBasicMaterial
                        color={light.color}
                        transparent
                        opacity={0.6}
                        toneMapped={false}
                    />
                </mesh>
            )}

            {/* Point light inside the box */}
            <pointLight
                ref={lightRef}
                color={light.color}
                intensity={effectiveBaseIntensity}
                distance={light.distance}
                decay={2}
            />
        </group>
    );
});

interface InteractiveBoxesProps {
    boxLights: BoxLightConfig[];
}

export const InteractiveBoxes = memo(function InteractiveBoxes({ boxLights }: InteractiveBoxesProps) {
    const mobile = isTouchDevice();
    return (
        <>
            {boxLights.filter(l => l.enabled).map((light) => (
                <InteractiveBox key={light.id} light={light} isMobile={mobile} />
            ))}
        </>
    );
});
