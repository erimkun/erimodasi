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

            {/* Main directional light - tight frustum for sharp shadows */}
            <directionalLight
                intensity={config.directional.intensity}
                position={config.directional.position}
                color={config.directional.color}
                castShadow
                shadow-mapSize={[1024, 1024]}
                shadow-camera-far={30}
                shadow-camera-near={0.1}
                shadow-camera-left={-3}
                shadow-camera-right={3}
                shadow-camera-top={3}
                shadow-camera-bottom={-3}
                shadow-bias={-0.001}
                shadow-normalBias={0.02}
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
