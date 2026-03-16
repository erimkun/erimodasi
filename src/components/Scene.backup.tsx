import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Stats, TransformControls, Bvh, useTexture } from '@react-three/drei';
import { Suspense, useRef, useEffect, useMemo, useCallback, memo, useState } from 'react';
import * as THREE from 'three';
import { Model } from './Model';
import { InteractiveBoxes } from './InteractiveBoxes';
import { Lighting } from './Lighting';
import { useSceneStore } from '../stores/sceneStore';
import { useLoadingStore } from '../stores/loadingStore';
import { STATIC_SCENE } from '../data/staticScene';
import { ModelConfig } from '../types/scene';
import { preloadModels } from './Model';

// Detect mobile/touch device — cache result to avoid forced reflows
const IS_MOBILE = typeof window !== 'undefined' && (
    window.innerWidth <= 768 ||
    'ontouchstart' in window ||
    navigator.maxTouchPoints > 0
);

const DEVICE_MEMORY = typeof navigator !== 'undefined' ? (navigator as any).deviceMemory ?? 8 : 8;
const CPU_CORES = typeof navigator !== 'undefined' ? navigator.hardwareConcurrency ?? 8 : 8;
const IS_LOW_END_DEVICE = IS_MOBILE && (DEVICE_MEMORY <= 4 || CPU_CORES <= 6);

type QualityTier = 'high' | 'medium' | 'low';

function getInitialQualityTier(isEditor: boolean): QualityTier {
    if (isEditor) return 'high';
    if (IS_LOW_END_DEVICE) return 'low';
    if (IS_MOBILE) return 'medium';
    return 'high';
}

function getQualitySettings(tier: QualityTier, isEditor: boolean) {
    if (isEditor) {
        return {
            dpr: 1,
            antialias: true,
            enableShadows: true,
            shadowMapSize: [2048, 2048] as [number, number],
        };
    }

    const mobileProfiles: Record<QualityTier, {
        dpr: [number, number];
        antialias: boolean;
        enableShadows: boolean;
        shadowMapSize: [number, number];
    }> = {
        high: {
            dpr: [0.78, 0.95],
            antialias: false,
            enableShadows: true,
            shadowMapSize: [768, 768],
        },
        medium: {
            dpr: [0.68, 0.82],
            antialias: false,
            enableShadows: true,
            shadowMapSize: [512, 512],
        },
        low: {
            dpr: [0.55, 0.7],
            antialias: false,
            enableShadows: true,
            shadowMapSize: [256, 256],
        },
    };

    const desktopProfiles: Record<QualityTier, {
        dpr: [number, number];
        antialias: boolean;
        enableShadows: boolean;
        shadowMapSize: [number, number];
    }> = {
        high: {
            dpr: [0.95, 1.2],
            antialias: true,
            enableShadows: true,
            shadowMapSize: [1024, 1024],
        },
        medium: {
            dpr: [0.85, 1.0],
            antialias: true,
            enableShadows: true,
            shadowMapSize: [1024, 1024],
        },
        low: {
            dpr: [0.72, 0.9],
            antialias: false,
            enableShadows: true,
            shadowMapSize: [512, 512],
        },
    };

    return (IS_MOBILE ? mobileProfiles : desktopProfiles)[tier];
}

// Use CSS class instead of document.body.style.cursor to avoid forced reflows
let _pointerCount = 0;
function setPointerCursor() {
    if (++_pointerCount === 1) document.documentElement.classList.add('cursor-pointer');
}
function resetPointerCursor() {
    if (--_pointerCount <= 0) { _pointerCount = 0; document.documentElement.classList.remove('cursor-pointer'); }
}

// Preload all models immediately so they start downloading in parallel
preloadModels(STATIC_SCENE.models.map(m => m.path));

interface SceneProps {
    isEditor?: boolean;
    focusedModelId?: string | null;
    onModelClick?: (modelId: string) => void;
    onBoxClick?: (boxId: string) => void;
    onMissed?: () => void;
}

function LoadingFallback() {
    return (
        <mesh>
            <boxGeometry args={[1, 1, 1]} />
            <meshBasicMaterial color="#666" wireframe />
        </mesh>
    );
}

