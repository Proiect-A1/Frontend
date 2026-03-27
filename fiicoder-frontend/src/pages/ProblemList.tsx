import { Fragment, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { problemSummaries } from "./problemData";

import FilterSidebar from "../components/FilterSidebar";
import StatsSidebar from "../components/StatsSidebar";

export default function ProblemList() {
  const [searchQuery, setSearchQuery] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState("All");

  const filteredProblems = useMemo(() => {
    const normalized = searchQuery.trim().toLowerCase();
    return problemSummaries.filter((problem) => {
      const matchesName = problem.title.toLowerCase().includes(normalized);
      const matchesDifficulty =
        difficultyFilter === "All" || problem.difficulty === difficultyFilter;
      return matchesName && matchesDifficulty;
    });
  }, [difficultyFilter, searchQuery]);

  const clearFilters = () => {
    setSearchQuery("");
    setDifficultyFilter("All");
  };

  return (
    <div className="grid w-screen box-border px-6 gap-6 md:grid-cols-[280px_minmax(0,1fr)_280px] md:relative md:left-1/2 md:right-1/2 md:-ml-[50vw] md:-mr-[50vw]">
      <FilterSidebar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        difficultyFilter={difficultyFilter}
        setDifficultyFilter={setDifficultyFilter}
        clearFilters={clearFilters}
        filteredCount={filteredProblems.length}
        totalCount={problemSummaries.length}
      />

      <section className="h-[calc(100svh-8.5rem)] overflow-y-auto p-8 bg-[#151221]/80 backdrop-blur-lg border-2 border-pink-500/30 rounded-2xl card-glow md:col-start-2">
        <h1 className="text-3xl font-bold text-pink-200 mb-2">Probleme</h1>
        <div className="page-line-horizontal" />

        <div className="">
          {filteredProblems.length === 0 && (
            <p className="text-sm text-pink-100/85 bg-[#100d19]/80 p-4 rounded-xl border-2 border-pink-500/25">
              Nu am găsit nicio problemă.
            </p>
          )}

          {filteredProblems.map((problem, index) => (
            <Fragment key={problem.id}>
              <div className="rounded-xl border border-pink-500/25 bg-[#100d19]/80 p-4 transition-all duration-200 hover:-translate-y-1">
                <div className="mb-2 flex items-center justify-between gap-3">
                  <Link
                    to={`/problems/${problem.id}`}
                    className="text-lg font-semibold text-pink-200 underline decoration-2 decoration-pink-500/60 underline-offset-4 transition hover:text-pink-100 hover:decoration-pink-300 hover:decoration-3"
                  >
                    {problem.title}
                  </Link>
                  <span className="rounded-full border border-pink-400/40 bg-pink-500/10 px-2.5 py-1 text-xs font-semibold text-pink-100">
                    {problem.difficulty}
                  </span>
                </div>
                <p className="text-sm text-pink-100/85">
                  {problem.shortDescription}
                </p>
              </div>
              {index < filteredProblems.length - 1 && (
                <div className="w-full h-1 bg-gradient-to-r from-transparent via-pink-500/50 my-4 blur-[3px]" />
              )}
            </Fragment>
          ))}
        </div>
      </section>

      <StatsSidebar />
    </div>
  );
}
