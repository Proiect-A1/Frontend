import { motion } from 'framer-motion';
import { containerVariants, itemVariants } from '../../../utils/motionConfig';
import { useLanguage } from '../../../language/Language';
import type { ProblemProposal, ProblemProposalDetail } from '../services/adminService';

type Props = {
    proposals: ProblemProposal[];
    selectedProposal: ProblemProposalDetail | null;
    selectedProposalId: string | null;
    setSelectedProposalId: (id: string | null) => void;
    handleReviewProposal: (id: string, action: 'approve' | 'reject') => void;
};

export default function ProposalsTab({
    proposals,
    selectedProposal,
    selectedProposalId,
    setSelectedProposalId,
    handleReviewProposal
}: Props) {
    const { lang } = useLanguage();

    return (
        <motion.div
            variants={containerVariants}
            className="space-y-6"
        >
            <motion.div variants={itemVariants} className="mb-6">
                <h2 className="text-2xl font-bold text-(--text-h)">
                    {lang === 'RO' ? 'Gestionare Propuneri' : 'Proposal Management'}
                </h2>
            </motion.div>

            <motion.div
                variants={containerVariants}
                className="grid gap-4 xl:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]"
            >
                <motion.div variants={containerVariants} className="space-y-3">
                    <motion.div
                        variants={itemVariants}
                        className="flex items-center justify-between text-xs uppercase tracking-widest text-(--text-muted) font-bold"
                    >
                        <span>
                            {lang === 'RO' ? 'Propuneri în așteptare' : 'Pending proposals'}
                        </span>
                        <span>{proposals.length}</span>
                    </motion.div>

                    <motion.div variants={containerVariants} className="grid gap-3">
                        {proposals.length === 0 && (
                            <motion.p variants={itemVariants} className="text-(--text-muted) text-sm">
                                {lang === 'RO'
                                    ? 'Nu există propuneri în așteptare.'
                                    : 'There are no pending proposals.'}
                            </motion.p>
                        )}

                        {proposals.map((proposal) => {
                            const isSelected = selectedProposalId === proposal.id;

                            return (
                                <motion.button
                                    variants={itemVariants}
                                    key={proposal.id}
                                    onClick={() => setSelectedProposalId(proposal.id)}
                                    className={`text-left p-4 rounded-2xl border transition-colors duration-200 ${
                                        isSelected
                                            ? 'border-(--accent) bg-(--accent)/15'
                                            : 'border-(--accent)/20 bg-(--surface-muted) hover:border-(--accent)/40 hover:bg-(--accent)/10'
                                    }`}
                                >
                                    <div className="flex items-start justify-between gap-3 mb-2">
                                        <h3 className="text-lg font-bold text-(--text-h) line-clamp-1">
                                            {proposal.title}
                                        </h3>
                                        <span className="text-[10px] uppercase tracking-widest text-(--text-muted) font-bold whitespace-nowrap">
                                            {proposal.createdAt}
                                        </span>
                                    </div>
                                    <p className="text-sm text-(--text) line-clamp-2 mb-3">
                                        {proposal.description}
                                    </p>
                                    <div className="flex items-center justify-between text-xs text-(--text-muted) font-semibold">
                                        <span>
                                            {lang === 'RO' ? 'Propus de' : 'By'}:{' '}
                                            <span className="text-(--text)">{proposal.authorUsername}</span>
                                        </span>
                                        <span className="rounded-full border border-amber-400/60 bg-amber-400/20 px-2.5 py-1 text-amber-400 uppercase tracking-widest">
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
                    className="p-5 rounded-2xl border border-(--accent)/20 bg-(--surface-muted)"
                >
                    {!selectedProposal && selectedProposalId && (
                        <p className="text-(--text-muted) text-sm">
                            {lang === 'RO'
                                ? 'Se încarcă detaliile propunerii...'
                                : 'Loading proposal details...'}
                        </p>
                    )}

                    {!selectedProposal && !selectedProposalId && (
                        <p className="text-(--text-muted) text-sm">
                            {lang === 'RO'
                                ? 'Selectează o propunere pentru a vedea detaliile.'
                                : 'Select a proposal to see the details.'}
                        </p>
                    )}

                    {selectedProposal && (
                        <div className="space-y-4">
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <h3 className="text-2xl font-bold text-(--text-h)">
                                        {selectedProposal.title}
                                    </h3>
                                    <p className="text-sm text-(--text-muted) mt-1">
                                        {lang === 'RO' ? 'Propus de' : 'Author'}{' '}
                                        <span className="text-(--text-h)">{selectedProposal.authorUsername}</span>
                                    </p>
                                </div>
                                <span className="rounded-full border border-amber-400/40 bg-amber-400/20 px-3 py-1 text-xs font-bold uppercase tracking-widest text-amber-400 whitespace-nowrap">
                                    {selectedProposal.status}
                                </span>
                            </div>

                            <p className="text-sm text-(--text) leading-relaxed">
                                {selectedProposal.statement ?? selectedProposal.description}
                            </p>

                            <div className="grid gap-3 sm:grid-cols-2">
                                <div className="rounded-2xl border border-(--accent)/20 bg-black/15 p-3">
                                    <p className="text-[10px] uppercase tracking-widest text-(--text-muted) font-bold mb-2">
                                        Input
                                    </p>
                                    <p className="text-sm text-(--text) whitespace-pre-wrap">
                                        {selectedProposal.inputDescription ?? '-'}
                                    </p>
                                </div>
                                <div className="rounded-2xl border border-(--accent)/20 bg-black/15 p-3">
                                    <p className="text-[10px] uppercase tracking-widest text-(--text-muted) font-bold mb-2">
                                        Output
                                    </p>
                                    <p className="text-sm text-(--text) whitespace-pre-wrap">
                                        {selectedProposal.outputDescription ?? '-'}
                                    </p>
                                </div>
                            </div>

                            {selectedProposal.constraints && selectedProposal.constraints.length > 0 && (
                                <div className="rounded-2xl border border-(--accent)/20 bg-black/15 p-3">
                                    <p className="text-[10px] uppercase tracking-widest text-(--text-muted) font-bold mb-2">
                                        {lang === 'RO' ? 'Restricții' : 'Constraints'}
                                    </p>
                                    <ul className="space-y-1 text-sm text-(--text)">
                                        {selectedProposal.constraints.map((constraint) => (
                                            <li key={constraint}>• {constraint}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            <div className="grid gap-3 sm:grid-cols-2">
                                <div className="rounded-2xl border border-(--accent)/20 bg-black/15 p-3">
                                    <p className="text-[10px] uppercase tracking-widest text-(--text-muted) font-bold mb-2">
                                        Sample Input
                                    </p>
                                    <pre className="text-xs text-(--text) whitespace-pre-wrap font-mono">
                                        {selectedProposal.sampleInput ?? '-'}
                                    </pre>
                                </div>
                                <div className="rounded-2xl border border-(--accent)/20 bg-black/15 p-3">
                                    <p className="text-[10px] uppercase tracking-widest text-(--text-muted) font-bold mb-2">
                                        Sample Output
                                    </p>
                                    <pre className="text-xs text-(--text) whitespace-pre-wrap font-mono">
                                        {selectedProposal.sampleOutput ?? '-'}
                                    </pre>
                                </div>
                            </div>

                            {selectedProposal.tags && selectedProposal.tags.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                    {selectedProposal.tags.map((tag) => (
                                        <span
                                            key={tag}
                                            className="rounded-full border border-(--accent)/30 bg-(--accent)/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-(--text-h)"
                                        >
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            )}

                            <div className="flex flex-wrap items-center justify-end gap-2 pt-2 border-t border-(--accent)/20">
                                <button
                                    onClick={() => handleReviewProposal(selectedProposal.id, 'reject')}
                                    className="px-4 py-2 rounded-full border border-red-500/40 bg-red-500/10 text-red-500 text-xs font-bold hover:bg-red-500/20 transition-colors"
                                >
                                    {lang === 'RO' ? 'Respinge' : 'Reject'}
                                </button>
                                <button
                                    onClick={() => handleReviewProposal(selectedProposal.id, 'approve')}
                                    className="px-4 py-2 rounded-full bg-green-500 text-white text-xs font-bold hover:bg-green-600 transition-colors"
                                >
                                    {lang === 'RO' ? 'Aprobă' : 'Approve'}
                                </button>
                            </div>
                        </div>
                    )}
                </motion.div>
            </motion.div>
        </motion.div>
    );
}
