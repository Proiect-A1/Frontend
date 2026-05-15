import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import type { ProblemProposalResponse } from '../../types/proposeProblem';
import { itemVariants } from '../../utils/motionConfig';

type ProfileProposalsPanelProps = {
    proposals: ProblemProposalResponse[] | null;
    loading: boolean;
    lang: 'RO' | 'EN';
};

export default function ProfileProposalsPanel({ proposals, loading, lang }: ProfileProposalsPanelProps) {
    return (
        <motion.div
            variants={itemVariants}
            className="p-6 rounded-2xl border border-(--accent)/50 bg-(--surface-muted) card-glow min-w-0"
        >
            <h2 className="text-sm font-bold text-(--text-h) mb-4 uppercase tracking-wider">
                {lang === 'RO' ? 'Propunerile Mele' : 'My Proposals'}
            </h2>
            {loading ? (
                <div className="flex justify-center p-8">
                    <div className="w-8 h-8 border-4 border-(--accent) border-t-transparent rounded-full animate-spin" />
                </div>
            ) : !proposals || proposals.length === 0 ? (
                <div className="text-center p-8 rounded-2xl border-2 border-dashed border-(--accent)/20">
                    <p className="text-sm text-(--text-subtle)">
                        {lang === 'RO'
                            ? 'Nu ai trimis nicio propunere încă.'
                            : "You haven't submitted any proposals yet."}
                    </p>
                </div>
            ) : (
                <div className="flex flex-col gap-3">
                    {proposals.map((proposal) => (
                        <Link
                            key={proposal.id}
                            to={`/propose/${proposal.id}`}
                            className="p-4 rounded-2xl border border-(--accent)/15 bg-(--surface-muted) hover:border-(--accent)/40 transition-all flex items-center justify-between group"
                        >
                            <div className="min-w-0">
                                <div className="font-bold text-(--text-h) truncate group-hover:text-(--accent) transition-colors">
                                    {proposal.title}
                                </div>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-[10px] font-mono text-(--text-subtle)">
                                        {new Date(proposal.submittedAt).toLocaleDateString()}
                                    </span>
                                    <span className="w-1 h-1 rounded-full bg-(--accent)/20" />
                                    <span className="text-[10px] uppercase tracking-widest text-(--text-muted) font-bold">
                                        {proposal.visibility}
                                    </span>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <span
                                    style={{
                                        borderColor: `color-mix(in srgb, var(--status-${proposal.status === 'approved' ? 'success' : proposal.status === 'rejected' ? 'error' : 'warning'}) 40%, transparent)`,
                                        color: `var(--status-${proposal.status === 'approved' ? 'success' : proposal.status === 'rejected' ? 'error' : 'warning'})`,
                                        backgroundColor: `color-mix(in srgb, var(--status-${proposal.status === 'approved' ? 'success' : proposal.status === 'rejected' ? 'error' : 'warning'}) 5%, transparent)`
                                    }}
                                    className="text-[10px] px-2 py-0.5 rounded-full border uppercase tracking-wider font-bold"
                                >
                                    {proposal.status}
                                </span>
                                <div className="text-(--accent) opacity-0 group-hover:opacity-100 transition-opacity">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                    </svg>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </motion.div>
    );
}
