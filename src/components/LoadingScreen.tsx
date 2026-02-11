import React, { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring } from 'framer-motion';
import './LoadingScreen.css';

// Lazy-load Three.js fluid — CSS blobs show instantly as fallback
const FluidBackground = lazy(() =>
    import('./FluidBackground').then(m => ({ default: m.FluidBackground }))
);

function useIsMobile() {
    const [isMobile, setIsMobile] = useState(() => {
        if (typeof window === 'undefined') return false;
        return window.innerWidth <= 768 || 'ontouchstart' in window;
    });
    useEffect(() => {
        let timeout: ReturnType<typeof setTimeout>;
        const check = () => {
            clearTimeout(timeout);
            timeout = setTimeout(() => setIsMobile(window.innerWidth <= 768 || 'ontouchstart' in window), 150);
        };
        window.addEventListener('resize', check);
        return () => { clearTimeout(timeout); window.removeEventListener('resize', check); };
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

    const [fluidReady, setFluidReady] = useState(false);

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
            {/* Layer 0: CSS blobs — instant, visible while WebGL loads */}
            <div className={`css-fluid-bg ${fluidReady ? 'css-fluid-bg--hidden' : ''}`}>
                <div className="fluid-blob fluid-blob--1" />
                <div className="fluid-blob fluid-blob--2" />
                <div className="fluid-blob fluid-blob--3" />
                <div className="fluid-blob fluid-blob--4" />
                <div className="fluid-blob fluid-blob--5" />
            </div>

            {/* Layer 1: Three.js WebGL fluid — lazy loaded, fades in over CSS */}
            <Suspense fallback={null}>
                <FluidBackground onReady={() => setFluidReady(true)} />
            </Suspense>

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
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px', perspective: 1000 }}>
                                {/* Logo - üstte */}
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
                                        width={120}
                                        height={120}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.2, duration: 0.8 }}
                                        style={{
                                            width: '120px',
                                            height: 'auto',
                                            aspectRatio: '1',
                                            opacity: 0.9,
                                            filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.5))',
                                            borderRadius: '12px'
                                        }}
                                    />
                                </motion.div>

                            {/* Giriş Yap butonu — fluid morphing blob */}
                                <motion.button
                                    key="ready"
                                    className="enter-btn"
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.5, duration: 0.8, type: 'spring', stiffness: 100, damping: 12 }}
                                    onClick={handleReadyClick}
                                >
                                    <div className="enter-fluid">
                                        <span className="enter-ambient" />
                                        <div className="enter-blob enter-blob--outer" />
                                        <div className="enter-blob enter-blob--mid" />
                                        <div className="enter-blob enter-blob--inner" />
                                        <div className="enter-core">
                                            <svg className="enter-core-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M5 12h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                                                <path d="M13 5l7 7-7 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                            </svg>
                                        </div>
                                    </div>
                                    <span className="enter-label">GİRİŞ</span>
                                </motion.button>
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
                                initial={false}
                                animate={isMobile ? {
                                    scale: activeId === item.id ? 1.05 : 1,
                                    zIndex: activeId === item.id ? 10 : 1
                                } : {
                                    flex: activeId === item.id ? 3 : 1
                                }}
                                transition={{ type: "tween", duration: 0.25 }}
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
