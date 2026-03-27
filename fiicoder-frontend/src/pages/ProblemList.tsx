import { Fragment, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { problemSummaries } from "./problemData";

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
    <div
      className="grid w-screen box-border px-6 gap-6 md:grid-cols-[280px_minmax(0,1fr)_280px]
     md:relative md:left-1/2 md:right-1/2 md:-ml-[50vw] md:-mr-[50vw]"
    >
      {/* search sidebar */}
      <aside className="h-fit p-5 bg-[#151221]/80 backdrop-blur-lg border-2 border-pink-500/30 rounded-2xl card-glow md:sticky md:top-6 md:col-start-1">
        <h2 className="text-xl font-bold text-pink-200 mb-2">
          Căutare & Filtre
        </h2>
        <div className="page-line" />
        <div className="space-y-4">
          <div>
            <label
              htmlFor="problem-search"
              className="mb-1 block text-sm font-semibold text-pink-200"
            >
              Nume problemă
            </label>
            <input
              id="problem-search"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ex: Problem 3"
              className="w-full rounded-lg border-2 border-pink-500/30 bg-[#0f0c18] px-3 py-2 text-sm text-pink-100 placeholder:text-pink-200/40 outline-none transition focus:border-pink-400 focus:ring-2 focus:ring-pink-500/20"
            />
          </div>
          <div>
            <label
              htmlFor="difficulty-filter"
              className="mb-1 block text-sm font-semibold text-pink-200"
            >
              Dificultate
            </label>
            <select
              id="difficulty-filter"
              value={difficultyFilter}
              onChange={(e) => setDifficultyFilter(e.target.value)}
              className="w-full rounded-lg border border-pink-500/30 bg-[#0f0c18] px-3 py-2 text-sm text-pink-100 outline-none transition focus:border-pink-400 focus:ring-2 focus:ring-pink-500/20"
            >
              <option value="All">Toate</option>
              <option value="Easy">Ușor</option>
              <option value="Medium">Mediu</option>
              <option value="Hard">Greu</option>
            </select>
          </div>
          <button
            onClick={clearFilters}
            className="w-full rounded-lg border border-pink-400/50 bg-pink-500/10 px-3 py-2 text-sm font-semibold text-pink-100 transition hover:bg-pink-500/20"
          >
            Șterge filtrele
          </button>
          <p className="text-xs text-pink-100/70">
            Afișate {filteredProblems.length} din {problemSummaries.length}{" "}
            probleme
          </p>
        </div>
      </aside>

      {/* problem section */}
      <section className="h-[calc(100svh-8.5rem)] overflow-y-auto p-8 bg-[#151221]/80 backdrop-blur-lg border-2 border-pink-500/30 rounded-2xl card-glow md:col-start-2">
        <h1 className="text-3xl font-bold text-pink-200 mb-2">Probleme</h1>
        <div className="page-line" />

        <div className="space-y-4">
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
                <div className="page-line mx-auto" />
              )}
            </Fragment>
          ))}
        </div>
      </section>

      {/* stats sidebar */}
      <aside className="h-fit p-5 bg-[#151221]/80 backdrop-blur-lg border-2 border-pink-500/30 rounded-2xl card-glow md:sticky md:top-6 md:col-start-3">
        <h2 className="text-xl font-bold text-pink-200 mb-2">Statistici</h2>
        <div className="page-line" />
        <div className="space-y-3">
          <StatCard title="Rezolvate" value="24" />
          <StatCard title="Rată de Succes" value="68%" />
          <StatCard title="Zile consecutive" value="5" />
          <StatCard title="Dificultate preferată" value="Mediu" />
        </div>
      </aside>
    </div>
  );
}

function StatCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-xl border border-pink-500/25 bg-[#100d19]/80 p-3">
      <p className="text-xs uppercase tracking-wide text-pink-300/70">
        {title}
      </p>
      <p className="mt-1 text-2xl font-semibold text-pink-100">{value}</p>
    </div>
  );
}
