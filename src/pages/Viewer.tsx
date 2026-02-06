import { useEffect, useState } from 'react';
import { Scene } from '../components/Scene';
import { useSceneStore } from '../stores/sceneStore';
import { SceneConfig, DEFAULT_SCENE_CONFIG } from '../types/scene';
import './Viewer.css';

export function Viewer() {
    const { config, setConfig } = useSceneStore();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Try to load config from static JSON file (for production)
        fetch('/scene-config.json')
            .then((res) => {
                if (!res.ok) throw new Error('Config not found');
                return res.json();
            })
            .then((data: SceneConfig) => {
                setConfig(data);
                setLoading(false);
            })
            .catch(() => {
                // Fallback to localStorage (already loaded by zustand persist)
                // or use default config
                console.log('Using localStorage/default config');
                setLoading(false);
            });
    }, [setConfig]);

    if (loading) {
        return (
            <div className="viewer loading">
                <div className="loader">
                    <div className="spinner"></div>
                    <p>Loading scene...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="viewer">
            <div className="viewer-header">
                <h1>Erim's Room</h1>
                <a href="/editor" className="edit-btn">
                    ✏️ Edit Scene
                </a>
            </div>
            <div className="viewer-canvas">
                <Scene />
            </div>
            <div className="viewer-footer">
                <p>Use mouse to orbit • Scroll to zoom • Click and drag to pan</p>
            </div>
        </div>
    );
}
