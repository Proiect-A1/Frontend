import { Controller, useFieldArray, useFormContext } from "react-hook-form";
import { motion } from 'framer-motion';
import type { ProposeProblemForm } from "../../types/proposeProblem";
import { itemVariants, staggerConfig } from '../../utils/motionConfig';

export default function TestsTab() {
  const { control } = useFormContext<ProposeProblemForm>();
  const { fields, append, remove } = useFieldArray({
    control,
    name: "tests",
  });

  const addTest = () => {
    append({
      id: `test_${Date.now()}`,
      input: "",
      output: "",
      subtaskIds: [],
      timeLimit: undefined,
      memoryLimit: undefined,
      points: 1,
    });
  };

  return (
    <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: staggerConfig } }} className="space-y-6">
      {/* Info */}
      <motion.div variants={itemVariants} className="p-4 bg-theme-surface-secondary rounded-xl border border-(--accent)/20">
        <p className="text-sm text-theme-text">
          <strong>Instrucțiuni:</strong> Adaugă testele pe care va trebui să le treacă soluția. Fiecare test poate fi asignat unor subtask-uri.
        </p>
      </motion.div>

      {/* Tests Table */}
      <motion.div variants={itemVariants} className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-theme-border">
              <th className="text-left text-theme-text font-semibold py-3 px-4">ID Test</th>
              <th className="text-left text-theme-text font-semibold py-3 px-4">Input</th>
              <th className="text-left text-theme-text font-semibold py-3 px-4">Output</th>
              <th className="text-left text-theme-text font-semibold py-3 px-4">Puncte</th>
              <th className="text-center text-theme-text font-semibold py-3 px-4 w-12">Acțiuni</th>
            </tr>
          </thead>
          <tbody>
            {fields.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center text-theme-text-muted py-8">
                  Nu ai adăugat niciun test. Fă clic pe butonul de mai jos pentru a adăuga.
                </td>
              </tr>
            ) : (
              fields.map((field, index) => (
                <tr key={field.id} className="border-b border-theme-border hover:bg-theme-surface-secondary/50 transition-colors">
                  <td className="text-theme-text text-xs font-mono py-4 px-4">
                    {field.id}
                  </td>

                  {/* Input Field */}
                  <td className="text-theme-text py-4 px-4">
                    <Controller
                      name={`tests.${index}.input`}
                      control={control}
                      render={({ field }) => (
                        <textarea
                          {...field}
                          className="w-full h-16 p-2 bg-theme-surface-secondary border accent-border rounded text-xs text-theme-text font-mono focus:outline-none accent-ring transition-all"
                          placeholder="Input..."
                        />
                      )}
                    />
                  </td>

                  {/* Output Field */}
                  <td className="text-theme-text py-4 px-4">
                    <Controller
                      name={`tests.${index}.output`}
                      control={control}
                      render={({ field }) => (
                        <textarea
                          {...field}
                          className="w-full h-16 p-2 bg-theme-surface-secondary border accent-border rounded text-xs text-theme-text font-mono focus:outline-none accent-ring transition-all"
                          placeholder="Output..."
                        />
                      )}
                    />
                  </td>

                  {/* Points */}
                  <td className="text-theme-text py-4 px-4">
                    <Controller
                      name={`tests.${index}.points`}
                      control={control}
                      render={({ field }) => (
                        <input
                          {...field}
                          type="number"
                          min="0"
                          className="w-16 px-2 py-1 bg-theme-surface-secondary border accent-border rounded text-theme-text text-center focus:outline-none accent-ring transition-all"
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                        />
                      )}
                    />
                  </td>

                  {/* Delete Button */}
                  <td className="text-center py-4 px-4">
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      className="p-2 text-red-400 hover:bg-red-500/20 rounded transition-colors inline-block"
                      title="Șterge test"
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </motion.div>

      {/* Add Test Button */}
      <motion.button
        variants={itemVariants}
        type="button"
        onClick={addTest}
        className="w-full flex items-center justify-center gap-2 px-4 py-2 border-2 border-dashed border-(--accent)/50 rounded-xl text-(--text-h) hover:border-(--accent) hover:bg-(--accent)/10 transition-colors font-semibold"
      >
        ➕ Adaugă Test
      </motion.button>

      {/* Stats */}
      <motion.div variants={itemVariants} className="p-4 bg-theme-surface-secondary rounded-xl border border-(--accent)/20">
        <p className="text-sm text-theme-text">
          <strong>Total teste:</strong> {fields.length}
        </p>
      </motion.div>
    </motion.div>
  );
}
