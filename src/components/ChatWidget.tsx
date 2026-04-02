import { useEffect, useMemo, useRef, useState } from 'react';
import type { ChatMessage } from '../types/chat';
import { sendChatMessage } from '../utils/chatClient';
import { withBase } from '../utils/assetPath';
import './ChatWidget.css';

interface ChatWidgetProps {
    isOpen: boolean;
    onToggle: (next: boolean) => void;
}

const AVATAR_FRAMES = [withBase('erimai0.png'), withBase('erimai1.png'), withBase('erimai2.png')];

const INITIAL_ASSISTANT_MESSAGE =
    'Merhaba, ben ERIM AI. Erden Erim\'in portfolyo asistaniyim; projeleri, deneyimi ve teknik yetkinlikleri hakkinda soru sorabilirsin.';

export function ChatWidget({ isOpen, onToggle }: ChatWidgetProps) {
    const [messages, setMessages] = useState<ChatMessage[]>([
        { role: 'assistant', content: INITIAL_ASSISTANT_MESSAGE },
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [isWritingResponse, setIsWritingResponse] = useState(false);
    const [typingDots, setTypingDots] = useState('.');
    const [avatarFrameIndex, setAvatarFrameIndex] = useState(0);
    const messageListRef = useRef<HTMLDivElement>(null);
    const writeTimerRef = useRef<number | null>(null);

    useEffect(() => {
        if (!loading) return;

        const timer = window.setInterval(() => {
            setTypingDots((prev) => (prev.length >= 3 ? '.' : `${prev}.`));
        }, 260);

        return () => window.clearInterval(timer);
    }, [loading]);

    useEffect(() => {
        if (loading) {
            // While preparing the response, keep a calm idle face (erimai0).
            setAvatarFrameIndex(0);
            return;
        }

        if (isWritingResponse) {
            const frameTimer = window.setInterval(() => {
                setAvatarFrameIndex((prev) => (prev + 1) % AVATAR_FRAMES.length);
            }, 280);

            return () => window.clearInterval(frameTimer);
        }

        setAvatarFrameIndex(isOpen ? 2 : 0);
    }, [loading, isWritingResponse, isOpen]);

    useEffect(() => {
        return () => {
            if (writeTimerRef.current !== null) {
                window.clearTimeout(writeTimerRef.current);
            }
        };
    }, []);

    useEffect(() => {
        const list = messageListRef.current;
        if (!list) return;
        list.scrollTop = list.scrollHeight;
    }, [messages, loading, typingDots]);

    const historyForApi = useMemo(() => {
        return messages.filter((m) => m.role === 'user' || m.role === 'assistant');
    }, [messages]);

    const handleSend = async () => {
        const normalized = input.trim();
        if (!normalized || loading || isWritingResponse) return;

        const writeAssistantMessage = async (fullMessage: string) => {
            const content = fullMessage.trim() || 'Sadece Erim\'in projeleri hakkında bilgi verebilirim.';
            setIsWritingResponse(true);
            setMessages((prev) => [...prev, { role: 'assistant', content: '' }]);

            await new Promise<void>((resolve) => {
                let cursor = 0;

                const tick = () => {
                    cursor = Math.min(content.length, cursor + 2);

                    setMessages((prev) => {
                        if (prev.length === 0) return prev;
                        const next = [...prev];
                        const lastIndex = next.length - 1;
                        const last = next[lastIndex];
                        if (last.role !== 'assistant') return prev;
                        next[lastIndex] = { ...last, content: content.slice(0, cursor) };
                        return next;
                    });

                    if (cursor >= content.length) {
                        resolve();
                        return;
                    }

                    writeTimerRef.current = window.setTimeout(tick, 26);
                };

                tick();
            });

            setIsWritingResponse(false);
        };

        const userMessage: ChatMessage = { role: 'user', content: normalized };
        setMessages((prev) => [...prev, userMessage]);
        setInput('');
        setLoading(true);

        const response = await sendChatMessage({
            message: normalized,
            history: historyForApi,
        });

        setLoading(false);

        if (response.error) {
            await writeAssistantMessage('Su an baglanti sorunu var. Birazdan tekrar dener misin?');
            return;
        }

        await writeAssistantMessage(response.message || 'Sadece Erim\'in projeleri hakkında bilgi verebilirim.');
    };

    return (
        <>
            <button
                className={`chat-avatar-trigger ${isOpen ? 'is-open' : ''}`}
                onClick={(e) => {
                    e.stopPropagation();
                    onToggle(!isOpen);
                }}
                aria-label={isOpen ? 'Sohbeti kapat' : 'Sohbeti ac'}
            >
                <img
                    className={`chat-avatar ${isWritingResponse ? 'is-speaking' : ''}`}
                    src={AVATAR_FRAMES[avatarFrameIndex]}
                    alt="ERIM AI"
                    draggable={false}
                />
            </button>

            {isOpen && (
                <section
                    className="chat-panel is-open"
                    onClick={(e) => e.stopPropagation()}
                    role="dialog"
                    aria-label="Erden Erim portfolyo asistani"
                >
                    <header className="chat-header">
                        <div>
                            <p className="chat-kicker">ERIM AI TERMINAL</p>
                            <h3>Portfolyo Asistani</h3>
                        </div>
                        <button
                            className="chat-close"
                            onClick={() => onToggle(false)}
                            aria-label="Sohbeti kapat"
                        >
                            x
                        </button>
                    </header>

                    <div className="chat-messages" ref={messageListRef}>
                        {messages.map((msg, index) => (
                            <article key={`${msg.role}-${index}`} className={`chat-message ${msg.role}`}>
                                <span className="chat-role">{msg.role === 'user' ? 'SEN' : 'ERIM-AI'}</span>
                                <p>{msg.content}</p>
                            </article>
                        ))}

                        {loading && (
                            <article className="chat-message assistant loading">
                                <span className="chat-role">ERIM-AI</span>
                                <p>Yanıt hazırlanıyor{typingDots}</p>
                            </article>
                        )}
                    </div>

                    <footer className="chat-input-row">
                        <textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Erden Erim'in projeleri hakkinda sor"
                            rows={2}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    void handleSend();
                                }
                            }}
                        />
                        <button onClick={() => void handleSend()} disabled={loading || isWritingResponse || !input.trim()}>
                            Gonder
                        </button>
                    </footer>
                </section>
            )}
        </>
    );
}
