import { LightConfig } from '../types/scene';
import { memo } from 'react';

// Cache mobile check to avoid forced reflows
const IS_MOBILE = typeof window !== 'undefined' && (
    window.innerWidth <= 768 ||
    'ontouchstart' in window ||
    navigator.maxTouchPoints > 0
);

const SHADOW_MAP_SIZE: [number, number] = IS_MOBILE ? [512, 512] : [2048, 2048];

interface LightingProps {
    config: LightConfig;
    enableShadows?: boolean;
}

export const Lighting = memo(function Lighting({ config, enableShadows = true }: LightingProps) {
    return (
        <>
            {/* Ambient light for base illumination */}
            <ambientLight
                intensity={config.ambient.intensity}
                color={config.ambient.color}
            />

            {/* Main directional light */}
            <directionalLight
                intensity={config.directional.intensity}
                position={config.directional.position}
                color={config.directional.color}
                castShadow={enableShadows}
                shadow-mapSize={SHADOW_MAP_SIZE}
                shadow-camera-far={30} // Restored far plane to encompass the origin from y=20
                shadow-camera-near={0.1}
                shadow-camera-left={-2.5}
                shadow-camera-right={2.5}
                shadow-camera-top={2.5}
                shadow-camera-bottom={-1.8}
                shadow-bias={-0.0005} // Tweak bias slightly to fit higher resolution map
                shadow-normalBias={0.03}
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
});
