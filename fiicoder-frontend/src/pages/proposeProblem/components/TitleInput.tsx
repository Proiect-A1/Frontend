import { Controller, useFormContext } from 'react-hook-form';
import { useT } from '../../../language/Language';
import type { ProposeProblemForm } from '../types/proposeProblem';

export default function TitleInput() {
    const { control } = useFormContext<ProposeProblemForm>();
    const t = useT();

    return (
        <div className="space-y-2">
            <label className="text-(--text) font-semibold text-sm">{t.proposeTitleLabel}</label>
            <Controller
                name="title"
                control={control}
                render={({ field }) => (
                    <input
                        {...field}
                        type="text"
                        placeholder={t.proposeTitlePlaceholder}
                        className="w-full rounded-2xl border border-(--accent)/25 bg-(--surface-input) px-3 py-2 text-sm text-(--text) placeholder:text-(--text-muted) outline-none transition hover:border-(--accent)"
                    />
                )}
            />
        </div>
    );
}
