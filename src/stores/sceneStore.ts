import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { SceneConfig, ModelConfig, PointLightConfig, DEFAULT_SCENE_CONFIG } from '../types/scene';

// Helper function to save config to public folder via API
async function saveConfigToFile(config: SceneConfig) {
    try {
        const res = await fetch('/api/save-config', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(config, null, 2),
        });
        const data = await res.json();
        if (data.success) {
            console.log('✅ Config saved to public/scene-config.json');
        }
    } catch (error) {
        console.log('⚠️ Could not save to file (only works in dev mode)');
    }
}

interface SceneStore {
    config: SceneConfig;
    selectedModelId: string | null;
    selectedLightId: string | null;
    transformMode: 'translate' | 'rotate' | 'scale';

    // Actions
    setConfig: (config: SceneConfig) => void;
    setTransformMode: (mode: 'translate' | 'rotate' | 'scale') => void;
    updateModel: (modelId: string, updates: Partial<ModelConfig>) => void;
    toggleModelVisibility: (modelId: string) => void;
    setSelectedModel: (modelId: string | null) => void;
    setSelectedLight: (lightId: string | null) => void;
    updateLighting: (lighting: Partial<SceneConfig['lighting']>) => void;
    updateAmbientLight: (updates: Partial<SceneConfig['lighting']['ambient']>) => void;
    updateDirectionalLight: (updates: Partial<SceneConfig['lighting']['directional']>) => void;
    updateHemisphereLight: (updates: Partial<SceneConfig['lighting']['hemisphere']>) => void;
    updatePointLight: (lightId: string, updates: Partial<PointLightConfig>) => void;
    togglePointLight: (lightId: string) => void;
    addPointLight: () => void;
    removePointLight: (lightId: string) => void;

    // Strip Light Actions
    updateStripLight: (lightId: string, updates: Partial<StripLightConfig>) => void;
    toggleStripLight: (lightId: string) => void;
    addStripLight: () => void;
    removeStripLight: (lightId: string) => void;

    saveToFile: () => void;
    resetConfig: () => void;
    exportConfig: () => string;
    importConfig: (json: string) => boolean;
}

