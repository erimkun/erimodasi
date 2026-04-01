import { useState, useCallback, useEffect, useTransition } from 'react';
import { useProgress } from '@react-three/drei';
import { Scene } from '../components/Scene';
import { SpeechBubble } from '../components/SpeechBubble';
import { LoadingScreen } from '../components/LoadingScreen';
import { ProjectPopup } from '../components/ProjectPopup';
import { TerminalPopup } from '../components/TerminalPopup';
import { ProfilePopup } from '../components/ProfilePopup';
import { useDialogueStore } from '../stores/dialogueStore';
import { useLoadingStore } from '../stores/loadingStore';
import { getProjectByBoxId } from '../data/projects';
import type { ProjectData } from '../components/ProjectPopup';
import type { DialogueAction } from '../types/dialogue';
import './Viewer.css';

function StoryProgressTracker({ onSceneReady }: { onSceneReady: () => void }) {
    const { progress, active } = useProgress();

    useEffect(() => {
        if (progress >= 100 && !active) {
            onSceneReady();
        }
    }, [progress, active, onSceneReady]);

    return null;
}

function getStoryMeta(currentNodeId: string | null, isOpen: boolean) {
    if (!currentNodeId || !isOpen) {
        return {
            title: 'Odada Keşif Modu',
            subtitle: 'Karaktere, masaya, yazıya veya kutulara dokunarak kendi akışını kur.',
        };
    }

    if (currentNodeId.startsWith('intro_') || currentNodeId.startsWith('about_')) {
        return {
            title: 'Biyografi Akışı',
            subtitle: 'Mühendislik, AI ve XR yolculuğunu adım adım dinliyorsun.',
        };
    }

    if (currentNodeId.startsWith('tour_')) {
        return {
            title: 'Oda Turu',
            subtitle: 'Her obje bir hikaye taşıyor; etkileşimle kapıları açıyorsun.',
        };
    }

    if (currentNodeId.startsWith('project_') || currentNodeId.startsWith('projects_')) {
        return {
            title: 'Proje Vitrini',
            subtitle: 'Kutular üzerinden teknik derinliği katman katman açıyorsun.',
        };
    }

    if (currentNodeId.startsWith('contact_')) {
        return {
            title: 'Bağlantı Noktası',
            subtitle: 'Profil panelinden iletişim ve sosyal kanallara doğrudan geç.',
        };
    }

    return {
        title: 'Canlı Diyalog',
        subtitle: 'Seçimlerin anlatıyı şekillendiriyor; farklı patikaları deneyebilirsin.',
    };
}

function deferMainThreadWork(task: () => void, timeout = 180) {
    const win = window as Window & {
        requestIdleCallback?: (callback: () => void, options?: { timeout: number }) => number;
    };

    if (typeof win.requestIdleCallback === 'function') {
        win.requestIdleCallback(task, { timeout });
        return;
    }

    setTimeout(task, 0);
}

