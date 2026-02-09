import { useState, useCallback, useEffect } from 'react';
import { Scene } from '../components/Scene';
import { SpeechBubble } from '../components/SpeechBubble';
import { LoadingScreen } from '../components/LoadingScreen';
import { ProjectPopup } from '../components/ProjectPopup';
import { TerminalPopup } from '../components/TerminalPopup';
import { ProfilePopup } from '../components/ProfilePopup';
import { useDialogueStore } from '../stores/dialogueStore';
import { getProjectByBoxId } from '../data/projects';
import type { ProjectData } from '../components/ProjectPopup';
import type { DialogueAction } from '../types/dialogue';
import './Viewer.css';

export function Viewer() {
    const [focusedModelId, setFocusedModelId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Popup states
    const [activeProject, setActiveProject] = useState<ProjectData | null>(null);
    const [showTerminal, setShowTerminal] = useState(false);
    const [showProfile, setShowProfile] = useState(false);
    const [showHint, setShowHint] = useState(false);

    // Dialogue store
    const {
        isOpen: showSpeechBubble,
        startDialogue,
        selectOption,
        goBack,
        close: closeDialogue,
        getCurrentNode,
        history,
    } = useDialogueStore();

    const currentNode = getCurrentNode();
    const canGoBack = history.length > 0;

    // Aksiyonları işle
    const handleAction = useCallback((action: DialogueAction | undefined) => {
        if (!action) return;
        switch (action.type) {
            case 'openTerminal':
                setShowTerminal(true);
                break;
            case 'openProfile':
                setShowProfile(true);
                break;
            case 'openProject': {
                const project = getProjectByBoxId(action.boxId);
                if (project) setActiveProject(project);
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
            setTimeout(() => {
                startDialogue();
            }, 600);
        }
        if (id === 'desk') {
            setShowTerminal(true);
        }
        if (id === 'writing') {
            setShowProfile(true);
        }
    }, [startDialogue]);

    const handleBoxClick = useCallback((boxId: string) => {
        console.log('[Viewer] Box clicked:', boxId);
        const project = getProjectByBoxId(boxId);
        if (project) setActiveProject(project);
    }, []);

    const handleMissed = useCallback(() => {
        console.log('[Viewer] onMissed fired, clearing focus');
        setFocusedModelId(null);
        closeDialogue();
    }, [closeDialogue]);

    const handleCloseBubble = useCallback(() => {
        closeDialogue();
    }, [closeDialogue]);

    const handleOptionSelect = useCallback((value: string) => {
        const index = parseInt(value, 10);
        const action = selectOption(index);
        handleAction(action);
    }, [selectOption, handleAction]);

    const handleBack = useCallback(() => {
        goBack();
    }, [goBack]);

    // ESC tuşu ile tüm popup/bubble'ları kapat
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                if (activeProject) { setActiveProject(null); return; }
                if (showTerminal) { setShowTerminal(false); return; }
                if (showProfile) { setShowProfile(false); return; }
                if (showSpeechBubble) { closeDialogue(); return; }
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
            {isLoading && (
                <LoadingScreen
                    isLoaded={true}
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

            <div className="viewer-canvas">
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
                onClose={() => setActiveProject(null)}
            />
            <TerminalPopup
                isVisible={showTerminal}
                onClose={() => setShowTerminal(false)}
            />
            <ProfilePopup
                isVisible={showProfile}
                onClose={() => setShowProfile(false)}
            />
        </div>
    );
}
