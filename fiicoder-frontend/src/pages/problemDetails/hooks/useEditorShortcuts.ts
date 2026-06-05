import { useEffect, useRef } from 'react';

interface UseEditorShortcutsParams {
    isAuthenticated: boolean;
    codeRef: React.MutableRefObject<string>;
    onSubmit: (e: React.FormEvent) => void | Promise<void>;
}

/**
 * Wires editor-wide keyboard behavior:
 *  - Ctrl/Cmd+Enter submits (when authenticated)
 *  - beforeunload warns if there is unsaved code
 *
 * `onSubmit` is read through a ref so the keydown listener always calls the
 * latest handler without re-binding on every render.
 */
export function useEditorShortcuts({ isAuthenticated, codeRef, onSubmit }: UseEditorShortcutsParams) {
    const submitRef = useRef(onSubmit);
    useEffect(() => { submitRef.current = onSubmit; }, [onSubmit]);

    useEffect(() => {
        const onBeforeUnload = (e: BeforeUnloadEvent) => {
            if (codeRef.current.trim()) {
                e.preventDefault();
            }
        };
        window.addEventListener('beforeunload', onBeforeUnload);
        return () => window.removeEventListener('beforeunload', onBeforeUnload);
    }, [codeRef]);

    useEffect(() => {
        const onKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && isAuthenticated) {
                e.preventDefault();
                submitRef.current?.({ preventDefault: () => {} } as React.FormEvent);
            }
        };
        document.addEventListener('keydown', onKeyDown);
        return () => document.removeEventListener('keydown', onKeyDown);
    }, [isAuthenticated]);
}
