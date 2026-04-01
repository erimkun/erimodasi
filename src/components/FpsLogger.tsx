import { useEffect, useRef, useState } from 'react';

declare global {
    interface Window {
        __R3F_METRICS__?: {
            updatedAt: number;
            render: {
                calls: number;
                triangles: number;
                points: number;
                lines: number;
            };
            memory: {
                geometries: number;
                textures: number;
            };
            maxCallsInLastSecond: number;
        };
        __FPS_TOOL__?: {
            active: boolean;
            startedAt: string;
            summary: {
                avg: number;
                min: number;
                max: number;
                p1Low: number;
                freezeCount: number;
                longTaskCount: number;
                avgRenderCalls: number;
                peakRenderCalls: number;
                sampleCount: number;
            };
            timeline: Array<{
                t: number;
                avg: number;
                min: number;
                max: number;
                calls: number;
            }>;
            samples: number[];
            freezes: Array<{ t: number; dtMs: number }>;
            longTasks: Array<{ t: number; durationMs: number }>;
        };
        __FPS_LOGGER_AUTO__?: boolean;
    }
}

function percentile(values: number[], q: number): number {
    if (values.length === 0) return 0;
    const sorted = [...values].sort((a, b) => a - b);
    const index = Math.max(0, Math.min(sorted.length - 1, Math.floor(q * (sorted.length - 1))));
    return sorted[index];
}

