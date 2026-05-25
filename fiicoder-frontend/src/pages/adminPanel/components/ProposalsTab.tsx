import { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import remarkGfm from 'remark-gfm';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import { containerVariants, itemVariants } from '../../../utils/motionConfig';
import { useLanguage } from '../../../language/Language';
import { adminService, type ProblemProposal, type ProblemProposalDetail, type AcceptedProblem } from '../services/adminService';
import { unpackTranslation } from '../../../utils/translationPacker';

type Props = {
    proposals: ProblemProposal[];
    selectedProposal: ProblemProposalDetail | null;
    selectedProposalId: string | null;
    setSelectedProposalId: (id: string | null) => void;
    handleReviewProposal: (id: string, action: 'approve' | 'reject') => void;
    handleDeleteProposal: (id: string) => void;
    acceptedProblems: AcceptedProblem[];
    isAcceptedLoading: boolean;
    handleDeleteAccepted: (title: string) => void;
    handleChangeVisibility: (title: string, visibility: 'PUBLIC' | 'PRIVATE') => void;
};

export default function ProposalsTab({
    proposals,
    selectedProposal,
    selectedProposalId,
    setSelectedProposalId,
    handleReviewProposal,
    handleDeleteProposal,
    acceptedProblems,
    isAcceptedLoading,
    handleDeleteAccepted,
    handleChangeVisibility,
}: Props) {
    const { lang } = useLanguage();
    const [subTab, setSubTab] = useState<'pending' | 'accepted'>('pending');
    const [showTests, setShowTests] = useState(false);

    const selectedProposalMeta = proposals.find(p => p.id === selectedProposalId);

    const statusBadge = (status: string) => {
        const upper = (status || '').toUpperCase();
        if (upper === 'CHECKED') {
            return {
                className: 'border-sky-400/60 bg-sky-400/20 text-sky-400',
                label: lang === 'RO' ? 'VERIFICAT' : 'CHECKED',
                title:
                    lang === 'RO'
                        ? 'Verificat automat de backend. Așteaptă review-ul tău.'
                        : 'Auto-checked by backend. Awaiting your review.',
            };
        }
        if (upper === 'PENDING') {
            return {
                className: 'border-amber-400/60 bg-amber-400/20 text-amber-500',
                label: lang === 'RO' ? 'ÎN AȘTEPTARE' : 'PENDING',
                title:
                    lang === 'RO'
                        ? 'Încă neverificată automat de backend.'
                        : 'Not yet auto-checked by backend.',
            };
        }
        return {
            className: 'border-(--accent)/40 bg-(--accent)/15 text-(--text-h)',
            label: upper,
            title: upper,
        };
    };

    const { data: testsData, isLoading: isTestsLoading } = useQuery({
        queryKey: ['admin', 'proposal', selectedProposalId, 'tests'],
        enabled: !!selectedProposalId && showTests,
        queryFn: () => adminService.getProblemTests(selectedProposalId as string),
    });

    const subTabBtn = (id: 'pending' | 'accepted', label: string) => (
        <button
            type="button"
            onClick={() => setSubTab(id)}
            className={`px-4 py-1.5 rounded-full text-sm font-bold border-2 transition-all duration-200 ${
                subTab === id
                    ? 'bg-(--accent)/25 border-(--accent) text-(--text-h)'
                    : 'bg-transparent border-(--accent)/50 text-(--text) hover:bg-(--accent)/15 hover:text-(--text-h)'
            }`}
        >
            {label}
        </button>
    );

    return (
        <motion.div variants={containerVariants} className="space-y-6">
            <motion.div variants={itemVariants} className="flex items-center justify-between gap-4">
                <h2 className="text-2xl font-bold text-(--text-h)">
                    {lang === 'RO' ? 'Gestionare Probleme' : 'Problem Management'}
                </h2>
                <div className="flex gap-2">
                    {subTabBtn('pending', lang === 'RO' ? 'În așteptare' : 'Pending')}
                    {subTabBtn('accepted', lang === 'RO' ? 'Acceptate' : 'Accepted')}
                </div>
            </motion.div>

            {subTab === 'pending' && (
                <motion.div
                    key="pending"
                    variants={containerVariants}
                    className="grid gap-4 xl:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]"
                >
                    <motion.div variants={containerVariants} className="space-y-3">
                        <motion.div
                            variants={itemVariants}
                            className="flex items-center justify-between text-sm text-(--text-muted) font-semibold gap-3"
                        >
                            <span>{lang === 'RO' ? 'Propuneri în așteptare' : 'Pending proposals'}</span>
                            <span className="flex items-center gap-2">
                                <span>{proposals.length}</span>
                                {(() => {
                                    const checkedCount = proposals.filter(
                                        (p) => (p.status as string).toUpperCase() === 'CHECKED',
                                    ).length;
                                    const pendingCount = proposals.length - checkedCount;
                                    return (
                                        <span className="text-[10px] uppercase tracking-widest font-bold flex items-center gap-1">
                                            <span className="px-1.5 py-0.5 rounded-full border border-amber-400/60 bg-amber-400/15 text-amber-500">
                                                {pendingCount} {lang === 'RO' ? 'pending' : 'pending'}
                                            </span>
                                            <span className="px-1.5 py-0.5 rounded-full border border-sky-400/60 bg-sky-400/15 text-sky-400">
                                                {checkedCount} {lang === 'RO' ? 'verif.' : 'checked'}
                                            </span>
                                        </span>
                                    );
                                })()}
                            </span>
                        </motion.div>

                        <motion.div variants={containerVariants} className="grid gap-3">
                            {proposals.length === 0 && (
                                <motion.p variants={itemVariants} className="text-(--text-muted) text-sm">
                                    {lang === 'RO' ? 'Nu există propuneri în așteptare.' : 'There are no pending proposals.'}
                                </motion.p>
                            )}

                            {proposals.map((proposal) => {
                                const isSelected = selectedProposalId === proposal.id;
                                return (
                                    <motion.button
                                        variants={itemVariants}
                                        key={proposal.id}
                                        onClick={() => { setSelectedProposalId(proposal.id); setShowTests(false); }}
                                        className={`text-left p-4 rounded-2xl border transition-colors duration-200 ${
                                            isSelected
                                                ? 'border-(--accent) bg-(--accent)/15'
                                                : 'border-(--accent)/20 bg-(--surface-muted) hover:border-(--accent)/40 hover:bg-(--accent)/10'
                                        }`}
                                    >
                                        <div className="flex items-start justify-between gap-3 mb-2">
                                            <h3 className="text-lg font-bold text-(--text-h) line-clamp-1">{proposal.title}</h3>
                                            <span className="text-xs text-(--text-muted) font-semibold whitespace-nowrap">{formatDate(proposal.createdAt)}</span>
                                        </div>
                                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                                            {proposal.difficulty && (
                                                <DifficultyBadge difficulty={proposal.difficulty} />
                                            )}
                                            {proposal.tags && proposal.tags.length > 0 && proposal.tags.slice(0, 3).map(tag => (
                                                <span key={tag} className="rounded-full border border-(--accent)/20 bg-(--accent)/5 px-2 py-0.5 text-[10px] text-(--text-muted)">
                                                    {tag}
                                                </span>
                                            ))}
                                            {proposal.tags && proposal.tags.length > 3 && (
                                                <span className="text-[10px] text-(--text-muted)">+{proposal.tags.length - 3}</span>
                                            )}
                                        </div>
                                        <div className="flex items-center justify-between text-xs text-(--text-muted) font-semibold">
                                            <span>
                                                {lang === 'RO' ? 'Propus de' : 'By'}:{' '}
                                                <span className="text-(--text)">{proposal.authorUsername}</span>
                                            </span>
                                            {(() => {
                                                const badge = statusBadge(proposal.status);
                                                return (
                                                    <span
                                                        title={badge.title}
                                                        className={`rounded-full border px-2.5 py-1 font-bold ${badge.className}`}
                                                    >
                                                        {badge.label}
                                                    </span>
                                                );
                                            })()}
                                        </div>
                                    </motion.button>
                                );
                            })}
                        </motion.div>
                    </motion.div>

                    <motion.div
                        variants={itemVariants}
                        className="p-5 rounded-2xl border border-(--accent)/20 bg-(--surface-muted) h-fit sticky top-0"
                    >
                        {!selectedProposal && selectedProposalId && (
                            <p className="text-(--text-muted) text-sm">
                                {lang === 'RO' ? 'Se încarcă detaliile propunerii...' : 'Loading proposal details...'}
                            </p>
                        )}
                        {!selectedProposal && !selectedProposalId && (
                            <p className="text-(--text-muted) text-sm text-center py-8">
                                {lang === 'RO' ? 'Selectează o propunere pentru a vedea detaliile.' : 'Select a proposal to see the details.'}
                            </p>
                        )}
                        {selectedProposal && (
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <div className="flex items-start justify-between gap-3">
                                        <h3 className="text-2xl font-bold text-(--text-h)">{selectedProposal.title}</h3>
                                        {(() => {
                                            const liveStatus = selectedProposalMeta?.status ?? selectedProposal.status;
                                            const badge = statusBadge(liveStatus);
                                            return (
                                                <span
                                                    title={badge.title}
                                                    className={`rounded-full border px-3 py-1 text-xs font-bold whitespace-nowrap ${badge.className}`}
                                                >
                                                    {badge.label}
                                                </span>
                                            );
                                        })()}
                                    </div>
                                    <div className="flex flex-wrap items-center gap-2 text-xs text-(--text-muted)">
                                        <span>
                                            {lang === 'RO' ? 'Propus de' : 'By'}{' '}
                                            <span className="text-(--text-h) font-bold">{selectedProposal.authorUsername}</span>
                                        </span>
                                        {selectedProposalMeta?.createdAt && (
                                            <>
                                                <span className="opacity-40">·</span>
                                                <span>{formatDate(selectedProposalMeta.createdAt)}</span>
                                            </>
                                        )}
                                        {selectedProposalMeta?.difficulty && (
                                            <>
                                                <span className="opacity-40">·</span>
                                                <DifficultyBadge difficulty={selectedProposalMeta.difficulty} />
                                            </>
                                        )}
                                    </div>
                                </div>

                                <div className="flex gap-2 border-b border-(--accent)/20 pb-2">
                                    <button
                                        onClick={() => setShowTests(false)}
                                        className={`text-xs font-bold px-3 py-1.5 rounded-full border-2 transition-all ${!showTests ? 'bg-(--accent)/25 border-(--accent) text-(--text-h)' : 'bg-transparent border-(--accent)/50 text-(--text) hover:bg-(--accent)/15'}`}
                                    >
                                        {lang === 'RO' ? 'Detalii' : 'Details'}
                                    </button>
                                    <button
                                        onClick={() => setShowTests(true)}
                                        className={`text-xs font-bold px-3 py-1.5 rounded-full border-2 transition-all ${showTests ? 'bg-(--accent)/25 border-(--accent) text-(--text-h)' : 'bg-transparent border-(--accent)/50 text-(--text) hover:bg-(--accent)/15'}`}
                                    >
                                        {lang === 'RO' ? 'Teste' : 'Tests'}
                                    </button>
                                </div>

                                {showTests ? (
                                    <div className="space-y-4">
                                        {isTestsLoading ? (
                                            <p className="text-sm text-(--text-muted)">{lang === 'RO' ? 'Se încarcă testele...' : 'Loading tests...'}</p>
                                        ) : testsData?.subtasks && testsData.subtasks.length > 0 ? (
                                            <div className="space-y-4">
                                                {testsData.subtasks.map((subtask) => (
                                                    <div key={subtask.index} className="rounded-2xl border border-(--accent)/20 bg-black/15 p-3">
                                                        <div className="flex justify-between items-center mb-2">
                                                            <p className="text-xs font-bold text-(--text-h)">Subtask {subtask.index + 1}</p>
                                                            <p className="text-xs font-black text-(--accent)">{subtask.score} pct</p>
                                                        </div>
                                                        <div className="grid grid-cols-5 gap-1">
                                                            {subtask.tests.map((test) => (
                                                                <div key={test.index} className="aspect-square rounded-md bg-(--accent)/10 border border-(--accent)/30 flex items-center justify-center text-[10px] font-bold text-(--text-h)" title={`Test ${test.index + 1}: ${test.score} pct`}>
                                                                    {test.index + 1}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-sm text-(--text-muted)">{lang === 'RO' ? 'Nu există teste generate pentru această propunere.' : 'No tests generated for this proposal.'}</p>
                                        )}
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {(selectedProposal.time_limit != null || selectedProposal.memory_limit != null) && (
                                            <div className="flex gap-3 text-xs text-(--text-muted) font-semibold">
                                                {selectedProposal.time_limit != null && (
                                                    <span className="flex items-center gap-1">
                                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                                        {selectedProposal.time_limit}s
                                                    </span>
                                                )}
                                                {selectedProposal.memory_limit != null && (
                                                    <span className="flex items-center gap-1">
                                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18" /></svg>
                                                        {selectedProposal.memory_limit} MB
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                        <div className="max-h-96 overflow-y-auto custom-scrollbar text-sm text-(--text) leading-relaxed prose-sm">
                                            <ReactMarkdown
                                                remarkPlugins={[remarkMath, remarkGfm]}
                                                rehypePlugins={[rehypeKatex]}
                                            >
                                                {unpackTranslation(selectedProposal.statement ?? selectedProposal.description, lang)}
                                            </ReactMarkdown>
                                        </div>
                                        {selectedProposal.tags && selectedProposal.tags.length > 0 && (
                                            <div className="flex flex-wrap gap-2">
                                                {selectedProposal.tags.map((tag) => (
                                                    <span key={tag} className="rounded-full border border-(--accent)/30 bg-(--accent)/10 px-2.5 py-1 text-[10px] font-bold text-(--text-h)">{tag}</span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}

                                <div className="flex flex-wrap items-center justify-end gap-2 pt-4 border-t border-(--accent)/20">
                                    <button
                                        onClick={() => handleDeleteProposal(selectedProposal.id)}
                                        className="px-4 py-2 rounded-full border-2 border-red-900/40 bg-red-900/10 text-red-400 text-xs font-bold hover:bg-red-900/20 transition-all active:scale-95 mr-auto"
                                    >
                                        {lang === 'RO' ? 'Șterge' : 'Delete'}
                                    </button>
                                    {selectedProposal.zipDownloadLink && selectedProposal.status === 'ACCEPTED' && (
                                        <a
                                            href={selectedProposal.zipDownloadLink}
                                            download
                                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border-2 border-(--accent)/40 bg-(--accent)/10 text-(--text-h) text-xs font-bold hover:bg-(--accent)/20 transition-all active:scale-95"
                                        >
                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                                            ZIP
                                        </a>
                                    )}
                                    <button
                                        onClick={() => handleReviewProposal(selectedProposal.id, 'reject')}
                                        className="px-4 py-2 rounded-full border-2 border-red-500/40 bg-red-500/10 text-red-500 text-xs font-bold hover:bg-red-500/20 transition-all active:scale-95"
                                    >
                                        {lang === 'RO' ? 'Respinge' : 'Reject'}
                                    </button>
                                    <button
                                        onClick={() => handleReviewProposal(selectedProposal.id, 'approve')}
                                        className="px-4 py-2 rounded-full border-2 border-green-500/40 bg-green-500/10 text-green-500 text-xs font-bold hover:bg-green-500/20 transition-all active:scale-95"
                                    >
                                        {lang === 'RO' ? 'Aprobă' : 'Approve'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </motion.div>
                </motion.div>
            )}

            {subTab === 'accepted' && (
                <motion.div key="accepted" variants={containerVariants} className="space-y-3">
                    <motion.div
                        variants={itemVariants}
                        className="flex items-center justify-between text-sm text-(--text-muted) font-semibold"
                    >
                        <span>{lang === 'RO' ? 'Probleme acceptate (publice)' : 'Accepted problems (public)'}</span>
                        <span>{isAcceptedLoading ? '...' : acceptedProblems.length}</span>
                    </motion.div>

                    {isAcceptedLoading && (
                        <motion.p variants={itemVariants} className="text-(--text-muted) text-sm">
                            {lang === 'RO' ? 'Se încarcă...' : 'Loading...'}
                        </motion.p>
                    )}

                    {!isAcceptedLoading && acceptedProblems.length === 0 && (
                        <motion.p variants={itemVariants} className="text-(--text-muted) text-sm">
                            {lang === 'RO' ? 'Nu există probleme acceptate.' : 'No accepted problems.'}
                        </motion.p>
                    )}

                    {acceptedProblems.map((problem) => (
                        <motion.div
                            variants={itemVariants}
                            key={problem.title}
                            className="p-4 rounded-2xl border border-(--accent)/20 bg-(--surface-muted) flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
                        >
                            <div className="min-w-0">
                                <div className="flex items-center gap-2 flex-wrap mb-1">
                                    <h3 className="text-base font-bold text-(--text-h) truncate">{problem.title}</h3>
                                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                                        problem.problemVisibility === 'PUBLIC'
                                            ? 'border-green-500/40 bg-green-500/15 text-green-400'
                                            : 'border-(--accent)/40 bg-(--accent)/10 text-(--text-muted)'
                                    }`}>
                                        {problem.problemVisibility === 'PUBLIC'
                                            ? (lang === 'RO' ? 'Public' : 'Public')
                                            : (lang === 'RO' ? 'Privat' : 'Private')}
                                    </span>
                                    {problem.difficulty && (
                                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border border-(--accent)/30 bg-(--accent)/10 text-(--text-muted)">
                                            {problem.difficulty}
                                        </span>
                                    )}
                                </div>
                                {problem.tags.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mt-1">
                                        {problem.tags.map((tag) => (
                                            <span key={tag} className="px-2 py-0.5 rounded-full text-[10px] border border-(--accent)/20 bg-(--accent)/5 text-(--text-muted)">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                                <button
                                    onClick={() => handleChangeVisibility(
                                        problem.title,
                                        problem.problemVisibility === 'PUBLIC' ? 'PRIVATE' : 'PUBLIC'
                                    )}
                                    className="px-3 py-1.5 rounded-xl text-xs font-bold border-2 border-(--accent)/50 bg-(--accent)/10 text-(--text-h) hover:bg-(--accent)/20 transition-all active:scale-95"
                                >
                                    {problem.problemVisibility === 'PUBLIC'
                                        ? (lang === 'RO' ? 'Fă privat' : 'Make private')
                                        : (lang === 'RO' ? 'Fă public' : 'Make public')}
                                </button>
                                <button
                                    onClick={() => handleDeleteAccepted(problem.title)}
                                    className="px-3 py-1.5 rounded-xl text-xs font-bold border-2 border-red-900/40 bg-red-900/10 text-red-400 hover:bg-red-900/20 transition-all active:scale-95"
                                >
                                    {lang === 'RO' ? 'Șterge' : 'Delete'}
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            )}
        </motion.div>
    );
}

const DIFFICULTY_STYLES: Record<string, string> = {
    EASY:    'border-green-500/40 bg-green-500/15 text-green-400',
    MEDIUM:  'border-amber-400/40 bg-amber-400/15 text-amber-400',
    HARD:    'border-red-500/40 bg-red-500/15 text-red-400',
    CONTEST: 'border-purple-500/40 bg-purple-500/15 text-purple-400',
};

function DifficultyBadge({ difficulty }: { difficulty: string }) {
    const key = difficulty.toUpperCase();
    const cls = DIFFICULTY_STYLES[key] ?? 'border-(--accent)/30 bg-(--accent)/10 text-(--text-muted)';
    return (
        <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase ${cls}`}>
            {difficulty}
        </span>
    );
}

function formatDate(iso: string): string {
    try {
        return new Date(iso).toLocaleDateString('ro-RO', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch {
        return iso;
    }
}
