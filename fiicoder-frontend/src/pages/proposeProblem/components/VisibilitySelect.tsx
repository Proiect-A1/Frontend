import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

type Visibility = 'private' | 'public';

interface VisibilitySelectProps {
    value: Visibility;
    onChange: (value: Visibility) => void;
}

const visibilityOptions: Array<{ value: Visibility; label: string }> = [
    { value: 'private', label: 'Privată - Doar tu și moderatorii' },
    { value: 'public', label: 'Publică - Vizibilă pentru toți' },
];

function getVisibilityIcon(visibility: Visibility) {
    return visibility === 'private'
        ? 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z'
        : 'M21 12a9 9 0 11-18 0 9 9 0 0118 0z M3.6 9h16.8 M3.6 15h16.8';
}

export default function VisibilitySelect({ value, onChange }: VisibilitySelectProps) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="space-y-2">
            <label className="text-(--text) font-semibold text-sm">Vizibilitate</label>
            <div className="relative">
                <button
                    type="button"
                    onClick={() => setIsOpen(!isOpen)}
                    className="w-full flex items-center justify-between rounded-2xl border border-(--accent)/30 bg-(--surface-input) px-3 py-2 text-sm text-(--text) outline-none transition hover:border-(--accent)"
                >
                    <span className="flex items-center gap-2">
                        <svg
                            className="w-4 h-4 text-(--accent)"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d={getVisibilityIcon(value)}
                            />
                        </svg>
                        {visibilityOptions.find((opt) => opt.value === value)?.label}
                    </span>
                    <motion.span animate={{ rotate: isOpen ? 180 : 0 }}>▼</motion.span>
                </button>

                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: -6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -6 }}
                            transition={{ duration: 0.12 }}
                            className="absolute z-50 mt-1 w-full bg-(--surface-dropdown) border border-(--accent)/25 rounded-2xl shadow-2xl overflow-hidden"
                        >
                            {visibilityOptions.map((opt) => (
                                <button
                                    key={opt.value}
                                    type="button"
                                    onClick={() => {
                                        onChange(opt.value);
                                        setIsOpen(false);
                                    }}
                                    className="w-full text-left px-4 py-2 text-sm text-(--text) hover:bg-(--accent)/20 transition-colors flex items-center gap-2"
                                >
                                    <svg
                                        className="w-4 h-4 text-(--accent)/60"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d={getVisibilityIcon(opt.value)}
                                        />
                                    </svg>
                                    {opt.label}
                                </button>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
            <p className="text-xs text-(--text-muted)">
                {value === 'private'
                    ? 'Salvare directă, fără review de la moderatori.'
                    : 'Va fi trimisă la review. Moderatorii vor aproba sau respinge propunerea.'}
            </p>
        </div>
    );
}

