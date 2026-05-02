import { Controller, useFormContext } from "react-hook-form";
import type { ProposeProblemForm } from "../../types/proposeProblem";

const difficulties = ["easy", "medium", "hard"];

export default function GeneralTab() {
  const { control, watch } = useFormContext<ProposeProblemForm>();
  const formData = watch();

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
                  <option key={diff} value={diff} className="bg-[var(--surface-page)] text-[var(--text)]">
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

      {/* Tags */}
      <div className="space-y-2">
        <label className="text-theme-text font-semibold text-sm">Etichete (separate prin virgulă)</label>
        <Controller
          name="tags"
          control={control}
          render={({ field }) => (
            <input
              {...field}
              placeholder="ex: Array, Dynamic Programming, Recursion"
              className="w-full px-4 py-2 bg-theme-surface-secondary border accent-border rounded-lg text-theme-text placeholder-theme-text-muted focus:outline-none accent-ring transition-all"
              onChange={(e) => field.onChange(e.target.value.split(",").map((t) => t.trim()))}
              value={field.value.join(", ")}
            />
          )}
        />
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
