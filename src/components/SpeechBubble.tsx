import { useState, useEffect, useCallback } from 'react';
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
    const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

    const revealImmediately = useCallback(() => {
        setDisplayedText(message);
        setIsAnimating(false);
        setShowOptions(true);
    }, [message]);

    useEffect(() => {
        if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;

        const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
        const update = () => setPrefersReducedMotion(mediaQuery.matches);
        update();

        mediaQuery.addEventListener('change', update);
        return () => mediaQuery.removeEventListener('change', update);
    }, []);

    // Typewriter effect with dynamic pacing and skip support.
    useEffect(() => {
        if (isVisible && message) {
            setDisplayedText('');
            setIsAnimating(true);
            setShowOptions(false);

            if (prefersReducedMotion || message.length > 300) {
                revealImmediately();
                return;
            }

            let index = 0;
            const frameMs = message.length > 180 ? 28 : 44;
            const stepSize = message.length > 220 ? 3 : 1;
            const timer = window.setInterval(() => {
                if (index < message.length) {
                    index = Math.min(message.length, index + stepSize);
                    setDisplayedText(message.slice(0, index));
                } else {
                    window.clearInterval(timer);
                    setIsAnimating(false);
                    setShowOptions(true);
                }
            }, frameMs);

            return () => window.clearInterval(timer);
        } else {
            setDisplayedText('');
            setShowOptions(false);
            setIsAnimating(false);
        }
    }, [isVisible, message, prefersReducedMotion, revealImmediately]);

    if (!isVisible) return null;

    return (
        <div
            className="speech-bubble-container"
            onClick={() => {
                if (isAnimating) {
                    revealImmediately();
                    return;
                }
                onClose?.();
            }}
        >
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
