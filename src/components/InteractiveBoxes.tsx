import { useRef, useEffect, memo } from 'react';
// import { useFrame } from '@react-three/fiber';  // DISABLED: no emissive animation
// import * as THREE from 'three';  // DISABLED: no emissive blending materials
import { BoxLightConfig } from '../types/scene';

// Detect touch device
function isTouchDevice() {
    if (typeof window === 'undefined') return false;
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
}

interface InteractiveBoxProps {
    light: BoxLightConfig;
    isMobile: boolean;
    onBoxClick?: (boxId: string) => void;
}

// Memoized individual box component — uses refs instead of state to avoid re-renders
const InteractiveBox = memo(function InteractiveBox({ light, isMobile, onBoxClick }: InteractiveBoxProps) {
    const hoveredRef = useRef(false);
    const tappedRef = useRef(false);
    const tapTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // DISABLED: emissive meshes commented out — refs and animation removed
    // Restore coreRef, haloRef, currentOpacity, isAnimating, useFrame when re-enabling

    // Auto-dismiss tapped state after 2 seconds on mobile (using ref, no re-render)
    useEffect(() => {
        return () => {
            if (tapTimerRef.current) clearTimeout(tapTimerRef.current);
        };
    }, []);

    // Hitbox size: larger on mobile for easier tapping
    const hitboxSize: [number, number, number] = isMobile ? [0.25, 0.25, 0.25] : [0.15, 0.15, 0.15];

    return (
        <group position={light.position}>
            {/* Invisible hitbox for hover/tap detection */}
            <mesh
                onPointerOver={isMobile ? undefined : (e) => {
                    e.stopPropagation();
                    hoveredRef.current = true;
                    document.documentElement.classList.add('cursor-pointer');
                }}
                onPointerOut={isMobile ? undefined : () => {
                    hoveredRef.current = false;
                    document.documentElement.classList.remove('cursor-pointer');
                }}
                onClick={isMobile ? (e) => {
                    e.stopPropagation();
                    tappedRef.current = !tappedRef.current;
                    // Auto-dismiss after 2s
                    if (tapTimerRef.current) clearTimeout(tapTimerRef.current);
                    if (tappedRef.current) {
                        tapTimerRef.current = setTimeout(() => { tappedRef.current = false; }, 2000);
                    }
                    onBoxClick?.(light.id);
                } : (e) => {
                    e.stopPropagation();
                    onBoxClick?.(light.id);
                }}
            >
                <boxGeometry args={hitboxSize} />
                <meshBasicMaterial transparent opacity={0} />
            </mesh>

            {/* Emissive glow — DISABLED: commented out per design decision */}
            {/* Outer halo — large, soft, simulates light spread */}
            {/* <mesh ref={haloRef}>
                <sphereGeometry args={[isMobile ? 0.12 : 0.09, 12, 12]} />
                <meshBasicMaterial
                    color={light.color}
                    transparent
                    opacity={haloBaseOpacity}
                    toneMapped={false}
                    depthWrite={false}
                    blending={THREE.AdditiveBlending}
                />
            </mesh> */}
            {/* Inner core — bright, sharp center */}
            {/* <mesh ref={coreRef}>
                <sphereGeometry args={[isMobile ? 0.04 : 0.03, 8, 8]} />
                <meshBasicMaterial
                    color={light.color}
                    transparent
                    opacity={baseOpacity}
                    toneMapped={false}
                    depthWrite={false}
                    blending={THREE.AdditiveBlending}
                />
            </mesh> */}
        </group>
    );
});

interface InteractiveBoxesProps {
    boxLights: BoxLightConfig[];
    onBoxClick?: (boxId: string) => void;
}

export const InteractiveBoxes = memo(function InteractiveBoxes({ boxLights, onBoxClick }: InteractiveBoxesProps) {
    const mobile = isTouchDevice();
    return (
        <>
            {boxLights.filter(l => l.enabled).map((light) => (
                <InteractiveBox key={light.id} light={light} isMobile={mobile} onBoxClick={onBoxClick} />
            ))}
        </>
    );
});
