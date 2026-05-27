import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { itemVariants } from '../../../utils/motionConfig';
import { studentHomeworkService } from '../services/studentHomeworkService';
import type { HomeworkResponseDTO } from '../../classDetails/types/homework';

type Props = {
    lang: 'RO' | 'EN';
};

function statusColor(status: HomeworkResponseDTO['status']) {
    switch (status) {
        case 'ACTIVE': return 'text-emerald-400 border-emerald-400/40 bg-emerald-500/10';
        case 'CLOSED': return 'text-(--text-muted) border-(--accent)/20 bg-(--accent)/5';
        case 'DRAFT':  return 'text-amber-400 border-amber-400/40 bg-amber-500/10';
    }
}

function HomeworkRow({ hw, lang }: { hw: HomeworkResponseDTO; lang: 'RO' | 'EN' }) {
    const [open, setOpen] = useState(false);

    const detailsQuery = useQuery({
        queryKey: ['student-hw-detail', hw.id],
        enabled: open,
        queryFn: () => studentHomeworkService.getHomeworkDetails(hw.id),
    });

    const progressQuery = useQuery({
        queryKey: ['student-hw-progress', hw.id],
        enabled: open,
        queryFn: () => studentHomeworkService.getMyProgress(hw.id),
    });

    const details = detailsQuery.data;
    const progress = progressQuery.data;

    return (
        <div className="rounded-2xl border border-(--accent)/15 bg-(--surface-muted) overflow-hidden">
            <button
                onClick={() => setOpen(o => !o)}
                className="w-full flex items-center justify-between gap-4 p-4 text-left hover:bg-(--accent)/5 transition-colors"
            >
                <div className="min-w-0">
                    <p className="font-bold text-(--text-h) truncate">{hw.title}</p>
                    <p className="text-[11px] text-(--text-muted) mt-0.5">
                        {lang === 'RO' ? 'Termen:' : 'Deadline:'}{' '}
                        {new Date(hw.deadline).toLocaleDateString()}
                    </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border uppercase tracking-wider font-bold ${statusColor(hw.status)}`}>
                        {hw.status}
                    </span>
                    <svg
                        className={`w-4 h-4 text-(--text-muted) transition-transform ${open ? 'rotate-180' : ''}`}
                        fill="none" stroke="currentColor" viewBox="0 0 24 24"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                </div>
            </button>

            {open && (
                <div className="px-4 pb-4 border-t border-(--accent)/10 pt-3 space-y-3">
                    {(detailsQuery.isPending || progressQuery.isPending) && (
                        <p className="text-xs text-(--text-muted)">{lang === 'RO' ? 'Se încarcă...' : 'Loading...'}</p>
                    )}

                    {progress && (() => {
                        const isCompleted = progress.totalProblems > 0 && progress.solvedProblems >= progress.totalProblems;
                        const isOverdue = new Date(hw.deadline).getTime() < Date.now();
                        const pct = progress.progressPercentage;
                        const barColor = isCompleted
                            ? 'bg-emerald-400'
                            : isOverdue
                            ? 'bg-red-400'
                            : 'bg-(--accent)';
                        return (
                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-(--text-muted)">
                                        {lang === 'RO' ? 'Progres' : 'Progress'}{' '}
                                        <span className="font-bold text-(--text-h)">
                                            {progress.solvedProblems}/{progress.totalProblems}
                                        </span>
                                    </span>
                                    <div className="flex items-center gap-2">
                                        {isCompleted && (
                                            <span className="text-emerald-400 font-bold text-[10px]">
                                                ✓ {lang === 'RO' ? 'Finalizat' : 'Completed'}
                                            </span>
                                        )}
                                        {isOverdue && !isCompleted && (
                                            <span className="text-red-400 font-bold text-[10px]">
                                                ⚠ {lang === 'RO' ? 'Depășit' : 'Overdue'}
                                            </span>
                                        )}
                                        <span className="font-bold text-(--text-h)">{pct.toFixed(0)}%</span>
                                    </div>
                                </div>
                                <div className="w-full h-2 rounded-full bg-(--accent)/10">
                                    <div
                                        className={`h-2 rounded-full transition-all duration-500 ${barColor}`}
                                        style={{ width: `${pct}%` }}
                                    />
                                </div>
                            </div>
                        );
                    })()}

                    {details && details.problems.length > 0 && (
                        <div className="flex flex-col gap-1.5">
                            {details.problems.map((p) => {
                                const pTitle = p.problemTitle ?? p.title;
                                const pProgress = progress?.problems.find(pp => pp.title === pTitle);
                                const hasScore = pProgress?.bestScore != null;
                                return (
                                    <div key={p.id} className="flex items-center justify-between text-xs px-1">
                                        <Link
                                            to={`/problems/${encodeURIComponent(pTitle ?? p.id)}`}
                                            className="text-(--accent) hover:underline truncate max-w-[60%]"
                                        >
                                            {pTitle ?? p.id}
                                        </Link>
                                        {hasScore ? (
                                            <span className={`font-mono font-bold ${pProgress!.bestScore! >= 100 ? 'text-emerald-400' : 'text-(--text-muted)'}`}>
                                                {pProgress!.bestScore!.toFixed(0)} pts
                                            </span>
                                        ) : (
                                            <span className="text-(--text-muted)">-</span>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default function ProfileHomeworkPanel({ lang }: Props) {
    const homeworksQuery = useQuery({
        queryKey: ['student-homeworks'],
        queryFn: () => studentHomeworkService.getMyHomeworks(),
    });

    const homeworks = homeworksQuery.data ?? [];

    return (
        <motion.div
            variants={itemVariants}
            className="p-6 rounded-2xl border border-(--accent)/50 bg-(--surface-muted) card-glow min-w-0"
        >
            <h2 className="text-sm font-bold text-(--text-h) mb-4 uppercase tracking-wider">
                {lang === 'RO' ? 'Temele Mele' : 'My Homework'}
            </h2>

            {homeworksQuery.isPending ? (
                <div className="flex justify-center p-8">
                    <div className="w-8 h-8 border-4 border-(--accent) border-t-transparent rounded-full animate-spin" />
                </div>
            ) : homeworks.length === 0 ? (
                <div className="text-center p-8 rounded-2xl border-2 border-dashed border-(--accent)/20">
                    <p className="text-sm text-(--text-subtle)">
                        {lang === 'RO' ? 'Nu ești asignat la nicio temă.' : 'You have no assigned homework.'}
                    </p>
                </div>
            ) : (
                <div className="flex flex-col gap-3">
                    {homeworks.map(hw => <HomeworkRow key={hw.id} hw={hw} lang={lang} />)}
                </div>
            )}
        </motion.div>
    );
}
