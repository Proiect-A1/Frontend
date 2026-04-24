import { motion, AnimatePresence } from "framer-motion";
import {
  getDifficultyLabel,
  useLanguage,
  translations,
} from "../language/Language";
import { useState, useEffect } from "react";
import type { Difficulty } from "../types/problem";
import { tagService, type TagResponseDTO } from "../services/tagService";

interface FilterSidebarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  difficultyFilter: string;
  setDifficultyFilter: (difficulty: string) => void;
  selectedTags: string[];
  setSelectedTags: (tags: string[]) => void;
  clearFilters: () => void;
  filteredCount: number;
  totalCount: number;
}

export default function FilterSidebar({
  searchQuery,
  setSearchQuery,
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

  const [isOpen, setIsOpen] = useState(false);

  // Tag-uri din backend
  const [availableTags, setAvailableTags] = useState<TagResponseDTO[]>([]);
  const [tagsLoading, setTagsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    tagService.getAllTags()
      .then((tags) => { if (mounted) setAvailableTags(tags); })
      .catch(() => { /* silently ignore */ })
      .finally(() => { if (mounted) setTagsLoading(false); });
    return () => { mounted = false; };
  }, []);

  const toggleTag = (tagTitle: string) => {
    if (selectedTags.includes(tagTitle)) {
      setSelectedTags(selectedTags.filter((t) => t !== tagTitle));
    } else {
      setSelectedTags([...selectedTags, tagTitle]);
    }
  };

  const difficultyOptions = ["ALL", "EASY", "MEDIUM", "HARD", "CONTEST"];

  const getOptionLabel = (val: string) => {
    if (val === "ALL") {
      return t.allOption;
    }

    return getDifficultyLabel(lang, val as Difficulty);
  };

  return (
    <aside className="h-auto overflow-visible xl:h-fit xl:max-h-[calc(100svh-8.5rem)] xl:overflow-y-auto p-5 bg-[#151221]/80 backdrop-blur-lg border-2 border-pink-500/30 rounded-2xl card-glow xl:sticky xl:top-0 xl:col-start-1 custom-scrollbar">
      <h2 className="text-xl font-bold text-pink-200 mb-2">{t.filterTitle}</h2>

      <div className="space-y-4">
        {/* input cautare */}
        <div>
          <label
            htmlFor="problem-search"
            className="mb-1 block text-sm font-semibold text-pink-200"
          >
            {t.searchLabel}
          </label>
          <input
            id="problem-search"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={lang === "RO" ? "ex: Problema 3" : "ex: Problem 3"}
            className="w-full rounded-xl border border-pink-500/30 bg-[#0f0c18] px-3 py-2 text-sm text-pink-100 placeholder:text-pink-200/40 outline-none transition hover:border-pink-400"
          />
        </div>

        {/* dropdown dificultate */}
        <div>
          <label className="mb-1 block text-sm font-semibold text-pink-200">
            {t.difficultyLabel}
          </label>
          <div className="relative w-full">
            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              className="w-full flex items-center justify-between rounded-xl border border-pink-500/30 bg-[#0f0c18] px-3 py-2 text-sm text-pink-100 outline-none transition hover:border-pink-400"
            >
              {getOptionLabel(difficultyFilter)}
              <motion.span animate={{ rotate: isOpen ? 180 : 0 }}>
                ▼
              </motion.span>
            </button>

            <AnimatePresence>
              {isOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 5 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute z-50 mt-1 w-full bg-[#1a1629] border border-pink-500/40 rounded-xl shadow-2xl overflow-hidden"
                >
                  {difficultyOptions.map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => {
                        setDifficultyFilter(option);
                        setIsOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-pink-100 hover:bg-pink-500/20 transition-colors"
                    >
                      {getOptionLabel(option)}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* tag-uri */}
        <div>
          <label className="mb-1 block text-sm font-semibold text-pink-200">
            {t.tagsLabel}
          </label>
          {tagsLoading ? (
            <div className="flex gap-2">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-7 w-16 rounded-full bg-pink-500/10 animate-pulse"
                />
              ))}
            </div>
          ) : availableTags.length === 0 ? (
            <p className="text-xs text-pink-100/50">{t.noTagsAvailable}</p>
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
                        ? "bg-pink-500/30 border-pink-400 text-pink-100 shadow-[0_0_12px_rgba(236,72,153,0.3)]"
                        : "bg-pink-500/5 border-pink-500/25 text-pink-200/70 hover:border-pink-400/60 hover:bg-pink-500/15"
                    }`}
                  >
                    {isSelected && "✓ "}
                    {tag.title}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* delete filters */}
        <button
          type="button"
          onClick={() => {
            clearFilters();
            setIsOpen(false);
          }}
          className="w-full rounded-xl border border-pink-400/50 bg-pink-500/10 px-3 py-2 text-sm font-semibold text-pink-100 outline-none transition hover:border-pink-400 hover:bg-pink-500/30 hover:-translate-y-0.5"
        >
          {t.clearFilters}
        </button>

        {/* counter for search results */}
        <p className="text-xs text-pink-100/70">
          {lang === "RO"
            ? `Afișate ${filteredCount} din ${totalCount} probleme`
            : `Showing ${filteredCount} out of ${totalCount} problems`}
        </p>
      </div>
    </aside>
  );
}
