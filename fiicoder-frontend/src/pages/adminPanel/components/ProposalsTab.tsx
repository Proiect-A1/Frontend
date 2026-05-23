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
                            className="flex items-center justify-between text-sm text-(--text-muted) font-semibold"
                        >
                            <span>{lang === 'RO' ? 'Propuneri în așteptare' : 'Pending proposals'}</span>
                            <span>{proposals.length}</span>
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
                                            <span className="text-xs text-(--text-muted) font-semibold whitespace-nowrap">{proposal.createdAt}</span>
                                        </div>
                                        <p className="text-sm text-(--text) line-clamp-2 mb-3">
                                            {unpackTranslation(proposal.description, lang)}
                                        </p>
                                        <div className="flex items-center justify-between text-xs text-(--text-muted) font-semibold">
                                            <span>
                                                {lang === 'RO' ? 'Propus de' : 'By'}:{' '}
                                                <span className="text-(--text)">{proposal.authorUsername}</span>
                                            </span>
                                            <span className="rounded-full border border-amber-400/60 bg-amber-400/20 px-2.5 py-1 text-amber-500 font-bold">
                                                {proposal.status}
                                            </span>
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
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <h3 className="text-2xl font-bold text-(--text-h)">{selectedProposal.title}</h3>
                                        <p className="text-sm text-(--text-muted) mt-1">
                                            {lang === 'RO' ? 'Propus de' : 'Author'}{' '}
                                            <span className="text-(--text-h) font-bold">{selectedProposal.authorUsername}</span>
                                        </p>
                                    </div>
                                    <span className="rounded-full border border-amber-400/40 bg-amber-400/20 px-3 py-1 text-xs font-bold text-amber-500 whitespace-nowrap">
                                        {selectedProposal.status}
                                    </span>
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
                                        {(selectedProposal.timeLimit != null || selectedProposal.memoryLimit != null) && (
                                            <div className="flex gap-3 text-xs text-(--text-muted) font-semibold">
                                                {selectedProposal.timeLimit != null && (
                                                    <span>⏱ {selectedProposal.timeLimit}s</span>
                                                )}
                                                {selectedProposal.memoryLimit != null && (
                                                    <span>💾 {selectedProposal.memoryLimit} MB</span>
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
