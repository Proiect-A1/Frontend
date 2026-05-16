import { Controller, useFormContext } from 'react-hook-form';
import type { ProposeProblemForm } from '../types/proposeProblem';

export default function TitleInput() {
    const { control } = useFormContext<ProposeProblemForm>();

    return (
        <div className="space-y-2">
            <label className="text-(--text) font-semibold text-sm">Titlu</label>
            <Controller
                name="title"
                control={control}
                render={({ field }) => (
                    <input
                        {...field}
                        type="text"
                        placeholder="Titlu descriptiv al problemei"
                        className="w-full rounded-2xl border border-(--accent)/25 bg-(--surface-input) px-3 py-2 text-sm text-(--text) placeholder:text-(--text-muted) outline-none transition hover:border-(--accent)"
                    />
                )}
            />
        </div>
    );
}

