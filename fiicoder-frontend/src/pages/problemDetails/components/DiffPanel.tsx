import { useState, useCallback, useRef } from 'react';
import { DiffEditor } from '@monaco-editor/react';
import type { ProblemSubmissionDTO } from '../types/problemDetails';
import { applyMonacoTheme, getMonacoLanguageId } from '../../../utils/monacoTheme';
import { useTheme } from '../../../contexts/ThemeContext';
import { formatScore } from '../utils/textUtils';
import {
    submissionVerdict,
    submissionVerdictLabels,
    type SubmissionVerdict,
} from '../../profile/profileUtils';
import { translations } from '../../../language/Language';

type Props = {
    lang: string;
    recentSubmissions: ProblemSubmissionDTO[];
    codeRef: React.RefObject<string>;
    language: string;
    onRestoreCode?: (code: string) => void;
};

const verdictTextColor: Record<SubmissionVerdict, string> = {
    ACCEPTED: 'text-green-400',
    PARTIAL:  'text-amber-400',
    REJECTED: 'text-red-400',
    PENDING:  'text-blue-400',
};

const verdictBadgeClass: Record<SubmissionVerdict, string> = {
    ACCEPTED: 'border-green-500/40 bg-green-500/10 text-green-300',
    PARTIAL:  'border-amber-500/40 bg-amber-500/10 text-amber-300',
    REJECTED: 'border-red-500/40 bg-red-500/10 text-red-300',
    PENDING:  'border-blue-500/40 bg-blue-500/10 text-blue-300',
};

