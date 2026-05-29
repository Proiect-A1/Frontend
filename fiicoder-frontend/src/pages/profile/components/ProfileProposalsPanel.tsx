import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import type { ProblemProposalResponse } from '../../proposeProblem/types/proposeProblem';
import { itemVariants } from '../../../utils/motionConfig';
import { translations, getDeleteConfirmMsg } from '../../../language/Language';

type ProfileProposalsPanelProps = {
    proposals: ProblemProposalResponse[] | null;
    loading: boolean;
    lang: 'RO' | 'EN';
    onToggleVisibility?: (title: string, current: 'public' | 'private') => void;
    togglingTitle?: string | null;
    onDelete?: (title: string) => Promise<void>;
};

export default function ProfileProposalsPanel({ proposals, loading, lang, onToggleVisibility, togglingTitle, onDelete }: ProfileProposalsPanelProps) {
    const t = translations[lang as 'RO' | 'EN'];

    return (
        <motion.div
            variants={itemVariants}
            className="p-6 rounded-2xl border border-(--accent)/50 bg-(--surface-muted) card-glow min-w-0"
        >
            <h2 className="text-sm font-bold text-(--text-h) mb-2 uppercase tracking-wider">
                {t.myProposals}
            </h2>
            <div className="mb-4 rounded-2xl border border-(--accent)/30 bg-(--accent)/5 p-3 text-[11px] leading-relaxed text-(--text-muted) space-y-1">
                <p>
                    {lang === 'RO' ? (
                        <>
                            <span className="font-bold text-(--text-h)">Cum funcționează:</span>{' '}
                            <span className="font-bold text-(--text-h)">„Editează"</span> îți permite
                            să modifici o propunere existentă. Dacă schimbi doar metadatele (titlu,
                            enunț, limite, etichete) modificările se aplică imediat. Dacă schimbi
                            fișierele, propunerea trece din nou prin verificarea automată.
                        </>
                    ) : (
                        <>
                            <span className="font-bold text-(--text-h)">How it works:</span>{' '}
                            <span className="font-bold text-(--text-h)">"Edit"</span> lets you change
                            an existing proposal. Metadata-only changes (title, statement, limits,
                            tags) apply instantly. Changing the files sends the proposal back through
                            automated verification.
                        </>
                    )}
                </p>
                <p>
                    {lang === 'RO'
                        ? 'La trimitere se face o verificare automată. Dacă fișierele sunt aranjate greșit, propunerea va fi respinsă automat. După verificare, este nevoie de aprobarea unui admin.'
                        : 'Submission triggers an automated check. If files are arranged incorrectly the proposal is auto-rejected. After the check, an admin still needs to approve it.'}
                </p>
            </div>
            {loading ? (
                <div className="flex justify-center p-8">
                    <div className="w-8 h-8 border-4 border-(--accent) border-t-transparent rounded-full animate-spin" />
                </div>
            ) : !proposals || proposals.length === 0 ? (
                <div className="text-center p-8 rounded-2xl border-2 border-dashed border-(--accent)/20">
                    <p className="text-sm text-(--text-subtle)">
                        {t.proposalNoProposals}
                    </p>
                </div>
            ) : (
                <div className="flex flex-col gap-3">
                    {proposals.map((proposal) => (
                        <div
                            key={proposal.id}
                            className="p-4 rounded-2xl border border-(--accent)/15 bg-(--surface-muted) hover:border-(--accent)/40 transition-all flex flex-col gap-4 md:flex-row md:items-center md:justify-between group"
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

                            <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
                                {(() => {
                                    const statusToken =
                                        proposal.status === 'approved' ? 'success'
                                            : proposal.status === 'rejected' ? 'error'
                                                : proposal.status === 'checked' ? 'info'
                                                    : 'warning';
                                    const label =
                                        proposal.status === 'checked'
                                            ? t.proposalStatusChecked
                                            : proposal.status;
                                    const title =
                                        proposal.status === 'checked'
                                            ? t.proposalCheckedTooltip
                                            : proposal.status;
                                    return (
                                        <span
                                            title={title}
                                            style={{
                                                borderColor: `color-mix(in srgb, var(--status-${statusToken}) 40%, transparent)`,
                                                color: `var(--status-${statusToken})`,
                                                backgroundColor: `color-mix(in srgb, var(--status-${statusToken}) 5%, transparent)`,
                                            }}
                                            className="text-[10px] px-2 py-0.5 rounded-full border uppercase tracking-wider font-bold self-start sm:self-center"
                                        >
                                            {label}
                                        </span>
                                    );
                                })()}
                                <div className="flex flex-wrap gap-2">
                                    {proposal.status === 'approved' && onToggleVisibility && (
                                        <button
                                            onClick={() => onToggleVisibility(proposal.title, proposal.visibility)}
                                            disabled={togglingTitle === proposal.title}
                                            className="px-3 py-1.5 rounded-full border-2 border-(--accent)/40 bg-transparent text-xs font-bold text-(--text-muted) hover:bg-(--accent)/10 hover:text-(--text-h) disabled:opacity-50 transition-colors"
                                        >
                                            {togglingTitle === proposal.title
                                                ? '...'
                                                : proposal.visibility === 'public'
                                                ? t.proposalMakePrivate
                                                : t.proposalMakePublic}
                                        </button>
                                    )}
                                    <Link
                                        to={`/problems/${encodeURIComponent(proposal.title)}`}
                                        className="px-3 py-1.5 rounded-full border-2 border-(--accent)/40 bg-transparent text-xs font-bold text-(--text) hover:bg-(--accent)/15 hover:text-(--text-h) transition-colors"
                                    >
                                        {t.proposalView}
                                    </Link>
                                    <Link
                                        to={`/propose/${encodeURIComponent(proposal.id)}`}
                                        className="px-3 py-1.5 rounded-full border-2 border-(--accent)/40 bg-transparent text-xs font-bold text-(--text) hover:bg-(--accent)/15 hover:text-(--text-h) transition-colors"
                                    >
                                        {t.proposalEdit}
                                    </Link>
                                    {onDelete && (
                                        <button
                                            onClick={() => {
                                                const msg = getDeleteConfirmMsg(lang, proposal.title);
                                                if (window.confirm(msg)) onDelete(proposal.title);
                                            }}
                                            className="px-3 py-1.5 rounded-full border-2 border-red-500/40 bg-red-500/10 text-xs font-bold text-red-500 hover:bg-red-500/20 transition-colors"
                                        >
                                            {t.proposalDelete}
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </motion.div>
    );
}
