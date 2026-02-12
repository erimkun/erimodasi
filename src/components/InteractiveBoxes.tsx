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
    onBoxClick?: (boxId: string) => void;
}

// Memoized individual box component
const InteractiveBox = memo(function InteractiveBox({ light, isMobile, onBoxClick }: InteractiveBoxProps) {
    const [hovered, setHovered] = useState(false);
    const [tapped, setTapped] = useState(false);
    const coreRef = useRef<THREE.Mesh>(null);
    const haloRef = useRef<THREE.Mesh>(null);
    const currentOpacity = useRef(isMobile ? 0.4 : 0.15);
    const isAnimating = useRef(false);

    // Emissive glow opacity targets (replaces expensive PointLights)
    const baseOpacity = isMobile ? 0.4 : 0.15;
    const hoverOpacity = 0.85;
    const haloBaseOpacity = isMobile ? 0.12 : 0.04;
    const haloHoverOpacity = 0.3;

    // Active state: hovered on desktop, tapped on mobile
    const isActive = isMobile ? tapped : hovered;

    useFrame((state) => {
        if (!coreRef.current) return;

        const targetOpacity = isActive ? hoverOpacity : baseOpacity;
        const diff = Math.abs(currentOpacity.current - targetOpacity);

        // Stop animating when close enough to target
        if (diff < 0.005) {
            if (isAnimating.current) {
                (coreRef.current.material as THREE.MeshBasicMaterial).opacity = targetOpacity;
                if (haloRef.current) {
                    (haloRef.current.material as THREE.MeshBasicMaterial).opacity =
                        isActive ? haloHoverOpacity : haloBaseOpacity;
                }
                currentOpacity.current = targetOpacity;
                isAnimating.current = false;
            }
            return;
        }

        isAnimating.current = true;
        currentOpacity.current = THREE.MathUtils.lerp(
            currentOpacity.current,
            targetOpacity,
            0.15
        );
        (coreRef.current.material as THREE.MeshBasicMaterial).opacity = currentOpacity.current;

        // Halo follows core with lower opacity
        if (haloRef.current) {
            const haloTarget = isActive ? haloHoverOpacity : haloBaseOpacity;
            const haloMat = haloRef.current.material as THREE.MeshBasicMaterial;
            haloMat.opacity = THREE.MathUtils.lerp(haloMat.opacity, haloTarget, 0.15);
        }

        // Request next frame for smooth transition
        state.invalidate();
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
                    document.documentElement.classList.add('cursor-pointer');
                }}
                onPointerOut={isMobile ? undefined : () => {
                    setHovered(false);
                    document.documentElement.classList.remove('cursor-pointer');
                }}
                onClick={isMobile ? (e) => {
                    e.stopPropagation();
                    setTapped(prev => !prev);
                    onBoxClick?.(light.id);
                } : (e) => {
                    e.stopPropagation();
                    onBoxClick?.(light.id);
                }}
            >
                <boxGeometry args={hitboxSize} />
                <meshBasicMaterial transparent opacity={0} />
            </mesh>

            {/* Emissive glow — dual layer: inner core + outer halo */}
            {/* Outer halo — large, soft, simulates light spread */}
            <mesh ref={haloRef}>
                <sphereGeometry args={[isMobile ? 0.12 : 0.09, 12, 12]} />
                <meshBasicMaterial
                    color={light.color}
                    transparent
                    opacity={haloBaseOpacity}
                    toneMapped={false}
                    depthWrite={false}
                    blending={THREE.AdditiveBlending}
                />
            </mesh>
            {/* Inner core — bright, sharp center */}
            <mesh ref={coreRef}>
                <sphereGeometry args={[isMobile ? 0.04 : 0.03, 8, 8]} />
                <meshBasicMaterial
                    color={light.color}
                    transparent
                    opacity={baseOpacity}
                    toneMapped={false}
                    depthWrite={false}
                    blending={THREE.AdditiveBlending}
                />
            </mesh>
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
