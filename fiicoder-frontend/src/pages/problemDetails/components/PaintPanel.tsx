import { useRef, useState, useEffect, useCallback } from 'react';
import { useTheme } from '../../../contexts/ThemeContext';
import { getEffectivePalette } from '../../../utils/monacoTheme';

type Tool = 'pencil' | 'line' | 'rect' | 'ellipse' | 'eraser';

const PALETTE = [
    '#ef4444', '#f97316', '#facc15', '#4ade80',
    '#22d3ee', '#60a5fa', '#a78bfa', '#f472b6',
    '#ffffff', '#94a3b8', '#475569', '#000000',
];

const TOOL_ICONS: Record<Tool, string> = {
    pencil:  'M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z',
    line:    'M4 20L20 4',
    rect:    'M4 6a2 2 0 012-2h12a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V6z',
    ellipse: 'M12 4C7.582 4 4 7.582 4 12s3.582 8 8 8 8-3.582 8-8-3.582-8-8-8z',
    eraser:  'M20 20H7L3 16l9-9 8 8-2.5 2.5M6.5 17.5l4-4',
};

type Props = {
    lang: string;
    problemTitle: string;
};

export default function PaintPanel({ lang, problemTitle }: Props) {
    const storageKey = `fiicoder_paint_${problemTitle}`;
    const { theme, customColors } = useTheme();
    const bgColor = getEffectivePalette(theme, customColors).editorBg;

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const snapshotRef = useRef<ImageData | null>(null);
    const startPosRef = useRef<{ x: number; y: number } | null>(null);
    const historyRef = useRef<ImageData[]>([]);
    const savedRef = useRef<string | null>(null);

    const [tool, setTool] = useState<Tool>('pencil');
    const [color, setColor] = useState(PALETTE[4]);
    const [size, setSize] = useState(2);
    const [isDrawing, setIsDrawing] = useState(false);

    // Initialise / restore canvas on mount and on resize
    useEffect(() => {
        const canvas = canvasRef.current;
        const container = containerRef.current;
        if (!canvas || !container) return;

        let firstRun = true;

        const setup = () => {
            const ctx = canvas.getContext('2d');
            if (!ctx) return;
            const w = container.clientWidth;
            const h = container.clientHeight;
            if (w === 0 || h === 0) return;

            canvas.width = w;
            canvas.height = h;
            ctx.fillStyle = bgColor;
            ctx.fillRect(0, 0, w, h);

            const src = firstRun
                ? (savedRef.current ?? (() => { try { return localStorage.getItem(storageKey); } catch { return null; } })())
                : savedRef.current;

            if (src) {
                const img = new Image();
                img.onload = () => ctx.drawImage(img, 0, 0);
                img.src = src;
            }
            firstRun = false;
        };

        const ro = new ResizeObserver(setup);
        ro.observe(container);
        setup();
        return () => ro.disconnect();
    }, [bgColor, storageKey]);

    // Autosave to localStorage every 15 s
    useEffect(() => {
        const id = setInterval(() => {
            if (savedRef.current) {
                try { localStorage.setItem(storageKey, savedRef.current); } catch {}
            }
        }, 15_000);
        return () => {
            clearInterval(id);
            if (savedRef.current) {
                try { localStorage.setItem(storageKey, savedRef.current); } catch {}
            }
        };
    }, [storageKey]);

    const getPos = (e: React.MouseEvent) => {
        const r = canvasRef.current!.getBoundingClientRect();
        return { x: e.clientX - r.left, y: e.clientY - r.top };
    };

    const saveHistory = useCallback(() => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!ctx || !canvas) return;
        historyRef.current.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
        if (historyRef.current.length > 40) historyRef.current.shift();
    }, []);

    const commitSaved = useCallback(() => {
        const url = canvasRef.current?.toDataURL('image/png');
        if (url) savedRef.current = url;
    }, []);

    const onMouseDown = useCallback((e: React.MouseEvent) => {
        const pos = getPos(e);
        setIsDrawing(true);
        startPosRef.current = pos;
        saveHistory();

        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!ctx || !canvas) return;

        if (tool === 'pencil' || tool === 'eraser') {
            ctx.beginPath();
            ctx.moveTo(pos.x, pos.y);
        } else {
            snapshotRef.current = ctx.getImageData(0, 0, canvas.width, canvas.height);
        }
    }, [tool, saveHistory]);

    const onMouseMove = useCallback((e: React.MouseEvent) => {
        if (!isDrawing) return;
        const pos = getPos(e);
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!ctx || !canvas || !startPosRef.current) return;

        const drawColor = tool === 'eraser' ? bgColor : color;
        ctx.strokeStyle = drawColor;
        ctx.fillStyle = drawColor;
        ctx.lineWidth = tool === 'eraser' ? size * 5 : size;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        if (tool === 'pencil' || tool === 'eraser') {
            ctx.lineTo(pos.x, pos.y);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(pos.x, pos.y);
            return;
        }

        if (!snapshotRef.current) return;
        ctx.putImageData(snapshotRef.current, 0, 0);
        const sx = startPosRef.current.x;
        const sy = startPosRef.current.y;

        if (tool === 'line') {
            ctx.beginPath();
            ctx.moveTo(sx, sy);
            ctx.lineTo(pos.x, pos.y);
            ctx.stroke();
        } else if (tool === 'rect') {
            ctx.strokeRect(sx, sy, pos.x - sx, pos.y - sy);
        } else if (tool === 'ellipse') {
            const rx = Math.abs(pos.x - sx) / 2;
            const ry = Math.abs(pos.y - sy) / 2;
            ctx.beginPath();
            ctx.ellipse((sx + pos.x) / 2, (sy + pos.y) / 2, Math.max(rx, 1), Math.max(ry, 1), 0, 0, Math.PI * 2);
            ctx.stroke();
        }
    }, [isDrawing, tool, color, bgColor, size]);

    const onMouseUp = useCallback(() => {
        setIsDrawing(false);
        snapshotRef.current = null;
        startPosRef.current = null;
        canvasRef.current?.getContext('2d')?.beginPath();
        commitSaved();
    }, [commitSaved]);

    const undo = useCallback(() => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!ctx || !canvas || historyRef.current.length === 0) return;
        ctx.putImageData(historyRef.current.pop()!, 0, 0);
        commitSaved();
    }, [commitSaved]);

    const clear = useCallback(() => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!ctx || !canvas) return;
        saveHistory();
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        commitSaved();
    }, [bgColor, saveHistory, commitSaved]);

    const download = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const a = document.createElement('a');
        a.download = `${problemTitle}-scratch.png`;
        a.href = canvas.toDataURL();
        a.click();
    }, [problemTitle]);

    return (
        <div className="h-full flex flex-col bg-(--surface-card)">
            {/* Toolbar */}
            <div className="flex items-center gap-2 px-3 py-1.5 border-b border-(--accent)/15 shrink-0 flex-wrap">
                {/* Tools */}
                <div className="flex gap-0.5 rounded-lg overflow-hidden border border-(--accent)/20">
                    {(Object.keys(TOOL_ICONS) as Tool[]).map(t => (
                        <button
                            key={t}
                            onClick={() => setTool(t)}
                            title={t}
                            className={`p-1.5 transition-colors ${tool === t ? 'bg-(--accent) text-(--surface-card)' : 'hover:bg-(--accent)/20 text-(--text-muted)'}`}
                        >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d={TOOL_ICONS[t]} />
                            </svg>
                        </button>
                    ))}
                </div>

                {/* Size */}
                <div className="flex gap-0.5 rounded-lg overflow-hidden border border-(--accent)/20">
                    {[1, 2, 4, 8].map(s => (
                        <button
                            key={s}
                            onClick={() => setSize(s)}
                            className={`px-2 py-1.5 text-[10px] font-bold transition-colors ${size === s ? 'bg-(--accent) text-(--surface-card)' : 'hover:bg-(--accent)/20 text-(--text-muted)'}`}
                        >
                            {s}px
                        </button>
                    ))}
                </div>

                {/* Color palette */}
                <div className="flex gap-0.5 flex-wrap">
                    {PALETTE.map(c => (
                        <button
                            key={c}
                            onClick={() => { setColor(c); if (tool === 'eraser') setTool('pencil'); }}
                            className={`w-5 h-5 rounded-sm border-2 transition-transform hover:scale-110 ${color === c && tool !== 'eraser' ? 'border-(--accent) scale-110' : 'border-transparent'}`}
                            style={{ backgroundColor: c }}
                        />
                    ))}
                    {/* Custom color */}
                    <label title={lang === 'RO' ? 'Culoare personalizată' : 'Custom colour'} className="relative w-5 h-5 rounded-sm overflow-hidden border border-(--accent)/30 cursor-pointer hover:scale-110 transition-transform">
                        <div className="absolute inset-0" style={{ background: 'conic-gradient(red, yellow, lime, cyan, blue, magenta, red)' }} />
                        <input
                            type="color"
                            value={color}
                            onChange={e => { setColor(e.target.value); if (tool === 'eraser') setTool('pencil'); }}
                            className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
                        />
                    </label>
                </div>

                {/* Actions */}
                <div className="flex gap-0.5 ml-auto">
                    <button
                        onClick={undo}
                        title={lang === 'RO' ? 'Anul' : 'Undo'}
                        disabled={historyRef.current.length === 0}
                        className="p-1.5 rounded-lg border border-(--accent)/20 text-(--text-muted) hover:bg-(--accent)/20 hover:text-(--accent) transition-colors disabled:opacity-30"
                    >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                        </svg>
                    </button>
                    <button
                        onClick={clear}
                        title={lang === 'RO' ? 'Șterge tot' : 'Clear all'}
                        className="p-1.5 rounded-lg border border-(--accent)/20 text-(--text-muted) hover:bg-red-500/20 hover:text-red-400 transition-colors"
                    >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    </button>
                    <button
                        onClick={download}
                        title={lang === 'RO' ? 'Descarcă PNG' : 'Download PNG'}
                        className="p-1.5 rounded-lg border border-(--accent)/20 text-(--text-muted) hover:bg-(--accent)/20 hover:text-(--accent) transition-colors"
                    >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Canvas */}
            <div ref={containerRef} className="flex-1 min-h-0 overflow-hidden">
                <canvas
                    ref={canvasRef}
                    className="block"
                    style={{ cursor: tool === 'eraser' ? 'cell' : 'crosshair' }}
                    onMouseDown={onMouseDown}
                    onMouseMove={onMouseMove}
                    onMouseUp={onMouseUp}
                    onMouseLeave={onMouseUp}
                />
            </div>
        </div>
    );
}