export function Viewer() {
    const [, startTransition] = useTransition();
    const [focusedModelId, setFocusedModelId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [sceneReady, setSceneReady] = useState(false);
    const bakingStatus = useLoadingStore((s) => s.bakingStatus);
    const runtimeReady = sceneReady && bakingStatus === 'done';

    const markSceneReady = useCallback(() => {
        setSceneReady(true);
    }, []);

    // Popup states
    const [activeProject, setActiveProject] = useState<ProjectData | null>(null);
    const [showTerminal, setShowTerminal] = useState(false);
    const [showProfile, setShowProfile] = useState(false);
    const [showHint, setShowHint] = useState(false);
    const [showStoryPanel, setShowStoryPanel] = useState(true);

    // Dialogue store — use individual selectors to avoid unnecessary re-renders
    const showSpeechBubble = useDialogueStore(s => s.isOpen);
    const currentNodeId = useDialogueStore(s => s.currentNodeId);
    const historyFlags = useDialogueStore(s => s.history.length);
    const startDialogue = useDialogueStore(s => s.startDialogue);
    const selectOption = useDialogueStore(s => s.selectOption);
    const goBack = useDialogueStore(s => s.goBack);
    const closeDialogue = useDialogueStore(s => s.close);
    const getCurrentNode = useDialogueStore(s => s.getCurrentNode);

    const currentNode = currentNodeId ? getCurrentNode() : null;
    const canGoBack = historyFlags > 0;

    // Aksiyonları işle
    const handleAction = useCallback((action: DialogueAction | undefined) => {
        if (!action) return;
        switch (action.type) {
            case 'openTerminal':
                startTransition(() => {
                    setShowTerminal(true);
                });
                break;
            case 'openProfile':
                startTransition(() => {
                    setShowProfile(true);
                });
                break;
            case 'openProject': {
                const project = getProjectByBoxId(action.boxId);
                if (project) {
                    startTransition(() => {
                        setActiveProject(project);
                    });
                }
                break;
            }
            case 'highlightBox':
                // Kutu highlight — ışık artışı InteractiveBoxes'ta zaten var
                break;
            case 'closeBubble':
                closeDialogue();
                break;
        }
    }, [closeDialogue, startTransition]);

    const handleCharacterClick = useCallback((id: string) => {
        setFocusedModelId(id);

        if (id === 'char') {
            deferMainThreadWork(() => {
                startTransition(() => {
                    startDialogue();
                });
            }, 600);
        }
        if (id === 'desk') {
            deferMainThreadWork(() => {
                startTransition(() => {
                    setShowTerminal(true);
                });
            });
        }
        if (id === 'writing') {
            deferMainThreadWork(() => {
                startTransition(() => {
                    setShowProfile(true);
                });
            });
        }
    }, [startDialogue]);

    const handleBoxClick = useCallback((boxId: string) => {
        const project = getProjectByBoxId(boxId);
        if (project) {
            deferMainThreadWork(() => {
                startTransition(() => {
                    setActiveProject(project);
                });
            });
        }
    }, [startTransition]);

    const handleMissed = useCallback(() => {
        setFocusedModelId(null);
        closeDialogue();
    }, [closeDialogue]);

    const handleCloseBubble = useCallback(() => {
        closeDialogue();
        setFocusedModelId(null);
    }, [closeDialogue]);

    const handleOptionSelect = useCallback((value: string) => {
        const index = parseInt(value, 10);
        const action = selectOption(index);
        handleAction(action);
    }, [selectOption, handleAction]);

    const handleBack = useCallback(() => {
        goBack();
    }, [goBack]);

    // ESC tuşu ile tüm popup/bubble'ları kapat + zoom reset
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                if (activeProject) { setActiveProject(null); setFocusedModelId(null); return; }
                if (showTerminal) { setShowTerminal(false); setFocusedModelId(null); return; }
                if (showProfile) { setShowProfile(false); setFocusedModelId(null); return; }
                if (showSpeechBubble) { closeDialogue(); setFocusedModelId(null); return; }
                if (focusedModelId) { setFocusedModelId(null); return; }
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [activeProject, showTerminal, showProfile, showSpeechBubble, focusedModelId, closeDialogue]);

    // Mevcut düğümden seçenekleri hazırla
    const options = currentNode?.options.map((opt, i) => ({
        label: opt.label,
        value: String(i),
    }));
    const storyMeta = getStoryMeta(currentNodeId, showSpeechBubble);

    return (
        <div className="viewer">
            <StoryProgressTracker onSceneReady={markSceneReady} />
            {isLoading && (
                <LoadingScreen
                    isLoaded={sceneReady}
                    onComplete={() => {
                        setIsLoading(false);
                        // İpucu 2 saniye sonra göster
                        window.setTimeout(() => setShowHint(true), 2000);
                    }}
                />
            )}

            {!isLoading && showStoryPanel && (
                <div className="story-panel">
                    <button
                        className="story-panel-close"
                        onClick={() => setShowStoryPanel(false)}
                        aria-label="Dijital anlatıyı kapat"
                    >
                        ×
                    </button>
                    <p className="story-panel-kicker">Dijital Anlatı</p>
                    <h2>{storyMeta.title}</h2>
                    <p className="story-panel-subtitle">{storyMeta.subtitle}</p>
                    <div className="story-panel-actions">
                        <button
                            className="story-chip"
                            onClick={() => {
                                setFocusedModelId('char');
                                startTransition(() => startDialogue());
                            }}
                        >
                            Karakterle Başla
                        </button>
                        <button
                            className="story-chip"
                            onClick={() => {
                                const firstProject = getProjectByBoxId('box_1');
                                if (firstProject) {
                                    startTransition(() => setActiveProject(firstProject));
                                }
                            }}
                        >
                            Projeyi Aç
                        </button>
                        <button
                            className="story-chip"
                            onClick={() => startTransition(() => setShowProfile(true))}
                        >
                            Profili Göster
                        </button>
                    </div>
                </div>
            )}

            {focusedModelId && !activeProject && !showTerminal && !showProfile && (
                <button
                    className="close-btn"
                    onClick={() => {
                        setFocusedModelId(null);
                        closeDialogue();
                    }}
                    aria-label="Kapat"
                >
                    ×
                </button>
            )}

            {/* Speech Bubble — dialogue store'dan beslenir */}
            <SpeechBubble
                isVisible={showSpeechBubble && !!currentNode}
                message={currentNode?.message ?? ''}
                options={options}
                onOptionSelect={handleOptionSelect}
                onClose={handleCloseBubble}
                onBack={handleBack}
                canGoBack={canGoBack}
            />

            {!isLoading && showHint && (
                <div className="viewer-hint">
                    <p>✨ Karaktere, kutulara, masaya veya yazıya tıklayın</p>
                </div>
            )}

            {/* Scene always mounted so models preload — keep full size to avoid costly resize recompile */}
            <div className="viewer-canvas" style={!runtimeReady ? { opacity: 0, pointerEvents: 'none' } : undefined}>
                <Scene
                    focusedModelId={focusedModelId}
                    onModelClick={handleCharacterClick}
                    onBoxClick={handleBoxClick}
                    onMissed={handleMissed}
                />
            </div>
            <div className="viewer-footer">
                <p>Erden Erim Aydoğdu Sunar...</p>
            </div>

            {/* Popup'lar */}
            <ProjectPopup
                isVisible={!!activeProject}
                project={activeProject}
                onClose={() => { setActiveProject(null); setFocusedModelId(null); }}
            />
            <TerminalPopup
                isVisible={showTerminal}
                onClose={() => { setShowTerminal(false); setFocusedModelId(null); }}
            />
            <ProfilePopup
                isVisible={showProfile}
                onClose={() => { setShowProfile(false); setFocusedModelId(null); }}
            />
        </div>
    );
}