function QualityAutoTuner({
    enabled,
    tier,
    onTierChange,
}: {
    enabled: boolean;
    tier: QualityTier;
    onTierChange: (next: QualityTier) => void;
}) {
    const lowFpsDuration = useRef(0);
    const highFpsDuration = useRef(0);
    const cooldownDuration = useRef(0);

    useFrame((_, delta) => {
        if (!enabled) return;
        if (delta <= 0) return;

        const fps = 1 / delta;
        cooldownDuration.current += delta;

        if (fps < 26) {
            lowFpsDuration.current += delta;
            highFpsDuration.current = 0;
        } else if (fps > 53) {
            highFpsDuration.current += delta;
            lowFpsDuration.current = 0;
        } else {
            lowFpsDuration.current = Math.max(0, lowFpsDuration.current - delta * 0.5);
            highFpsDuration.current = Math.max(0, highFpsDuration.current - delta * 0.5);
        }

        if (cooldownDuration.current < 2.5) return;

        if (lowFpsDuration.current > 2.2) {
            if (tier === 'high') onTierChange('medium');
            else if (tier === 'medium') onTierChange('low');
            lowFpsDuration.current = 0;
            cooldownDuration.current = 0;
            return;
        }

        if (highFpsDuration.current > 6.0) {
            if (tier === 'low') onTierChange('medium');
            else if (tier === 'medium') onTierChange('high');
            highFpsDuration.current = 0;
            cooldownDuration.current = 0;
        }
    });

    return null;
}

function RuntimeMetricsReporter() {
    const { gl } = useThree();
    const elapsedAccumulator = useRef(0);
    const maxCalls = useRef(0);

    useFrame((_, delta) => {
        elapsedAccumulator.current += delta;
        const calls = gl.info.render.calls;
        if (calls > maxCalls.current) maxCalls.current = calls;

        if (elapsedAccumulator.current < 1.0) return;

        const info = gl.info;
        (window as any).__R3F_METRICS__ = {
            updatedAt: Date.now(),
            render: {
                calls: info.render.calls,
                triangles: info.render.triangles,
                points: info.render.points,
                lines: info.render.lines,
            },
            memory: {
                geometries: info.memory.geometries,
                textures: info.memory.textures,
            },
            maxCallsInLastSecond: maxCalls.current,
        };

        elapsedAccumulator.current = 0;
        maxCalls.current = 0;
    });

    return null;
}

const Skybox = () => {
    const texture = useTexture('/sky.webp');
    // Ensure correct color space so sky doesn't look washed out
    texture.colorSpace = THREE.SRGBColorSpace;
    return <primitive object={texture} attach="background" />;
};

// Single emissive glow plane to replace 4 strip lights
// DISABLED: commented out per design decision — will be replaced with better solution
// function EmissiveGlowPlane() {
//     return (
//         <mesh
//             position={[0.3, 0.99, -0.87]}
//             rotation={[0, 0, 0]}
//         >
//             <planeGeometry args={[1.45, 0.55]} />
//             <meshBasicMaterial
//                 color="#00ffff"
//                 transparent
//                 opacity={0.04}
//                 side={THREE.FrontSide}
//                 toneMapped={false}
//                 depthWrite={false}
//                 blending={THREE.AdditiveBlending}
//             />
//         </mesh>
//     );
// }

// Wrapper for OrbitControls
function AdaptiveControls({ isEditor, ...props }: any) {
    // Camera starts at [3, 2.5, 3] → azimuth ≈ 0.785 rad (45°)
    // Allow ±30° (0.524 rad) from initial angle in Viewer
    const initialAzimuth = Math.atan2(3, 3); // ~0.785 rad
    const limit = 30 * (Math.PI / 180); // 0.524 rad

    return (
        <OrbitControls
            {...props}
            makeDefault
            enableDamping
            dampingFactor={isEditor ? 0.1 : 0.18}
            // Viewer: no zoom, no pan, limited rotation
            enableZoom={isEditor}
            enablePan={isEditor}
            mouseButtons={isEditor ? undefined : { LEFT: THREE.MOUSE.ROTATE }}
            touches={isEditor ? undefined : { ONE: THREE.TOUCH.ROTATE }}
            minAzimuthAngle={isEditor ? -Infinity : initialAzimuth - limit}
            maxAzimuthAngle={isEditor ? Infinity : initialAzimuth + limit}
            minPolarAngle={isEditor ? 0 : Math.PI / 4}
            maxPolarAngle={isEditor ? Math.PI : Math.PI / 2}
        />
    );
}



