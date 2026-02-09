import { useEffect, useState, useRef, useCallback } from 'react';
import './TerminalPopup.css';

interface TerminalPopupProps {
    isVisible: boolean;
    onClose: () => void;
}

const TERMINAL_LINES = [
    'erim@skills:~$ cat /etc/skills.conf',
    '',
    '╔══════════════════════════════════════════════════╗',
    '║              S K I L L S                         ║',
    '╚══════════════════════════════════════════════════╝',
    '',
    '[AI & Machine Learning]',
    '  RAG ████████░░ | LLM (MCP, LangChain) ████████░░',
    '  CNN ███████░░░ | PyTorch ███████░░░',
    '  Computer Vision ██████░░░░',
    '  Reinforcement Learning ██████░░░░',
    '',
    '[Engineering & Hardware]',
    '  Gömülü Sistemler (STM32) ████████░░',
    '  IoT (MQTT, Sensör Ağları) ███████░░░',
    '  Devre Analizi (LTspice) ██████░░░░',
    '  PCB Tasarım ████░░░░░░',
    '',
    '[XR & Spatial Computing]',
    '  Unreal Engine (C++) █████████░',
    '  Unity ██████░░░░ | WebXR ████████░░',
    '  CesiumJS (Digital Twin) ████████░░',
    '  Three.js █████████░',
    '  Fotogrametri ██████░░░░',
    '',
    '[Full-Stack Web]',
    '  React █████████░ | Next.js ████████░░',
    '  Node.js ████████░░ | FastAPI ███████░░░',
    '  PostgreSQL/PostGIS ████████░░',
    '  Tailwind CSS ████████░░',
    '',
    '[Systems & DevOps]',
    '  Docker █████████░ | Kubernetes ███████░░░',
    '  CI/CD ████████░░ | Linux ████████░░',
    '  Nginx ███████░░░ | Git █████████░',
    '',
    'erim@skills:~$ _',
];

// Matrix rain character set
const MATRIX_CHARS = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789ABCDEF';

function MatrixRain({ width, height }: { width: number; height: number }) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animRef = useRef<number>(0);
    const columnsRef = useRef<number[]>([]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        canvas.width = width;
        canvas.height = height;

        const fontSize = 12;
        const cols = Math.floor(width / fontSize);
        columnsRef.current = Array(cols).fill(0).map(() => Math.random() * height / fontSize);

        const draw = () => {
            ctx.fillStyle = 'rgba(10, 10, 20, 0.06)';
            ctx.fillRect(0, 0, width, height);
            ctx.fillStyle = 'rgba(0, 255, 80, 0.12)';
            ctx.font = `${fontSize}px monospace`;

            for (let i = 0; i < cols; i++) {
                const char = MATRIX_CHARS[Math.floor(Math.random() * MATRIX_CHARS.length)];
                const x = i * fontSize;
                const y = columnsRef.current[i] * fontSize;
                ctx.fillText(char, x, y);

                if (y > height && Math.random() > 0.975) {
                    columnsRef.current[i] = 0;
                }
                columnsRef.current[i] += 0.5;
            }
            animRef.current = requestAnimationFrame(draw);
        };

        animRef.current = requestAnimationFrame(draw);
        return () => cancelAnimationFrame(animRef.current);
    }, [width, height]);

    return <canvas ref={canvasRef} className="matrix-rain" />;
}

export function TerminalPopup({ isVisible, onClose }: TerminalPopupProps) {
    const [show, setShow] = useState(false);
    const [closing, setClosing] = useState(false);
    const [visibleLines, setVisibleLines] = useState(0);
    const contentRef = useRef<HTMLDivElement>(null);
    const popupRef = useRef<HTMLDivElement>(null);

    const handleClose = useCallback(() => {
        setClosing(true);
        setTimeout(() => {
            setClosing(false);
            setShow(false);
            onClose();
        }, 300);
    }, [onClose]);

    useEffect(() => {
        if (isVisible) {
            setVisibleLines(0);
            setClosing(false);
            requestAnimationFrame(() => setShow(true));
            // Satır satır göster
            let line = 0;
            const timer = setInterval(() => {
                line++;
                setVisibleLines(line);
                if (line >= TERMINAL_LINES.length) {
                    clearInterval(timer);
                }
            }, 60);
            return () => clearInterval(timer);
        } else {
            setShow(false);
            setVisibleLines(0);
        }
    }, [isVisible]);

    // Auto-scroll
    useEffect(() => {
        if (contentRef.current) {
            contentRef.current.scrollTop = contentRef.current.scrollHeight;
        }
    }, [visibleLines]);

    if (!isVisible && !closing) return null;

    return (
        <div className="terminal-popup-overlay" onClick={handleClose}>
            <div
                ref={popupRef}
                className={`terminal-popup ${show && !closing ? 'visible' : ''} ${closing ? 'closing' : ''}`}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Matrix rain background */}
                <MatrixRain width={640} height={500} />
                <div className="terminal-scanline" />

                {/* Title bar */}
                <div className="terminal-titlebar">
                    <div className="terminal-dots">
                        <span className="dot red" onClick={handleClose} />
                        <span className="dot yellow" />
                        <span className="dot green" />
                    </div>
                    <span className="terminal-title">erim@skills — bash</span>
                </div>

                {/* Terminal content */}
                <div className="terminal-content" ref={contentRef}>
                    {TERMINAL_LINES.slice(0, visibleLines).map((line, i) => (
                        <div key={i} className={`terminal-line ${line.startsWith('[') ? 'terminal-line-header' : ''}`}>
                            {line || '\u00A0'}
                        </div>
                    ))}
                    {visibleLines < TERMINAL_LINES.length && (
                        <span className="terminal-cursor">▌</span>
                    )}
                </div>
            </div>
        </div>
    );
}
