import { useState, useCallback, useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import type { GeneratorValidationError, ProposeProblemForm } from '../types/proposeProblem';
import { validateGeneratorScript } from '../utils/generatorValidator';

export type ValidationStatus = 'idle' | 'validating' | 'success' | 'error';

export function useGeneratorValidation(script: string) {
    const { getValues } = useFormContext<ProposeProblemForm>();
    const [status, setStatus] = useState<ValidationStatus>('idle');
    const [errors, setErrors] = useState<GeneratorValidationError[]>([]);

    const handleSave = useCallback(() => {
        setStatus('validating');
        setErrors([]);

        // Small delay so the spinner is visible — the check itself is sync.
        const handle = setTimeout(() => {
            const files = getValues('files') ?? [];
            const result = validateGeneratorScript(script, files);
            if (result.valid) {
                setStatus('success');
                setErrors([]);
            } else {
                setStatus('error');
                setErrors(result.errors);
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
