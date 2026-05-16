import { motion } from 'framer-motion';
import { containerVariants, itemVariants } from '../../../utils/motionConfig';
import { useLanguage } from '../../../language/Language';
import type { AuditLogEntry } from '../services/adminService';

type Props = {
    auditLog: AuditLogEntry[];
};

export default function AuditLogTab({ auditLog }: Props) {
    const { lang } = useLanguage();

    return (
        <motion.div
            variants={containerVariants}
            className="space-y-6"
        >
            <motion.div variants={itemVariants} className="mb-6">
                <h2 className="text-2xl font-bold text-(--text-h)">
                    {lang === 'RO' ? 'Jurnal Audit' : 'Audit Log'}
                </h2>
            </motion.div>

            <motion.div
                variants={containerVariants}
                className="grid gap-3"
            >
                {auditLog.map((entry) => (
                    <motion.div
                        variants={itemVariants}
                        key={entry.id}
                        className="p-4 rounded-2xl border border-(--accent)/20 bg-(--surface-muted) flex flex-col gap-3 md:flex-row md:items-center md:justify-between"
                    >
                        <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2 mb-2">
                                <span className="rounded-full border border-amber-400/40 bg-amber-500/20 px-3 py-1 text-xs font-bold uppercase tracking-widest text-amber-400">
                                    {entry.action}
                                </span>
                                <span className="text-xs uppercase tracking-widest text-(--text-muted) font-bold">
                                    {entry.createdAt}
                                </span>
                            </div>
                            <p className="text-(--text-h) font-semibold truncate">
                                {entry.targetType}: {entry.targetName}
                            </p>
                            <p className="text-sm text-(--text-muted) mt-1">
                                {entry.details}
                            </p>
                        </div>

                        <div className="text-xs uppercase tracking-widest text-(--text-muted) font-bold">
                            {lang === 'RO' ? 'Utilizator:' : 'User:'}{' '}
                            {entry.actorUsername}
                        </div>
                    </motion.div>
                ))}
            </motion.div>
        </motion.div>
    );
}
