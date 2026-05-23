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
                <p>
                    <strong>Vizibilitate:</strong>
                    <span className="flex items-center gap-1.5 mt-1">
                        <svg
                            className="w-3.5 h-3.5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d={
                                    data.visibility === 'private'
                                        ? 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z'
                                        : 'M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
                                }
                            />
                        </svg>
                        {data.visibility === 'private' ? 'Privată' : 'Publică'}
                    </span>
                </p>
            </div>
        </motion.div>
    );
}

