import { useRef, useState, memo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { BoxLightConfig } from '../types/scene';

interface InteractiveBoxProps {
    light: BoxLightConfig;
}

// Memoized individual box component
const InteractiveBox = memo(function InteractiveBox({ light }: InteractiveBoxProps) {
    const [hovered, setHovered] = useState(false);
    const lightRef = useRef<THREE.PointLight>(null);
    const currentIntensity = useRef(light.baseIntensity);
    const isAnimating = useRef(false);

    // Only run useFrame when animating (hover transition)
    useFrame(() => {
        if (!lightRef.current) return;

        const targetIntensity = hovered ? light.hoverIntensity : light.baseIntensity;
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
            0.12 // Faster lerp for quicker animation
        );
        lightRef.current.intensity = currentIntensity.current;
    });

    return (
        <group position={light.position}>
            {/* Invisible hitbox for hover detection */}
            <mesh
                onPointerOver={(e) => {
                    e.stopPropagation();
                    setHovered(true);
                    document.body.style.cursor = 'pointer';
                }}
                onPointerOut={() => {
                    setHovered(false);
                    document.body.style.cursor = 'default';
                }}
            >
                <boxGeometry args={[0.15, 0.15, 0.15]} />
                <meshBasicMaterial transparent opacity={0} />
            </mesh>

            {/* Point light inside the box */}
            <pointLight
                ref={lightRef}
                color={light.color}
                intensity={light.baseIntensity}
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
    return (
        <>
            {boxLights.filter(l => l.enabled).map((light) => (
                <InteractiveBox key={light.id} light={light} />
            ))}
        </>
    );
});
