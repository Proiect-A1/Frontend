import { Fragment, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { problemSummaries } from "./problemData";
import type { Difficulty, Problem } from "../types/problem";
import { apiClient } from "../services/apiClient";

import {
  getDifficultyLabel,
  useLanguage,
  translations,
} from "../language/Language";
import FilterSidebar from "../components/FilterSidebar";
import StatsSidebar from "../components/StatsSidebar";

function toDifficulty(value: unknown): Difficulty {
  if (value === "Easy" || value === "Medium" || value === "Hard") {
    return value;
  }

  return "Medium";
}

function normalizeProblem(raw: unknown): Problem | null {
  if (!raw || typeof raw !== "object") {
    return null;
  }

  const candidate = raw as Record<string, unknown>;
  const id = candidate.id;

  if (id === undefined || id === null) {
    return null;
  }

  return {
    id: String(id),
    title: String(candidate.title ?? `Problem`),
    shortDescription: String(
      candidate.shortDescription ??
        candidate.summary ??
        "No short description available.",
    ),
    statement: String(candidate.statement ?? candidate.description ?? ""),
    difficulty: toDifficulty(candidate.difficulty),
  };
}

function extractProblems(payload: unknown): Problem[] {
  if (Array.isArray(payload)) {
    return payload
      .map(normalizeProblem)
      .filter((p): p is Problem => p !== null);
  }

  if (payload && typeof payload === "object") {
    const maybeWrapped = payload as Record<string, unknown>;
    if (Array.isArray(maybeWrapped.data)) {
      return maybeWrapped.data
        .map(normalizeProblem)
        .filter((p): p is Problem => p !== null);
    }
  }

  return [];
}

export default function ProblemList() {
  const { lang } = useLanguage();
  const t = translations[lang];
  const [searchQuery, setSearchQuery] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState("All");
  const [problems, setProblems] = useState<Problem[]>(problemSummaries);

  useEffect(() => {
    let isMounted = true;

    apiClient
      .get<unknown>("/problems")
      .then((payload) => {
        if (!isMounted) {
          return;
        }

        const extracted = extractProblems(payload);
        if (extracted.length > 0) {
          setProblems(extracted);
        }
      })
      .catch(() => {
        // In case of error, we keep the default hardcoded problems.
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredProblems = useMemo(() => {
    const normalized = searchQuery.trim().toLowerCase();
    return problems.filter((problem) => {
      const matchesName = problem.title.toLowerCase().includes(normalized);
      const matchesDifficulty =
        difficultyFilter === "All" || problem.difficulty === difficultyFilter;
      return matchesName && matchesDifficulty;
    });
  }, [difficultyFilter, problems, searchQuery]);

  const clearFilters = () => {
    setSearchQuery("");
    setDifficultyFilter("All");
  };

  return (
    <div className="w-full grid gap-6 xl:grid-cols-[280px_1fr_280px]">
      <FilterSidebar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        difficultyFilter={difficultyFilter}
        setDifficultyFilter={setDifficultyFilter}
        clearFilters={clearFilters}
        filteredCount={filteredProblems.length}
        totalCount={problems.length}
      />

      <section className="h-auto overflow-visible xl:h-[calc(100svh-8.5rem)] xl:overflow-y-auto p-8 bg-[#151221]/80 backdrop-blur-lg border-2 border-pink-500/30 rounded-2xl card-glow xl:col-start-2 custom-scrollbar">
        <h1 className="text-3xl font-bold text-pink-200 mb-2">{t.problemsTitle}</h1>
        <div className="page-line-horizontal" />

        <div className="space-y-3">
          {filteredProblems.length === 0 && (
            <p className="p-4 text-sm border-2 rounded-xl text-pink-100/85 bg-[#100d19]/80 border-pink-500/25">
              {t.noProblemsFound}
            </p>
          )}

          {filteredProblems.map((problem, index) => (
            <Fragment key={problem.id}>
              <div className="rounded-xl border border-pink-500/25 bg-[#100d19]/80 p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-pink-400">
                <div className="flex items-center justify-between gap-3 mb-2">
                  <Link to={`/problems/${problem.id}`} className="text-lg font-semibold text-pink-200 underline decoration-2 decoration-pink-500/60 underline-offset-4 transition hover:text-pink-100 hover:decoration-pink-300">
                    {problem.title}
                  </Link>
                  <span className="rounded-full border border-pink-400/40 bg-pink-500/10 px-2.5 py-1 text-xs font-semibold text-pink-100">
                    {getDifficultyLabel(lang, problem.difficulty)}
                  </span>
                </div>
                <p className="text-sm text-pink-100/85">{problem.shortDescription}</p>
              </div>
              {index < filteredProblems.length - 1 && (
                <div className="w-full h-1 bg-linear-to-r from-transparent via-pink-500/50 my-3 blur-[5px]" />
              )}
            </Fragment>
          ))}
        </div>
      </section>

      <StatsSidebar />
    </div>
  );
}
