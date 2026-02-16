import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Stats, TransformControls, Bvh, useTexture } from '@react-three/drei';
import { Suspense, useRef, useEffect, useMemo, useState } from 'react';
import * as THREE from 'three';
import { Model } from './Model';
import { InteractiveBoxes } from './InteractiveBoxes';
import { Lighting } from './Lighting';
import { useSceneStore } from '../stores/sceneStore';
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
            enableDamping={true}
            dampingFactor={0.1}
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
function ClickableModel({ config, isFocused, onClick }: {
    config: ModelConfig;
    isFocused: boolean;
    onClick?: () => void;
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
            return;
        }

        groupRef.current.rotation.y = THREE.MathUtils.lerp(
            groupRef.current.rotation.y,
            targetRotY,
            0.08
        );
        // Request next frame for smooth animation
        state.invalidate();
    });

    return (
        <group
            ref={groupRef}
            position={config.position}
            rotation={config.rotation}
            scale={config.scale}
            onClick={(e) => { e.stopPropagation(); onClick?.(); }}
            onPointerOver={setPointerCursor}
            onPointerOut={resetPointerCursor}
        >
            <Model config={{ ...config, position: [0, 0, 0], rotation: [0, 0, 0], scale: [1, 1, 1] }} />
        </group>
    );
}

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
        const lerpFactor = 0.12;
        camera.position.lerp(goalPos, lerpFactor);
        currentLookAt.current.lerp(goalTarget, lerpFactor);
        camera.lookAt(currentLookAt.current);

        // Request next frame
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
                animationComplete.current = true;
            }
        }
    });

    return null;
}

// Disable shadow auto-update for static scenes — massive perf win on mobile
// Computes shadow map once, then freezes it
function ShadowFreeze() {
    const { gl } = useThree();
    const done = useRef(false);
    useFrame(() => {
        if (!done.current) {
            // Let first frame compute shadow map, then freeze
            gl.shadowMap.autoUpdate = false;
            gl.shadowMap.needsUpdate = true;
            done.current = true;
        }
    });
    return null;
}

export function Scene({ isEditor = false, focusedModelId = null, onModelClick, onBoxClick, onMissed }: SceneProps) {
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
    const [isInteracting, setIsInteracting] = useState(false);
    const interactionTimeoutRef = useRef<number | null>(null);

    const beginInteraction = () => {
        if (interactionTimeoutRef.current !== null) {
            window.clearTimeout(interactionTimeoutRef.current);
            interactionTimeoutRef.current = null;
        }
        setIsInteracting(true);
    };

    const endInteraction = () => {
        if (interactionTimeoutRef.current !== null) {
            window.clearTimeout(interactionTimeoutRef.current);
        }
        interactionTimeoutRef.current = window.setTimeout(() => {
            setIsInteracting(false);
            interactionTimeoutRef.current = null;
        }, 120);
    };

    useEffect(() => {
        return () => {
            if (interactionTimeoutRef.current !== null) {
                window.clearTimeout(interactionTimeoutRef.current);
            }
        };
    }, []);

    const handleModelTransform = (modelId: string) => (pos: [number, number, number], rot: [number, number, number], scl: [number, number, number]) => {
        updateModel(modelId, { position: pos, rotation: rot, scale: scl });
    };

    const handlePointLightTransform = (lightId: string) => (pos: [number, number, number]) => {
        updatePointLight(lightId, { position: pos });
    };

    const handleStripLightTransform = (lightId: string) => (pos: [number, number, number], rot: [number, number, number], scl: [number, number, number]) => {
        updateStripLight(lightId, { position: pos, rotation: rot, scale: scl });
    };

    const handleBoxLightTransform = (lightId: string) => (pos: [number, number, number]) => {
        updateBoxLight(lightId, { position: pos });
    };

    const dpr = useMemo(() => {
        const reducedQuality = !isEditor && (isInteracting || !!focusedModelId);

        if (reducedQuality) {
            if (IS_LOW_END_DEVICE) return 0.5;
            if (IS_MOBILE) return 0.62;
            return 0.72;
        }

        if (isEditor) return 1;
        if (IS_LOW_END_DEVICE) return 0.7;
        if (IS_MOBILE) return 0.85;
        return Math.min(window.devicePixelRatio || 1, 1.25);
    }, [isEditor, isInteracting, focusedModelId]);

    const enableShadows = (isEditor || !IS_LOW_END_DEVICE) && !isInteracting;
    const enableBvh = false;

    return (
        <Canvas
            shadows={enableShadows}
            frameloop="demand"
            camera={{ position: config.camera.position, fov: 50 }}
            dpr={dpr}
            gl={{
                antialias: !IS_MOBILE && !IS_LOW_END_DEVICE,
                powerPreference: 'high-performance',
                depth: true,
                stencil: false,
                toneMapping: THREE.AgXToneMapping,
                toneMappingExposure: 1.0
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
            {/* Freeze shadow map after first frame — static scene optimization */}
            {!isEditor && <ShadowFreeze />}

            <Suspense fallback={<LoadingFallback />}>
                {/* Skybox with texture */}
                <Skybox />

                <Lighting config={config.lighting} enableShadows={enableShadows} />

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
                                            onClick={() => onModelClick?.(model.id)}
                                        />
                                    </Suspense>
                                );
                            }
                            if (model.id === 'desk' || model.id === 'writing') {
                                return (
                                    <Suspense key={model.id} fallback={null}>
                                        <group
                                            position={model.position}
                                            rotation={model.rotation}
                                            scale={model.scale}
                                            onClick={(e) => { e.stopPropagation(); onModelClick?.(model.id); }}
                                            onPointerOver={setPointerCursor}
                                            onPointerOut={resetPointerCursor}
                                        >
                                            <Model config={{ ...model, position: [0, 0, 0], rotation: [0, 0, 0], scale: [1, 1, 1] }} />
                                        </group>
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
                                            onClick={() => onModelClick?.(model.id)}
                                        />
                                    </Suspense>
                                );
                            }
                            if (model.id === 'desk' || model.id === 'writing') {
                                return (
                                    <Suspense key={model.id} fallback={null}>
                                        <group
                                            position={model.position}
                                            rotation={model.rotation}
                                            scale={model.scale}
                                            onClick={(e) => { e.stopPropagation(); onModelClick?.(model.id); }}
                                            onPointerOver={setPointerCursor}
                                            onPointerOut={resetPointerCursor}
                                        >
                                            <Model config={{ ...model, position: [0, 0, 0], rotation: [0, 0, 0], scale: [1, 1, 1] }} />
                                        </group>
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

                <AdaptiveControls
                    ref={orbitRef}
                    isEditor={isEditor}
                    onStart={beginInteraction}
                    onEnd={endInteraction}
                />

                {!isEditor && (
                    <ViewerInteraction
                        focusedModelId={focusedModelId}
                        orbitRef={orbitRef}
                        cameraPosition={config.camera.position}
                    />
                )}
            </Suspense>
        </Canvas>
    );
}
