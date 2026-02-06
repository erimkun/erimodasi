import { useCallback, useMemo, useState } from 'react';
import { Scene } from '../components/Scene';
import { useSceneStore } from '../stores/sceneStore';
import './Editor.css';

// Reusable control row component
interface ControlRowProps {
    label: string;
    value: number;
    onChange: (value: number) => void;
    min: number;
    max: number;
    step: number;
    displayValue?: string;
}

function ControlRow({ label, value, onChange, min, max, step, displayValue }: ControlRowProps) {
    return (
        <div className="control-row">
            <label>{label}</label>
            <input
                type="range"
                min={min}
                max={max}
                step={step}
                value={value}
                onChange={(e) => onChange(parseFloat(e.target.value))}
            />
            <input
                type="number"
                className="number-input"
                value={displayValue ?? value.toFixed(2)}
                step={step}
                onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    if (!isNaN(val)) onChange(val);
                }}
            />
        </div>
    );
}

type TabType = 'models' | 'lights';

export function Editor() {
    const [activeTab, setActiveTab] = useState<TabType>('models');

    const {
        config,
        selectedModelId,
        selectedLightId,
        transformMode,
        setTransformMode,
        setSelectedModel,
        setSelectedLight,
        toggleModelVisibility,
        updateModel,
        updateAmbientLight,
        updateDirectionalLight,
        updateHemisphereLight,
        updatePointLight,
        togglePointLight,
        addPointLight,
        removePointLight,
        // Strip Lights
        addStripLight,
        removeStripLight,
        updateStripLight,
        toggleStripLight,
        saveToFile,
        resetConfig,
        exportConfig,
        importConfig,
    } = useSceneStore();

    const selectedModel = useMemo(
        () => config.models.find((m) => m.id === selectedModelId),
        [config.models, selectedModelId]
    );

    // Update selection handlers to clear the other type
    const handleModelSelect = (id: string) => {
        setSelectedModel(id);
        // setSelectedLight(null); // Managed by store action now
    }

    const handleLightSelect = (id: string) => {
        setSelectedLight(id);
        // setSelectedModel(null); // Managed by store action now
    }

    const handlePositionChange = useCallback(
        (axis: 0 | 1 | 2, value: number) => {
            if (!selectedModel) return;
            const newPos: [number, number, number] = [...selectedModel.position];
            newPos[axis] = value;
            updateModel(selectedModel.id, { position: newPos });
        },
        [selectedModel, updateModel]
    );

    const handleRotationChange = useCallback(
        (axis: 0 | 1 | 2, value: number) => {
            if (!selectedModel) return;
            const newRot: [number, number, number] = [...selectedModel.rotation];
            newRot[axis] = value;
            updateModel(selectedModel.id, { rotation: newRot });
        },
        [selectedModel, updateModel]
    );

    const handleScaleChange = useCallback(
        (axis: 0 | 1 | 2, value: number) => {
            if (!selectedModel) return;
            const newScale: [number, number, number] = [...selectedModel.scale];
            newScale[axis] = value;
            updateModel(selectedModel.id, { scale: newScale });
        },
        [selectedModel, updateModel]
    );

    const handleSave = () => {
        saveToFile();
        alert('✅ Kaydedildi! public/scene-config.json güncellendi.');
    };

    const handleImport = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (event) => {
                const json = event.target?.result as string;
                if (importConfig(json)) {
                    alert('✅ Config yüklendi!');
                } else {
                    alert('❌ Geçersiz JSON dosyası');
                }
            };
            reader.readAsText(file);
        };
        input.click();
    };

    const handleExport = () => {
        const json = exportConfig();
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'scene-config.json';
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleReset = () => {
        if (confirm('Tüm ayarları sıfırlamak istediğinize emin misiniz?')) {
            resetConfig();
        }
    };

    return (
        <div className="editor">
            <div className="editor-header">
                <h1>🎨 Scene Editor</h1>
                <div className="header-actions">
                    <button className="btn btn-secondary" onClick={handleImport} title="Import JSON">
                        📂
                    </button>
                    <button className="btn btn-secondary" onClick={handleExport} title="Export JSON">
                        📥
                    </button>
                    <button className="btn btn-primary" onClick={handleSave}>
                        💾 Save
                    </button>
                    <button className="btn btn-secondary" onClick={handleReset} title="Reset">
                        🔄
                    </button>
                    <a href="/" className="view-btn">
                        👁️ View
                    </a>
                </div>
            </div>

            <div className="editor-layout">
                <aside className="sidebar left-sidebar">
                    {/* Tabs */}
                    <div className="tabs">
                        <button
                            className={`tab ${activeTab === 'models' ? 'active' : ''}`}
                            onClick={() => setActiveTab('models')}
                        >
                            📦 Models
                        </button>
                        <button
                            className={`tab ${activeTab === 'lights' ? 'active' : ''}`}
                            onClick={() => setActiveTab('lights')}
                        >
                            💡 Lights
                        </button>
                    </div>

                    {activeTab === 'models' && (
                        <>
                            {/* Transform Mode */}
                            <div className="panel">
                                <h2>Transform Mode</h2>
                                <div className="mode-buttons">
                                    <button
                                        className={`mode-btn ${transformMode === 'translate' ? 'active' : ''}`}
                                        onClick={() => setTransformMode('translate')}
                                    >
                                        ↔️ Move
                                    </button>
                                    <button
                                        className={`mode-btn ${transformMode === 'rotate' ? 'active' : ''}`}
                                        onClick={() => setTransformMode('rotate')}
                                    >
                                        🔄 Rotate
                                    </button>
                                    <button
                                        className={`mode-btn ${transformMode === 'scale' ? 'active' : ''}`}
                                        onClick={() => setTransformMode('scale')}
                                    >
                                        ⬛ Scale
                                    </button>
                                </div>
                            </div>

                            {/* Models List */}
                            <div className="panel">
                                <h2>Models</h2>
                                <ul className="model-list">
                                    {config.models.map((model) => (
                                        <li
                                            key={model.id}
                                            className={`model-item ${selectedModelId === model.id ? 'selected' : ''}`}
                                            onClick={() => setSelectedModel(model.id)}
                                        >
                                            <label onClick={(e) => e.stopPropagation()}>
                                                <input
                                                    type="checkbox"
                                                    checked={model.visible}
                                                    onChange={() => toggleModelVisibility(model.id)}
                                                />
                                                {model.name}
                                            </label>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Selected Model Controls */}
                            {selectedModel && (
                                <div className="panel">
                                    <h2>📍 {selectedModel.name}</h2>

                                    <div className="control-group">
                                        <h3>Position</h3>
                                        <ControlRow label="X" value={selectedModel.position[0]} onChange={(v) => handlePositionChange(0, v)} min={-20} max={20} step={0.1} />
                                        <ControlRow label="Y" value={selectedModel.position[1]} onChange={(v) => handlePositionChange(1, v)} min={-20} max={20} step={0.1} />
                                        <ControlRow label="Z" value={selectedModel.position[2]} onChange={(v) => handlePositionChange(2, v)} min={-20} max={20} step={0.1} />
                                    </div>

                                    <div className="control-group">
                                        <h3>Rotation (°)</h3>
                                        <ControlRow label="X" value={(selectedModel.rotation[0] * 180) / Math.PI} onChange={(v) => handleRotationChange(0, (v * Math.PI) / 180)} min={-180} max={180} step={1} displayValue={((selectedModel.rotation[0] * 180) / Math.PI).toFixed(0)} />
                                        <ControlRow label="Y" value={(selectedModel.rotation[1] * 180) / Math.PI} onChange={(v) => handleRotationChange(1, (v * Math.PI) / 180)} min={-180} max={180} step={1} displayValue={((selectedModel.rotation[1] * 180) / Math.PI).toFixed(0)} />
                                        <ControlRow label="Z" value={(selectedModel.rotation[2] * 180) / Math.PI} onChange={(v) => handleRotationChange(2, (v * Math.PI) / 180)} min={-180} max={180} step={1} displayValue={((selectedModel.rotation[2] * 180) / Math.PI).toFixed(0)} />
                                    </div>

                                    <div className="control-group">
                                        <h3>Scale</h3>
                                        <ControlRow label="X" value={selectedModel.scale[0]} onChange={(v) => handleScaleChange(0, v)} min={0.01} max={10} step={0.1} />
                                        <ControlRow label="Y" value={selectedModel.scale[1]} onChange={(v) => handleScaleChange(1, v)} min={0.01} max={10} step={0.1} />
                                        <ControlRow label="Z" value={selectedModel.scale[2]} onChange={(v) => handleScaleChange(2, v)} min={0.01} max={10} step={0.1} />
                                    </div>
                                </div>
                            )}
                        </>
                    )}

                    {activeTab === 'lights' && (
                        <>
                            {/* Ambient Light */}
                            <div className="panel">
                                <h2>🌍 Ambient Light</h2>
                                <ControlRow label="Intensity" value={config.lighting.ambient.intensity} onChange={(v) => updateAmbientLight({ intensity: v })} min={0} max={2} step={0.05} />
                                <div className="control-row">
                                    <label>Color</label>
                                    <input type="color" value={config.lighting.ambient.color} onChange={(e) => updateAmbientLight({ color: e.target.value })} />
                                </div>
                            </div>

                            {/* Directional Light */}
                            <div className="panel">
                                <h2>☀️ Directional Light</h2>
                                <ControlRow label="Intensity" value={config.lighting.directional.intensity} onChange={(v) => updateDirectionalLight({ intensity: v })} min={0} max={3} step={0.1} />
                                <div className="control-row">
                                    <label>Color</label>
                                    <input type="color" value={config.lighting.directional.color} onChange={(e) => updateDirectionalLight({ color: e.target.value })} />
                                </div>
                                <ControlRow label="Pos X" value={config.lighting.directional.position[0]} onChange={(v) => updateDirectionalLight({ position: [v, config.lighting.directional.position[1], config.lighting.directional.position[2]] })} min={-20} max={20} step={0.5} />
                                <ControlRow label="Pos Y" value={config.lighting.directional.position[1]} onChange={(v) => updateDirectionalLight({ position: [config.lighting.directional.position[0], v, config.lighting.directional.position[2]] })} min={-20} max={20} step={0.5} />
                                <ControlRow label="Pos Z" value={config.lighting.directional.position[2]} onChange={(v) => updateDirectionalLight({ position: [config.lighting.directional.position[0], config.lighting.directional.position[1], v] })} min={-20} max={20} step={0.5} />
                            </div>

                            {/* Hemisphere Light */}
                            {config.lighting.hemisphere && (
                                <div className="panel">
                                    <h2>
                                        <label className="toggle-label">
                                            <input type="checkbox" checked={config.lighting.hemisphere.enabled} onChange={(e) => updateHemisphereLight({ enabled: e.target.checked })} />
                                            🌈 Hemisphere Light
                                        </label>
                                    </h2>
                                    {config.lighting.hemisphere.enabled && (
                                        <>
                                            <ControlRow label="Intensity" value={config.lighting.hemisphere.intensity} onChange={(v) => updateHemisphereLight({ intensity: v })} min={0} max={2} step={0.05} />
                                            <div className="control-row"><label>Sky</label><input type="color" value={config.lighting.hemisphere.skyColor} onChange={(e) => updateHemisphereLight({ skyColor: e.target.value })} /></div>
                                            <div className="control-row"><label>Ground</label><input type="color" value={config.lighting.hemisphere.groundColor} onChange={(e) => updateHemisphereLight({ groundColor: e.target.value })} /></div>
                                        </>
                                    )}
                                </div>
                            )}

                            {/* Point Lights */}
                            <div className="panel">
                                <div className="panel-header">
                                    <h2>💡 Point Lights</h2>
                                    <button className="btn-add" onClick={addPointLight}>+ Add</button>
                                </div>
                                {config.lighting.pointLights?.map((light) => (
                                    <div
                                        key={light.id}
                                        className={`light-item ${selectedLightId === light.id ? 'selected' : ''}`}
                                        onClick={() => handleLightSelect(light.id)}
                                    >
                                        <div className="light-header">
                                            <label className="toggle-label" onClick={(e) => e.stopPropagation()}>
                                                <input
                                                    type="checkbox"
                                                    checked={light.enabled}
                                                    onChange={() => togglePointLight(light.id)}
                                                />
                                                <input
                                                    type="text"
                                                    className="light-name"
                                                    value={light.name}
                                                    onChange={(e) => updatePointLight(light.id, { name: e.target.value })}
                                                    onClick={(e) => e.stopPropagation()}
                                                />
                                            </label>
                                            <button className="btn-delete" onClick={(e) => { e.stopPropagation(); removePointLight(light.id); }}>🗑️</button>
                                        </div>
                                        {light.enabled && selectedLightId === light.id && (
                                            <div className="light-controls" onClick={(e) => e.stopPropagation()}>
                                                <div className="control-row"><label>Color</label><input type="color" value={light.color} onChange={(e) => updatePointLight(light.id, { color: e.target.value })} /></div>
                                                <ControlRow label="Intensity" value={light.intensity} onChange={(v) => updatePointLight(light.id, { intensity: v })} min={0} max={5} step={0.1} />
                                                <ControlRow label="X" value={light.position[0]} onChange={(v) => updatePointLight(light.id, { position: [v, light.position[1], light.position[2]] })} min={-20} max={20} step={0.5} />
                                                <ControlRow label="Y" value={light.position[1]} onChange={(v) => updatePointLight(light.id, { position: [light.position[0], v, light.position[2]] })} min={-20} max={20} step={0.5} />
                                                <ControlRow label="Z" value={light.position[2]} onChange={(v) => updatePointLight(light.id, { position: [light.position[0], light.position[1], v] })} min={-20} max={20} step={0.5} />
                                                <ControlRow label="Distance" value={light.distance} onChange={(v) => updatePointLight(light.id, { distance: v })} min={1} max={50} step={1} />
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {/* Strip Lights (Neon) */}
                            <div className="panel">
                                <div className="panel-header">
                                    <h2>➖ Neon Strips</h2>
                                    <button className="btn-add" onClick={addStripLight}>+ Add</button>
                                </div>
                                {config.lighting.stripLights?.map((light) => (
                                    <div
                                        key={light.id}
                                        className={`light-item ${selectedLightId === light.id ? 'selected' : ''}`}
                                        onClick={() => handleLightSelect(light.id)}
                                    >
                                        <div className="light-header">
                                            <label className="toggle-label" onClick={(e) => e.stopPropagation()}>
                                                <input
                                                    type="checkbox"
                                                    checked={light.enabled}
                                                    onChange={() => toggleStripLight(light.id)}
                                                />
                                                <input
                                                    type="text"
                                                    className="light-name"
                                                    value={light.name}
                                                    onChange={(e) => updateStripLight(light.id, { name: e.target.value })}
                                                    onClick={(e) => e.stopPropagation()}
                                                />
                                            </label>
                                            <button className="btn-delete" onClick={(e) => { e.stopPropagation(); removeStripLight(light.id); }}>🗑️</button>
                                        </div>
                                        {light.enabled && selectedLightId === light.id && (
                                            <div className="light-controls" onClick={(e) => e.stopPropagation()}>
                                                <div className="control-row"><label>Color</label><input type="color" value={light.color} onChange={(e) => updateStripLight(light.id, { color: e.target.value })} /></div>
                                                <ControlRow label="Intensity" value={light.intensity} onChange={(v) => updateStripLight(light.id, { intensity: v })} min={0} max={10} step={0.1} />

                                                <div className="control-group">
                                                    <h3>Size (Scale)</h3>
                                                    <ControlRow label="W" value={light.scale[0]} onChange={(v) => updateStripLight(light.id, { scale: [v, light.scale[1], light.scale[2]] })} min={0.01} max={5} step={0.05} />
                                                    <ControlRow label="H" value={light.scale[1]} onChange={(v) => updateStripLight(light.id, { scale: [light.scale[0], v, light.scale[2]] })} min={0.01} max={5} step={0.05} />
                                                    <ControlRow label="L" value={light.scale[2]} onChange={(v) => updateStripLight(light.id, { scale: [light.scale[0], light.scale[1], v] })} min={0.1} max={10} step={0.1} />
                                                </div>

                                                <div className="control-group">
                                                    <h3>Rotation</h3>
                                                    <ControlRow label="X" value={(light.rotation[0] * 180) / Math.PI} onChange={(v) => updateStripLight(light.id, { rotation: [(v * Math.PI) / 180, light.rotation[1], light.rotation[2]] })} min={-180} max={180} step={15} />
                                                    <ControlRow label="Y" value={(light.rotation[1] * 180) / Math.PI} onChange={(v) => updateStripLight(light.id, { rotation: [light.rotation[0], (v * Math.PI) / 180, light.rotation[2]] })} min={-180} max={180} step={15} />
                                                    <ControlRow label="Z" value={(light.rotation[2] * 180) / Math.PI} onChange={(v) => updateStripLight(light.id, { rotation: [light.rotation[0], light.rotation[1], (v * Math.PI) / 180] })} min={-180} max={180} step={15} />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </aside>

                <main className="canvas-container">
                    <Scene isEditor />
                </main>
            </div>
        </div>
    );
}
