import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring } from 'framer-motion';
import { FluidBackground } from './FluidBackground';
import './LoadingScreen.css';

function useIsMobile() {
    const [isMobile, setIsMobile] = useState(() => {
        if (typeof window === 'undefined') return false;
        return window.innerWidth <= 768 || 'ontouchstart' in window;
    });
    useEffect(() => {
        const check = () => setIsMobile(window.innerWidth <= 768 || 'ontouchstart' in window);
        window.addEventListener('resize', check);
        return () => window.removeEventListener('resize', check);
    }, []);
    return isMobile;
}

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
    const isMobile = useIsMobile();

    const handleItemTap = useCallback((id: number) => {
        if (!isMobile) return;
        setActiveId(prev => prev === id ? null : id);
    }, [isMobile]);

    const [showFullText, setShowFullText] = useState(false);

    useEffect(() => {
        if (isLoaded) {
            setShowReady(true);
        }
    }, [isLoaded]);

    // Mouse movement for logo rotation
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const mouseX = useSpring(x, { stiffness: 150, damping: 15 });
    const mouseY = useSpring(y, { stiffness: 150, damping: 15 });

    const rotateX = useTransform(mouseY, [-0.5, 0.5], ["15deg", "-15deg"]);
    const rotateY = useTransform(mouseX, [-0.5, 0.5], ["-15deg", "15deg"]);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            const { innerWidth, innerHeight } = window;
            const xPct = (e.clientX / innerWidth) - 0.5;
            const yPct = (e.clientY / innerHeight) - 0.5;
            x.set(xPct);
            y.set(yPct);
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, [x, y]);

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
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '30px', perspective: 1000 }}>
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

                                <motion.div
                                    style={{
                                        rotateX,
                                        rotateY,
                                        cursor: 'pointer'
                                    }}
                                    whileHover={{ scale: 1.1 }}
                                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                                >
                                    <motion.img
                                        src="/entry-logo.webp"
                                        alt="Entry Icon"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.2, duration: 0.8 }}
                                        style={{
                                            width: '120px',
                                            height: 'auto',
                                            opacity: 0.9,
                                            filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.5))',
                                            borderRadius: '12px'
                                        }}
                                    />
                                </motion.div>
                            </div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Center Section: Gallery */}
                <div className="gallery-section">
                    <div className={`gallery-container ${isMobile ? 'gallery-mobile' : ''}`}>
                        {items.map((item) => (
                            <motion.div
                                key={item.id}
                                className={`gallery-item ${activeId === item.id ? 'active' : ''}`}
                                onHoverStart={isMobile ? undefined : () => setActiveId(item.id)}
                                onHoverEnd={isMobile ? undefined : () => setActiveId(null)}
                                onClick={isMobile ? () => handleItemTap(item.id) : undefined}
                                layout
                                initial={isMobile ? {} : { flex: 1 }}
                                animate={isMobile ? {
                                    scale: activeId === item.id ? 1.05 : 1,
                                    zIndex: activeId === item.id ? 10 : 1
                                } : {
                                    flex: activeId === item.id ? 3 : 1
                                }}
                                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                style={{
                                    backgroundImage: `url(${item.image})`,
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center'
                                }}
                            >
                                <div className="overlay" />
                                {/* Mobile: show text label on each item */}
                                {isMobile && (
                                    <div className="gallery-item-label">
                                        {item.text}
                                    </div>
                                )}
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
                                <motion.div
                                    key="placeholder"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 0.3 }}
                                    exit={{ opacity: 0 }}
                                    className="dynamic-text placeholder"
                                >
                                    ERDEN ERİM
                                </motion.div>
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
