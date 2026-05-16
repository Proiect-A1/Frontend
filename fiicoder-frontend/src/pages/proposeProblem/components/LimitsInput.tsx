import { Controller, useFormContext } from 'react-hook-form';
import type { ProposeProblemForm } from '../types/proposeProblem';

export default function LimitsInput() {
    const { control } = useFormContext<ProposeProblemForm>();

    return (
        <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
                <label className="text-(--text) font-semibold text-sm">Timp Limită (s)</label>
                <Controller
                    name="timeLimit"
                    control={control}
                    render={({ field }) => (
                        <input
                            {...field}
                            type="number"
                            min="1"
                            max="30"
                            step="0.1"
                            className="w-full rounded-2xl border border-(--accent)/25 bg-(--surface-input) px-3 py-2 text-sm text-(--text) outline-none transition hover:border-(--accent)"
                        />
                    )}
                />
            </div>
            <div className="space-y-2">
                <label className="text-(--text) font-semibold text-sm">Memorie Limită (MB)</label>
                <Controller
                    name="memoryLimit"
                    control={control}
                    render={({ field }) => (
                        <input
                            {...field}
                            type="number"
                            min="32"
                            max="512"
                            step="1"
                            className="w-full rounded-2xl border border-(--accent)/25 bg-(--surface-input) px-3 py-2 text-sm text-(--text) outline-none transition hover:border-(--accent)"
                        />
                    )}
                />
            </div>
        </div>
    );
}

