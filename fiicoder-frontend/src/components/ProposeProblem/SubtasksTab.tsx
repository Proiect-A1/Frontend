import { Controller, useFieldArray, useFormContext } from 'react-hook-form';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { ProposeProblemForm } from '../../types/proposeProblem';
import { itemVariants, staggerConfig } from '../../utils/motionConfig';

export default function SubtasksTab() {
    const { control, watch } = useFormContext<ProposeProblemForm>();
    const { fields, append, remove } = useFieldArray({ control, name: 'subtasks' });
    const tests = watch('tests');

    const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

    const toggleExpand = (id: string) => {
        setExpandedIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const expandAll = () => setExpandedIds(new Set(fields.map((f) => f.id)));
    const collapseAll = () => setExpandedIds(new Set());

    const addSubtask = () => {
        const newId = `subtask_${Date.now()}`;
        append({ id: newId, title: '', points: 10, testIds: [] });
        setExpandedIds((prev) => new Set(prev).add(newId));
    };

    // Get manual tests for a subtask
    const getManualTestsForSubtask = (testIds: string[]) => {
        return tests.filter(
            (t) => testIds.includes(t.id) && t.source === 'manual',
        );
    };

    const getGeneratedTestsForSubtask = (testIds: string[]) => {
        return tests.filter(
            (t) => testIds.includes(t.id) && t.source === 'generated',
        );
    };

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: staggerConfig } }}
            className="space-y-4"
        >
            {/* Header with actions */}
            <motion.div
                variants={itemVariants}
                className="flex items-center justify-between flex-wrap gap-3"
            >
                <div>
                    <p className="text-sm text-(--text-muted)">
                        <strong>{fields.length}</strong> subtask-uri · <strong>
                            {fields.reduce((s, f) => s + (f.points || 0), 0)}
                        </strong> puncte total
                    </p>
                </div>
                <div className="flex gap-2">
                    <button
                        type="button"
                        onClick={expandAll}
                        className="px-2.5 py-1 text-xs rounded-lg border border-(--accent)/30 text-(--text-muted) hover:bg-(--accent)/10 transition-colors"
                    >
                        Expandează tot
                    </button>
                    <button
                        type="button"
                        onClick={collapseAll}
                        className="px-2.5 py-1 text-xs rounded-lg border border-(--accent)/30 text-(--text-muted) hover:bg-(--accent)/10 transition-colors"
                    >
                        Restrânge tot
                    </button>
                </div>
            </motion.div>

            {/* Info */}
            <motion.div
                variants={itemVariants}
                className="p-4 bg-(--surface-muted) rounded-xl border border-(--accent)/20"
            >
                <p className="text-sm text-(--text)">
                    <strong>Instrucțiuni:</strong> Fiecare subtask este un card expandabil.
                    Testele manuale sunt mereu vizibile, iar cele generate apar doar după
                    ce rulezi o sursă în tab-ul „Rulează".
                </p>
            </motion.div>

            {/* Subtask Cards */}
            {fields.length === 0 ? (
                <motion.div
                    variants={itemVariants}
                    className="text-center py-12 text-(--text-muted)"
                >
                    Nu ai adăugat niciun subtask. Fă clic pe butonul de mai jos.
                </motion.div>
            ) : (
                <div className="space-y-2">
                    {fields.map((field, index) => {
                        const isExpanded = expandedIds.has(field.id);
                        const manualTests = getManualTestsForSubtask(field.testIds || []);
                        const generatedTests = getGeneratedTestsForSubtask(field.testIds || []);
                        const hasTests = manualTests.length > 0 || generatedTests.length > 0;

                        return (
                            <motion.div
                                key={field.id}
                                variants={itemVariants}
                                className="rounded-xl border border-(--accent)/20 overflow-hidden"
                            >
                                {/* Subtask Header (clickable) */}
                                <div className="flex items-center bg-(--surface-muted) hover:bg-(--accent)/8 transition-colors">
                                    <button
                                        type="button"
                                        onClick={() => toggleExpand(field.id)}
                                        className="flex-1 flex items-center gap-3 px-4 py-3 text-left"
                                    >
                                        <motion.span
                                            animate={{ rotate: isExpanded ? 90 : 0 }}
                                            transition={{ duration: 0.15 }}
                                            className="text-(--text-muted) text-xs"
                                        >
                                            ▶
                                        </motion.span>
                                        <span className="font-semibold text-sm text-(--text-h)">
                                            {field.title || `Subtask ${index + 1}`}
                                        </span>
                                        {hasTests && (
                                            <span className="text-xs text-(--text-muted)">
                                                ({manualTests.length} manual{generatedTests.length > 0 ? `, ${generatedTests.length} generat` : ''})
                                            </span>
                                        )}
                                    </button>

                                    <span className="text-sm font-bold text-(--accent) px-3">
                                        {field.points}p
                                    </span>

                                    <button
                                        type="button"
                                        onClick={() => remove(index)}
                                        className="p-2 mr-2 text-red-400 hover:bg-red-500/20 rounded transition-colors"
                                        title="Șterge subtask"
                                    >
                                        🗑️
                                    </button>
                                </div>

                                {/* Expanded Content */}
                                <AnimatePresence>
                                    {isExpanded && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.2 }}
                                            className="overflow-hidden"
                                        >
                                            <div className="p-4 space-y-4 border-t border-(--accent)/15">
                                                {/* Editable Fields */}
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div className="space-y-1">
                                                        <label className="text-xs text-(--text-muted) font-semibold">
                                                            Titlu Subtask
                                                        </label>
                                                        <Controller
                                                            name={`subtasks.${index}.title`}
                                                            control={control}
                                                            render={({ field }) => (
                                                                <input
                                                                    {...field}
                                                                    placeholder="ex: Brute Force N≤100"
                                                                    className="w-full px-3 py-1.5 bg-(--surface-card) border border-(--accent)/25 rounded-lg text-sm text-(--text) focus:outline-none focus:[box-shadow:0_0_0_2px_color-mix(in_srgb,var(--accent)_50%,transparent)] transition-all"
                                                                />
                                                            )}
                                                        />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <label className="text-xs text-(--text-muted) font-semibold">
                                                            Puncte
                                                        </label>
                                                        <Controller
                                                            name={`subtasks.${index}.points`}
                                                            control={control}
                                                            render={({ field }) => (
                                                                <input
                                                                    {...field}
                                                                    type="number"
                                                                    min="0"
                                                                    className="w-full px-3 py-1.5 bg-(--surface-card) border border-(--accent)/25 rounded-lg text-sm text-(--text) text-center focus:outline-none focus:[box-shadow:0_0_0_2px_color-mix(in_srgb,var(--accent)_50%,transparent)] transition-all"
                                                                    onChange={(e) =>
                                                                        field.onChange(parseInt(e.target.value) || 0)
                                                                    }
                                                                />
                                                            )}
                                                        />
                                                    </div>
                                                </div>

                                                {/* Associated Tests */}
                                                <div>
                                                    <label className="text-xs text-(--text-muted) font-semibold block mb-2">
                                                        Teste Asociate
                                                    </label>

                                                    {tests.length === 0 ? (
                                                        <p className="text-xs text-(--text-muted) italic">
                                                            Nu există teste. Adaugă teste manuale sau rulează generatorul.
                                                        </p>
                                                    ) : (
                                                        <div className="space-y-3">
                                                            {/* Manual Tests Section */}
                                                            {tests.filter((t) => t.source === 'manual').length > 0 && (
                                                                <div>
                                                                    <p className="text-xs text-green-400 font-semibold mb-1.5">
                                                                        📝 Manuale
                                                                    </p>
                                                                    <div className="flex flex-wrap gap-2">
                                                                        {tests
                                                                            .filter((t) => t.source === 'manual')
                                                                            .map((test) => {
                                                                                const isSelected = (field.testIds || []).includes(test.id);
                                                                                return (
                                                                                    <Controller
                                                                                        key={test.id}
                                                                                        name={`subtasks.${index}.testIds`}
                                                                                        control={control}
                                                                                        render={({ field: arrField }) => (
                                                                                            <button
                                                                                                type="button"
                                                                                                onClick={() => {
                                                                                                    const current = arrField.value || [];
                                                                                                    if (isSelected) {
                                                                                                        arrField.onChange(current.filter((id: string) => id !== test.id));
                                                                                                    } else {
                                                                                                        arrField.onChange([...current, test.id]);
                                                                                                    }
                                                                                                }}
                                                                                                className={`text-xs px-2.5 py-1 rounded-lg border transition-all font-mono ${
                                                                                                    isSelected
                                                                                                        ? 'bg-(--accent)/20 border-(--accent)/50 text-(--text-h)'
                                                                                                        : 'bg-transparent border-(--accent)/20 text-(--text-muted) hover:border-(--accent)/40'
                                                                                                }`}
                                                                                            >
                                                                                                {test.id}
                                                                                            </button>
                                                                                        )}
                                                                                    />
                                                                                );
                                                                            })}
                                                                    </div>
                                                                </div>
                                                            )}

                                                            {/* Generated Tests Section */}
                                                            {tests.filter((t) => t.source === 'generated').length > 0 && (
                                                                <div>
                                                                    <p className="text-xs text-blue-400 font-semibold mb-1.5">
                                                                        ⚙️ Generate
                                                                    </p>
                                                                    <div className="flex flex-wrap gap-2">
                                                                        {tests
                                                                            .filter((t) => t.source === 'generated')
                                                                            .map((test) => {
                                                                                const isSelected = (field.testIds || []).includes(test.id);
                                                                                return (
                                                                                    <Controller
                                                                                        key={test.id}
                                                                                        name={`subtasks.${index}.testIds`}
                                                                                        control={control}
                                                                                        render={({ field: arrField }) => (
                                                                                            <button
                                                                                                type="button"
                                                                                                onClick={() => {
                                                                                                    const current = arrField.value || [];
                                                                                                    if (isSelected) {
                                                                                                        arrField.onChange(current.filter((id: string) => id !== test.id));
                                                                                                    } else {
                                                                                                        arrField.onChange([...current, test.id]);
                                                                                                    }
                                                                                                }}
                                                                                                className={`text-xs px-2.5 py-1 rounded-lg border transition-all font-mono ${
                                                                                                    isSelected
                                                                                                        ? 'bg-blue-500/20 border-blue-500/50 text-blue-300'
                                                                                                        : 'bg-transparent border-blue-500/20 text-(--text-muted) hover:border-blue-500/40'
                                                                                                }`}
                                                                                            >
                                                                                                {test.id}
                                                                                            </button>
                                                                                        )}
                                                                                    />
                                                                                );
                                                                            })}
                                                                    </div>
                                                                </div>
                                                            )}

                                                            {/* No generated tests hint */}
                                                            {tests.filter((t) => t.source === 'generated').length === 0 && (
                                                                <p className="text-xs text-(--text-muted) italic">
                                                                    ⏳ Testele generate vor apărea după ce rulezi o sursă în tab-ul „Rulează".
                                                                </p>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Test Details Table (for associated tests) */}
                                                {hasTests && (
                                                    <div className="overflow-x-auto">
                                                        <table className="w-full text-xs">
                                                            <thead>
                                                                <tr className="border-b border-(--accent)/15">
                                                                    <th className="text-left text-(--text-muted) font-medium py-2 px-3">
                                                                        Test ID
                                                                    </th>
                                                                    <th className="text-left text-(--text-muted) font-medium py-2 px-3">
                                                                        Tip
                                                                    </th>
                                                                    <th className="text-right text-(--text-muted) font-medium py-2 px-3">
                                                                        Puncte
                                                                    </th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {[...manualTests, ...generatedTests].map((test) => (
                                                                    <tr
                                                                        key={test.id}
                                                                        className="border-b border-(--accent)/10 hover:bg-(--surface-muted)/50 transition-colors"
                                                                    >
                                                                        <td className="py-1.5 px-3 font-mono text-(--text)">
                                                                            {test.id}
                                                                        </td>
                                                                        <td className="py-1.5 px-3">
                                                                            <span
                                                                                className={`px-2 py-0.5 rounded text-xs font-semibold ${
                                                                                    test.source === 'manual'
                                                                                        ? 'bg-green-500/15 text-green-400'
                                                                                        : 'bg-blue-500/15 text-blue-400'
                                                                                }`}
                                                                            >
                                                                                {test.source === 'manual' ? 'Manual' : 'Generat'}
                                                                            </span>
                                                                        </td>
                                                                        <td className="py-1.5 px-3 text-right text-(--text)">
                                                                            {test.points ?? '—'}
                                                                        </td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                )}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        );
                    })}
                </div>
            )}

            {/* Add Subtask Button */}
            <motion.button
                variants={itemVariants}
                type="button"
                onClick={addSubtask}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border-2 border-dashed border-(--accent)/50 rounded-xl text-(--text-h) hover:border-(--accent) hover:bg-(--accent)/10 transition-colors font-semibold"
            >
                ➕ Adaugă Subtask
            </motion.button>

            {/* Total Stats */}
            <motion.div
                variants={itemVariants}
                className="p-4 bg-(--surface-muted) rounded-xl border border-(--accent)/25 flex items-center justify-between"
            >
                <p className="text-sm text-(--text)">
                    <strong>Total subtask-uri:</strong> {fields.length}
                </p>
                <p className={`text-sm font-bold ${
                    fields.reduce((s, f) => s + (f.points || 0), 0) === 100 ? 'text-green-400' : 'text-yellow-400'
                }`}>
                    {fields.reduce((s, f) => s + (f.points || 0), 0)}/100 puncte
                </p>
            </motion.div>
        </motion.div>
    );
}
