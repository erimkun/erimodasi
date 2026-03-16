import { useEffect, useState, useRef, useCallback, type KeyboardEvent } from 'react';
import './TerminalPopup.css';

const ANGRY_RESPONSES = [
    [
        '',
        '  ╭──────────────────────────────────────────╮',
        '  │  (ノಠ益ಠ)ノ彡┻━┻                         │',
        '  │                                          │',
        '  │  İyi deneme...                            │',
        '  │  Ceza olarak IP adresinden konumuna       │',
        '  │  birkaç pizza yolluyorum. 🍕🍕🍕          │',
        '  │                                          │',
        '  │  > IP tespit edildi: 192.168.x.x          │',
        '  │  > Konum: Muhtemelen annenin evi          │',
        '  │  > Sipariş: 3x Ananaslı Pizza             │',
        '  │  > Durum: YOL-DA ████████░░ 80%           │',
        '  ╰──────────────────────────────────────────╯',
        '',
    ],
    [
        '',
        '  ╭──────────────────────────────────────────╮',
        '  │  ಠ_ಠ  ...ciddi misin?                    │',
        '  │                                          │',
        '  │  Bu terminale yazı yazmaya çalışan        │',
        '  │  son kişi hâlâ kayıp.                     │',
        '  │                                          │',
        '  │  > sudo rm -rf /your-career               │',
        '  │  > [TAMAM]                                │',
        '  ╰──────────────────────────────────────────╯',
        '',
    ],
    [
        '',
        '  ╭──────────────────────────────────────────╮',
        '  │  (╯°□°)╯︵ ┻━┻                            │',
        '  │                                          │',
        '  │  Hack mi deniyorsun yoksa?                │',
        '  │  Kardeşim ben zaten hacklenmiş            │',
        '  │  durumdayım, geç kaldın.                  │',
        '  │                                          │',
        '  │  > firewall.exe has stopped working       │',
        '  │  > brain.exe not found                    │',
        '  ╰──────────────────────────────────────────╯',
        '',
    ],
    [
        '',
        '  ╭──────────────────────────────────────────╮',
        '  │  ᕦ(ò_óˇ)ᕤ  DUR BAKALIM                  │',
        '  │                                          │',
        '  │  Bak güzel kardeşim, bu terminal          │',
        '  │  sadece benim. Dokunma.                   │',
        '  │                                          │',
        '  │  > Parmak izi kaydedildi ✓                │',
        '  │  > CIA\'ya bildirildi ✓                    │',
        '  │  > Annen arandı ✓                         │',
        '  ╰──────────────────────────────────────────╯',
        '',
    ],
];

interface TerminalPopupProps {
    isVisible: boolean;
    onClose: () => void;
}

const FACE_EXPRESSIONS = ['◕‿◕', '◕‿◕', '◕‿◕', '◕‿◕', '─‿─', '◕‿◕', '◕ᴗ◕', '◕‿◕'];
const FACE_PLACEHOLDER = '{FACE}';

const TERMINAL_LINES = [
    'erim@skills:~$ ./system-info.sh',
    '',
    ' [✓] Loading modules...',
    ' [✓] Initializing skill matrix...',
    ' [✓] System ready.',
    '',
    '          ╭─────────────────╮',
    '     ══●══┤  ┌───────────┐  ├══●══',
    '     ══○══┤  │   ({FACE})   │  ├══○══',
    '          │  │ ERIM·CPU  │  │',
    '     ══●══┤  └───────────┘  ├══●══',
    '     ══○══┤                 ├══○══',
    '          ╰─────────────────╯',
    '',
    '  ╭─ SPEC ──────────────────────╮',
    '  │  OS      ErimOS v26.2       │',
    '  │  Core    creative-engine    │',
    '  │  Shell   bash 5.2           │',
    '  │  Uptime  since ~2002        │',
    '  ╰─────────────────────────────╯',
    '',
    '  ◈ AI & Machine Learning',
    '    RAG · LLM · MCP · LangChain',
    '    CNN · PyTorch · Computer Vision · RL',
    '',
    '  ◈ Engineering & Hardware',
    '    STM32 · MQTT · IoT',
    '    LTspice · PCB Tasarım',
    '',
    '  ◈ XR & Spatial Computing',
    '    Unreal Engine (C++) · Unity · WebXR',
    '    CesiumJS · Three.js · Fotogrametri',
    '',
    '  ◈ Full-Stack Web',
    '    React · Next.js · Node.js · FastAPI',
    '    PostgreSQL/PostGIS · Tailwind CSS',
    '',
    '  ◈ Systems & DevOps',
    '    Docker · Kubernetes · CI/CD · Linux',
    '    Nginx · Git',
    '',
];

// Matrix rain character set
const MATRIX_CHARS = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789ABCDEF';

