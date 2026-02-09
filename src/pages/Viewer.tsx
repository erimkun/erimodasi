import { useState, useCallback } from 'react';
import { Scene } from '../components/Scene';
import { SpeechBubble } from '../components/SpeechBubble';
import { LoadingScreen } from '../components/LoadingScreen';
import { useDialogueStore } from '../stores/dialogueStore';
import type { DialogueAction } from '../types/dialogue';
import './Viewer.css';

export function Viewer() {
    const [focusedModelId, setFocusedModelId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

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
                // Faz 3'te TerminalPopup açılacak
                console.log('[Viewer] ACTION: openTerminal');
                break;
            case 'openProfile':
                // Faz 3'te ProfilePopup açılacak
                console.log('[Viewer] ACTION: openProfile');
                break;
            case 'openProject':
                // Faz 3'te ProjectPopup açılacak
                console.log('[Viewer] ACTION: openProject', action.boxId);
                break;
            case 'highlightBox':
                // Faz 2'de kutu highlight implementasyonu
                console.log('[Viewer] ACTION: highlightBox', action.boxId);
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
        // desk, writing, kutu tıklama → Faz 3'te popup açılacak
        if (id === 'desk') {
            console.log('[Viewer] Desk clicked → will open TerminalPopup');
        }
        if (id === 'writing') {
            console.log('[Viewer] Writing clicked → will open ProfilePopup');
        }
    }, [startDialogue]);

    const handleBoxClick = useCallback((boxId: string) => {
        console.log('[Viewer] Box clicked:', boxId);
        // Faz 3'te ProjectPopup açılacak
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
                    onComplete={() => setIsLoading(false)}
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
        </div>
    );
}
