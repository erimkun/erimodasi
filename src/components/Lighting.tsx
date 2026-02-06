import { LightConfig } from '../types/scene';

interface LightingProps {
    config: LightConfig;
}

export function Lighting({ config }: LightingProps) {
    return (
        <>
            {/* Ambient light for base illumination */}
            <ambientLight
                intensity={config.ambient.intensity}
                color={config.ambient.color}
            />

            {/* Main directional light with good quality shadows */}
            <directionalLight
                intensity={config.directional.intensity}
                position={config.directional.position}
                color={config.directional.color}
                castShadow
                shadow-mapSize={[1024, 1024]}
                shadow-camera-far={20}
                shadow-camera-left={-5}
                shadow-camera-right={5}
                shadow-camera-top={5}
                shadow-camera-bottom={-5}
                shadow-bias={-0.0005}
            />

            {/* Hemisphere light for realistic sky/ground color blending */}
            {config.hemisphere?.enabled && (
                <hemisphereLight
                    color={config.hemisphere.skyColor}
                    groundColor={config.hemisphere.groundColor}
                    intensity={config.hemisphere.intensity}
                />
            )}

            {/* Point lights for accent/neon effects */}
            {config.pointLights?.map((light) =>
                light.enabled && (
                    <pointLight
                        key={light.id}
                        color={light.color}
                        intensity={light.intensity}
                        position={light.position}
                        distance={light.distance}
                        decay={2}
                    />
                )
            )}
        </>
    );
}
