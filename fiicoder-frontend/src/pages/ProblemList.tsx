import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import type { Problem } from "../types/problem";
import { problemService } from "../services/problemService";
import {
  getDifficultyLabel,
  useLanguage,
  translations,
} from "../language/Language";
import FilterSidebar from "../components/FilterSidebar";
import StatsSidebar from "../components/StatsSidebar";
import { itemVariants } from "../utils/motionConfig";

export default function ProblemList() {
  const { lang } = useLanguage();
  const t = translations[lang];

  const [searchQuery, setSearchQuery] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState("ALL");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const ITEMS_PER_PAGE = 2;

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
          data = await problemService.searchByTags(
            selectedTags,
            page,
            ITEMS_PER_PAGE,
          );
        } else {
          data = await problemService.getAllProblems(page, ITEMS_PER_PAGE);
        }

        if (!isMounted) return;

        setHasMore(data.length === ITEMS_PER_PAGE);

        // cast la vector de probleme
        const mappedData = data as unknown as Problem[];

        if (page === 1) {
          setProblems(mappedData);
        } else {
          setProblems((prev) => [...prev, ...mappedData]);
        }
      } catch (err) {
        if (isMounted) setError("Error loading problems.");
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
    const normalized = searchQuery.trim().toLowerCase();
    return problems.filter((problem) => {
      const matchesName = problem.title.toLowerCase().includes(normalized);
      const matchesDifficulty =
        difficultyFilter === "ALL" || problem.difficulty === difficultyFilter;
      return matchesName && matchesDifficulty;
    });
  }, [difficultyFilter, problems, searchQuery]);

  const clearFilters = () => {
    setSearchQuery("");
    setDifficultyFilter("ALL");
    setSelectedTags([]);
  };

  return (
    <div className="w-full grid gap-6 xl:grid-cols-[280px_1fr_280px] h-auto overflow-visible">
      <FilterSidebar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        difficultyFilter={difficultyFilter}
        setDifficultyFilter={setDifficultyFilter}
        selectedTags={selectedTags}
        setSelectedTags={setSelectedTags}
        clearFilters={clearFilters}
        filteredCount={filteredProblems.length}
        totalCount={problems.length}
      />

      <section className="h-auto xl:h-[calc(100svh-8.5rem)] overflow-visible xl:overflow-y-auto p-5 theme-surface-card backdrop-blur-lg border-2 border-pink-500/30 rounded-2xl card-glow xl:col-start-2 custom-scrollbar">
        <h1 className="text-3xl font-bold text-pink-200 mb-2">
          {t.problemsTitle}
        </h1>
        <div className="page-line-horizontal" />

        <div className="">
          {loading && (
            <p className="text-pink-200">
              {lang === "RO"
                ? "Se încarcă problemele..."
                : "Loading problems..."}
            </p>
          )}
          {error && <p className="text-red-400">{error}</p>}

          {!loading && !error && filteredProblems.length === 0 && (
            <p className="text-sm text-pink-100/85 theme-surface-muted p-4 rounded-xl border-2 border-pink-500/25">
              {t.noProblemsFound}
            </p>
          )}

          {!loading && filteredProblems.length > 0 && (
            <div className="w-full">
              {filteredProblems.map((problem, index) => (
                <motion.div 
                  key={problem.id} 
                  initial="hidden"
                  animate="visible"
                  variants={itemVariants}
                  transition={{ delay: (index % 20) * 0.07 }}
                >
                  <Link
                    to={`/problems/${problem.id}`}
                    className="block rounded-xl border border-pink-500/25 theme-surface-muted p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-pink-400 group cursor-pointer"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="text-lg font-semibold text-pink-200 underline decoration-2 decoration-pink-500/60 underline-offset-4 transition group-hover:text-pink-100 group-hover:decoration-pink-300 group-hover:decoration-3">
                        {problem.title}
                      </h3>
                      <span className="rounded-full border border-pink-400/40 bg-pink-500/10 px-2.5 py-1 text-xs font-semibold text-pink-100">
                        {getDifficultyLabel(lang, problem.difficulty)}
                      </span>
                    </div>

                    {problem.tags && problem.tags.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {problem.tags.map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-0.5 rounded-full text-[10px] font-semibold border border-pink-500/20 bg-pink-500/5 text-pink-300/80"
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
                className="group relative flex items-center gap-2 px-6 py-2.5 rounded-full border-2 border-pink-400/40 bg-pink-500/10 text-pink-100 font-bold text-sm transition-all duration-200 hover:bg-pink-500/20 hover:border-pink-400 hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0 disabled:cursor-not-allowed"
              >
                {isLoadingMore ? (
                  <>
                    <div className="w-4 h-4 rounded-full border-2 border-pink-200/30 border-t-pink-200 animate-spin" />
                    {lang === "RO" ? "Se încarcă..." : "Loading..."}
                  </>
                ) : (
                  <>
                    {lang === "RO" ? "Afișează mai multe" : "Load more"}
                    <span className="transition-transform group-hover:translate-y-0.5">
                      ▼
                    </span>
                  </>
                )}
              </button>
            </div>
          )}

          {!loading && !hasMore && problems.length > 0 && (
            <div className="mt-8 mb-4 text-center text-xs text-pink-300/50 uppercase tracking-widest font-bold">
              {lang === "RO" ? "Ai ajuns la finalul listei" : "End of the list"}
            </div>
          )}
        </div>
      </section>
      <StatsSidebar />
    </div>
  );
}
