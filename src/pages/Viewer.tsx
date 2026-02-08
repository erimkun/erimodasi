import { useState } from 'react';
import { Scene } from '../components/Scene';
import { SpeechBubble } from '../components/SpeechBubble';
import { LoadingScreen } from '../components/LoadingScreen';
import './Viewer.css';

export function Viewer() {
    const [focusedModelId, setFocusedModelId] = useState<string | null>(null);
    const [showSpeechBubble, setShowSpeechBubble] = useState(false);
    const [currentMessage, setCurrentMessage] = useState("Merhaba, Nasılsın?");
    const [showOptions, setShowOptions] = useState(true);
    const [isLoading, setIsLoading] = useState(true);

    const handleCharacterClick = (id: string) => {
        console.log('[Viewer] onModelClick fired, id:', id);
        setFocusedModelId(id);

        // Karakter tıklandığında speech bubble göster
        if (id === 'char') {
            setCurrentMessage("Merhaba, Nasılsın?");
            setShowOptions(true);
            setTimeout(() => {
                setShowSpeechBubble(true);
            }, 600);
        }
    };

    const handleMissed = () => {
        console.log('[Viewer] onMissed fired, clearing focus');
        setFocusedModelId(null);
        setShowSpeechBubble(false);
    };

    const handleCloseBubble = () => {
        setShowSpeechBubble(false);
    };

    const handleOptionSelect = (value: string) => {
        if (value === 'good') {
            setCurrentMessage("Ne güzel! Ben de iyiyim 😊");
        } else if (value === 'bad') {
            setCurrentMessage("Üzüldüm... Umarım düzelir 💙");
        }
        setShowOptions(false);
    };

    return (
        <div className="viewer">
            {isLoading && (
                <LoadingScreen
                    isLoaded={true} // In a real app, bind to asset loading state
                    onComplete={() => setIsLoading(false)}
                />
            )}
            {focusedModelId && (
                <button
                    className="close-btn"
                    onClick={() => {
                        console.log('[Viewer] close button clicked');
                        setFocusedModelId(null);
                        setShowSpeechBubble(false);
                    }}
                    aria-label="Kapat"
                >
                    ×
                </button>
            )}

            {/* Speech Bubble - karakter tıklandığında görünür */}
            <SpeechBubble
                isVisible={showSpeechBubble}
                message={currentMessage}
                options={showOptions ? [
                    { label: "İyiyim 😊", value: "good" },
                    { label: "Kötüyüm 😔", value: "bad" }
                ] : undefined}
                onOptionSelect={handleOptionSelect}
                onClose={handleCloseBubble}
            />

            <div className="viewer-canvas">
                <Scene
                    focusedModelId={focusedModelId}
                    onModelClick={handleCharacterClick}
                    onMissed={handleMissed}
                />
            </div>
            <div className="viewer-footer">
                <p>Erden Erim Aydoğdu Sunar...</p>
            </div>
        </div>
    );
}
