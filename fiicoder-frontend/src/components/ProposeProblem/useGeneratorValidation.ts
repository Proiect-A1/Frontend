import { useState, useCallback, useEffect } from 'react';
import type { GeneratorValidationError } from '../../types/proposeProblem';

export type ValidationStatus = 'idle' | 'validating' | 'success' | 'error';

export function useGeneratorValidation(script: string) {
    const [status, setStatus] = useState<ValidationStatus>('idle');
    const [errors, setErrors] = useState<GeneratorValidationError[]>([]);

    const handleSave = useCallback(async () => {
        setStatus('validating');
        setErrors([]);

        try {
            // Mock API call
            await new Promise((resolve) => setTimeout(resolve, 1200));

            if (script.trim().length === 0) {
                setStatus('error');
                setErrors([{ line: 1, col: 1, message: 'Scriptul de generare este gol.' }]);
                return;
            }

            const mockSuccess = script.length > 10;
            if (mockSuccess) {
                setStatus('success');
                setErrors([]);
            } else {
                setStatus('error');
                setErrors([
                    { line: 1, col: 1, message: 'Scriptul este prea scurt. Adaugă comenzi de generare.' },
                ]);
            }
        } catch {
            setStatus('error');
            setErrors([{ line: 0, col: 0, message: 'Eroare de conexiune la server.' }]);
        }
    }, [script]);

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
