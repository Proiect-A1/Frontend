import { useState, useEffect, useRef, useCallback } from 'react';

export function useMonacoContextMenu() {
    const editorRef = useRef<any>(null);
    const [ctxMenu, setCtxMenu] = useState<{ x: number; y: number } | null>(null);

    const closeCtxMenu = useCallback(() => setCtxMenu(null), []);

    useEffect(() => {
        if (!ctxMenu) return;
        const handler = () => closeCtxMenu();
        document.addEventListener('mousedown', handler);
        document.addEventListener('keydown', handler);
        return () => {
            document.removeEventListener('mousedown', handler);
            document.removeEventListener('keydown', handler);
        };
    }, [ctxMenu, closeCtxMenu]);

    const trigger = useCallback((actionId: string) => {
        const editor = editorRef.current;
        const selection = editor?.getSelection();
        const position = editor?.getPosition();
        closeCtxMenu();
        requestAnimationFrame(() => {
            editor?.focus();
            if (selection) editor?.setSelection(selection);
            else if (position) editor?.setPosition(position);
            editor?.trigger('ctx', actionId, null);
        });
    }, [closeCtxMenu]);

    const setupContextMenu = useCallback((editor: any) => {
        editorRef.current = editor;
        editor.getDomNode()?.addEventListener('contextmenu', (e: MouseEvent) => {
            e.preventDefault();
            setCtxMenu({ x: e.clientX, y: e.clientY });
        });
    }, []);

    const actions = [
        { label: 'Change All Occurrences', hint: 'Ctrl+F2', run: () => trigger('editor.action.changeAll') },
        { separator: true },
        { label: 'Cut',  run: () => trigger('editor.action.clipboardCutAction') },
        { label: 'Copy', run: () => trigger('editor.action.clipboardCopyAction') },
        {
            label: 'Paste',
            run: async () => {
                closeCtxMenu();
                const editor = editorRef.current;
                if (!editor) return;
                try {
                    const text = await navigator.clipboard.readText();
                    const sel = editor.getSelection();
                    if (text && sel) {
                        editor.executeEdits('paste', [{ range: sel, text }]);
                        editor.focus();
                    }
                } catch {}
            },
        },
        { separator: true },
        { label: 'Command Palette', hint: 'F1', run: () => trigger('editor.action.quickCommand') },
    ] as const;

    const contextMenuEl = ctxMenu ? (
        <div
            className="fixed z-[9999] min-w-[200px] bg-(--surface-dropdown) border border-(--accent)/20 rounded-lg shadow-xl py-1 text-sm"
            style={{ left: ctxMenu.x, top: ctxMenu.y }}
            onMouseDown={e => e.stopPropagation()}
        >
            {actions.map((action, i) =>
                'separator' in action ? (
                    <div key={i} className="h-px bg-(--accent)/15 my-1" />
                ) : (
                    <button
                        key={action.label}
                        className="w-full flex items-center justify-between px-3 py-1.5 text-left text-(--text-h) hover:bg-(--accent)/15 transition-colors"
                        onMouseDown={e => { e.stopPropagation(); action.run(); }}
                    >
                        <span>{action.label}</span>
                        {'hint' in action && action.hint && (
                            <span className="ml-8 text-(--text-muted) text-xs">{action.hint}</span>
                        )}
                    </button>
                )
            )}
        </div>
    ) : null;

    return { setupContextMenu, contextMenuEl };
}
