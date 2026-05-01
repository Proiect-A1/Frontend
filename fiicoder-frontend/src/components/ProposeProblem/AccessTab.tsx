import { Controller, useFormContext } from "react-hook-form";
import type { ProposeProblemForm } from "../../types/proposeProblem";

export default function AccessTab() {
  const { control, watch } = useFormContext<ProposeProblemForm>();
  const visibility = watch("visibility");

  return (
    <div className="space-y-6 p-6 bg-theme-surface-card rounded-lg border border-theme-border">
      {/* Info */}
      <div className="p-4 info-box border rounded-lg">
        <p className="text-sm text-theme-text">
          <strong>Instrucțiuni:</strong> Alege cine poate vedea și accesa propunerea ta.
        </p>
      </div>

      {/* Visibility */}
      <div className="space-y-2">
        <label className="text-theme-text font-semibold text-sm">Vizibilitate</label>
        <Controller
          name="visibility"
          control={control}
          render={({ field }) => (
            <select
              {...field}
              className="w-full px-4 py-2 bg-theme-surface-secondary border accent-border rounded-lg text-theme-text focus:outline-none accent-ring transition-all"
            >
              <option value="private">🔒 Privată - Doar tu și moderatorii</option>
              <option value="unlisted">🔗 Ascunsă - Link pentru oameni selectați</option>
              <option value="public">🌍 Publică - Vizibilă pentru toți</option>
            </select>
          )}
        />
        <p className="text-xs text-theme-text-muted">
          {visibility === "private" &&
            "Propunerea ta este privată. Va fi vizibilă doar pentru moderatori și pentru tine."}
          {visibility === "unlisted" &&
            "Propunerea ta este ascunsă. Poți partaja linkul cu oameni specifici."}
          {visibility === "public" &&
            "Propunerea ta va fi vizibilă pentru toți. Va apărea în lista propunerilor publice."}
        </p>
      </div>

      {/* Allowed Users */}
      {visibility === "unlisted" && (
        <div className="space-y-2">
          <label className="text-theme-text font-semibold text-sm">Utilizatori Permisi (opțional)</label>
          <Controller
            name="allowedUsers"
            control={control}
            render={({ field }) => (
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="Introdu usernames separate prin virgulă"
                  className="w-full px-4 py-2 bg-theme-surface-secondary border accent-border rounded-lg text-theme-text placeholder-theme-text-muted focus:outline-none accent-ring transition-all"
                  onChange={(e) => {
                    const usernames = e.target.value.split(",").map((u) => u.trim());
                    field.onChange(usernames.filter((u) => u.length > 0));
                  }}
                  value={field.value?.join(", ") || ""}
                />
                <p className="text-xs text-theme-text-muted">
                  Lasă gol pentru a permite accesul pentru oricine cu linkul.
                </p>
              </div>
            )}
          />
        </div>
      )}

      {/* Allowed Groups */}
      {visibility === "unlisted" && (
        <div className="space-y-2">
          <label className="text-theme-text font-semibold text-sm">Clase/Grupuri Permise (opțional)</label>
          <Controller
            name="allowedGroups"
            control={control}
            render={({ field }) => (
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="Introdu ID-uri de clase separate prin virgulă"
                  className="w-full px-4 py-2 bg-theme-surface-secondary border accent-border rounded-lg text-theme-text placeholder-theme-text-muted focus:outline-none accent-ring transition-all"
                  onChange={(e) => {
                    const groupIds = e.target.value.split(",").map((g) => g.trim());
                    field.onChange(groupIds.filter((g) => g.length > 0));
                  }}
                  value={field.value?.join(", ") || ""}
                />
                <p className="text-xs text-theme-text-muted">
                  Specifică clasele care pot accesa această propunere.
                </p>
              </div>
            )}
          />
        </div>
      )}

      {/* Preview */}
      <div className="p-4 bg-theme-surface-secondary rounded-lg border border-theme-border space-y-3">
        <h3 className="font-semibold text-theme-text">Rezumat Acces:</h3>
        <div className="space-y-2 text-sm text-theme-text-muted">
          <p>
            <strong>Vizibilitate:</strong>{" "}
            {visibility === "private"
              ? "🔒 Privată"
              : visibility === "unlisted"
                ? "🔗 Ascunsă"
                : "🌍 Publică"}
          </p>
          {visibility === "unlisted" && (
            <>
              {watch("allowedUsers")?.length ? (
                <p>
                  <strong>Utilizatori permisi:</strong> {watch("allowedUsers")?.join(", ")}
                </p>
              ) : (
                <p className="italic text-theme-text-muted">
                  Oricine cu linkul poate accesa.
                </p>
              )}
              {watch("allowedGroups")?.length ? (
                <p>
                  <strong>Clase permise:</strong> {watch("allowedGroups")?.join(", ")}
                </p>
              ) : null}
            </>
          )}
        </div>
      </div>

      {/* Info Box */}
      <div className="p-4 success-box border rounded-lg space-y-2">
        <h4 className="font-semibold text-theme-text">Sfaturi de Siguranță:</h4>
        <ul className="text-xs text-theme-text-muted space-y-1 list-disc list-inside">
          <li>
            Propunerile private nu vor fi niciodată publicate fără consimțământul tău.
          </li>
          <li>Moderatorii au acces la toate propunerile pentru revizuire.</li>
          <li>
            Poți schimba vizibilitatea mai târziu, chiar și după publicare.
          </li>
        </ul>
      </div>
    </div>
  );
}
