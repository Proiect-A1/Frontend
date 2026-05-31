import { useState, useEffect } from 'react';
import { storage, STORAGE_KEYS } from '../../../utils/storage';
import { translations } from '../../../language/Language';

type Props = {
    lang: string;
    problemTitle: string;
};

export default function NotesPanel({ lang, problemTitle }: Props) {
    const t = translations[lang as 'RO' | 'EN'] ?? translations.RO;
    const storageKey = STORAGE_KEYS.notes(problemTitle);
    const [notes, setNotes] = useState(() => storage.get(storageKey) ?? '');

    // Debounced autosave
    useEffect(() => {
        const timeoutId = setTimeout(() => storage.set(storageKey, notes), 400);
        return () => clearTimeout(timeoutId);
    }, [notes, storageKey]);

    return (
        <div className="h-full flex flex-col bg-(--surface-card)">
            <div className="flex items-center justify-between px-4 py-2 border-b border-(--accent)/15 shrink-0">
                <span className="text-[11px] font-bold uppercase tracking-wider text-(--text-muted)">
                    {t.notesPanelTitle}
                </span>
                <div className="flex items-center gap-3">
                    <span className="text-[10px] font-mono text-(--text-muted) opacity-50">{notes.length}</span>
                    {notes.length > 0 && (
                        <button
                            onClick={() => setNotes('')}
                            className="text-[10px] text-(--text-muted) hover:text-red-400 transition-colors"
                        >
                            {t.notesClear}
                        </button>
                    )}
                </div>
            </div>
            <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder={t.notesPlaceholder}
                className="flex-1 resize-none p-4 bg-transparent text-sm text-(--text) placeholder:text-(--text-muted)/40 outline-none leading-relaxed custom-scrollbar font-mono"
                spellCheck={false}
            />
        </div>
    );
}