export const useSceneStore = create<SceneStore>()(
    persist(
        (set, get) => ({
            config: DEFAULT_SCENE_CONFIG,
            selectedModelId: null,
            selectedLightId: null,
            transformMode: 'translate',

            setConfig: (config) => set({ config }),

            setTransformMode: (mode) => set({ transformMode: mode }),

            updateModel: (modelId, updates) =>
                set((state) => ({
                    config: {
                        ...state.config,
                        models: state.config.models.map((model) =>
                            model.id === modelId ? { ...model, ...updates } : model
                        ),
                    },
                })),

            toggleModelVisibility: (modelId) =>
                set((state) => ({
                    config: {
                        ...state.config,
                        models: state.config.models.map((model) =>
                            model.id === modelId ? { ...model, visible: !model.visible } : model
                        ),
                    },
                })),

            setSelectedModel: (modelId) => set({ selectedModelId: modelId, selectedLightId: null }),

            setSelectedLight: (lightId) => set({ selectedLightId: lightId, selectedModelId: null }),

            updateLighting: (lighting) =>
                set((state) => ({
                    config: {
                        ...state.config,
                        lighting: { ...state.config.lighting, ...lighting },
                    },
                })),

            updateAmbientLight: (updates) =>
                set((state) => ({
                    config: {
                        ...state.config,
                        lighting: {
                            ...state.config.lighting,
                            ambient: { ...state.config.lighting.ambient, ...updates },
                        },
                    },
                })),

            updateDirectionalLight: (updates) =>
                set((state) => ({
                    config: {
                        ...state.config,
                        lighting: {
                            ...state.config.lighting,
                            directional: { ...state.config.lighting.directional, ...updates },
                        },
                    },
                })),

            updateHemisphereLight: (updates) =>
                set((state) => ({
                    config: {
                        ...state.config,
                        lighting: {
                            ...state.config.lighting,
                            hemisphere: { ...state.config.lighting.hemisphere, ...updates },
                        },
                    },
                })),

            updatePointLight: (lightId, updates) =>
                set((state) => ({
                    config: {
                        ...state.config,
                        lighting: {
                            ...state.config.lighting,
                            pointLights: state.config.lighting.pointLights.map((light) =>
                                light.id === lightId ? { ...light, ...updates } : light
                            ),
                        },
                    },
                })),

            togglePointLight: (lightId) =>
                set((state) => ({
                    config: {
                        ...state.config,
                        lighting: {
                            ...state.config.lighting,
                            pointLights: state.config.lighting.pointLights.map((light) =>
                                light.id === lightId ? { ...light, enabled: !light.enabled } : light
                            ),
                        },
                    },
                })),

            addPointLight: () =>
                set((state) => {
                    const newId = `light_${Date.now()}`;
                    const newLight: PointLightConfig = {
                        id: newId,
                        name: `Light ${state.config.lighting.pointLights.length + 1}`,
                        enabled: true,
                        color: '#ffffff',
                        intensity: 1,
                        position: [0, 3, 0],
                        distance: 10,
                    };
                    return {
                        config: {
                            ...state.config,
                            lighting: {
                                ...state.config.lighting,
                                pointLights: [...state.config.lighting.pointLights, newLight],
                            },
                        },
                    };
                }),

            removePointLight: (lightId) =>
                set((state) => ({
                    config: {
                        ...state.config,
                        lighting: {
                            ...state.config.lighting,
                            pointLights: state.config.lighting.pointLights.filter((l) => l.id !== lightId),
                        },
                    },
                })),

            // Strip Light Implementations
            updateStripLight: (lightId, updates) =>
                set((state) => ({
                    config: {
                        ...state.config,
                        lighting: {
                            ...state.config.lighting,
                            stripLights: (state.config.lighting.stripLights || []).map((light) =>
                                light.id === lightId ? { ...light, ...updates } : light
                            ),
                        },
                    },
                })),

            toggleStripLight: (lightId) =>
                set((state) => ({
                    config: {
                        ...state.config,
                        lighting: {
                            ...state.config.lighting,
                            stripLights: (state.config.lighting.stripLights || []).map((light) =>
                                light.id === lightId ? { ...light, enabled: !light.enabled } : light
                            ),
                        },
                    },
                })),

            addStripLight: () =>
                set((state) => {
                    const newId = `strip_${Date.now()}`;
                    const newLight: StripLightConfig = {
                        id: newId,
                        name: `Neon ${(state.config.lighting.stripLights || []).length + 1}`,
                        enabled: true,
                        color: '#00ffff', // Cyan neon default
                        intensity: 2,
                        position: [0, 2, 0],
                        rotation: [0, 0, 0],
                        scale: [0.1, 0.1, 2], // Thin long strip
                    };
                    return {
                        config: {
                            ...state.config,
                            lighting: {
                                ...state.config.lighting,
                                stripLights: [...(state.config.lighting.stripLights || []), newLight],
                            },
                        },
                    };
                }),

            removeStripLight: (lightId) =>
                set((state) => ({
                    config: {
                        ...state.config,
                        lighting: {
                            ...state.config.lighting,
                            stripLights: (state.config.lighting.stripLights || []).filter((l) => l.id !== lightId),
                        },
                    },
                })),

            saveToFile: () => {
                saveConfigToFile(get().config);
            },

            resetConfig: () => {
                set({ config: DEFAULT_SCENE_CONFIG, selectedModelId: null, selectedLightId: null });
                saveConfigToFile(DEFAULT_SCENE_CONFIG);
            },

            exportConfig: () => JSON.stringify(get().config, null, 2),

            importConfig: (json) => {
                try {
                    const config = JSON.parse(json) as SceneConfig;
                    set({ config });
                    saveConfigToFile(config);
                    return true;
                } catch {
                    return false;
                }
            },
        }),
        {
            name: 'scene-config-storage',
        }
    )
);
