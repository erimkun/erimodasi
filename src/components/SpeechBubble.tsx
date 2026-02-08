import { useState, useEffect } from 'react';
import './SpeechBubble.css';

interface SpeechBubbleProps {
    isVisible: boolean;
    message: string;
    options?: { label: string; value: string }[];
    onOptionSelect?: (value: string) => void;
    onClose?: () => void;
}

export function SpeechBubble({
    isVisible,
    message,
    options,
    onOptionSelect,
    onClose
}: SpeechBubbleProps) {
    const [displayedText, setDisplayedText] = useState('');
    const [isAnimating, setIsAnimating] = useState(false);
    const [showOptions, setShowOptions] = useState(false);

    // Typewriter effect
    useEffect(() => {
        if (isVisible && message) {
            setDisplayedText('');
            setIsAnimating(true);
            setShowOptions(false);
            let index = 0;
            const timer = setInterval(() => {
                if (index < message.length) {
                    setDisplayedText(message.slice(0, index + 1));
                    index++;
                } else {
                    clearInterval(timer);
                    setIsAnimating(false);
                    // Yazı bittikten sonra seçenekleri göster
                    setTimeout(() => setShowOptions(true), 200);
                }
            }, 50);
            return () => clearInterval(timer);
        } else {
            setDisplayedText('');
            setShowOptions(false);
        }
    }, [isVisible, message]);

    if (!isVisible) return null;

    return (
        <div className="speech-bubble-container" onClick={onClose}>
            <div className="speech-bubble" onClick={(e) => e.stopPropagation()}>
                <div className="speech-bubble-content">
                    <p>{displayedText}<span className={isAnimating ? 'cursor blink' : 'cursor'}>|</span></p>
                </div>
                <div className="speech-bubble-tail" />
            </div>

            {/* Seçenek butonları */}
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
                            style={{ animationDelay: `${index * 0.1}s` }}
                        >
                            {option.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
