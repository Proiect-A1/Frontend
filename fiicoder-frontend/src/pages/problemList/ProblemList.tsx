import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useInfiniteQuery } from "@tanstack/react-query";
import { problemService } from "../../services/problemService";
import {
  getDifficultyLabel,
  useLanguage,
  translations,
} from "../../language/Language";
import FilterSidebar from "./components/FilterSidebar";
import SearchInput from "../../components/SearchInput";
import StatsSidebar from "./components/StatsSidebar";
import { useAuth } from "../../contexts/AuthContext";

export default function ProblemList() {
  const { lang } = useLanguage();
  const t = translations[lang];

  const { isAdmin, isProfessor } = useAuth();
  const canPropose = isAdmin || isProfessor;

  const [searchTerm, setSearchTerm] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState("ALL");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const ITEMS_PER_PAGE = 15;

  const problemsQuery = useInfiniteQuery({
    queryKey: ["problems", selectedTags, ITEMS_PER_PAGE],
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => {
      if (selectedTags.length > 0) {
        return problemService.searchByTags(
          selectedTags,
          pageParam,
          ITEMS_PER_PAGE,
        );
      }
      return problemService.getAllProblems(pageParam, ITEMS_PER_PAGE);
    },
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.length === ITEMS_PER_PAGE
        ? allPages.length + 1
        : undefined;
    },
  });

  const problems = useMemo(
    () => problemsQuery.data?.pages.flat() ?? [],
    [problemsQuery.data],
  );
  const loading = problemsQuery.isPending;
  const error =
    problemsQuery.error instanceof Error ? problemsQuery.error.message : null;
  const hasMore = problemsQuery.hasNextPage ?? false;
  const isLoadingMore = problemsQuery.isFetchingNextPage;

  const filteredProblems = useMemo(() => {
    return problems.filter((problem) => {
      const matchesDifficulty =
        difficultyFilter === "ALL" || problem.difficulty === difficultyFilter;
      const matchesSearch = problem.title
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      return matchesDifficulty && matchesSearch;
    });
  }, [difficultyFilter, searchTerm, problems]);

  const suggestions = problems.map((p) => p.title);

  const handleTagsChange = (newTags: string[]) => {
    setSelectedTags(newTags);
  };

  const clearFilters = () => {
    setDifficultyFilter("ALL");
    setSelectedTags([]);
    setSearchTerm("");
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
                    <h1 className="text-3xl font-bold text-(--text) shrink-0">
            {t.problemsTitle}
          </h1>
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto md:flex-1 md:justify-end">
            {canPropose && (
              <Link
                to="/propose"
                className="px-4 py-1.5 rounded-full border-2 border-(--accent)/50 bg-transparent text-sm font-bold text-(--text) hover:bg-(--accent)/15 hover:text-(--text-h) hover:-translate-y-0.5 transition-all duration-200 text-center whitespace-nowrap shrink-0"
              >
                {lang === "RO" ? "Propune problemă" : "Propose problem"}
              </Link>
            )}

            <div className="relative group w-full max-w-sm">
              <SearchInput
                value={searchTerm}
                onChange={setSearchTerm}
                placeholder={
                  lang === "RO" ? "Caută problemă..." : "Search problem..."
                }
                suggestions={suggestions}
                onSelectSuggestion={(s) => setSearchTerm(s)}
                showIcon
              />
            </div>
          </div>

        </div>
        <div className="page-line-horizontal mb-6" />

        <div className="">
          {loading && (
            <p className="text-(--text)">
              {lang === "RO"
                ? "Se încarcă problemele..."
                : "Loading problems..."}
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
                onClick={() => problemsQuery.fetchNextPage()}
                disabled={isLoadingMore}
                className="group relative flex items-center gap-2 px-6 py-2.5 rounded-full border-2 border-(--accent)/40 bg-(--accent)/10 text-(--text-h) font-bold text-sm transition-all duration-200 hover:bg-(--accent)/20 hover:border-(--accent) hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0 disabled:cursor-not-allowed"
              >
                {isLoadingMore ? (
                  <>
                    <div className="w-4 h-4 rounded-full border-2 border-(--text)/30 border-t-(--text) animate-spin" />
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
            <div className="mt-8 mb-4 text-center text-xs text-(--text-subtle) uppercase tracking-widest font-bold">
              {lang === "RO" ? "Ai ajuns la finalul listei" : "End of the list"}
            </div>
          )}
        </div>
      </section>
      <StatsSidebar />
    </div>
  );
}
