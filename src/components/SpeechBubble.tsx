import { useState, useEffect } from 'react';
import './SpeechBubble.css';

interface SpeechBubbleProps {
    isVisible: boolean;
    message: string;
    options?: { label: string; value: string }[];
    onOptionSelect?: (value: string) => void;
    onClose?: () => void;
    onBack?: () => void;
    canGoBack?: boolean;
}

export function SpeechBubble({
    isVisible,
    message,
    options,
    onOptionSelect,
    onClose,
    onBack,
    canGoBack = false,
}: SpeechBubbleProps) {
    const [displayedText, setDisplayedText] = useState('');
    const [isAnimating, setIsAnimating] = useState(false);
    const [showOptions, setShowOptions] = useState(false);

    // Typewriter effect — uses requestAnimationFrame for better INP
    useEffect(() => {
        if (isVisible && message) {
            setDisplayedText('');
            setIsAnimating(true);
            setShowOptions(false);
            let index = 0;
            let lastTime = 0;
            let rafId: number;
            const step = (time: number) => {
                if (time - lastTime >= 50) {
                    lastTime = time;
                    if (index < message.length) {
                        setDisplayedText(message.slice(0, index + 1));
                        index++;
                    } else {
                        setIsAnimating(false);
                        setTimeout(() => setShowOptions(true), 200);
                        return;
                    }
                }
                rafId = requestAnimationFrame(step);
            };
            rafId = requestAnimationFrame(step);
            return () => cancelAnimationFrame(rafId);
        } else {
            setDisplayedText('');
            setShowOptions(false);
        }
    }, [isVisible, message]);

    if (!isVisible) return null;

    return (
        <div className="speech-bubble-container" onClick={onClose}>
            <div className="speech-bubble" onClick={(e) => e.stopPropagation()}>
                {/* Geri butonu */}
                {canGoBack && showOptions && (
                    <button
                        className="speech-back-btn"
                        onClick={(e) => {
                            e.stopPropagation();
                            onBack?.();
                        }}
                        aria-label="Geri"
                    >
                        ←
                    </button>
                )}
                <div className="speech-bubble-content">
                    <p>{displayedText}<span className={isAnimating ? 'cursor blink' : 'cursor'}>|</span></p>
                </div>

                {/* Seçenek butonları — bubble içinde */}
                {options && showOptions && (
                    <div className="speech-options">
                        {options.map((option, index) => (
                            <button
                                key={option.value}
                                className="speech-option-btn"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onOptionSelect?.(option.value);
                                }}
                                style={{ animationDelay: `${index * 0.08}s` }}
                            >
                                {option.label}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
