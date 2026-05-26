import { useMemo, useState, useEffect, useRef } from "react";
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
import ProblemSkeleton from "../../components/ProblemSkeleton";
import { useAuth } from "../../contexts/AuthContext";

export default function ProblemList() {
  const { lang } = useLanguage();
  const t = translations[lang];

  const { isAdmin, isProfessor } = useAuth();
  const canPropose = isAdmin || isProfessor;

  const [searchTerm, setSearchTerm] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState("ALL");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sortOrder, setSortOrder] = useState<"default" | "az" | "za" | "easy" | "hard">("default");

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

  const DIFFICULTY_ORDER: Record<string, number> = { EASY: 0, MEDIUM: 1, HARD: 2, CONTEST: 3 };

  const filteredProblems = useMemo(() => {
    const filtered = problems.filter((problem) => {
      const matchesDifficulty =
        difficultyFilter === "ALL" || problem.difficulty === difficultyFilter;
      const matchesSearch = problem.title
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      return matchesDifficulty && matchesSearch;
    });
    if (sortOrder === "az") return [...filtered].sort((a, b) => a.title.localeCompare(b.title));
    if (sortOrder === "za") return [...filtered].sort((a, b) => b.title.localeCompare(a.title));
    if (sortOrder === "easy") return [...filtered].sort((a, b) => (DIFFICULTY_ORDER[a.difficulty] ?? 9) - (DIFFICULTY_ORDER[b.difficulty] ?? 9));
    if (sortOrder === "hard") return [...filtered].sort((a, b) => (DIFFICULTY_ORDER[b.difficulty] ?? 9) - (DIFFICULTY_ORDER[a.difficulty] ?? 9));
    return filtered;
  }, [difficultyFilter, searchTerm, problems, sortOrder]);

  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoadingMore) {
          problemsQuery.fetchNextPage();
        }
      },
      { rootMargin: '200px' },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, isLoadingMore, problemsQuery]);

  const suggestions = problems.map((p) => p.title);

  const handleTagsChange = (newTags: string[]) => {
    setSelectedTags(newTags);
  };

  const clearFilters = () => {
    setDifficultyFilter("ALL");
    setSelectedTags([]);
    setSearchTerm("");
    setSortOrder("default");
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

            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as typeof sortOrder)}
              className="shrink-0 rounded-xl border border-(--accent)/30 bg-(--surface-input) px-3 py-1.5 text-sm text-(--text) outline-none transition hover:border-(--accent) cursor-pointer"
            >
              <option value="default">{lang === "RO" ? "Implicit" : "Default"}</option>
              <option value="az">A → Z</option>
              <option value="za">Z → A</option>
              <option value="easy">{lang === "RO" ? "Ușor → Greu" : "Easy → Hard"}</option>
              <option value="hard">{lang === "RO" ? "Greu → Ușor" : "Hard → Easy"}</option>
            </select>

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
          {loading && <ProblemSkeleton />}
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
                            className="px-2 py-0.5 rounded-full text-[10px] font-semibold border border-(--accent-secondary)/25 bg-(--accent-secondary)/10 text-(--text-muted)"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </Link>

                  {/* separator */}
                  {index < filteredProblems.length - 1 && (
                    <div className="w-full h-0.5 my-3 rounded-full bg-[color-mix(in_srgb,var(--accent-secondary)_20%,transparent)] shadow-[0_0_5px_color-mix(in_srgb,var(--accent-secondary)_50%,transparent)]" />
                  )}
                </motion.div>
              ))}
            </div>
          )}

          {/* infinite scroll sentinel */}
          <div ref={sentinelRef} className="h-1" />
          {isLoadingMore && (
            <div className="mt-6 mb-4 flex justify-center">
              <div className="w-5 h-5 rounded-full border-2 border-(--accent)/30 border-t-(--accent) animate-spin" />
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
