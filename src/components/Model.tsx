import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { ModelConfig } from '../types/scene';
import { memo, useMemo } from 'react';

import type { ComponentProps } from 'react';

interface ModelProps extends Omit<ComponentProps<'group'>, 'position' | 'rotation' | 'scale'> {
    config: ModelConfig;
    onClick?: () => void;
    isSelected?: boolean;
}

export const Model = memo(function Model({ config, onClick, isSelected, ...props }: ModelProps) {
    const { scene } = useGLTF(config.path);

    // Clone scene with shadow setup
    const clonedScene = useMemo(() => {
        const cloned = scene.clone();
        cloned.traverse((child) => {
            if ((child as any).isMesh) {
                const mesh = child as THREE.Mesh;
                child.receiveShadow = true;
                if (mesh.geometry) {
                    mesh.geometry.computeBoundingSphere();
                    const radius = mesh.geometry.boundingSphere?.radius || 0;
                    child.castShadow = radius > 0.05;
                }
            }
        });
        // Freeze matrix for static models (good optimization, keeps quality)
        cloned.matrixAutoUpdate = false;
        cloned.updateMatrix();
        return cloned;
    }, [scene]);

    if (!config.visible) return null;

    return (
        <group
            position={config.position}
            rotation={config.rotation}
            scale={config.scale}
            {...(onClick ? {
                onClick: (e: any) => {
                    e.stopPropagation();
                    onClick();
                }
            } : {})}
            {...props}
        >
            <primitive object={clonedScene} castShadow receiveShadow />
            {isSelected && (
                <mesh scale={[1.1, 1.1, 1.1]}>
                    <boxGeometry />
                    <meshBasicMaterial color="#00ff00" wireframe opacity={0.3} transparent />
                </mesh>
            )}
        </group>
    );
});

// Preload all models
export function preloadModels(paths: string[]) {
    paths.forEach((path) => useGLTF.preload(path));
}
