import { motion } from 'framer-motion';
import { itemVariants } from '../../../utils/motionConfig';
import { useT, getProposeDifficultyLabel, useLanguage } from '../../../language/Language';
import type { ProposeProblemForm } from '../types/proposeProblem';

interface GeneralPreviewProps {
    data: ProposeProblemForm;
}

export default function GeneralPreview({ data }: GeneralPreviewProps) {
    const t = useT();
    const { lang } = useLanguage();

    return (
        <motion.div
            variants={itemVariants}
            className="p-4 rounded-2xl border border-(--accent)/25 bg-(--surface-muted) space-y-3"
        >
            <h3 className="font-semibold text-(--text)">{t.proposePreviewTitle}</h3>
            <div className="space-y-1 text-sm text-(--text-muted)">
                <p>
                    <strong>{t.proposePreviewTitleField}</strong> {data.title || '-'}
                </p>
                <p>
                    <strong>{t.proposePreviewDifficulty}</strong>{' '}
                    {getProposeDifficultyLabel(lang, data.difficulty)}
                </p>
                <p>
                    <strong>{t.proposePreviewLimits}</strong> {data.timeLimit}s / {data.memoryLimit}MB
                </p>
                <p>
                    <strong>{t.proposePreviewTags}</strong>{' '}
                    {data.tags.length > 0 ? data.tags.join(', ') : '-'}
                </p>
                <p className="text-xs text-(--text-subtle) mt-2">
                    {t.proposePreviewVisibilityNote}
                </p>
            </div>
        </motion.div>
    );
}
