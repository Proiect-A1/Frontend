import { motion } from 'framer-motion';
import { useT } from '../../../language/Language';

interface InteractiveToggleProps {
    value: boolean;
    onChange: (value: boolean) => void;
}

export default function InteractiveToggle({ value, onChange }: InteractiveToggleProps) {
    const t = useT();

    return (
        <label className="flex items-center gap-3 cursor-pointer group">
            <button
                type="button"
                role="switch"
                aria-checked={value}
                aria-label={t.proposeInteractiveAriaLabel}
                tabIndex={0}
                onClick={(e) => {
                    e.stopPropagation();
                    onChange(!value);
                }}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        onChange(!value);
                    }
                }}
                className={`relative inline-flex items-center w-12 h-7 rounded-full transition-colors duration-200 shrink-0 ${
                    value ? 'bg-(--accent)' : 'bg-(--surface-input)'
                }`}
            >
                <motion.span
                    animate={{ x: value ? 25 : 3 }}
                    transition={{ type: 'spring', stiffness: 700, damping: 30 }}
                    className="inline-block w-5 h-5 rounded-full bg-white shadow-md"
                />
            </button>
            <div>
                <span className="text-sm font-semibold text-(--text) group-hover:text-(--text-h) transition-colors flex items-center gap-2">
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
                            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                        />
                    </svg>
                    {t.proposeInteractiveLabel}
                </span>
                <p className="text-xs text-(--text-muted)">
                    {t.proposeInteractiveDesc}
                </p>
            </div>
        </label>
    );
}
