import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Stats, TransformControls, Bvh, useTexture } from '@react-three/drei';
import { Suspense, useRef, useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { Model } from './Model';
import { InteractiveBoxes } from './InteractiveBoxes';
import { Lighting } from './Lighting';
import { useSceneStore } from '../stores/sceneStore';
import { STATIC_SCENE } from '../data/staticScene';
import { ModelConfig } from '../types/scene';
import { preloadModels } from './Model';

// Preload all models immediately so they start downloading in parallel
preloadModels(STATIC_SCENE.models.map(m => m.path));

interface SceneProps {
    isEditor?: boolean;
    focusedModelId?: string | null;
    onModelClick?: (modelId: string) => void;
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
    const texture = useTexture('/sky.png');
    // Ensure correct color space so sky doesn't look washed out
    texture.colorSpace = THREE.SRGBColorSpace;
    return <primitive object={texture} attach="background" />;
};

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
            dampingFactor={0.05}
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

    useFrame(() => {
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
            0.05 // Faster lerp
        );
    });

    return (
        <group
            ref={groupRef}
            position={config.position}
            rotation={config.rotation}
            scale={config.scale}
            onClick={(e) => { e.stopPropagation(); onClick?.(); }}
            onPointerOver={() => { document.body.style.cursor = 'pointer'; }}
            onPointerOut={() => { document.body.style.cursor = 'default'; }}
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
    const focusCamPos = useMemo(() => new THREE.Vector3(0.6, 1.0, 1.2), []);
    const focusTarget = useMemo(() => new THREE.Vector3(0.16, 0.65, 0), []);

    const currentLookAt = useRef(new THREE.Vector3(0, 0, 0));
    const isAnimating = useRef(false);
    const prevFocusedId = useRef<string | null>(null);
    const animationComplete = useRef(true);

    useFrame(() => {
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

        const goalPos = focusedModelId ? focusCamPos : defaultCamPos;
        const goalTarget = focusedModelId ? focusTarget : defaultTarget;

        // Use faster lerp for smoother, quicker animation
        const lerpFactor = 0.12;
        camera.position.lerp(goalPos, lerpFactor);
        currentLookAt.current.lerp(goalTarget, lerpFactor);
        camera.lookAt(currentLookAt.current);

        // Check if animation is complete (use squared distance for performance)
        const dx = camera.position.x - goalPos.x;
        const dy = camera.position.y - goalPos.y;
        const dz = camera.position.z - goalPos.z;
        const distSq = dx * dx + dy * dy + dz * dz;

        if (distSq < 0.0004) { // 0.02 squared
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

export function Scene({ isEditor = false, focusedModelId = null, onModelClick, onMissed }: SceneProps) {
    // Editor uses store config, Viewer uses hardcoded static scene
    const storeConfig = useSceneStore((s) => s.config);
    const config = isEditor ? storeConfig : STATIC_SCENE;
    const {
        selectedModelId, selectedLightId,
        setSelectedModel, setSelectedLight,
        updateModel, updatePointLight, updateStripLight, updateBoxLight
    } = useSceneStore();

    const orbitRef = useRef<any>(null);

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

    return (
        <Canvas
            shadows
            camera={{ position: config.camera.position, fov: 50 }}
            dpr={1}
            gl={{
                antialias: true,
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

            <Suspense fallback={<LoadingFallback />}>
                {/* Skybox with texture */}
                <Skybox />

                <Lighting config={config.lighting} />

                {/* Models - each in own Suspense for progressive loading */}
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
                        return null;
                    })}
                </Bvh>

                {/* Non-clickable models rendered outside Bvh — no raycast interference */}
                {!isEditor && config.models.map((model) => {
                    if (!model.visible || model.id === 'char') return null;
                    return (
                        <Suspense key={model.id} fallback={null}>
                            <Model config={model} />
                        </Suspense>
                    );
                })}

                {/* Interactive Box Lights for Viewer mode */}
                {!isEditor && config.lighting.boxLights && config.lighting.boxLights.length > 0 && (
                    <InteractiveBoxes boxLights={config.lighting.boxLights} />
                )}

                {/* Point Lights (With visual helpers) */}
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
                        ) : (
                            <pointLight
                                key={light.id}
                                position={light.position}
                                intensity={light.intensity}
                                color={light.color}
                                distance={light.distance}
                                decay={2}
                            />
                        )
                    )
                ))}

                {/* Strip Lights (Neon) */}
                {config.lighting.stripLights?.map((light) => (
                    light.enabled && (
                        isEditor ? (
                            <EditableStripLight
                                key={light.id}
                                light={light}
                                isSelected={selectedLightId === light.id}
                                onSelect={() => { setSelectedLight(light.id); }}
                                onTransformChange={handleStripLightTransform(light.id)}
                                orbitRef={orbitRef}
                            />
                        ) : (
                            <group
                                key={light.id}
                                position={light.position}
                                rotation={light.rotation}
                                scale={light.scale}
                            >
                                {/* Geometry removed so it's invisible, just the light source remains */}
                                <pointLight
                                    intensity={light.intensity * 0.5}
                                    color={light.color}
                                    distance={5}
                                    decay={2}
                                />
                            </group>
                        )
                    )
                ))}

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
            </Suspense>
        </Canvas>
    );
}
