import { motion } from 'framer-motion';
import { itemVariants } from '../../../utils/motionConfig';
import type { ProposeProblemForm } from '../types/proposeProblem';

const difficultyLabels: Record<string, string> = {
    easy: 'Ușoară',
    medium: 'Medie',
    hard: 'Grea',
    contest: 'Concurs',
};

interface GeneralPreviewProps {
    data: ProposeProblemForm;
}

export default function GeneralPreview({ data }: GeneralPreviewProps) {
    return (
        <motion.div
            variants={itemVariants}
            className="p-4 rounded-2xl border border-(--accent)/25 bg-(--surface-muted) space-y-3"
        >
            <h3 className="font-semibold text-(--text)">Previzualizare:</h3>
            <div className="space-y-1 text-sm text-(--text-muted)">
                <p>
                    <strong>Titlu:</strong> {data.title || '-'}
                </p>
                <p>
                    <strong>Dificultate:</strong> {difficultyLabels[data.difficulty]}
                </p>
                <p>
                    <strong>Timp/Memorie:</strong> {data.timeLimit}s / {data.memoryLimit}MB
                </p>
                <p>
                    <strong>Etichete:</strong> {data.tags.length > 0 ? data.tags.join(', ') : '-'}
                </p>
                <p className="text-xs text-(--text-subtle) mt-2">
                    Toate propunerile sunt private la trimitere. Vizibilitatea poate fi schimbată din profilul tău după aprobarea de către un admin.
                </p>
            </div>
        </motion.div>
    );
}