export default function DiffPanel({ lang, recentSubmissions, codeRef, language, onRestoreCode }: Props) {
    const t = translations[lang as 'RO' | 'EN'] ?? translations.RO;
    const { theme, customColors } = useTheme();
    const themeId = theme === 'custom' ? 'fiicoder-custom' : `fiicoder-${theme}`;

    const sorted = [...recentSubmissions].sort(
        (a, b) => new Date(b.submissiondate).getTime() - new Date(a.submissiondate).getTime(),
    );

    const [selectedIdx, setSelectedIdx] = useState(0);
    const [modifiedCode, setModifiedCode] = useState(() => codeRef.current ?? '');
    const [isEditable, setIsEditable] = useState(false);
    const [renderSideBySide, setRenderSideBySide] = useState(true);
    const [wordWrap, setWordWrap] = useState<'on' | 'off'>('on');
    const [copyFeedback, setCopyFeedback] = useState(false);

    const diffEditorRef = useRef<any>(null);

    const handleDiffMount = useCallback((editor: any) => {
        diffEditorRef.current = editor;
    }, []);

    const refresh = useCallback(() => {
        setModifiedCode(codeRef.current ?? '');
    }, [codeRef]);

    const handleLoadPastCode = useCallback(() => {
        const sub = sorted[selectedIdx];
        if (sub) setModifiedCode(sub.code);
    }, [sorted, selectedIdx]);

    const handleCopyPastCode = useCallback(async () => {
        const sub = sorted[selectedIdx];
        if (!sub) return;
        await navigator.clipboard.writeText(sub.code);
        setCopyFeedback(true);
        setTimeout(() => setCopyFeedback(false), 1500);
    }, [sorted, selectedIdx]);

    const handleApplyToEditor = useCallback(() => {
        if (!onRestoreCode) return;
        const val = diffEditorRef.current?.getModifiedEditor()?.getValue() ?? modifiedCode;
        onRestoreCode(val);
    }, [onRestoreCode, modifiedCode]);

    const beforeMount = useCallback((monaco: any) => {
        applyMonacoTheme(monaco, theme, { customColors });
    }, [theme, customColors]);

    const selectedSub = sorted[selectedIdx] ?? null;
    const selectedVerdict = selectedSub
        ? submissionVerdict({ status: selectedSub.status, score: selectedSub.Score })
        : null;

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
            <div className="flex items-center gap-1.5 px-2.5 py-2 border-b border-(--accent)/15 shrink-0 flex-wrap">
                {/* Submission selector */}
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

                {/* Copy past submission code */}
                <button
                    onClick={handleCopyPastCode}
                    title={t.diffCopyPastCode}
                    className="shrink-0 flex items-center justify-center w-7 h-7 rounded-lg border border-(--accent)/30 bg-(--surface-input) text-(--text-muted) hover:text-(--accent) hover:border-(--accent)/60 transition-colors"
                >
                    {copyFeedback ? (
                        <svg className="w-3.5 h-3.5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                    ) : (
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                    )}
                </button>

                {/* Load past code into right pane */}
                <button
                    onClick={handleLoadPastCode}
                    title={t.diffLoadPastCode}
                    className="shrink-0 flex items-center justify-center w-7 h-7 rounded-lg border border-(--accent)/30 bg-(--surface-input) text-(--text-muted) hover:text-(--accent) hover:border-(--accent)/60 transition-colors"
                >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 13l-7 7-7-7m14-8l-7 7-7-7" />
                    </svg>
                </button>

                <div className="w-px h-5 bg-(--accent)/20 shrink-0" />

                {/* Snapshot from editor */}
                <button
                    onClick={refresh}
                    title={t.diffSnapshotTitle}
                    className="shrink-0 flex items-center justify-center w-7 h-7 rounded-lg border border-(--accent)/30 bg-(--surface-input) text-(--text-muted) hover:text-(--accent) hover:border-(--accent)/60 transition-colors"
                >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                </button>

                {/* Apply right pane to main editor */}
                {onRestoreCode && (
                    <button
                        onClick={handleApplyToEditor}
                        title={t.diffApplyToEditor}
                        className="shrink-0 flex items-center justify-center w-7 h-7 rounded-lg border border-(--accent)/30 bg-(--surface-input) text-(--text-muted) hover:text-(--accent) hover:border-(--accent)/60 transition-colors"
                    >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                        </svg>
                    </button>
                )}

                <div className="w-px h-5 bg-(--accent)/20 shrink-0" />

                {/* Editable toggle */}
                <button
                    onClick={() => setIsEditable(e => !e)}
                    title={isEditable ? t.diffDisableEdit : t.diffEnableEdit}
                    className={`shrink-0 flex items-center justify-center w-7 h-7 rounded-lg border transition-colors ${
                        isEditable
                            ? 'border-(--accent) bg-(--accent)/20 text-(--accent)'
                            : 'border-(--accent)/30 bg-(--surface-input) text-(--text-muted) hover:text-(--accent) hover:border-(--accent)/60'
                    }`}
                >
                    {isEditable ? (
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                    ) : (
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                    )}
                </button>

                {/* Side-by-side / inline toggle */}
                <button
                    onClick={() => setRenderSideBySide(s => !s)}
                    title={renderSideBySide ? t.diffInlineView : t.diffSideBySide}
                    className="shrink-0 flex items-center justify-center w-7 h-7 rounded-lg border border-(--accent)/30 bg-(--surface-input) text-(--text-muted) hover:text-(--accent) hover:border-(--accent)/60 transition-colors"
                >
                    {renderSideBySide ? (
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    ) : (
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                            <rect x="3" y="4" width="8" height="16" rx="1" strokeLinecap="round" strokeLinejoin="round" />
                            <rect x="13" y="4" width="8" height="16" rx="1" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    )}
                </button>

                {/* Word wrap toggle */}
                <button
                    onClick={() => setWordWrap(w => w === 'on' ? 'off' : 'on')}
                    title={wordWrap === 'on' ? 'Disable word wrap' : 'Enable word wrap'}
                    className={`shrink-0 flex items-center justify-center w-7 h-7 rounded-lg border text-[11px] font-bold transition-colors ${
                        wordWrap === 'off'
                            ? 'border-(--accent) bg-(--accent)/20 text-(--accent)'
                            : 'border-(--accent)/30 bg-(--surface-input) text-(--text-muted) hover:text-(--accent) hover:border-(--accent)/60'
                    }`}
                >
                    ↵
                </button>
            </div>

            {/* Column labels — only in side-by-side mode */}
            {renderSideBySide && (
                <div className="grid grid-cols-2 border-b border-(--accent)/10 shrink-0">
                    <div className="flex items-center gap-2 px-3 py-1.5 border-r border-(--accent)/10 min-w-0">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-(--text-muted) shrink-0">
                            {t.diffPastSubmission}
                        </span>
                        {selectedVerdict && (
                            <span className={`text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded border ${verdictBadgeClass[selectedVerdict]} shrink-0`}>
                                {submissionVerdictLabels[selectedVerdict][lang === 'RO' ? 'ro' : 'en']}
                            </span>
                        )}
                        {selectedSub && (
                            <span className={`text-[10px] font-bold ml-auto shrink-0 ${selectedVerdict ? verdictTextColor[selectedVerdict] : 'text-(--text-muted)'}`}>
                                {formatScore(selectedSub.Score)}p
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 min-w-0">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-(--text-muted) shrink-0">
                            {t.diffCurrentCode}
                        </span>
                        {isEditable && (
                            <span className="text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded border border-amber-500/40 bg-amber-500/10 text-amber-300 shrink-0">
                                {t.diffEditMode}
                            </span>
                        )}
                    </div>
                </div>
            )}

            {/* Diff editor */}
            <div className="flex-1 min-h-0">
                {selectedSub && (
                    <DiffEditor
                        height="100%"
                        language={getMonacoLanguageId(language)}
                        theme={themeId}
                        original={selectedSub.code}
                        modified={modifiedCode}
                        beforeMount={beforeMount}
                        onMount={handleDiffMount}
                        options={{
                            readOnly: !isEditable,
                            originalEditable: false,
                            fontSize: 13,
                            fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                            minimap: { enabled: false },
                            scrollBeyondLastLine: false,
                            renderSideBySide,
                            automaticLayout: true,
                            padding: { top: 10 },
                            lineNumbers: 'on',
                            renderIndicators: true,
                            wordWrap,
                        }}
                    />
                )}
            </div>
        </div>
    );
}
