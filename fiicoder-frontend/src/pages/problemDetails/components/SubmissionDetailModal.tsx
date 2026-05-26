import { motion, AnimatePresence } from 'framer-motion';
import Editor from '@monaco-editor/react';
import { useTheme } from '../../../contexts/ThemeContext';
import { formatScore } from '../utils/textUtils';
import type { ProblemSubmissionDTO } from '../types/problemDetails';
import { submissionVerdictLabels, submissionVerdict, type SubmissionVerdict } from '../../profile/profileUtils';
import { applyMonacoTheme } from '../../../utils/monacoTheme';

type Props = {
    isOpen: boolean;
    onClose: () => void;
    submission: ProblemSubmissionDTO | null;
    lang: string;
};

const verdictClasses: Record<SubmissionVerdict, string> = {
    ACCEPTED: 'border-green-500/40 bg-green-500/10 text-green-300',
    PARTIAL: 'border-amber-500/40 bg-amber-500/10 text-amber-300',
    PENDING: 'border-sky-500/40 bg-sky-500/10 text-sky-300',
    REJECTED: 'border-red-500/40 bg-red-500/10 text-red-300',
};

export default function SubmissionDetailModal({ isOpen, onClose, submission, lang }: Props) {
    const { theme, customColors } = useTheme();

    if (!submission) return null;

    const verdict = submissionVerdict({ status: submission.status, score: submission.Score });
    const verdictLabel = submissionVerdictLabels[verdict][lang === 'RO' ? 'ro' : 'en'];
    const languageName = typeof submission.language === 'string' 
        ? submission.language 
        : (submission.language as any)?.name || 'Unknown';

    let editorLang = 'plaintext';
    const langLower = languageName.toLowerCase();
    if (langLower.includes('c++') || langLower.includes('cpp') || langLower.includes('c')) {
        editorLang = 'cpp';
    } else if (langLower.includes('py')) {
        editorLang = 'python';
    } else if (langLower.includes('java')) {
        editorLang = 'java';
    } else if (langLower.includes('js') || langLower.includes('node') || langLower.includes('javascript')) {
        editorLang = 'javascript';
    } else if (langLower.includes('ts') || langLower.includes('typescript')) {
        editorLang = 'typescript';
    }

    const handleCopy = () => {
        navigator.clipboard.writeText(submission.code);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 z-50 md:w-[800px] md:max-w-[90vw] md:h-[80vh] bg-(--surface-card) border-2 border-(--accent) rounded-3xl shadow-2xl flex flex-col overflow-hidden"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b border-(--accent)/20 bg-(--surface-muted)">
                            <div className="flex items-center gap-4 flex-wrap">
                                <div>
                                    <h3 className="text-lg font-bold text-(--text-h)">
                                        {lang === 'RO' ? 'Detalii Submisie' : 'Submission Details'}
                                    </h3>
                                    <p className="text-xs text-(--text-muted)">
                                        {new Date(submission.submissiondate).toLocaleString(lang === 'RO' ? 'ro-RO' : 'en-US')}
                                    </p>
                                </div>
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border-2 ${verdictClasses[verdict]}`}>
                                    {verdictLabel}
                                </span>
                                <span className="text-sm font-bold text-(--text-h)">
                                    Scor: {formatScore(submission.Score)}
                                </span>
                                <span className="text-xs px-2 py-1 bg-(--accent)/10 text-(--accent) rounded-md border border-(--accent)/20">
                                    {languageName}
                                </span>
                            </div>
                            <button
                                onClick={onClose}
                                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-(--accent)/10 text-(--text-muted) hover:text-(--accent) transition-colors"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>

                        {/* Editor */}
                        <div className="flex-1 min-h-0 relative bg-(--surface-card)">
                            <Editor
                                height="100%"
                                language={editorLang}
                                value={submission.code}
                                onMount={(_editor, monaco) => {
                                    applyMonacoTheme(monaco, theme, { customColors });
                                }}
                                options={{
                                    readOnly: true,
                                    minimap: { enabled: false },
                                    scrollBeyondLastLine: false,
                                    fontSize: 14,
                                    fontFamily: "'JetBrains Mono', 'Fira Code', 'Ubuntu Mono', 'DejaVu Sans Mono', 'Cascadia Code', monospace",
                                    fontLigatures: true,
                                }}
                            />
                            
                            {/* Copy button floating over editor */}
                            <button
                                onClick={handleCopy}
                                className="absolute bottom-4 right-6 p-2 rounded-xl bg-(--surface-card) border-2 border-(--accent)/50 text-(--text-muted) hover:text-(--accent) hover:border-(--accent) shadow-lg transition-all z-10"
                                title="Copy code"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
