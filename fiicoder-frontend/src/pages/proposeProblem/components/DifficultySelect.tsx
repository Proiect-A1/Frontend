import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { useT, getProposeDifficultyLabel, useLanguage } from '../../../language/Language';

type Difficulty = 'easy' | 'medium' | 'hard' | 'contest';

const difficulties: Difficulty[] = ['easy', 'medium', 'hard', 'contest'];

interface DifficultySelectProps {
    value: Difficulty;
    onChange: (value: Difficulty) => void;
}

export default function DifficultySelect({ value, onChange }: DifficultySelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const t = useT();
    const { lang } = useLanguage();

    return (
        <div className="space-y-2">
            <label className="text-(--text) font-semibold text-sm">{t.proposeDifficultyLabel}</label>
            <div className="relative w-full">
                <button
                    type="button"
                    onClick={() => setIsOpen(!isOpen)}
                    className="w-full flex items-center justify-between rounded-2xl border border-(--accent)/30 bg-(--surface-input) px-3 py-2 text-sm text-(--text) outline-none transition hover:border-(--accent)"
                >
                    <span>
                        {value
                            ? getProposeDifficultyLabel(lang, value)
                            : t.proposeDifficultyPlaceholder}
                    </span>
                    <motion.span animate={{ rotate: isOpen ? 180 : 0 }}>▼</motion.span>
                </button>

                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.07 }}
                            className="absolute z-50 mt-1 w-full bg-(--surface-dropdown) border border-(--accent)/30 rounded-2xl overflow-hidden"
                        >
                            {difficulties.map((diff) => (
                                <button
                                    key={diff}
                                    type="button"
                                    onClick={() => {
                                        onChange(diff);
                                        setIsOpen(false);
                                    }}
                                    className="w-full text-left px-4 py-2 text-sm text-(--text) hover:bg-(--accent)/20 transition-colors"
                                >
                                    {getProposeDifficultyLabel(lang, diff)}
                                </button>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
