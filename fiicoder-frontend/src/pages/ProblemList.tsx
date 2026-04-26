import { Fragment, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import type { Difficulty, Problem } from "../types/problem";
import { problemService } from "../services/problemService";
import { getDifficultyLabel, useLanguage, translations } from "../language/Language";
import FilterSidebar from "../components/FilterSidebar";
import StatsSidebar from "../components/StatsSidebar";

export default function ProblemList() {
  const { lang } = useLanguage();
  const t = translations[lang];
  // TEMPORARY need backend filtering (because of pagination) 
  const [searchQuery, setSearchQuery] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState("ALL");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function fetchProblems() {
      try {
        setLoading(true);
        setError(null);

        let data;
        if (selectedTags.length > 0) {
          // foloseste endpoint-ul de filtrare pe tag-uri
          data = await problemService.searchByTags(selectedTags, 1, 100);
        } else {
          data = await problemService.getAllProblems(1, 100);
        }

        if (!isMounted) return;

        // mapez raspunsul la interfata Problem din front
        const formattedProblems: Problem[] = data.map((dto) => ({
          id: dto.title, // pun titlul ca identificator
          title: dto.title,
          shortDescription: dto.description.substring(0, 120) + "...", // extrag o scurta descriere
          statement: dto.description,
          difficulty: (dto.difficulty as Difficulty) || "MEDIUM", // daca nu e specificata dificultatea, o setez pe Medium
          tags: dto.tags || [],
        }));

        setProblems(formattedProblems);
      } catch (err) {
        if (isMounted) setError("Nu s-au putut încărca problemele.");
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchProblems();

    return () => {
      isMounted = false;
    };
  }, [selectedTags]); // re-fetch cand se schimba tag-urile selectate

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
          {loading && <p className="text-pink-200">Se încarcă problemele...</p>}
          {error && <p className="text-red-400">{error}</p>}

          {!loading && !error && filteredProblems.length === 0 && (
            <p className="text-sm text-pink-100/85 theme-surface-muted p-4 rounded-xl border-2 border-pink-500/25">
              {t.noProblemsFound}
            </p>
          )}

          {!loading && (
            <motion.div
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: { staggerChildren: 0.05 },
                },
              }}
            >
              {filteredProblems.map((problem, index) => (
                <Fragment key={problem.id}>
                  <motion.div
                    variants={{
                      hidden: { opacity: 0, y: 15 },
                      visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
                    }}
                    className="rounded-xl border border-pink-500/25 theme-surface-muted p-4 transition-all duration-200 hover:-translate-y-0.5  hover:border-pink-400"
                  >
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <Link
                        to={`/problems/${problem.id}`}
                        className="text-lg font-semibold text-pink-200 underline decoration-2 decoration-pink-500/60 underline-offset-4 transition hover:text-pink-100 hover:decoration-pink-300 hover:decoration-3"
                      >
                        {problem.title}
                      </Link>
                      <span className="rounded-full border border-pink-400/40 bg-pink-500/10 px-2.5 py-1 text-xs font-semibold text-pink-100">
                        {getDifficultyLabel(lang, problem.difficulty)}
                      </span>
                    </div>
                    <p className="text-sm text-pink-100/85">
                      {problem.shortDescription}
                    </p>
                    {/* Tag-uri afisate pe card */}
                    {problem.tags.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1.5">
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
                  </motion.div>
                  {index < filteredProblems.length - 1 && (
                    <motion.div
                      variants={{
                        hidden: { opacity: 0 },
                        visible: { opacity: 1 },
                      }}
                      className="w-full h-1 bg-linear-to-r from-transparent via-pink-500/50 my-3 blur-[5px]"
                    />
                  )}
                </Fragment>
              ))}
            </motion.div>
          )}
        </div>
      </section>

      <StatsSidebar />
    </div>
  );
}