export function FpsLogger() {
    const [active, setActive] = useState(false);
    const [hud, setHud] = useState({ fps: 0, avg: 0, min: 0, p1Low: 0, freezes: 0 });

    const rafRef = useRef<number | null>(null);
    const prevRef = useRef<number>(0);
    const startRef = useRef<number>(0);
    const startEpochRef = useRef<number>(0);
    const samplesRef = useRef<number[]>([]);
    const freezesRef = useRef<Array<{ t: number; dtMs: number }>>([]);
    const timelineRef = useRef<Array<{ t: number; avg: number; min: number; max: number; calls: number }>>([]);
    const bucketRef = useRef<number[]>([]);
    const bucketStartedAtRef = useRef<number>(0);
    const lastHudAtRef = useRef<number>(0);
    const longTasksRef = useRef<Array<{ t: number; durationMs: number }>>([]);
    const bucketCallsRef = useRef<number[]>([]);
    const runningSumRef = useRef(0);
    const runningMinRef = useRef(Number.POSITIVE_INFINITY);

    const getSnapshot = () => {
        const samples = samplesRef.current;
        if (samples.length === 0) return null;

        const min = Math.min(...samples);
        const max = Math.max(...samples);
        const avg = samples.reduce((sum, value) => sum + value, 0) / samples.length;
        const p1Low = percentile(samples, 0.01);
        const avgRenderCalls = timelineRef.current.length > 0
            ? timelineRef.current.reduce((sum, item) => sum + item.calls, 0) / timelineRef.current.length
            : 0;
        const peakRenderCalls = timelineRef.current.length > 0
            ? Math.max(...timelineRef.current.map((item) => item.calls))
            : 0;

        return {
            active,
            startedAt: new Date(startEpochRef.current).toISOString(),
            summary: {
                avg: Number(avg.toFixed(2)),
                min: Number(min.toFixed(2)),
                max: Number(max.toFixed(2)),
                p1Low: Number(p1Low.toFixed(2)),
                freezeCount: freezesRef.current.length,
                longTaskCount: longTasksRef.current.length,
                avgRenderCalls: Number(avgRenderCalls.toFixed(2)),
                peakRenderCalls: Number(peakRenderCalls.toFixed(2)),
                sampleCount: samples.length,
            },
            timeline: timelineRef.current,
            samples,
            freezes: freezesRef.current,
            longTasks: longTasksRef.current,
        };
    };

    const downloadSnapshot = (payload: unknown, suffix = 'session') => {
        const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const time = new Date().toISOString().replace(/[:.]/g, '-');
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = `fps-log-${suffix}-${time}.json`;
        anchor.click();
        URL.revokeObjectURL(url);
    };

    useEffect(() => {
        if (typeof navigator !== 'undefined' && navigator.webdriver) {
            window.__FPS_LOGGER_AUTO__ = true;
            setActive(true);
        }
    }, []);

    useEffect(() => {
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.repeat) return;
            const key = event.key.toLowerCase();

            if (key === 'f') {
                setActive((prev) => !prev);
                return;
            }

            if (key !== 'l') return;

            const liveSnapshot = getSnapshot();
            if (liveSnapshot) {
                downloadSnapshot(liveSnapshot, liveSnapshot.active ? 'live' : 'session');
                console.log('[FPS Tool] JSON indirildi:', liveSnapshot);
                return;
            }

            if (window.__FPS_TOOL__) {
                downloadSnapshot(window.__FPS_TOOL__, 'last');
                console.log('[FPS Tool] Son oturum JSON indirildi:', window.__FPS_TOOL__);
                return;
            }

            console.log('[FPS Tool] İndirilecek veri yok. Önce F ile kayıt başlatın.');
        };

        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, []);

    useEffect(() => {
        if (typeof PerformanceObserver === 'undefined') return;

        let observer: PerformanceObserver | null = null;

        try {
            observer = new PerformanceObserver((list) => {
                if (!active) return;
                const now = performance.now();
                const sinceStartSec = Number(((now - startRef.current) / 1000).toFixed(2));

                list.getEntries().forEach((entry) => {
                    longTasksRef.current.push({
                        t: sinceStartSec,
                        durationMs: Number(entry.duration.toFixed(2)),
                    });
                });
            });

            observer.observe({ entryTypes: ['longtask'] });
        } catch {
            observer = null;
        }

        return () => {
            if (observer) observer.disconnect();
        };
    }, [active]);

    useEffect(() => {
        if (!active) {
            if (rafRef.current !== null) {
                cancelAnimationFrame(rafRef.current);
                rafRef.current = null;
            }

            if (samplesRef.current.length > 0) {
                const snapshot = getSnapshot();
                if (!snapshot) return;

                window.__FPS_TOOL__ = {
                    ...snapshot,
                    active: false,
                };

                console.groupCollapsed('[FPS Tool] Session complete (F ile tekrar başlat)');
                console.table(window.__FPS_TOOL__.summary);
                console.log('Timeline:', window.__FPS_TOOL__.timeline);
                console.log('Freezes (>100ms):', window.__FPS_TOOL__.freezes);
                console.log('Raw samples: window.__FPS_TOOL__.samples');
                console.groupEnd();
            }

            return;
        }

        startRef.current = performance.now();
        startEpochRef.current = Date.now();
        prevRef.current = 0;
        samplesRef.current = [];
        freezesRef.current = [];
        timelineRef.current = [];
        bucketRef.current = [];
        bucketStartedAtRef.current = 0;
        lastHudAtRef.current = 0;
        longTasksRef.current = [];
        bucketCallsRef.current = [];
        runningSumRef.current = 0;
        runningMinRef.current = Number.POSITIVE_INFINITY;
        setHud({ fps: 0, avg: 0, min: 0, p1Low: 0, freezes: 0 });

        const loop = (now: number) => {
            if (!prevRef.current) {
                prevRef.current = now;
                bucketStartedAtRef.current = now;
                rafRef.current = requestAnimationFrame(loop);
                return;
            }

            const dt = now - prevRef.current;
            prevRef.current = now;
            if (dt <= 0) {
                rafRef.current = requestAnimationFrame(loop);
                return;
            }

            const fps = Math.min(240, 1000 / dt);
            samplesRef.current.push(fps);
            runningSumRef.current += fps;
            if (fps < runningMinRef.current) runningMinRef.current = fps;
            bucketRef.current.push(fps);
            bucketCallsRef.current.push(window.__R3F_METRICS__?.render.calls ?? 0);

            if (dt > 100) {
                freezesRef.current.push({
                    t: Number(((now - startRef.current) / 1000).toFixed(2)),
                    dtMs: Number(dt.toFixed(2)),
                });
            }

            if (now - bucketStartedAtRef.current >= 1000 && bucketRef.current.length > 0) {
                const bucket = bucketRef.current;
                const bucketCalls = bucketCallsRef.current;
                const bMin = Math.min(...bucket);
                const bMax = Math.max(...bucket);
                const bAvg = bucket.reduce((sum, value) => sum + value, 0) / bucket.length;
                const bCalls = bucketCalls.length > 0
                    ? bucketCalls.reduce((sum, value) => sum + value, 0) / bucketCalls.length
                    : 0;
                timelineRef.current.push({
                    t: Number(((now - startRef.current) / 1000).toFixed(1)),
                    avg: Number(bAvg.toFixed(2)),
                    min: Number(bMin.toFixed(2)),
                    max: Number(bMax.toFixed(2)),
                    calls: Number(bCalls.toFixed(2)),
                });
                bucketRef.current = [];
                bucketCallsRef.current = [];
                bucketStartedAtRef.current = now;
            }

            if (now - lastHudAtRef.current >= 500 && samplesRef.current.length > 5) {
                const count = samplesRef.current.length;
                const avg = runningSumRef.current / count;
                const min = runningMinRef.current;

                // Estimate p1 low from a rolling tail window to avoid sorting the full session repeatedly.
                const tailWindow = samplesRef.current.slice(Math.max(0, count - 240));
                const p1Low = percentile(tailWindow, 0.01);
                setHud({
                    fps: Number(fps.toFixed(1)),
                    avg: Number(avg.toFixed(1)),
                    min: Number(min.toFixed(1)),
                    p1Low: Number(p1Low.toFixed(1)),
                    freezes: freezesRef.current.length,
                });

                const liveSnapshot = getSnapshot();
                if (liveSnapshot) {
                    window.__FPS_TOOL__ = {
                        ...liveSnapshot,
                        active: true,
                    };
                }

                lastHudAtRef.current = now;
            }

            rafRef.current = requestAnimationFrame(loop);
        };

        rafRef.current = requestAnimationFrame(loop);

        return () => {
            if (rafRef.current !== null) {
                cancelAnimationFrame(rafRef.current);
                rafRef.current = null;
            }
        };
    }, [active]);

    if (!active) return null;

    return (
        <div
            style={{
                position: 'fixed',
                top: 10,
                left: 10,
                zIndex: 9999,
                background: 'rgba(0,0,0,0.75)',
                color: '#7CFF7C',
                padding: '8px 10px',
                borderRadius: '8px',
                border: '1px solid rgba(124,255,124,0.4)',
                fontSize: '12px',
                fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                pointerEvents: 'none',
                lineHeight: 1.4,
            }}
        >
            <div>FPS: {hud.fps}</div>
            <div>AVG: {hud.avg}</div>
            <div>MIN: {hud.min}</div>
            <div>1% LOW: {hud.p1Low}</div>
            <div>FREEZE: {hud.freezes}</div>
            <div>CALLS: {window.__R3F_METRICS__?.render.calls ?? 0}</div>
            <div style={{ opacity: 0.7 }}>F: start/stop, L: JSON indir</div>
        </div>
    );
}
