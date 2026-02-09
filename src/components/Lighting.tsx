import { LightConfig } from '../types/scene';
import { memo } from 'react';

interface LightingProps {
    config: LightConfig;
    isMobile?: boolean;
}

export const Lighting = memo(function Lighting({ config, isMobile = false }: LightingProps) {
    // Mobile: smaller shadow map, tighter frustum
    const shadowMapSize: [number, number] = isMobile ? [256, 256] : [1024, 1024];

    return (
        <>
            {/* Ambient light for base illumination */}
            <ambientLight
                intensity={isMobile ? config.ambient.intensity * 1.2 : config.ambient.intensity}
                color={config.ambient.color}
            />

            {/* Main directional light */}
            <directionalLight
                intensity={config.directional.intensity}
                position={config.directional.position}
                color={config.directional.color}
                castShadow={!isMobile}
                shadow-mapSize={shadowMapSize}
                shadow-camera-far={15}
                shadow-camera-near={0.5}
                shadow-camera-left={-2}
                shadow-camera-right={2}
                shadow-camera-top={2.5}
                shadow-camera-bottom={-1}
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
                        distance={isMobile ? Math.min(light.distance, 3) : light.distance}
                        decay={2}
                    />
                )
            )}
        </>
    );
});
