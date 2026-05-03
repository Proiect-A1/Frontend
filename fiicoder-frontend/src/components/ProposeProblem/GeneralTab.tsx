import { Controller, useFormContext } from "react-hook-form";
import { useState, useEffect, useRef } from "react";
import type { ProposeProblemForm } from "../../types/proposeProblem";
import { tagService, type TagResponseDTO } from "../../services/tagService";

const difficulties = ["easy", "medium", "hard"];

export default function GeneralTab() {
  const { control, watch, setValue } = useFormContext<ProposeProblemForm>();
  const formData = watch();

  // Tag autocomplete state
  const [availableTags, setAvailableTags] = useState<TagResponseDTO[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [suggestions, setSuggestions] = useState<TagResponseDTO[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Fetch tags on mount
  useEffect(() => {
    tagService.getAllTags().then(setAvailableTags).catch(console.error);
  }, []);

  // Filter suggestions based on input
  useEffect(() => {
    if (inputValue.trim()) {
      const filtered = availableTags.filter(
        (tag) =>
          tag.title.toLowerCase().includes(inputValue.toLowerCase()) &&
          !formData.tags.includes(tag.title)
      );
      setSuggestions(filtered.slice(0, 5)); // Max 5 suggestions
      setShowSuggestions(filtered.length > 0);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
    setSelectedIndex(-1);
  }, [inputValue, availableTags, formData.tags]);

  // Click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(e.target as Node) &&
        !inputRef.current?.contains(e.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const addTag = (tag: string) => {
    const trimmedTag = tag.trim();
    // Doar tag-uri existente în baza de date
    const tagExists = availableTags.some(
      (t) => t.title.toLowerCase() === trimmedTag.toLowerCase()
    );
    if (trimmedTag && tagExists && !formData.tags.includes(trimmedTag)) {
      setValue("tags", [...formData.tags, trimmedTag]);
    }
    setInputValue("");
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  const removeTag = (tagToRemove: string) => {
    setValue(
      "tags",
      formData.tags.filter((t) => t !== tagToRemove)
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev < suggestions.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (selectedIndex >= 0 && suggestions[selectedIndex]) {
        addTag(suggestions[selectedIndex].title);
      }
      // Dacă nu e selectată o sugestie validă, nu facem nimic (nu adăugăm tag-uri noi)
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
    } else if (e.key === "Backspace" && !inputValue && formData.tags.length > 0) {
      removeTag(formData.tags[formData.tags.length - 1]);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleInputFocus = () => {
    if (inputValue.trim() && suggestions.length > 0) {
      setShowSuggestions(true);
    }
  };

  return (
    <div className="space-y-6 p-6 bg-theme-surface-card rounded-lg border border-theme-border">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Title */}
        <div className="space-y-2">
          <label className="text-theme-text font-semibold text-sm">Titlu Problemei</label>
          <Controller
            name="title"
            control={control}
            rules={{ required: "Titlul este obligatoriu" }}
            render={({ field, fieldState: { error } }) => (
              <div>
                <input
                  {...field}
                  placeholder="ex: Two Sum, Fibonacci, DP Matrix"
                  className="w-full px-4 py-2 bg-theme-surface-secondary border accent-border rounded-lg text-theme-text placeholder-theme-text-muted focus:outline-none accent-ring transition-all"
                />
                {error && <p className="text-red-400 text-xs mt-1">{error.message}</p>}
              </div>
            )}
          />
        </div>

        {/* Difficulty */}
        <div className="space-y-2">
          <label className="text-theme-text font-semibold text-sm">Nivel de Dificultate</label>
          <Controller
            name="difficulty"
            control={control}
            render={({ field }) => (
              <select
                {...field}
                className="w-full px-4 py-2 bg-theme-surface-secondary border accent-border rounded-lg text-theme-text focus:outline-none accent-ring transition-all cursor-pointer"
              >
                {difficulties.map((diff) => (
                  <option key={diff} value={diff} className="bg-(--surface-page) text-(--text)">
                    {diff.charAt(0).toUpperCase() + diff.slice(1)}
                  </option>
                ))}
              </select>
            )}
          />
        </div>

        {/* Time Limit */}
        <div className="space-y-2">
          <label className="text-theme-text font-semibold text-sm">Limită de Timp (s)</label>
          <Controller
            name="timeLimit"
            control={control}
            render={({ field }) => (
              <input
                {...field}
                type="number"
                min="0.1"
                step="0.1"
                placeholder="1.0"
                className="w-full px-4 py-2 bg-theme-surface-secondary border accent-border rounded-lg text-theme-text placeholder-theme-text-muted focus:outline-none accent-ring transition-all"
                onChange={(e) => field.onChange(parseFloat(e.target.value))}
              />
            )}
          />
        </div>

        {/* Memory Limit */}
        <div className="space-y-2">
          <label className="text-theme-text font-semibold text-sm">Limită de Memorie (MB)</label>
          <Controller
            name="memoryLimit"
            control={control}
            render={({ field }) => (
              <input
                {...field}
                type="number"
                min="16"
                step="16"
                placeholder="256"
                className="w-full px-4 py-2 bg-theme-surface-secondary border accent-border rounded-lg text-theme-text placeholder-theme-text-muted focus:outline-none accent-ring transition-all"
                onChange={(e) => field.onChange(parseInt(e.target.value))}
              />
            )}
          />
        </div>
      </div>

      {/* Tags with Autocomplete */}
      <div className="space-y-2">
        <label className="text-theme-text font-semibold text-sm">Etichete</label>
        <div className="relative">
          {/* Selected tags display */}
          <div className="w-full min-h-10.5 px-3 py-2 bg-theme-surface-secondary border accent-border rounded-lg flex flex-wrap gap-2 items-center">
            {formData.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-(--accent)/20 text-(--text-h) border border-(--accent)/30"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="hover:text-red-400 transition-colors"
                >
                  ×
                </button>
              </span>
            ))}
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              onFocus={handleInputFocus}
              placeholder={formData.tags.length === 0 ? "Scrie pentru a căuta etichete..." : ""}
              className="flex-1 min-w-30 bg-transparent text-theme-text placeholder-theme-text-muted outline-none text-sm"
            />
          </div>

          {/* Suggestions dropdown */}
          {showSuggestions && (
            <div
              ref={suggestionsRef}
              className="absolute z-50 mt-1 w-full theme-surface-dropdown border border-(--accent)/40 rounded-xl shadow-2xl overflow-hidden max-h-48 overflow-y-auto"
            >
              {suggestions.map((tag, index) => (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => addTag(tag.title)}
                  className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                    index === selectedIndex
                      ? "bg-(--accent)/30 text-(--text-h)"
                      : "text-(--text) hover:bg-(--accent)/20"
                  }`}
                >
                  {tag.title}
                </button>
              ))}
            </div>
          )}
        </div>
        <p className="text-xs text-theme-text-muted">
          Selectează din lista de etichete existente.
        </p>
      </div>

      {/* Info Section */}
      <div className="p-4 bg-theme-surface-secondary rounded-lg border border-theme-border text-sm text-theme-text-muted">
        <p>
          <strong>Sfat:</strong> Alege limite care sunt realiste pentru problema ta. Timp prea mic poate frustra utilizatorii.
        </p>
      </div>

      {/* Preview */}
      <div className="p-4 bg-theme-surface-secondary rounded-lg border border-theme-border space-y-3">
        <h3 className="font-semibold text-theme-text">Previzualizare:</h3>
        <div className="space-y-1 text-sm text-theme-text-muted">
          <p>
            <strong>Titlu:</strong> {formData.title || "—"}
          </p>
          <p>
            <strong>Dificultate:</strong> {formData.difficulty}
          </p>
          <p>
            <strong>Timp/Memorie:</strong> {formData.timeLimit}s / {formData.memoryLimit}MB
          </p>
          <p>
            <strong>Etichete:</strong> {formData.tags.length > 0 ? formData.tags.join(", ") : "—"}
          </p>
        </div>
      </div>
    </div>
  );
}
