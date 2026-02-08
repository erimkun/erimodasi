// Scene configuration types

export interface ModelConfig {
    id: string;
    name: string;
    path: string;
    visible: boolean;
    position: [number, number, number];
    rotation: [number, number, number];
    scale: [number, number, number];
}

export interface PointLightConfig {
    id: string;
    name: string;
    enabled: boolean;
    color: string;
    intensity: number;
    position: [number, number, number];
    distance: number;
}

export interface StripLightConfig {
    id: string;
    name: string;
    enabled: boolean;
    color: string;
    intensity: number;
    position: [number, number, number];
    rotation: [number, number, number];
    scale: [number, number, number]; // width, height, length
}

export interface BoxLightConfig {
    id: string;
    name: string;
    enabled: boolean;
    color: string;
    baseIntensity: number;    // Intensity when not hovered
    hoverIntensity: number;   // Intensity when hovered
    position: [number, number, number];
    distance: number;
}

export interface LightConfig {
    ambient: {
        intensity: number;
        color: string;
    };
    directional: {
        intensity: number;
        color: string;
        position: [number, number, number];
    };
    hemisphere?: {
        enabled: boolean;
        intensity: number;
        skyColor: string;
        groundColor: string;
    };
    pointLights: PointLightConfig[];
    stripLights: StripLightConfig[];
    boxLights?: BoxLightConfig[];
}

export interface SceneConfig {
    models: ModelConfig[];
    lighting: LightConfig;
    camera: {
        position: [number, number, number];
        target?: [number, number, number]; // Added target property
    };
}

// Default available models
export const AVAILABLE_MODELS: Omit<ModelConfig, 'visible' | 'position' | 'rotation' | 'scale'>[] = [
    { id: 'room', name: 'Room', path: '/room_opt.glb' },
    { id: 'desk', name: 'Desk', path: '/desk_opt.glb' },
    { id: 'cabinet', name: 'Cabinet', path: '/cabinet_opt.glb' },
    { id: 'char', name: 'Character', path: '/char_opt.glb' },
    { id: 'kutu', name: 'Kutu (Box)', path: '/kutu_opt.glb' },
    { id: 'writing', name: 'Writing', path: '/writing_opt.glb' },
];

export const DEFAULT_SCENE_CONFIG: SceneConfig = {
    models: [
        { id: 'room', name: 'Oda', path: '/room_opt.glb', visible: true, position: [0, 0, 0], rotation: [0, 0, 0], scale: [1, 1, 1] },
        { id: 'desk', name: 'Masa', path: '/desk_opt.glb', visible: true, position: [0, 0, 0], rotation: [0, 0, 0], scale: [1, 1, 1] },
        { id: 'chair', name: 'Sandalye', path: '/char_opt.glb', visible: true, position: [0, 0, 0], rotation: [0, 0, 0], scale: [1, 1, 1] },
        { id: 'cabinet', name: 'Dolap', path: '/cabinet_opt.glb', visible: true, position: [0, 0, 0], rotation: [0, 0, 0], scale: [1, 1, 1] },
        { id: 'kutu', name: 'Kutu', path: '/kutu_opt.glb', visible: true, position: [0, 0, 0], rotation: [0, 0, 0], scale: [1, 1, 1] },
        { id: 'writing', name: 'Yazı', path: '/writing_opt.glb', visible: true, position: [0, 0, 0], rotation: [0, 0, 0], scale: [1, 1, 1] },
    ],
    lighting: {
        ambient: {
            intensity: 1.5,
            color: '#e8e0f0'
        },
        directional: {
            intensity: 0.8,
            position: [-5, 8, 5],
            color: '#fff5e6'
        },
        hemisphere: {
            enabled: true,
            skyColor: '#b0c4de',
            groundColor: '#d4a574',
            intensity: 0.5,
        },
        pointLights: [
            {
                id: 'accent1',
                name: 'Neon Accent',
                enabled: true,
                color: '#00ffff',
                intensity: 0.5,
                position: [3, 2, -2],
                distance: 8,
            },
            {
                id: 'accent2',
                name: 'Warm Fill',
                enabled: true,
                color: '#ffaa77',
                intensity: 0.3,
                position: [-3, 1, 2],
                distance: 6,
            },
        ],
        stripLights: [],
    },
    camera: {
        position: [0, 3, 6],
    },
};
