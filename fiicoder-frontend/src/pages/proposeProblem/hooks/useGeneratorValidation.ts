import { useState, useCallback, useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { toast } from 'sonner';
import type { GeneratorValidationError, ProposeProblemForm } from '../types/proposeProblem';
import { validateGeneratorScript } from '../utils/generatorValidator';

export type ValidationStatus = 'idle' | 'validating' | 'success' | 'error';

export function useGeneratorValidation(script: string) {
    const { getValues } = useFormContext<ProposeProblemForm>();
    const [status, setStatus] = useState<ValidationStatus>('idle');
    const [errors, setErrors] = useState<GeneratorValidationError[]>([]);

    // Clear stale validation results whenever the script content changes.
    useEffect(() => {
        setStatus('idle');
        setErrors([]);
    }, [script]);

    const handleSave = useCallback(() => {
        setStatus('validating');
        setErrors([]);

        // Small delay so the spinner is visible — the check itself is sync.
        const handle = setTimeout(() => {
            const result = validateGeneratorScript(script);
            if (result.valid) {
                setStatus('success');
                setErrors([]);
                toast.success('Script valid! Sintaxă și referințe OK.', { duration: 3000 });
            } else {
                setStatus('error');
                setErrors(result.errors);
                const count = result.errors.length;
                const preview = result.errors
                    .slice(0, 3)
                    .map(e => `• L${e.line}:${e.col} — ${e.message}`)
                    .join('\n');
                const suffix = count > 3 ? `\n... și încă ${count - 3} ${count - 3 === 1 ? 'eroare' : 'erori'}` : '';
                toast.error(`${count} ${count === 1 ? 'eroare găsită' : 'erori găsite'} în script`, {
                    description: preview + suffix,
                    duration: 8000,
                });
            }
        }, 150);

        return () => clearTimeout(handle);
    }, [script, getValues]);

    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                handleSave();
            }
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [handleSave]);

    return { status, errors, handleSave };
}
