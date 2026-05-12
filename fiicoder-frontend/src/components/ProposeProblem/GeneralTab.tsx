import { Controller, useFormContext } from 'react-hook-form';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { ProposeProblemForm } from '../../types/proposeProblem';
import { tagService, type TagResponseDTO } from '../../services/tagService';
import { hoverTransition, itemVariants, staggerConfig } from '../../utils/motionConfig';

const difficulties = ['easy', 'medium', 'hard', 'contest'] as const;

const difficultyLabels: Record<string, string> = {
    easy: 'Ușoară',
    medium: 'Medie',
    hard: 'Grea',
    contest: 'Concurs',
};

export default function GeneralTab() {
    const { control, watch, setValue } = useFormContext<ProposeProblemForm>();
    const formData = watch();

    // Difficulty dropdown state
    const [isDifficultyOpen, setIsDifficultyOpen] = useState(false);
    const [isVisibilityOpen, setIsVisibilityOpen] = useState(false);

    // Tag autocomplete state
    const [availableTags, setAvailableTags] = useState<TagResponseDTO[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [suggestions, setSuggestions] = useState<TagResponseDTO[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const inputRef = useRef<HTMLInputElement>(null);
    const suggestionsRef = useRef<HTMLDivElement>(null);

    // Fetch tags on mount
    useEffect(() => {
        tagService.getAllTags().then(setAvailableTags).catch(console.error);
    }, []);

    // Filter suggestions based on input
    useEffect(() => {
        if (inputValue.trim()) {
            const filtered = availableTags.filter(
                (tag) =>
                    tag.title.toLowerCase().includes(inputValue.toLowerCase()) &&
                    !formData.tags.includes(tag.title),
            );
            setSuggestions(filtered.slice(0, 5)); // Max 5 suggestions
            setShowSuggestions(filtered.length > 0);
        } else {
            setSuggestions([]);
            setShowSuggestions(false);
        }
        setSelectedIndex(-1);
    }, [inputValue, availableTags, formData.tags]);

    // Click outside to close suggestions
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (
                suggestionsRef.current &&
                !suggestionsRef.current.contains(e.target as Node) &&
                !inputRef.current?.contains(e.target as Node)
            ) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const addTag = (tag: string) => {
        const trimmedTag = tag.trim();
        // Doar tag-uri existente în baza de date
        const tagExists = availableTags.some(
            (t) => t.title.toLowerCase() === trimmedTag.toLowerCase(),
        );
        if (trimmedTag && tagExists && !formData.tags.includes(trimmedTag)) {
            setValue('tags', [...formData.tags, trimmedTag]);
        }
        setInputValue('');
        setShowSuggestions(false);
        inputRef.current?.focus();
    };

    const removeTag = (tagToRemove: string) => {
        setValue(
            'tags',
            formData.tags.filter((t) => t !== tagToRemove),
        );
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : prev));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (selectedIndex >= 0 && suggestions[selectedIndex]) {
                addTag(suggestions[selectedIndex].title);
            }
            // Dacă nu e selectată o sugestie validă, nu facem nimic (nu adăugăm tag-uri noi)
        } else if (e.key === 'Escape') {
            setShowSuggestions(false);
        } else if (e.key === 'Backspace' && !inputValue && formData.tags.length > 0) {
            removeTag(formData.tags[formData.tags.length - 1]);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInputValue(e.target.value);
    };

    const handleInputFocus = () => {
        if (inputValue.trim() && suggestions.length > 0) {
            setShowSuggestions(true);
        }
    };

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: staggerConfig } }}
            className="space-y-6"
        >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Title */}
                <motion.div variants={itemVariants} className="space-y-2">
                    <label className="text-(--text) font-semibold text-sm">Titlu Problemei</label>
                    <Controller
                        name="title"
                        control={control}
                        rules={{ required: 'Titlul este obligatoriu' }}
                        render={({ field, fieldState: { error } }) => (
                            <div>
                                <input
                                    {...field}
                                    placeholder="ex: Two Sum, Fibonacci, DP Matrix"
                                    className="w-full flex items-center justify-between rounded-2xl border border-(--accent)/30 bg-(--surface-input) px-3 py-2 text-sm text-(--text) outline-none transition hover:border-(--accent)"
                                />
                                {error && (
                                    <p className="text-red-400 text-xs mt-1">{error.message}</p>
                                )}
                            </div>
                        )}
                    />
                </motion.div>

                {/* Difficulty */}
                <motion.div variants={itemVariants} className="space-y-2">
                    <label className="text-(--text) font-semibold text-sm">
                        Nivel de Dificultate
                    </label>
                    <div className="relative w-full">
                        <button
                            type="button"
                            onClick={() => setIsDifficultyOpen(!isDifficultyOpen)}
                            className="w-full flex items-center justify-between rounded-2xl border border-(--accent)/30 bg-(--surface-input) px-3 py-2 text-sm text-(--text) outline-none transition hover:border-(--accent)"
                        >
                            <span>
                                {formData.difficulty
                                    ? difficultyLabels[formData.difficulty]
                                    : 'Alege dificultate'}
                            </span>
                            <motion.span animate={{ rotate: isDifficultyOpen ? 180 : 0 }}>
                                ▼
                            </motion.span>
                        </button>

                        <AnimatePresence>
                            {isDifficultyOpen && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.12 }}
                                    className="absolute z-50 mt-1 w-full bg-(--surface-dropdown) border border-(--accent)/30 rounded-2xl overflow-hidden"
                                >
                                    {difficulties.map((diff) => (
                                        <button
                                            key={diff}
                                            type="button"
                                            onClick={() => {
                                                setValue('difficulty', diff);
                                                setIsDifficultyOpen(false);
                                            }}
                                            className="w-full text-left px-4 py-2 text-sm text-(--text) hover:bg-(--accent)/20 transition-colors"
                                        >
                                            {difficultyLabels[diff]}
                                        </button>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </motion.div>

                {/* Time Limit */}
                <motion.div variants={itemVariants} className="space-y-2">
                    <label className="text-(--text) font-semibold text-sm">
                        Limită de Timp (s)
                    </label>
                    <Controller
                        name="timeLimit"
                        control={control}
                        render={({ field }) => (
                            <input
                                {...field}
                                type="number"
                                min="0.1"
                                step="0.1"
                                placeholder="1.0"
                                className="w-full flex items-center justify-between rounded-2xl border border-(--accent)/30 bg-(--surface-input) px-3 py-2 text-sm text-(--text) outline-none transition hover:border-(--accent)"
                                onChange={(e) => field.onChange(parseFloat(e.target.value))}
                            />
                        )}
                    />
                </motion.div>

                {/* Memory Limit */}
                <motion.div variants={itemVariants} className="space-y-2">
                    <label className="text-(--text) font-semibold text-sm">
                        Limită de Memorie (MB)
                    </label>
                    <Controller
                        name="memoryLimit"
                        control={control}
                        render={({ field }) => (
                            <input
                                {...field}
                                type="number"
                                min="16"
                                step="16"
                                placeholder="256"
                                className="w-full flex items-center justify-between rounded-2xl border border-(--accent)/30 bg-(--surface-input) px-3 py-2 text-sm text-(--text) outline-none transition hover:border-(--accent)"
                                onChange={(e) => field.onChange(parseInt(e.target.value))}
                            />
                        )}
                    />
                </motion.div>
            </div>

            {/* Interactive Problem Toggle */}
            <motion.div variants={itemVariants}>
                <label className="flex items-center gap-2 cursor-pointer group">
                    <Controller
                        name="isInteractive"
                        control={control}
                        render={({ field }) => {
                            const value = !!field.value;
                            const onChange = field.onChange;
                            return (
                                <button
                                    type="button"
                                    role="switch"
                                    aria-checked={value}
                                    aria-label="Toggle problem interactor"
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
                                        className={`inline-block w-5 h-5 rounded-full bg-white shadow-md transform ${
                                            value ? '' : ''
                                        }`}
                                    />
                                </button>
                            );
                        }}
                    />
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
                            Problemă Interactivă
                        </span>
                        <p className="text-xs text-(--text-muted)">
                            Activează dacă problema necesită un interactor (comunicare
                            bidirecțională cu soluția).
                        </p>
                    </div>
                </label>
            </motion.div>

            {/* Tags with Autocomplete */}
            <motion.div variants={itemVariants} className="space-y-2">
                <label className="text-(--text) font-semibold text-sm">Etichete</label>
                <div className="relative">
                    {/* Selected tags display */}
                    <>
                        {formData.tags.map((tag) => (
                            <span
                                key={tag}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-(--accent)/20 text-(--text-h)"
                            >
                                {tag}
                                <button
                                    type="button"
                                    onClick={() => removeTag(tag)}
                                    className="hover:text-red-400 transition-colors"
                                >
                                    ✕
                                </button>
                            </span>
                        ))}
                        <input
                            ref={inputRef}
                            type="text"
                            value={inputValue}
                            onChange={handleInputChange}
                            onKeyDown={handleKeyDown}
                            onFocus={handleInputFocus}
                            placeholder={
                                formData.tags.length === 0 ? 'Scrie pentru a căuta etichete...' : ''
                            }
                            className="w-full rounded-2xl border border-(--accent)/25 bg-(--surface-input) px-3 py-2 text-sm text-(--text) placeholder:text-(--text-muted) outline-none transition hover:border-(--accent)"
                        />
                    </>

                    {/* Suggestions dropdown */}
                    <AnimatePresence>
                        {showSuggestions && (
                            <motion.div
                                ref={suggestionsRef}
                                initial={{ opacity: 0, y: -6 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -6 }}
                                transition={{ duration: 0.12 }}
                                className="absolute z-50 mt-1 w-full bg-(--surface-dropdown) border border-(--accent)/25 rounded-2xl overflow-hidden max-h-48 overflow-y-auto"
                            >
                                {suggestions.map((tag, index) => (
                                    <motion.button
                                        key={tag.id}
                                        type="button"
                                        onClick={() => addTag(tag.title)}
                                        whileHover={{ scale: 1.01, transition: hoverTransition }}
                                        className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                                            index === selectedIndex
                                                ? 'bg-(--accent)/30 text-(--text-h)'
                                                : 'text-(--text) hover:bg-(--accent)/20'
                                        }`}
                                    >
                                        {tag.title}
                                    </motion.button>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
                <p className="text-xs text-(--text-muted)">
                    Selectează din lista de etichete existente.
                </p>
            </motion.div>

            {/* Info Section */}
            <motion.div
                variants={itemVariants}
                className="p-4 bg-(--surface-muted) rounded-2xl border border-(--accent)/25 text-sm text-(--text-muted)"
            >
                <p>
                    <strong>Sfat:</strong> Alege limite care sunt realiste pentru problema ta. Timp
                    prea mic poate frustra utilizatorii.
                </p>
            </motion.div>

            {/* ── Access / Vizibilitate ── */}
            <motion.div variants={itemVariants} className="space-y-4">
                <div className="page-line-horizontal" />
                <h3 className="text-base font-bold text-(--text-h)">Vizibilitate & Acces</h3>

                {/* Visibility Dropdown */}
                <div className="space-y-2">
                    <label className="text-(--text) font-semibold text-sm">Vizibilitate</label>
                    <div className="relative">
                        <button
                            type="button"
                            onClick={() => setIsVisibilityOpen(!isVisibilityOpen)}
                            className="w-full flex items-center justify-between rounded-2xl border border-(--accent)/30 bg-(--surface-input) px-3 py-2 text-sm text-(--text) outline-none transition hover:border-(--accent)"
                        >
                            <span className="flex items-center gap-2">
                                {formData.visibility === 'private' && (
                                    <>
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
                                                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                                            />
                                        </svg>
                                        Privată — Doar tu și moderatorii
                                    </>
                                )}
                                {formData.visibility === 'public' && (
                                    <>
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
                                                d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                            />
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth="2"
                                                d="M3.6 9h16.8M3.6 15h16.8"
                                            />
                                        </svg>
                                        Publică — Vizibilă pentru toți
                                    </>
                                )}
                            </span>
                            <motion.span animate={{ rotate: isVisibilityOpen ? 180 : 0 }}>
                                ▼
                            </motion.span>
                        </button>

                        <AnimatePresence>
                            {isVisibilityOpen && (
                                <motion.div
                                    initial={{ opacity: 0, y: -6 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -6 }}
                                    transition={{ duration: 0.12 }}
                                    className="absolute z-50 mt-1 w-full bg-(--surface-dropdown) border border-(--accent)/25 rounded-2xl shadow-2xl overflow-hidden"
                                >
                                    {[
                                        {
                                            value: 'private' as const,
                                            label: 'Privată — Doar tu și moderatorii',
                                            icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z',
                                        },
                                        {
                                            value: 'public' as const,
                                            label: 'Publică — Vizibilă pentru toți',
                                            icon: 'M21 12a9 9 0 11-18 0 9 9 0 0118 0z M3.6 9h16.8 M3.6 15h16.8',
                                        },
                                    ].map((opt) => (
                                        <button
                                            key={opt.value}
                                            type="button"
                                            onClick={() => {
                                                setValue('visibility', opt.value);
                                                setIsVisibilityOpen(false);
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
                                                    d={opt.icon}
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
                        {formData.visibility === 'private' &&
                            'Salvare directă, fără review de la moderatori.'}
                        {formData.visibility === 'public' &&
                            'Va fi trimisă la review. Moderatorii vor aproba sau respinge propunerea.'}
                    </p>
                </div>

                {/* Allowed Users (unlisted only) */}
                {/* Allowed Users/Groups removed as unlisted is no longer supported */}
            </motion.div>

            {/* Preview */}
            <motion.div
                variants={itemVariants}
                className="p-4 rounded-2xl border border-(--accent)/25 bg-(--surface-muted) space-y-3"
            >
                <h3 className="font-semibold text-(--text)">Previzualizare:</h3>
                <div className="space-y-1 text-sm text-(--text-muted)">
                    <p>
                        <strong>Titlu:</strong> {formData.title || '—'}
                    </p>
                    <p>
                        <strong>Dificultate:</strong> {difficultyLabels[formData.difficulty]}
                    </p>
                    <p>
                        <strong>Timp/Memorie:</strong> {formData.timeLimit}s /{' '}
                        {formData.memoryLimit}MB
                    </p>
                    <p>
                        <strong>Etichete:</strong>{' '}
                        {formData.tags.length > 0 ? formData.tags.join(', ') : '—'}
                    </p>
                    <p>
                        <strong>Vizibilitate:</strong>{' '}
                        <span className="flex items-center gap-1.5">
                            {formData.visibility === 'private' ? (
                                <>
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
                                            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                                        />
                                    </svg>
                                    Privată
                                </>
                            ) : (
                                <>
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
                                            d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                        />
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M3.6 9h16.8M3.6 15h16.8"
                                        />
                                    </svg>
                                    Publică
                                </>
                            )}
                        </span>
                    </p>
                </div>
            </motion.div>
        </motion.div>
    );
}
