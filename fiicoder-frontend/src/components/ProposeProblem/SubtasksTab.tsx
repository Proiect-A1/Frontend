import { Controller, useFieldArray, useFormContext } from "react-hook-form";
import type { ProposeProblemForm } from "../../types/proposeProblem";

export default function SubtasksTab() {
  const { control, watch } = useFormContext<ProposeProblemForm>();
  const { fields, append, remove } = useFieldArray({
    control,
    name: "subtasks",
  });

  const tests = watch("tests");

  const addSubtask = () => {
    append({
      id: `subtask_${Date.now()}`,
      title: "",
      points: 10,
      testIds: [],
    });
  };

  return (
    <div className="space-y-6 p-6 bg-theme-surface-card rounded-lg border border-theme-border">
      {/* Info */}
      <div className="p-4 info-box border rounded-lg">
        <p className="text-sm text-theme-text">
          <strong>Instrucțiuni:</strong> Subtask-urile permit o scorare progresivă. Definiți care teste aparțin fiecărui subtask.
        </p>
      </div>

      {/* Subtasks Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-theme-border">
              <th className="text-left text-theme-text font-semibold py-3 px-4">Titlu Subtask</th>
              <th className="text-left text-theme-text font-semibold py-3 px-4">Puncte</th>
              <th className="text-left text-theme-text font-semibold py-3 px-4">Teste Asociate</th>
              <th className="text-center text-theme-text font-semibold py-3 px-4 w-12">Acțiuni</th>
            </tr>
          </thead>
          <tbody>
            {fields.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center text-theme-text-muted py-8">
                  Nu ai adăugat niciun subtask. Fă clic pe butonul de mai jos pentru a adăuga.
                </td>
              </tr>
            ) : (
              fields.map((field, index) => (
                <tr key={field.id} className="border-b border-theme-border hover:bg-theme-surface-secondary/50 transition-colors">
                  {/* Title */}
                  <td className="text-theme-text py-4 px-4">
                    <Controller
                      name={`subtasks.${index}.title`}
                      control={control}
                      render={({ field }) => (
                        <input
                          {...field}
                          placeholder="ex: Subtask 1 - Soluție Brute Force"
                          className="w-full px-3 py-1 bg-theme-surface-secondary border accent-border rounded text-theme-text text-sm focus:outline-none accent-ring transition-all"
                        />
                      )}
                    />
                  </td>

                  {/* Points */}
                  <td className="text-theme-text py-4 px-4">
                    <Controller
                      name={`subtasks.${index}.points`}
                      control={control}
                      render={({ field }) => (
                        <input
                          {...field}
                          type="number"
                          min="0"
                          className="w-24 px-2 py-1 bg-theme-surface-secondary border accent-border rounded text-theme-text text-center focus:outline-none accent-ring transition-all"
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                        />
                      )}
                    />
                  </td>

                  {/* Test Selection */}
                  <td className="text-theme-text text-sm py-4 px-4">
                    {tests.length === 0 ? (
                      <span className="text-theme-text-muted italic">Adaugă teste mai sus</span>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {tests.map((test) => (
                          <label key={test.id} className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              defaultChecked={field.testIds?.includes(test.id)}
                              onChange={(e) => {
                                const subtask = field;
                                const current = subtask.testIds || [];
                                if (e.target.checked) {
                                  subtask.testIds = [...current, test.id];
                                } else {
                                  subtask.testIds = current.filter((id) => id !== test.id);
                                }
                              }}
                              className="rounded border-theme-border cursor-pointer"
                            />
                            <span className="text-xs accent-bg accent-text px-2 py-1 rounded">
                              {test.id}
                            </span>
                          </label>
                        ))}
                      </div>
                    )}
                  </td>

                  {/* Delete Button */}
                  <td className="text-center py-4 px-4">
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      className="p-2 text-red-400 hover:bg-red-500/20 rounded transition-colors inline-block"
                      title="Șterge subtask"
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add Subtask Button */}
      <button
        type="button"
        onClick={addSubtask}
        className="w-full flex items-center justify-center gap-2 px-4 py-2 border-2 border-dashed accent-border rounded-lg accent-text hover:accent-hover transition-colors font-semibold"
      >
        ➕ Adaugă Subtask
      </button>

      {/* Stats */}
      <div className="p-4 bg-theme-surface-secondary rounded-lg border border-theme-border space-y-2">
        <p className="text-sm text-theme-text">
          <strong>Total subtask-uri:</strong> {fields.length}
        </p>
        <p className="text-sm text-theme-text-muted">
          <strong>Punctaj total:</strong>{" "}
          {fields.reduce((sum, f) => sum + (f.points || 0), 0)} puncte
        </p>
      </div>
    </div>
  );
}
