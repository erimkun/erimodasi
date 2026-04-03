import type { ChatRequest, ChatResponse } from '../types/chat';

const REQUEST_TIMEOUT_MS = 20000;

function resolveApiBaseUrl(): string {
    const fromEnv = import.meta.env.VITE_CHAT_API_BASE_URL?.trim();
    if (fromEnv) return fromEnv.replace(/\/$/, '');

    // GitHub Pages cannot run serverless /api routes; proxy to Vercel backend.
    if (window.location.hostname.endsWith('github.io')) {
        return 'https://erdenerim.vercel.app';
    }

    return '';
}

export async function sendChatMessage(payload: ChatRequest): Promise<ChatResponse> {
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    const apiBaseUrl = resolveApiBaseUrl();

    try {
        const response = await fetch(`${apiBaseUrl}/api/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
            signal: controller.signal,
        });

        const data = (await response.json()) as ChatResponse;

        if (!response.ok) {
            return { error: data.error || 'Sohbet servisi su an kullanilamiyor.' };
        }

        return data;
    } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') {
            return { error: 'Istek zaman asimina ugradi. Lutfen tekrar deneyin.' };
        }

        return { error: 'Baglanti hatasi olustu. Lutfen tekrar deneyin.' };
    } finally {
        window.clearTimeout(timeoutId);
    }
}
