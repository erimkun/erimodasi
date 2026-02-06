import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, Stats, TransformControls, Bvh, useTexture, SoftShadows } from '@react-three/drei';
import { Suspense, useRef, useEffect } from 'react';
import * as THREE from 'three';
import { Model } from './Model';
import { Lighting } from './Lighting';
import { useSceneStore } from '../stores/sceneStore';
import { STATIC_MODELS } from '../data/staticModels';
import { preloadModels } from './Model';

// Preload all models immediately so they start downloading in parallel
preloadModels(STATIC_MODELS.map(m => m.path));

interface SceneProps {
    isEditor?: boolean;
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
    return <primitive object={texture} attach="background" />;
};

// Wrapper for OrbitControls
function AdaptiveControls(props: any) {
    return (
        <OrbitControls
            {...props}
            makeDefault
            enableDamping={true}
            dampingFactor={0.05}
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

export function Scene({ isEditor = false }: SceneProps) {
    const config = useSceneStore((s) => s.config);
    const {
        selectedModelId, selectedLightId,
        setSelectedModel, setSelectedLight,
        updateModel, updatePointLight, updateStripLight
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

    return (
        <Canvas
            shadows
            camera={{ position: config.camera.position, fov: 50 }}
            dpr={1}
            gl={{
                antialias: true,
                powerPreference: 'high-performance',
                depth: true,
                stencil: false
            }}
            onPointerMissed={() => {
                if (isEditor) {
                    setSelectedModel(null);
                    setSelectedLight(null);
                }
            }}
        >
            {isEditor && <Stats />}

            <Suspense fallback={<LoadingFallback />}>
                {/* Skybox with texture */}
                <Skybox />

                {/* Soft shadows */}
                <SoftShadows size={10} samples={10} focus={0.5} />

                <Lighting config={config.lighting} />

                {/* Models - each in own Suspense for progressive loading */}
                <Bvh firstHitOnly>
                    {(isEditor ? config.models : STATIC_MODELS).map((model) => {
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
                        return (
                            <Suspense key={model.id} fallback={null}>
                                <Model config={model} />
                            </Suspense>
                        );
                    })}
                </Bvh>

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

                <AdaptiveControls ref={orbitRef} />
            </Suspense>
        </Canvas>
    );
}
