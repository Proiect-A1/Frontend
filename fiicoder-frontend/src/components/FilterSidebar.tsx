import { useLanguage, translations } from "../language/LanguageUsed";

interface FilterSidebarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  difficultyFilter: string;
  setDifficultyFilter: (difficulty: string) => void;
  clearFilters: () => void;
  filteredCount: number;
  totalCount: number;
}

export default function FilterSidebar({
  searchQuery,
  setSearchQuery,
  difficultyFilter,
  setDifficultyFilter,
  clearFilters,
  filteredCount,
  totalCount,
}: FilterSidebarProps) {
  // Preluăm limba și traducerile din context
  const { lang } = useLanguage();
  const t = translations[lang];

  return (
    <aside className="h-fit p-5 bg-[#151221]/80 backdrop-blur-lg border-2 border-pink-500/30 rounded-2xl card-glow md:sticky md:top-6 md:col-start-1">
      <h2 className="text-xl font-bold text-pink-200 mb-2">{t.filterTitle}</h2>
      <div className="page-line-horizontal" />
      <div className="space-y-4">
        <div>
          <label htmlFor="problem-search" className="mb-1 block text-sm font-semibold text-pink-200">
            {t.searchLabel}
          </label>
          <input
            id="problem-search"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={lang === "RO" ? "ex: Problema 3" : "ex: Problem 3"}
            className="w-full rounded-lg border-2 border-pink-500/30 bg-[#0f0c18] px-3 py-2 text-sm text-pink-100 placeholder:text-pink-200/40 outline-none transition focus:border-pink-400 focus:ring-2 focus:ring-pink-500/20"
          />
        </div>
        <div>
          <label htmlFor="difficulty-filter" className="mb-1 block text-sm font-semibold text-pink-200">
            {t.difficultyLabel}
          </label>
          <select
            id="difficulty-filter"
            value={difficultyFilter}
            onChange={(e) => setDifficultyFilter(e.target.value)}
            className="w-full rounded-lg border border-pink-500/30 bg-[#0f0c18] px-3 py-2 text-sm text-pink-100 outline-none transition focus:border-pink-400 focus:ring-2 focus:ring-pink-500/20"
          >
            <option value="All">{t.allOption}</option>
            <option value="Easy">{lang === "RO" ? "Ușor" : "Easy"}</option>
            <option value="Medium">{lang === "RO" ? "Mediu" : "Medium"}</option>
            <option value="Hard">{lang === "RO" ? "Greu" : "Hard"}</option>
          </select>
        </div>
        <button
          onClick={clearFilters}
          className="w-full rounded-lg border border-pink-400/50 bg-pink-500/10 px-3 py-2 text-sm font-semibold text-pink-100 transition hover:bg-pink-500/20"
        >
          {t.clearFilters}
        </button>
        <p className="text-xs text-pink-100/70">
          {lang === "RO" 
            ? `Afișate ${filteredCount} din ${totalCount} probleme` 
            : `Showing ${filteredCount} out of ${totalCount} problems`}
        </p>
      </div>
    </aside>
  );
}