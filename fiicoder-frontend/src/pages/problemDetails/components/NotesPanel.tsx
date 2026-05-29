import { useState, useEffect } from 'react';

type Props = {
    lang: string;
    problemTitle: string;
};

export default function NotesPanel({ lang, problemTitle }: Props) {
    const storageKey = `fiicoder_notes_${problemTitle}`;
    const [notes, setNotes] = useState(() => {
        try { return localStorage.getItem(storageKey) ?? ''; } catch { return ''; }
    });

    // Debounced autosave
    useEffect(() => {
        const t = setTimeout(() => {
            try { localStorage.setItem(storageKey, notes); } catch {}
        }, 400);
        return () => clearTimeout(t);
    }, [notes, storageKey]);

    return (
        <div className="h-full flex flex-col bg-(--surface-card)">
            <div className="flex items-center justify-between px-4 py-2 border-b border-(--accent)/15 shrink-0">
                <span className="text-[11px] font-bold uppercase tracking-wider text-(--text-muted)">
                    {lang === 'RO' ? 'Notițe personale' : 'Personal notes'}
                </span>
                <div className="flex items-center gap-3">
                    <span className="text-[10px] font-mono text-(--text-muted) opacity-50">{notes.length}</span>
                    {notes.length > 0 && (
                        <button
                            onClick={() => setNotes('')}
                            className="text-[10px] text-(--text-muted) hover:text-red-400 transition-colors"
                        >
                            {lang === 'RO' ? 'Șterge' : 'Clear'}
                        </button>
                    )}
                </div>
            </div>
            <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder={
                    lang === 'RO'
                        ? 'Observații, idei, formule, complexitate...'
                        : 'Observations, ideas, formulas, complexity...'
                }
                className="flex-1 resize-none p-4 bg-transparent text-sm text-(--text) placeholder:text-(--text-muted)/40 outline-none leading-relaxed custom-scrollbar font-mono"
                spellCheck={false}
            />
        </div>
    );
}
