import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import type { ProblemFindResponseDTO } from '../services/problemService';
import { problemService } from '../services/problemService';
import { getDifficultyLabel, useLanguage, translations } from '../language/Language';
import FilterSidebar from '../components/FilterSidebar';
import StatsSidebar from '../components/StatsSidebar';

export default function ProblemList() {
    const { lang } = useLanguage();
    const t = translations[lang];

    const [searchTerm, setSearchTerm] = useState('');
    const [difficultyFilter, setDifficultyFilter] = useState('ALL');
    const [selectedTags, setSelectedTags] = useState<string[]>([]);

    const [problems, setProblems] = useState<ProblemFindResponseDTO[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const ITEMS_PER_PAGE = 15;

    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);

    useEffect(() => {
        let isMounted = true;

        async function fetchProblems() {
            try {
                if (page === 1) {
                    setLoading(true);
                } else {
                    setIsLoadingMore(true);
                }
                setError(null);

                let data;
                if (selectedTags.length > 0) {
                    data = await problemService.searchByTags(selectedTags, page, ITEMS_PER_PAGE);
                } else {
                    data = await problemService.getAllProblems(page, ITEMS_PER_PAGE);
                }

                if (!isMounted) return;

                setHasMore(data.length === ITEMS_PER_PAGE);

                if (page === 1) {
                    setProblems(data);
                } else {
                    setProblems((prev) => [...prev, ...data]);
                }
            } catch (err) {
                if (isMounted) setError('Error loading problems.');
            } finally {
                if (isMounted) {
                    setLoading(false);
                    setIsLoadingMore(false);
                }
            }
        }

        fetchProblems();

        return () => {
            isMounted = false;
        };
    }, [selectedTags, page]);

    const filteredProblems = useMemo(() => {
        return problems.filter(
            (problem) => {
                const matchesDifficulty = difficultyFilter === 'ALL' || problem.difficulty === difficultyFilter;
                const matchesSearch = problem.title.toLowerCase().includes(searchTerm.toLowerCase());
                return matchesDifficulty && matchesSearch;
            }
        );
    }, [difficultyFilter, searchTerm, problems]);

    const handleTagsChange = (newTags: string[]) => {
        setSelectedTags(newTags);
        setPage(1); // resetare paginare la schimbarea tag-urilor
    };

    const clearFilters = () => {
        setDifficultyFilter('ALL');
        setSelectedTags([]);
        setSearchTerm('');
        setPage(1);
    };

    return (
        <div className="w-full grid gap-6 xl:grid-cols-[350px_1fr_350px] h-auto overflow-visible">
            <FilterSidebar
                difficultyFilter={difficultyFilter}
                setDifficultyFilter={setDifficultyFilter}
                selectedTags={selectedTags}
                setSelectedTags={handleTagsChange}
                clearFilters={clearFilters}
                filteredCount={filteredProblems.length}
                totalCount={problems.length}
            />

            <section className="h-auto xl:h-[calc(100svh-8.5rem)] overflow-visible xl:overflow-y-auto p-5 bg-(--surface-card) border-2 border-(--accent) rounded-3xl xl:col-start-2 custom-scrollbar">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                    <h1 className="text-3xl font-bold text-(--text)">{t.problemsTitle}</h1>
                    <div className="relative group flex-1 max-w-sm">
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder={lang === 'RO' ? "Caută problemă..." : "Search problem..."}
                            className="w-full bg-(--surface-muted) border border-(--accent)/30 rounded-2xl px-4 py-2 text-sm text-(--text-h) outline-none focus:border-(--accent) transition-all pl-10"
                        />
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-(--accent)/60">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                    </div>
                </div>
                <div className="page-line-horizontal mb-6" />

                <div className="">
                    {loading && (
                        <p className="text-(--text)">
                            {lang === 'RO' ? 'Se încarcă problemele...' : 'Loading problems...'}
                        </p>
                    )}
                    {error && <p className="text-red-400">{error}</p>}

                    {!loading && !error && filteredProblems.length === 0 && (
                        <p className="text-sm text-(--text-h) bg-(--surface-muted) p-4 rounded-2xl border-2 border-(--accent)/25">
                            {t.noProblemsFound}
                        </p>
                    )}

                    {!loading && filteredProblems.length > 0 && (
                        <div className="w-full">
                            {filteredProblems.map((problem, index) => (
                                <motion.div
                                    key={problem.title}
                                    initial={{ opacity: 0, y: 15 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{
                                        delay: (index % ITEMS_PER_PAGE) * 0.07,
                                        duration: 0.3,
                                    }}
                                >
                                    <Link
                                        to={`/problems/${problem.title}`}
                                        className="block rounded-2xl border border-(--accent)/25 bg-(--surface-muted) p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-(--accent) group cursor-pointer"
                                    >
                                        <div className="flex items-center justify-between gap-3">
                                            <h3 className="text-lg font-semibold text-(--text) underline decoration-2 decoration-(--accent)/60 underline-offset-4 transition group-hover:text-(--text-h) group-hover:decoration-(--accent) group-hover:decoration-3">
                                                {problem.title}
                                            </h3>
                                            <span className="rounded-full border border-(--accent)/40 bg-(--accent)/10 px-2.5 py-1 text-xs font-semibold text-(--text-h)">
                                                {getDifficultyLabel(lang, problem.difficulty)}
                                            </span>
                                        </div>

                                        {problem.tags && problem.tags.length > 0 && (
                                            <div className="mt-3 flex flex-wrap gap-1.5">
                                                {problem.tags.map((tag) => (
                                                    <span
                                                        key={tag}
                                                        className="px-2 py-0.5 rounded-full text-[10px] font-semibold border border-(--accent)/20 bg-(--accent)/5 text-(--text-muted)"
                                                    >
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </Link>

                                    {/* separator */}
                                    {index < filteredProblems.length - 1 && (
                                        <div className="w-full h-0.5 my-3 rounded-full bg-[color-mix(in_srgb,var(--accent)_20%,transparent)] shadow-[0_0_5px_color-mix(in_srgb,var(--accent)_50%,transparent)]" />
                                    )}
                                </motion.div>
                            ))}
                        </div>
                    )}

                    {/* load button */}
                    {!loading && !error && hasMore && filteredProblems.length > 0 && (
                        <div className="mt-8 mb-4 flex justify-center">
                            <button
                                onClick={() => setPage((p) => p + 1)}
                                disabled={isLoadingMore}
                                className="group relative flex items-center gap-2 px-6 py-2.5 rounded-full border-2 border-(--accent)/40 bg-(--accent)/10 text-(--text-h) font-bold text-sm transition-all duration-200 hover:bg-(--accent)/20 hover:border-(--accent) hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0 disabled:cursor-not-allowed"
                            >
                                {isLoadingMore ? (
                                    <>
                                        <div className="w-4 h-4 rounded-full border-2 border-(--text)/30 border-t-(--text) animate-spin" />
                                        {lang === 'RO' ? 'Se încarcă...' : 'Loading...'}
                                    </>
                                ) : (
                                    <>
                                        {lang === 'RO' ? 'Afișează mai multe' : 'Load more'}
                                        <span className="transition-transform group-hover:translate-y-0.5">
                                            ▼
                                        </span>
                                    </>
                                )}
                            </button>
                        </div>
                    )}

                    {!loading && !hasMore && problems.length > 0 && (
                        <div className="mt-8 mb-4 text-center text-xs text-(--text-subtle) uppercase tracking-widest font-bold">
                            {lang === 'RO' ? 'Ai ajuns la finalul listei' : 'End of the list'}
                        </div>
                    )}
                </div>
            </section>
            <StatsSidebar />
        </div>
    );
}
