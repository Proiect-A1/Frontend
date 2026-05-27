import { Controller, useFieldArray, useFormContext } from 'react-hook-form';
import { motion } from 'framer-motion';
import { useT } from '../../../language/Language';
import type { ProposeProblemForm } from '../types/proposeProblem';
import { itemVariants, staggerConfig } from '../../../utils/motionConfig';

export default function TestsTab() {
    const { control } = useFormContext<ProposeProblemForm>();
    const { fields, append, remove } = useFieldArray({
        control,
        name: 'tests',
    });
    const t = useT();

    const addTest = () => {
        append({
            id: `manual_${Date.now()}`,
            input: '',
            output: '',
            subtaskIds: [],
            timeLimit: undefined,
            memoryLimit: undefined,
            points: 1,
            source: 'manual',
        });
    };

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: staggerConfig } }}
            className="space-y-6"
        >
            {/* Info */}
            <motion.div
                variants={itemVariants}
                className="p-4 bg-(--surface-muted) rounded-2xl border border-(--accent)/20"
            >
                <p className="text-sm text-(--text)">
                    {t.proposeTestsInfo}
                </p>
            </motion.div>

            {/* Tests Table */}
            <motion.div variants={itemVariants} className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-(--accent)/20">
                            <th className="text-left text-(--text) font-semibold py-3 px-4">
                                {t.proposeTestsColId}
                            </th>
                            <th className="text-left text-(--text) font-semibold py-3 px-4">
                                {t.proposeTestsColInput}
                            </th>
                            <th className="text-left text-(--text) font-semibold py-3 px-4">
                                {t.proposeTestsColOutput}
                            </th>
                            <th className="text-left text-(--text) font-semibold py-3 px-4">
                                {t.proposeTestsColPoints}
                            </th>
                            <th className="text-center text-(--text) font-semibold py-3 px-4 w-12">
                                {t.proposeTestsColActions}
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {fields.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="text-center text-(--text-muted) py-8">
                                    {t.proposeTestsEmpty}
                                </td>
                            </tr>
                        ) : (
                            fields.map((field, index) => (
                                <tr
                                    key={field.id}
                                    className="border-b border-(--accent)/20 hover:bg-(--surface-muted)/50 transition-colors"
                                >
                                    <td className="text-(--text) text-xs font-mono py-4 px-4">
                                        {field.id}
                                    </td>

                                    {/* Input Field */}
                                    <td className="text-(--text) py-4 px-4">
                                        <Controller
                                            name={`tests.${index}.input`}
                                            control={control}
                                            render={({ field }) => (
                                                <textarea
                                                    {...field}
                                                    className="w-full h-16 p-2 bg-(--surface-muted) border border-(--accent) rounded text-xs text-(--text) font-mono focus:outline-none focus:[box-shadow:0_0_0_2px_color-mix(in_srgb,var(--accent)_50%,transparent)] transition-all"
                                                    placeholder={t.proposeTestsColInput + '...'}
                                                />
                                            )}
                                        />
                                    </td>

                                    {/* Output Field */}
                                    <td className="text-(--text) py-4 px-4">
                                        <Controller
                                            name={`tests.${index}.output`}
                                            control={control}
                                            render={({ field }) => (
                                                <textarea
                                                    {...field}
                                                    className="w-full h-16 p-2 bg-(--surface-muted) border border-(--accent) rounded text-xs text-(--text) font-mono focus:outline-none focus:[box-shadow:0_0_0_2px_color-mix(in_srgb,var(--accent)_50%,transparent)] transition-all"
                                                    placeholder={t.proposeTestsColOutput + '...'}
                                                />
                                            )}
                                        />
                                    </td>

                                    {/* Points */}
                                    <td className="text-(--text) py-4 px-4">
                                        <Controller
                                            name={`tests.${index}.points`}
                                            control={control}
                                            render={({ field }) => (
                                                <input
                                                    {...field}
                                                    type="number"
                                                    min="0"
                                                    className="w-16 px-2 py-1 bg-(--surface-muted) border border-(--accent) rounded text-(--text) text-center focus:outline-none focus:[box-shadow:0_0_0_2px_color-mix(in_srgb,var(--accent)_50%,transparent)] transition-all"
                                                    onChange={(e) =>
                                                        field.onChange(parseInt(e.target.value))
                                                    }
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
                                            title={t.proposeTestsDeleteTitle}
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
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
                className="w-full flex items-center justify-center gap-2 px-4 py-2 border-2 border-dashed border-(--accent)/50 rounded-2xl text-(--text-h) hover:border-(--accent) hover:bg-(--accent)/10 transition-colors font-semibold"
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                {t.proposeTestsAddBtn}
            </motion.button>

            {/* Stats */}
            <motion.div
                variants={itemVariants}
                className="px-4 py-3 bg-(--surface-muted) rounded-2xl border border-(--accent)/25"
            >
                <p className="text-sm text-(--text)">
                    <strong>{t.proposeTestsTotal}</strong> {fields.length}
                </p>
            </motion.div>
        </motion.div>
    );
}
