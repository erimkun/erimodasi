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

    // Track real model loading progress via drei useProgress isolated component
    const ProgressTracker = useCallback(() => {
        const { progress, active } = useProgress();
        useEffect(() => {
            if (progress >= 100 && !active) {
                setSceneReady(true);
            }
        }, [progress, active]);
        return null;
    }, []);

    // Popup states
    const [activeProject, setActiveProject] = useState<ProjectData | null>(null);
    const [showTerminal, setShowTerminal] = useState(false);
    const [showProfile, setShowProfile] = useState(false);
    const [showHint, setShowHint] = useState(false);

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
                console.log('[Viewer] highlightBox', action.boxId);
                break;
            case 'closeBubble':
                closeDialogue();
                break;
        }
    }, [closeDialogue]);

    const handleCharacterClick = useCallback((id: string) => {
        console.log('[Viewer] onModelClick fired, id:', id);
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
        console.log('[Viewer] Box clicked:', boxId);
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
        console.log('[Viewer] onMissed fired, clearing focus');
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

    return (
        <div className="viewer">
            <ProgressTracker />
            {isLoading && (
                <LoadingScreen
                    isLoaded={sceneReady}
                    onComplete={() => {
                        setIsLoading(false);
                        // İpucu 2 saniye sonra göster
                        setTimeout(() => setShowHint(true), 2000);
                    }}
                />
            )}
            {focusedModelId && (
                <button
                    className="close-btn"
                    onClick={() => {
                        console.log('[Viewer] close button clicked');
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
