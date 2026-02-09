import { useEffect, useState, useRef } from 'react';
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

export function TerminalPopup({ isVisible, onClose }: TerminalPopupProps) {
    const [show, setShow] = useState(false);
    const [visibleLines, setVisibleLines] = useState(0);
    const contentRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isVisible) {
            setVisibleLines(0);
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

    if (!isVisible) return null;

    return (
        <div className="terminal-popup-overlay" onClick={onClose}>
            <div
                className={`terminal-popup ${show ? 'visible' : ''}`}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Title bar */}
                <div className="terminal-titlebar">
                    <div className="terminal-dots">
                        <span className="dot red" onClick={onClose} />
                        <span className="dot yellow" />
                        <span className="dot green" />
                    </div>
                    <span className="terminal-title">erim@skills — bash</span>
                </div>

                {/* Terminal content */}
                <div className="terminal-content" ref={contentRef}>
                    {TERMINAL_LINES.slice(0, visibleLines).map((line, i) => (
                        <div key={i} className="terminal-line">
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