function MatrixRain({ width, height }: { width: number; height: number }) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animRef = useRef<number>(0);
    const columnsRef = useRef<number[]>([]);
    const lastDrawTimeRef = useRef(0);

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

        const draw = (time: number) => {
            if (time - lastDrawTimeRef.current < 33) {
                animRef.current = requestAnimationFrame(draw);
                return;
            }
            lastDrawTimeRef.current = time;

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
    const [faceIndex, setFaceIndex] = useState(0);
    const [pinFrame, setPinFrame] = useState(0);
    const [inputValue, setInputValue] = useState('');
    const [extraLines, setExtraLines] = useState<string[]>([]);
    const [responseCount, setResponseCount] = useState(0);
    const [isResponseTyping, setIsResponseTyping] = useState(false);
    const contentRef = useRef<HTMLDivElement>(null);
    const popupRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const typingDone = visibleLines >= TERMINAL_LINES.length;
    const showInput = typingDone && !isResponseTyping;

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
            setFaceIndex(0);
            setPinFrame(0);
            setInputValue('');
            setExtraLines([]);
            setResponseCount(0);
            setIsResponseTyping(false);
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
    }, [visibleLines, extraLines]);

    // Focus input when typing is done (skip on mobile to prevent keyboard popup)
    useEffect(() => {
        const isMobile = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        if (showInput && inputRef.current && !isMobile) {
            inputRef.current.focus();
        }
    }, [showInput, extraLines]);

    const handleInputSubmit = useCallback((e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key !== 'Enter' || !inputValue.trim()) return;
        const cmd = inputValue.trim();
        setInputValue('');
        setIsResponseTyping(true);

        const response = ANGRY_RESPONSES[responseCount % ANGRY_RESPONSES.length];
        setResponseCount((c) => c + 1);

        // Add the typed command immediately
        setExtraLines((prev) => [...prev, `erim@skills:~$ ${cmd}`]);

        // Type response line by line
        let i = 0;
        const timer = setInterval(() => {
            if (i < response.length) {
                setExtraLines((prev) => [...prev, response[i]]);
                i++;
            } else {
                clearInterval(timer);
                setExtraLines((prev) => [...prev, '', 'erim@skills:~$ _']);
                setIsResponseTyping(false);
            }
        }, 70);
    }, [inputValue, responseCount]);

    // Face blink animation
    useEffect(() => {
        if (!typingDone) return;
        const timer = setInterval(() => {
            setFaceIndex((i) => (i + 1) % FACE_EXPRESSIONS.length);
        }, 2000);
        return () => clearInterval(timer);
    }, [typingDone]);

    // Pin data flow animation
    useEffect(() => {
        if (!typingDone) return;
        const timer = setInterval(() => {
            setPinFrame((f) => (f + 1) % 2);
        }, 800);
        return () => clearInterval(timer);
    }, [typingDone]);

    const renderLine = (line: string): string => {
        if (line.includes(FACE_PLACEHOLDER)) {
            line = line.replace(FACE_PLACEHOLDER, FACE_EXPRESSIONS[faceIndex]);
        }
        if (typingDone && pinFrame === 1) {
            line = line.replace(/●/g, '◆').replace(/○/g, '●').replace(/◆/g, '○');
        }
        return line;
    };

    const getLineClass = (_line: string, index: number): string => {
        if (index >= 2 && index <= 4) return 'terminal-line-boot';
        if (index >= 6 && index <= 12) return 'terminal-line-chip';
        if (index >= 14 && index <= 19) return 'terminal-line-spec';
        if (_line.trimStart().startsWith('◈')) return 'terminal-line-header';
        return '';
    };

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
                    {TERMINAL_LINES.slice(0, visibleLines).map((line, i) => {
                        const rendered = renderLine(line);
                        const cls = getLineClass(line, i);
                        return (
                            <div key={i} className={`terminal-line ${cls}`}>
                                {rendered || '\u00A0'}
                            </div>
                        );
                    })}
                    {/* Extra lines from user interaction */}
                    {extraLines.map((line, i) => {
                        const l = line ?? '';
                        return (
                            <div key={`extra-${i}`} className={`terminal-line ${l.includes('ಠ') || l.includes('╯°□°') || l.includes('ᕦ') ? 'terminal-line-angry' : ''} ${l.includes('pizza') || l.includes('Pizza') || l.includes('🍕') ? 'terminal-line-pizza' : ''}`}>
                                {l || '\u00A0'}
                            </div>
                        );
                    })}

                    {visibleLines < TERMINAL_LINES.length && (
                        <span className="terminal-cursor">▌</span>
                    )}

                    {/* Interactive input */}
                    {showInput && (
                        <div className="terminal-input-line">
                            <span className="terminal-prompt">erim@skills:~$&nbsp;</span>
                            <input
                                ref={inputRef}
                                type="text"
                                className="terminal-input"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyDown={handleInputSubmit}
                                spellCheck={false}
                                autoComplete="off"
                            />
                        </div>
                    )}

                    {isResponseTyping && (
                        <span className="terminal-cursor">▌</span>
                    )}
                </div>
            </div>
        </div>
    );
}