// Helper for Strip Light (Neon)
function StripLightHelper({
    color,
    isSelected,
    onClick
}: {
    color: string,
    isSelected: boolean,
    onClick: () => void
}) {
    return (
        <mesh onClick={(e) => { e.stopPropagation(); onClick(); }}>
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial
                color={color}
                emissive={color}
                emissiveIntensity={2}
                toneMapped={false}
            />
            {isSelected && (
                <lineSegments>
                    <edgesGeometry args={[new THREE.BoxGeometry(1, 1, 1)]} />
                    <lineBasicMaterial color="white" />
                </lineSegments>
            )}
        </mesh>
    );
}

// Editable Strip Light Wrapper
function EditableStripLight({
    light,
    isSelected,
    onSelect,
    onTransformChange,
    orbitRef
}: {
    light: any;
    isSelected: boolean;
    onSelect: () => void;
    onTransformChange: (pos: [number, number, number], rot: [number, number, number], scl: [number, number, number]) => void;
    orbitRef: React.RefObject<any>;
}) {
    const groupRef = useRef<THREE.Group>(null);
    const transformRef = useRef<any>(null);
    const transformMode = useSceneStore((s) => s.transformMode) || 'translate';

    useEffect(() => {
        if (!transformRef.current || !orbitRef.current) return;
        const controls = transformRef.current;
        const handleDragging = (e: any) => {
            if (orbitRef.current) orbitRef.current.enabled = !e.value;
        };
        controls.addEventListener('dragging-changed', handleDragging);
        return () => controls.removeEventListener('dragging-changed', handleDragging);
    }, [orbitRef]);

    useEffect(() => {
        if (!transformRef.current || !isSelected) return;
        const controls = transformRef.current;
        const handleChange = () => {
            // For strip lights, we want to update position, rotation, and scale
            if (groupRef.current) {
                const p = groupRef.current.position;
                const r = groupRef.current.rotation;
                const s = groupRef.current.scale;
                onTransformChange([p.x, p.y, p.z], [r.x, r.y, r.z], [s.x, s.y, s.z]);
            }
        };
        controls.addEventListener('mouseUp', handleChange);
        return () => controls.removeEventListener('mouseUp', handleChange);
    }, [isSelected, onTransformChange]);

    return (
        <>
            <group
                ref={groupRef}
                position={light.position}
                rotation={light.rotation}
                scale={light.scale}
            >
                <StripLightHelper
                    color={light.color}
                    isSelected={isSelected}
                    onClick={onSelect}
                />
            </group>
            {isSelected && groupRef.current && (
                <TransformControls
                    ref={transformRef}
                    object={groupRef.current}
                    mode={transformMode}
                    size={0.6}
                />
            )}
        </>
    );
}

// ... EditableObject and LightHelper (Point) remain similar ...
function LightHelper({ position, color, isSelected, onClick }: any) {
    return (
        <mesh position={position} onClick={(e) => { e.stopPropagation(); onClick(); }}>
            <sphereGeometry args={[0.15, 8, 8]} />
            <meshBasicMaterial color={color} transparent opacity={isSelected ? 1 : 0.7} />
            <mesh>
                <ringGeometry args={[0.2, 0.3, 16]} />
                <meshBasicMaterial color={color} transparent opacity={0.3} side={THREE.DoubleSide} />
            </mesh>
        </mesh>
    );
}

