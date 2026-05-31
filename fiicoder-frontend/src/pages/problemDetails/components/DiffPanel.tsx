import { useState, useCallback } from 'react';
import { DiffEditor } from '@monaco-editor/react';
import type { ProblemSubmissionDTO } from '../types/problemDetails';
import { applyMonacoTheme, getMonacoLanguageId } from '../../../utils/monacoTheme';
import { useTheme } from '../../../contexts/ThemeContext';
import { formatScore } from '../utils/textUtils';
import {
    submissionVerdict,
    submissionVerdictLabels,
} from '../../profile/profileUtils';
import { translations } from '../../../language/Language';

type Props = {
    lang: string;
    recentSubmissions: ProblemSubmissionDTO[];
    codeRef: React.RefObject<string>;
    language: string;
};

export default function DiffPanel({ lang, recentSubmissions, codeRef, language }: Props) {
    const t = translations[lang as 'RO' | 'EN'] ?? translations.RO;
    const { theme, customColors } = useTheme();
    const themeId = theme === 'custom' ? 'fiicoder-custom' : `fiicoder-${theme}`;

    const sorted = [...recentSubmissions].sort(
        (a, b) => new Date(b.submissiondate).getTime() - new Date(a.submissiondate).getTime(),
    );

    const [selectedIdx, setSelectedIdx] = useState(0);
    const [currentSnapshot, setCurrentSnapshot] = useState(() => codeRef.current ?? '');

    const refresh = useCallback(() => {
        setCurrentSnapshot(codeRef.current ?? '');
    }, [codeRef]);

    const beforeMount = useCallback((monaco: any) => {
        applyMonacoTheme(monaco, theme, { customColors });
    }, [theme, customColors]);

    const selectedSub = sorted[selectedIdx] ?? null;

    if (sorted.length === 0) {
        return (
            <div className="h-full flex items-center justify-center p-8 bg-(--surface-card)">
                <p className="text-sm text-(--text-muted) italic text-center">
                    {t.diffSubmitFirst}
                </p>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col bg-(--surface-card)">
            {/* Toolbar */}
            <div className="flex items-center gap-2 px-3 py-2 border-b border-(--accent)/15 shrink-0 overflow-x-auto">
                <select
                    value={selectedIdx}
                    onChange={e => setSelectedIdx(Number(e.target.value))}
                    className="flex-1 min-w-0 bg-(--surface-input) border border-(--accent)/30 rounded-lg px-2 py-1 text-[11px] text-(--text-h) outline-none cursor-pointer"
                >
                    {sorted.map((sub, i) => {
                        const verdict = submissionVerdict({ status: sub.status, score: sub.Score });
                        const label = submissionVerdictLabels[verdict][lang === 'RO' ? 'ro' : 'en'];
                        return (
                            <option key={i} value={i}>
                                {new Date(sub.submissiondate).toLocaleString()} — {formatScore(sub.Score)}p — {label}
                            </option>
                        );
                    })}
                </select>
                <button
                    onClick={refresh}
                    title={t.diffSnapshotTitle}
                    className="shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-lg border border-(--accent)/40 bg-(--accent)/10 text-[11px] font-bold text-(--text-muted) hover:bg-(--accent)/20 hover:text-(--accent) transition-colors whitespace-nowrap"
                >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    {t.diffCurrentCode}
                </button>
            </div>

            {/* Column labels */}
            <div className="grid grid-cols-2 border-b border-(--accent)/10 shrink-0">
                <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-(--text-muted) border-r border-(--accent)/10">
                    {t.diffPastSubmission}
                </div>
                <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-(--text-muted)">
                    {t.diffCurrentCode}
                </div>
            </div>

            {/* Diff editor */}
            <div className="flex-1 min-h-0">
                {selectedSub && (
                    <DiffEditor
                        height="100%"
                        language={getMonacoLanguageId(language)}
                        theme={themeId}
                        original={selectedSub.code}
                        modified={currentSnapshot}
                        beforeMount={beforeMount}
                        options={{
                            readOnly: true,
                            fontSize: 13,
                            fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                            minimap: { enabled: false },
                            scrollBeyondLastLine: false,
                            renderSideBySide: true,
                            automaticLayout: true,
                            padding: { top: 10 },
                            lineNumbers: 'on',
                            renderIndicators: true,
                        }}
                    />
                )}
            </div>
        </div>
    );
}
