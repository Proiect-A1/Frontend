import { motion, AnimatePresence } from 'framer-motion';
import { getDifficultyLabel, useLanguage, translations } from '../language/Language';
import { useState, useEffect } from 'react';
import type { Difficulty } from '../types/difficulty';
import { tagService, type TagResponseDTO } from '../services/tagService';
import { hoverTransition, itemVariants, staggerConfig } from '../utils/motionConfig';
import { useNavigate } from 'react-router-dom';
import { problemService } from '../services/problemService';

interface FilterSidebarProps {
    difficultyFilter: string;
    setDifficultyFilter: (difficulty: string) => void;
    selectedTags: string[];
    setSelectedTags: (tags: string[]) => void;
    clearFilters: () => void;
    filteredCount: number;
    totalCount: number;
}

export default function FilterSidebar({
    difficultyFilter,
    setDifficultyFilter,
    selectedTags,
    setSelectedTags,
    clearFilters,
    filteredCount,
    totalCount,
}: FilterSidebarProps) {
    const { lang } = useLanguage();
    const t = translations[lang];

    const navigate = useNavigate();

    const [isOpen, setIsOpen] = useState(false);

    // tag-uri din backend
    const [availableTags, setAvailableTags] = useState<TagResponseDTO[]>([]);
    const [tagsLoading, setTagsLoading] = useState(true);

    // search
    const [searchQuery, setSearchQuery] = useState('');
    const [searchError, setSearchError] = useState<string | null>(null);

    useEffect(() => {
        let mounted = true;
        tagService
            .getAllTags()
            .then((tags) => {
                if (mounted) setAvailableTags(tags);
            })
            .catch(() => {
                /* silently ignore */
            })
            .finally(() => {
                if (mounted) setTagsLoading(false);
            });
        return () => {
            mounted = false;
        };
    }, []);

    const toggleTag = (tagTitle: string) => {
        if (selectedTags.includes(tagTitle)) {
            setSelectedTags(selectedTags.filter((t) => t !== tagTitle));
        } else {
            setSelectedTags([...selectedTags, tagTitle]);
        }
    };

    const difficultyOptions = ['ALL', 'EASY', 'MEDIUM', 'HARD', 'CONTEST'];

    const getOptionLabel = (val: string) => {
        if (val === 'ALL') {
            return t.allOption;
        }

        return getDifficultyLabel(lang, val as Difficulty);
    };

    const handleSearchSubmit = async () => {
        const trimmedQuery = searchQuery.trim();
        if (!trimmedQuery) return;

        setSearchError(null);

        try {
            const problem = await problemService.getProblemByTitle(trimmedQuery);
            if (problem?.title) {
                navigate(`/problems/${problem.title}`);
            }
        } catch {
            setSearchError(
                lang === 'RO'
                    ? 'Nicio problemă găsită cu acest titlu.'
                    : 'No problem found with this title.',
            );
        }
    };

    return (
        <motion.aside
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="h-auto overflow-visible xl:h-fit xl:max-h-[calc(100svh-8.5rem)] xl:overflow-y-auto p-5 bg-(--surface-card) border-2 border-(--accent) rounded-3xl xl:sticky xl:top-0 xl:col-start-1 custom-scrollbar"
        >
            <motion.div
                initial="hidden"
                animate="visible"
                variants={{ visible: { transition: staggerConfig } }}
            >
                <motion.h2
                    variants={itemVariants}
                    className="text-m font-bold text-(--text-h) uppercase tracking-widest"
                >
                    {t.filterTitle}
                </motion.h2>
                <div className="page-line-horizontal" />
                <div className="space-y-4">
                    {/* input cautare */}
                    <motion.div variants={itemVariants}>
                        <label
                            htmlFor="problem-search"
                            className="mb-1 block text-sm font-semibold text-(--text-h)"
                        >
                            {t.searchLabel}
                        </label>
                        <input
                            id="problem-search"
                            type="text"
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                setSearchError(null); // reseteza eroare la modificare input
                            }}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSearchSubmit();
                            }}
                            placeholder={lang === 'RO' ? 'ex: Problema 3' : 'ex: Problem 3'}
                            className="w-full rounded-xl border border-(--accent)/30 bg-(--surface-input) px-3 py-2 text-sm text-(--text) placeholder:text-(--text-muted) outline-none transition hover:border-(--accent)"
                        />

                        {/* mesaj eroare inline */}
                        {searchError && (
                            <p className="mt-1 text-xs text-red-400/80">{searchError}</p>
                        )}
                    </motion.div>

                    {/* dropdown dificultate */}
                    <motion.div variants={itemVariants}>
                        <label className="mb-1 block text-sm font-semibold text-(--text-h)">
                            {t.difficultyLabel}
                        </label>
                        <div className="relative w-full">
                            <button
                                type="button"
                                onClick={() => setIsOpen(!isOpen)}
                                className="w-full flex items-center justify-between rounded-xl border border-(--accent)/30 bg-(--surface-input) px-3 py-2 text-sm text-(--text) outline-none transition hover:border-(--accent)"
                            >
                                {getOptionLabel(difficultyFilter)}
                                <motion.span animate={{ rotate: isOpen ? 180 : 0 }}>▼</motion.span>
                            </button>

                            <AnimatePresence>
                                {isOpen && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ duration: 0.12 }}
                                        className="absolute z-50 mt-1 w-full bg-(--surface-dropdown) border border-(--accent)/30 rounded-xl shadow-2xl overflow-hidden"
                                    >
                                        {difficultyOptions.map((option) => (
                                            <button
                                                key={option}
                                                type="button"
                                                onClick={() => {
                                                    setDifficultyFilter(option);
                                                    setIsOpen(false);
                                                }}
                                                className="w-full text-left px-4 py-2 text-sm text-(--text) hover:bg-(--accent)/20 transition-colors"
                                            >
                                                {getOptionLabel(option)}
                                            </button>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </motion.div>

                    {/* tag-uri */}
                    <motion.div variants={itemVariants}>
                        <label className="mb-1 block text-sm font-semibold text-(--text)">
                            {t.tagsLabel}
                        </label>
                        {tagsLoading ? (
                            <div className="flex gap-2">
                                {[1, 2, 3].map((i) => (
                                    <div
                                        key={i}
                                        className="h-7 w-16 rounded-full bg-(--accent)/10 animate-pulse"
                                    />
                                ))}
                            </div>
                        ) : availableTags.length === 0 ? (
                            <p className="text-xs text-(--text-muted)">{t.noTagsAvailable}</p>
                        ) : (
                            <div className="flex flex-wrap gap-2">
                                {availableTags.map((tag) => {
                                    const isSelected = selectedTags.includes(tag.title);
                                    return (
                                        <button
                                            key={tag.id}
                                            type="button"
                                            onClick={() => toggleTag(tag.title)}
                                            className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all duration-200 ${
                                                isSelected
                                                    ? 'bg-(--accent)/30 border-(--accent) text-(--text-h) shadow-[0_0_12px_color-mix(in_srgb,var(--accent)_30%,transparent)]'
                                                    : 'bg-(--accent)/5 border-(--accent)/25 text-(--text-muted) hover:border-(--accent)/60 hover:bg-(--accent)/15'
                                            }`}
                                        >
                                            {isSelected && '✓ '}
                                            {tag.title}
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </motion.div>

                    {/* delete filters */}
                    <motion.button
                        variants={itemVariants}
                        whileHover={{ y: -2, transition: hoverTransition }}
                        type="button"
                        onClick={() => {
                            clearFilters();
                            setSearchQuery('');
                            setSearchError(null);
                            setIsOpen(false);
                        }}
                        className="w-full rounded-xl border border-(--accent)/50 bg-(--accent)/10 px-3 py-2 text-sm font-semibold text-(--text-h) outline-none transition-colors hover:border-(--accent) hover:bg-(--accent)/30 hover:-translate-y-0.5"
                    >
                        {t.clearFilters}
                    </motion.button>

                    {/* counter for search results */}
                    <motion.p variants={itemVariants} className="text-xs text-(--text-muted)">
                        {lang === 'RO'
                            ? `Afișate ${filteredCount} din ${totalCount} probleme`
                            : `Showing ${filteredCount} out of ${totalCount} problems`}
                    </motion.p>
                </div>
            </motion.div>
        </motion.aside>
    );
}