function EditableObject({ children, position, rotation, scale, isSelected, onSelect, onTransformChange, orbitRef }: any) {
    const groupRef = useRef<THREE.Group>(null);
    const transformRef = useRef<any>(null);
    const transformMode = useSceneStore((s) => s.transformMode) || 'translate';

    useEffect(() => {
        if (!transformRef.current || !orbitRef.current) return;
        const controls = transformRef.current;
        const handleDragging = (e: any) => { if (orbitRef.current) orbitRef.current.enabled = !e.value; };
        controls.addEventListener('dragging-changed', handleDragging);
        return () => controls.removeEventListener('dragging-changed', handleDragging);
    }, [orbitRef]);

    useEffect(() => {
        if (!transformRef.current || !isSelected) return;
        const controls = transformRef.current;
        const handleChange = () => {
            if (groupRef.current) {
                const p = groupRef.current.position;
                const r = groupRef.current.rotation;
                const s = groupRef.current.scale;
                onTransformChange([p.x, p.y, p.z], [r.x, r.y, r.z], [s.x, s.y, s.z]);
            }
        };
        controls.addEventListener('mouseUp', handleChange);
        return () => controls.removeEventListener('mouseUp', handleChange);
    }, [isSelected, onTransformChange]);

    return (
        <>
            <group
                ref={groupRef}
                position={position}
                rotation={rotation}
                scale={scale}
                onClick={(e) => { e.stopPropagation(); onSelect(); }}
            >
                {children}
            </group>
            {isSelected && groupRef.current && (
                <TransformControls ref={transformRef} object={groupRef.current} mode={transformMode} size={0.6} />
            )}
        </>
    );
}
// Editable Light wrapper (Point)
function EditablePointLight({ light, isSelected, onSelect, onTransformChange, orbitRef }: any) {
    const groupRef = useRef<THREE.Group>(null);
    const transformRef = useRef<any>(null);
    useEffect(() => {
        if (!transformRef.current || !orbitRef.current) return;
        const controls = transformRef.current;
        const handleDragging = (e: any) => { if (orbitRef.current) orbitRef.current.enabled = !e.value; };
        controls.addEventListener('dragging-changed', handleDragging);
        return () => controls.removeEventListener('dragging-changed', handleDragging);
    }, [orbitRef]);
    useEffect(() => {
        if (!transformRef.current || !isSelected) return;
        const controls = transformRef.current;
        const handleChange = () => { if (groupRef.current) { const p = groupRef.current.position; onTransformChange([p.x, p.y, p.z]); } };
        controls.addEventListener('mouseUp', handleChange);
        return () => controls.removeEventListener('mouseUp', handleChange);
    }, [isSelected, onTransformChange]);

    return (
        <>
            <group ref={groupRef} position={light.position} onClick={(e) => { e.stopPropagation(); onSelect(); }}>
                <LightHelper position={[0, 0, 0]} color={light.color} isSelected={isSelected} onClick={() => { }} />
            </group>
            {isSelected && groupRef.current && <TransformControls ref={transformRef} object={groupRef.current} mode="translate" size={0.5} />}
        </>
    );
}

// Box Light Helper (shows as a small cube)
function BoxLightHelper({ color, isSelected, onClick }: {
    color: string;
    isSelected: boolean;
    onClick: () => void;
}) {
    return (
        <mesh onClick={(e) => { e.stopPropagation(); onClick(); }}>
            <boxGeometry args={[0.1, 0.1, 0.1]} />
            <meshStandardMaterial
                color={color}
                emissive={color}
                emissiveIntensity={isSelected ? 3 : 1}
                toneMapped={false}
            />
            {isSelected && (
                <lineSegments>
                    <edgesGeometry args={[new THREE.BoxGeometry(0.12, 0.12, 0.12)]} />
                    <lineBasicMaterial color="white" />
                </lineSegments>
            )}
        </mesh>
    );
}

// Editable Box Light wrapper
function EditableBoxLight({ light, isSelected, onSelect, onTransformChange, orbitRef }: any) {
    const groupRef = useRef<THREE.Group>(null);
    const transformRef = useRef<any>(null);

    useEffect(() => {
        if (!transformRef.current || !orbitRef.current) return;
        const controls = transformRef.current;
        const handleDragging = (e: any) => { if (orbitRef.current) orbitRef.current.enabled = !e.value; };
        controls.addEventListener('dragging-changed', handleDragging);
        return () => controls.removeEventListener('dragging-changed', handleDragging);
    }, [orbitRef]);

    useEffect(() => {
        if (!transformRef.current || !isSelected) return;
        const controls = transformRef.current;
        const handleChange = () => {
            if (groupRef.current) {
                const p = groupRef.current.position;
                onTransformChange([p.x, p.y, p.z]);
            }
        };
        controls.addEventListener('mouseUp', handleChange);
        return () => controls.removeEventListener('mouseUp', handleChange);
    }, [isSelected, onTransformChange]);

    return (
        <>
            <group ref={groupRef} position={light.position} onClick={(e) => { e.stopPropagation(); onSelect(); }}>
                <BoxLightHelper
                    color={light.color}
                    isSelected={isSelected}
                    onClick={() => { }}
                />
                <pointLight
                    color={light.color}
                    intensity={light.baseIntensity}
                    distance={light.distance}
                    decay={2}
                />
            </group>
            {isSelected && groupRef.current && (
                <TransformControls ref={transformRef} object={groupRef.current} mode="translate" size={0.5} />
            )}
        </>
    );
}

