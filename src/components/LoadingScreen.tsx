import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FluidBackground } from './FluidBackground';
import './LoadingScreen.css';

interface Item {
    id: number;
    text: string;
    image: string;
}

const items: Item[] = [
    { id: 1, text: "BİR", image: "/me01.webp" },
    { id: 2, text: "SORUN", image: "/me02.webp" },
    { id: 3, text: "VARSA", image: "/me03.webp" },
    { id: 4, text: "ERİMİ", image: "/me04.webp" },
    { id: 5, text: "DE", image: "/me05.webp" },
    { id: 6, text: "VAR", image: "/me06.webp" },
];

interface LoadingScreenProps {
    onComplete: () => void;
    isLoaded: boolean;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ onComplete, isLoaded }) => {
    const [activeId, setActiveId] = useState<number | null>(null);
    const [isMelting, setIsMelting] = useState(false);
    const [showReady, setShowReady] = useState(false);

    const [showFullText, setShowFullText] = useState(false);

    useEffect(() => {
        if (isLoaded) {
            setShowReady(true);
        }
    }, [isLoaded]);

    // Timer to show full text automatically after 10 seconds
    useEffect(() => {
        const timer = setTimeout(() => {
            setShowFullText(true);
        }, 10000);
        return () => clearTimeout(timer);
    }, []);

    const handleReadyClick = () => {
        setIsMelting(true);
        setTimeout(() => {
            onComplete();
        }, 1500);
    };

    const activeItem = items.find(i => i.id === activeId);

    return (
        <div className={`loading-screen ${isMelting ? 'melting' : ''}`}>
            <FluidBackground />

            <div className="content-wrapper">
                {/* Top Section: Loading/Ready Indicator */}
                <div className="top-indicator">
                    <AnimatePresence mode="wait">
                        {!showReady ? (
                            <motion.div
                                key="loading"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="loading-text"
                            >
                                YÜKLENİYOR...
                            </motion.div>
                        ) : (
                            <motion.button
                                key="ready"
                                className="ready-btn"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={handleReadyClick}
                            >
                                HAZIR - GİRİŞ YAP
                            </motion.button>
                        )}
                    </AnimatePresence>
                </div>

                {/* Center Section: Gallery */}
                <div className="gallery-section">
                    <div className="gallery-container">
                        {items.map((item) => (
                            <motion.div
                                key={item.id}
                                className={`gallery-item ${activeId === item.id ? 'active' : ''}`}
                                onHoverStart={() => setActiveId(item.id)}
                                onHoverEnd={() => setActiveId(null)}
                                layout
                                initial={{ flex: 1 }}
                                animate={{ flex: activeId === item.id ? 3 : 1 }}
                                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                style={{
                                    backgroundImage: `url(${item.image})`,
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center'
                                }}
                            >
                                {/* Images are set as background for better fit handling in flex */}
                                <div className="overlay" />
                            </motion.div>
                        ))}
                    </div>

                    {/* Bottom of Gallery: Dynamic Text */}
                    <div className="dynamic-text-container">
                        <AnimatePresence mode="wait">
                            {activeItem ? (
                                <motion.div
                                    key={activeItem.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.2 }}
                                    className="dynamic-text"
                                >
                                    {activeItem.text}
                                </motion.div>
                            ) : showFullText ? (
                                <motion.div
                                    key="full-text"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="dynamic-text full"
                                    style={{ fontSize: '1.5rem', letterSpacing: '2px' }}
                                >
                                    BİR SORUN VARSA ERİMİ DE VAR
                                </motion.div>
                            ) : (
                                <motion.img
                                    key="placeholder"
                                    src="/erder.png"
                                    alt="Erden Erim"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 0.8 }}
                                    exit={{ opacity: 0 }}
                                    style={{
                                        maxHeight: '120px',
                                        width: 'auto',
                                        filter: 'drop-shadow(0 0 10px rgba(255, 255, 255, 0.8)) brightness(1.2)'
                                    }}
                                />
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Footer */}
                <div className="footer-text">
                    AI & XR Solutions Architect | IoT, Embedded Systems & Full-Stack Developer
                </div>
            </div>
        </div>
    );
};
