import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { clone } from 'three/examples/jsm/utils/SkeletonUtils.js';
import { ModelConfig } from '../types/scene';
import { memo, useMemo } from 'react';

import type { ComponentProps } from 'react';

/**
 * P3 — WebWorker-based Draco decoding
 * drei's useGLTF internally creates a DRACOLoader which spawns WebWorkers
 * for parallel mesh decompression. setDecoderPath tells it where to fetch
 * the WASM decoder — this runs in workers, NOT on the main thread.
 * Calling this at module level ensures workers are ready before models load.
 */
useGLTF.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.7/');

interface ModelProps extends Omit<ComponentProps<'group'>, 'position' | 'rotation' | 'scale'> {
    config: ModelConfig;
    onClick?: () => void;
    isSelected?: boolean;
}

const CAST_SHADOW_IDS = new Set(['char', 'kutu', 'desk']);

export const Model = memo(function Model({ config, onClick, isSelected, ...props }: ModelProps) {
    const { scene } = useGLTF(config.path);

    // Clone scene with shadow setup
    const clonedScene = useMemo(() => {
        const cloned = clone(scene) as THREE.Object3D;
        cloned.traverse((child) => {
            if ((child as any).isMesh) {
                const mesh = child as THREE.Mesh;
                child.receiveShadow = true;
                if (mesh.geometry) {
                    // Only specific models cast shadows per user request
                    child.castShadow = CAST_SHADOW_IDS.has(config.id);
                }
            }
        });
        // Freeze matrix for static models (good optimization, keeps quality)
        cloned.matrixAutoUpdate = false;
        cloned.updateMatrix();
        return cloned;
    }, [scene, config.id]);

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