// Clickable model wrapper for Viewer mode - animates rotation on focus
const ClickableModel = memo(function ClickableModel({ config, isFocused, onModelClick }: {
    config: ModelConfig;
    isFocused: boolean;
    onModelClick?: (id: string) => void;
}) {
    const groupRef = useRef<THREE.Group>(null);
    const isAnimating = useRef(false);
    const prevFocused = useRef(isFocused);

    const targetRotY = isFocused
        ? config.rotation[1] - (125 * Math.PI / 180)
        : config.rotation[1];

    useFrame((state) => {
        if (!groupRef.current) return;

        // Detect focus change to start animation
        if (prevFocused.current !== isFocused) {
            prevFocused.current = isFocused;
            isAnimating.current = true;
        }

        // Skip if not animating
        if (!isAnimating.current) return;

        const diff = Math.abs(groupRef.current.rotation.y - targetRotY);
        if (diff < 0.01) {
            groupRef.current.rotation.y = targetRotY;
            isAnimating.current = false;
            state.invalidate(); // Once for final paint
            return;
        }

        groupRef.current.rotation.y = THREE.MathUtils.lerp(
            groupRef.current.rotation.y,
            targetRotY,
            0.16
        );
        // Request next frame for smooth animation
        state.invalidate();
    });

    const zeroConfig = useMemo(() => ({
        ...config,
        position: [0, 0, 0] as [number, number, number],
        rotation: [0, 0, 0] as [number, number, number],
        scale: [1, 1, 1] as [number, number, number]
    }), [config]);

    return (
        <group
            ref={groupRef}
            position={config.position}
            rotation={config.rotation}
            scale={config.scale}
            onClick={(e) => { e.stopPropagation(); onModelClick?.(config.id); }}
            onPointerOver={setPointerCursor}
            onPointerOut={resetPointerCursor}
        >
            <Model config={zeroConfig} />
        </group>
    );
});

// Static Hoverable Model wrapper for Viewer mode (Desk, Writing)
const StaticHoverModel = memo(function StaticHoverModel({ config, onModelClick }: {
    config: ModelConfig;
    onModelClick?: (id: string) => void;
}) {
    const zeroConfig = useMemo(() => ({
        ...config,
        position: [0, 0, 0] as [number, number, number],
        rotation: [0, 0, 0] as [number, number, number],
        scale: [1, 1, 1] as [number, number, number]
    }), [config]);

    return (
        <group
            position={config.position}
            rotation={config.rotation}
            scale={config.scale}
            onClick={(e) => { e.stopPropagation(); onModelClick?.(config.id); }}
            onPointerOver={setPointerCursor}
            onPointerOut={resetPointerCursor}
        >
            <Model config={zeroConfig} />
        </group>
    );
});

