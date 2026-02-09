import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { ModelConfig } from '../types/scene';
import { memo, useMemo } from 'react';

import type { ComponentProps } from 'react';

interface ModelProps extends Omit<ComponentProps<'group'>, 'position' | 'rotation' | 'scale'> {
    config: ModelConfig;
    onClick?: () => void;
    isSelected?: boolean;
    enableShadows?: boolean;
}

export const Model = memo(function Model({ config, onClick, isSelected, enableShadows = true, ...props }: ModelProps) {
    const { scene } = useGLTF(config.path);

    // Clone scene with conditional shadow setup
    const clonedScene = useMemo(() => {
        const cloned = scene.clone();
        cloned.traverse((child) => {
            if ((child as any).isMesh) {
                const mesh = child as THREE.Mesh;
                if (enableShadows) {
                    child.receiveShadow = true;
                    if (mesh.geometry) {
                        mesh.geometry.computeBoundingSphere();
                        const radius = mesh.geometry.boundingSphere?.radius || 0;
                        child.castShadow = radius > 0.1; // Raised threshold: only large meshes
                    }
                } else {
                    // Mobile: no shadows at all
                    child.castShadow = false;
                    child.receiveShadow = false;
                }
                // Optimize materials: disable unnecessary features
                if (mesh.material && (mesh.material as any).isMeshStandardMaterial) {
                    const mat = mesh.material as THREE.MeshStandardMaterial;
                    mat.envMapIntensity = enableShadows ? 1 : 0.5;
                }
            }
        });
        // Freeze matrix for static models
        cloned.matrixAutoUpdate = false;
        cloned.updateMatrix();
        return cloned;
    }, [scene, enableShadows]);

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