// Camera animation controller for Viewer mode
function ViewerInteraction({
    focusedModelId,
    orbitRef,
    cameraPosition
}: {
    focusedModelId: string | null;
    orbitRef: React.RefObject<any>;
    cameraPosition: [number, number, number];
}) {
    const { camera } = useThree();
    const defaultCamPos = useMemo(() => new THREE.Vector3(...cameraPosition), [cameraPosition]);
    const defaultTarget = useMemo(() => new THREE.Vector3(0, 0, 0), []);

    // Farklı modeller için kamera pozisyonları ve hedefleri
    const FOCUS_CONFIGS: Record<string, { camPos: THREE.Vector3; target: THREE.Vector3 }> = useMemo(() => ({
        char: {
            camPos: new THREE.Vector3(0.6, 1.0, 1.2),
            target: new THREE.Vector3(0.16, 0.65, 0),
        },
        kutu: {
            camPos: new THREE.Vector3(1.8, 0.8, 0.8),
            target: new THREE.Vector3(1.0, 0.4, -0.5),
        },
        desk: {
            camPos: new THREE.Vector3(0.3, 1.2, 1.0),
            target: new THREE.Vector3(-0.4, 0.5, 0),
        },
        writing: {
            camPos: new THREE.Vector3(0.8, 1.0, 0.3),
            target: new THREE.Vector3(0.3, 0.8, -0.9),
        },
    }), []);

    const currentLookAt = useRef(new THREE.Vector3(0, 0, 0));
    const isAnimating = useRef(false);
    const prevFocusedId = useRef<string | null>(null);
    const animationComplete = useRef(true);

    useFrame((state) => {
        const controls = orbitRef.current;
        if (!controls) return;

        // Recovery path: if controls remain disabled while no model is focused,
        // force a return animation back to the default orbit view.
        if (!focusedModelId && !controls.enabled && !isAnimating.current) {
            isAnimating.current = true;
            animationComplete.current = false;
        }

        // Early exit if no animation needed
        if (animationComplete.current && !focusedModelId) {
            return;
        }

        // Only trigger animation when focusedModelId changes
        const focusChanged = prevFocusedId.current !== focusedModelId;
        if (focusChanged) {
            prevFocusedId.current = focusedModelId;
            isAnimating.current = true;
            animationComplete.current = false;
            if (focusedModelId) {
                currentLookAt.current.copy(controls.target);
                controls.enabled = false;
            }
        }

        // Skip heavy calculations if not animating
        if (!isAnimating.current) {
            return;
        }

        const goalPos = focusedModelId && FOCUS_CONFIGS[focusedModelId]
            ? FOCUS_CONFIGS[focusedModelId].camPos
            : defaultCamPos;
        const goalTarget = focusedModelId && FOCUS_CONFIGS[focusedModelId]
            ? FOCUS_CONFIGS[focusedModelId].target
            : defaultTarget;

        // Use faster lerp for smoother, quicker animation
        const lerpFactor = 0.2;
        camera.position.lerp(goalPos, lerpFactor);
        currentLookAt.current.lerp(goalTarget, lerpFactor);
        camera.lookAt(currentLookAt.current);

        // Always invalidate while animating
        state.invalidate();

        // Check if animation is complete (use squared distance for performance)
        const dx = camera.position.x - goalPos.x;
        const dy = camera.position.y - goalPos.y;
        const dz = camera.position.z - goalPos.z;
        const distSq = dx * dx + dy * dy + dz * dz;

        if (distSq < 0.001) {
            // Snap to final position
            camera.position.copy(goalPos);
            currentLookAt.current.copy(goalTarget);
            camera.lookAt(goalTarget);
            isAnimating.current = false;

            if (!focusedModelId) {
                // Returning to default - re-enable controls
                controls.target.copy(goalTarget);
                controls.enabled = true;
                controls.update();
            }
            animationComplete.current = true;
            state.invalidate(); // Final paint
        }
    });

    useEffect(() => {
        const controls = orbitRef.current;
        if (!controls) return;

        // If focus is fully cleared externally, ensure controls are restored.
        if (!focusedModelId && controls.enabled === false) {
            isAnimating.current = true;
            animationComplete.current = false;
        }
    }, [focusedModelId, orbitRef]);

    return null;
}

// Sequential Baker: Waits for signal -> Compiles shaders -> Computes Shadows -> Done
function ShadowBaker({ enableShadows }: { enableShadows: boolean }) {
    const { gl, scene, camera, invalidate } = useThree();
    const bakingStatus = useLoadingStore((s) => s.bakingStatus);
    const setBakingStatus = useLoadingStore((s) => s.setBakingStatus);
    const setFluidPaused = useLoadingStore((s) => s.setFluidPaused);
    const frameCount = useRef(0);

    useFrame(() => {
        if (bakingStatus === 'baking') {
            frameCount.current++;

            // Frame 1: Pre-compile ALL shader programs while behind the loading screen.
            // This eliminates the 300-500ms jank spike on first user interaction.
            if (frameCount.current === 1) {
                gl.compile(scene, camera);
                invalidate();
            }

            // Frame 2: Bake shadow maps (separate GPU programs from main shaders).
            if (frameCount.current === 2) {
                if (enableShadows) {
                    gl.shadowMap.autoUpdate = false;
                    gl.shadowMap.needsUpdate = true;
                }
                invalidate();
            }

            // Frame 3: Signal done & resume fluid
            if (frameCount.current >= 3) {
                setBakingStatus('done');
                setFluidPaused(false);
                frameCount.current = 0;
            }
        }
    });
    return null;
}

// Keeps GPU shader caches warm during idle (demand frameloop).
// Without this, after ~2-5 min idle the browser evicts compiled shaders,
// causing 50-300ms long-task spikes on the next drag interaction.
function GpuKeepalive() {
    const { invalidate } = useThree();

    useEffect(() => {
        const id = setInterval(() => {
            invalidate();
        }, 20_000);
        return () => clearInterval(id);
    }, [invalidate]);

    return null;
}

export const Scene = memo(function Scene({ isEditor = false, focusedModelId = null, onModelClick, onBoxClick, onMissed }: SceneProps) {
    // Editor uses store config, Viewer uses hardcoded static scene
    const storeConfig = useSceneStore((s) => s.config);
    const config = isEditor ? storeConfig : STATIC_SCENE;
    // Use individual selectors to prevent unnecessary re-renders (R3F best practice)
    const selectedModelId = useSceneStore((s) => s.selectedModelId);
    const selectedLightId = useSceneStore((s) => s.selectedLightId);
    const setSelectedModel = useSceneStore((s) => s.setSelectedModel);
    const setSelectedLight = useSceneStore((s) => s.setSelectedLight);
    const updateModel = useSceneStore((s) => s.updateModel);
    const updatePointLight = useSceneStore((s) => s.updatePointLight);
    const updateStripLight = useSceneStore((s) => s.updateStripLight);
    const updateBoxLight = useSceneStore((s) => s.updateBoxLight);

    const orbitRef = useRef<any>(null);

    const handleModelTransform = useCallback((modelId: string) => (pos: [number, number, number], rot: [number, number, number], scl: [number, number, number]) => {
        updateModel(modelId, { position: pos, rotation: rot, scale: scl });
    }, [updateModel]);

    const handlePointLightTransform = useCallback((lightId: string) => (pos: [number, number, number]) => {
        updatePointLight(lightId, { position: pos });
    }, [updatePointLight]);

    const handleStripLightTransform = useCallback((lightId: string) => (pos: [number, number, number], rot: [number, number, number], scl: [number, number, number]) => {
        updateStripLight(lightId, { position: pos, rotation: rot, scale: scl });
    }, [updateStripLight]);

    const handleBoxLightTransform = useCallback((lightId: string) => (pos: [number, number, number]) => {
        updateBoxLight(lightId, { position: pos });
    }, [updateBoxLight]);

    const [qualityTier, setQualityTier] = useState<QualityTier>(() => getInitialQualityTier(isEditor));

    const quality = useMemo(() => getQualitySettings(qualityTier, isEditor), [qualityTier, isEditor]);

    const dpr = useMemo(() => {
        if (Array.isArray(quality.dpr)) {
            const deviceDpr = Math.min(window.devicePixelRatio || 1, 2);
            const [minDpr, maxDpr] = quality.dpr;
            return Math.max(minDpr, Math.min(deviceDpr, maxDpr));
        }
        return quality.dpr;
    }, [quality]);

    const enableShadows = quality.enableShadows;
    const enableBvh = false;

    return (
        <Canvas
            shadows={enableShadows}
            frameloop="demand"
            camera={{ position: config.camera.position, fov: 50 }}
            dpr={dpr}
            onCreated={({ gl }) => {
                if (enableShadows) {
                    gl.shadowMap.enabled = true;
                    gl.shadowMap.type = THREE.PCFShadowMap;
                }
            }}
            gl={{
                antialias: quality.antialias,
                powerPreference: 'high-performance',
                precision: IS_MOBILE ? 'mediump' : 'highp',
                depth: true,
                stencil: false,
                toneMapping: THREE.AgXToneMapping,
                toneMappingExposure: 1.05
            }}
            onPointerMissed={() => {
                if (isEditor) {
                    setSelectedModel(null);
                    setSelectedLight(null);
                }
                if (!isEditor && onMissed) {
                    onMissed();
                }
            }}
        >
            {isEditor && <Stats />}

            <Suspense fallback={<LoadingFallback />}>
                {/* Skybox with texture */}
                <Skybox />

                {!isEditor && (
                    <QualityAutoTuner
                        enabled={false}
                        tier={qualityTier}
                        onTierChange={setQualityTier}
                    />
                )}

                <RuntimeMetricsReporter />

                <Lighting
                    config={config.lighting}
                    enableShadows={enableShadows}
                    shadowMapSize={quality.shadowMapSize}
                />

                {/* Models - each in own Suspense for progressive loading */}
                {enableBvh ? (
                    <Bvh firstHitOnly>
                        {config.models.map((model) => {
                            if (!model.visible) return null;
                            if (isEditor) {
                                return (
                                    <Suspense key={model.id} fallback={null}>
                                        <EditableObject
                                            position={model.position}
                                            rotation={model.rotation}
                                            scale={model.scale}
                                            isSelected={selectedModelId === model.id}
                                            onSelect={() => { setSelectedModel(model.id); }}
                                            onTransformChange={handleModelTransform(model.id)}
                                            orbitRef={orbitRef}
                                        >
                                            <Model config={{ ...model, position: [0, 0, 0], rotation: [0, 0, 0], scale: [1, 1, 1] }} />
                                        </EditableObject>
                                    </Suspense>
                                );
                            }
                            if (model.id === 'char') {
                                return (
                                    <Suspense key={model.id} fallback={null}>
                                        <ClickableModel
                                            config={model}
                                            isFocused={focusedModelId === model.id}
                                            onModelClick={onModelClick}
                                        />
                                    </Suspense>
                                );
                            }
                            if (model.id === 'desk' || model.id === 'writing') {
                                return (
                                    <Suspense key={model.id} fallback={null}>
                                        <StaticHoverModel config={model} onModelClick={onModelClick} />
                                    </Suspense>
                                );
                            }
                            return null;
                        })}
                    </Bvh>
                ) : (
                    <>
                        {config.models.map((model) => {
                            if (!model.visible) return null;
                            if (isEditor) {
                                return (
                                    <Suspense key={model.id} fallback={null}>
                                        <EditableObject
                                            position={model.position}
                                            rotation={model.rotation}
                                            scale={model.scale}
                                            isSelected={selectedModelId === model.id}
                                            onSelect={() => { setSelectedModel(model.id); }}
                                            onTransformChange={handleModelTransform(model.id)}
                                            orbitRef={orbitRef}
                                        >
                                            <Model config={{ ...model, position: [0, 0, 0], rotation: [0, 0, 0], scale: [1, 1, 1] }} />
                                        </EditableObject>
                                    </Suspense>
                                );
                            }
                            if (model.id === 'char') {
                                return (
                                    <Suspense key={model.id} fallback={null}>
                                        <ClickableModel
                                            config={model}
                                            isFocused={focusedModelId === model.id}
                                            onModelClick={onModelClick}
                                        />
                                    </Suspense>
                                );
                            }
                            if (model.id === 'desk' || model.id === 'writing') {
                                return (
                                    <Suspense key={model.id} fallback={null}>
                                        <StaticHoverModel config={model} onModelClick={onModelClick} />
                                    </Suspense>
                                );
                            }
                            return null;
                        })}
                    </>
                )}

                {/* Non-clickable models rendered outside Bvh — no raycast interference */}
                {!isEditor && config.models.map((model) => {
                    if (!model.visible) return null;
                    // Tıklanabilir modeller Bvh içinde render ediliyor
                    if (model.id === 'char' || model.id === 'desk' || model.id === 'writing') return null;
                    return (
                        <Suspense key={model.id} fallback={null}>
                            <Model config={model} />
                        </Suspense>
                    );
                })}

                {/* Interactive Box Lights for Viewer mode */}
                {!isEditor && config.lighting.boxLights && config.lighting.boxLights.length > 0 && (
                    <InteractiveBoxes boxLights={config.lighting.boxLights} onBoxClick={onBoxClick} />
                )}

                {/* Point Lights (With visual helpers in editor) */}
                {config.lighting.pointLights?.map((light) => (
                    light.enabled && (
                        isEditor ? (
                            <EditablePointLight
                                key={light.id}
                                light={light}
                                isSelected={selectedLightId === light.id}
                                onSelect={() => { setSelectedLight(light.id); }}
                                onTransformChange={handlePointLightTransform(light.id)}
                                orbitRef={orbitRef}
                            />
                        ) : null
                    )
                ))}

                {/* Strip Lights (Neon) — Editor keeps editable, Viewer uses single emissive plane */}
                {isEditor && config.lighting.stripLights?.map((light) => (
                    light.enabled && (
                        <EditableStripLight
                            key={light.id}
                            light={light}
                            isSelected={selectedLightId === light.id}
                            onSelect={() => { setSelectedLight(light.id); }}
                            onTransformChange={handleStripLightTransform(light.id)}
                            orbitRef={orbitRef}
                        />
                    )
                ))}

                {/* Viewer: emissive glow plane DISABLED */}
                {/* {!isEditor && <EmissiveGlowPlane />} */}

                {/* Box Lights (Interactive) */}
                {config.lighting.boxLights?.map((light) => (
                    light.enabled && (
                        isEditor ? (
                            <EditableBoxLight
                                key={light.id}
                                light={light}
                                isSelected={selectedLightId === light.id}
                                onSelect={() => { setSelectedLight(light.id); }}
                                onTransformChange={handleBoxLightTransform(light.id)}
                                orbitRef={orbitRef}
                            />
                        ) : null
                    )
                ))}

                <AdaptiveControls ref={orbitRef} isEditor={isEditor} />

                {!isEditor && (
                    <ViewerInteraction
                        focusedModelId={focusedModelId}
                        orbitRef={orbitRef}
                        cameraPosition={config.camera.position}
                    />
                )}
                {!isEditor && <ShadowBaker enableShadows={enableShadows} />}
                {!isEditor && <GpuKeepalive />}
            </Suspense>
        </Canvas>
    );
});
