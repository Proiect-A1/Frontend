import { useCallback, useEffect, useRef, useState } from 'react';
import * as FlexLayout from 'flexlayout-react';
import { storage, STORAGE_KEYS } from '../../../utils/storage';

// Default FlexLayout configuration for the problem workspace. Pure function of
// the current UI language (tab names are localized).
function getDefaultLayout(currentLang: string) {
    return {
        global: {
            tabSetTabStripHeight: 36,
            tabEnableClose: false,
            tabEnableRename: false,
            splitterSize: 8,
            tabSetHeaderHeight: 36,
            tabSetEnableTabStrip: true,
            tabSetEnableMaximize: true,
            tabSetMinWidth: 160,
            tabSetMinHeight: 100,
        },
        borders: [],
        layout: {
            type: 'row',
            weight: 100,
            children: [
                // ── Left: Description + Notes + Paint ─────────────
                {
                    type: 'tabset',
                    weight: 30,
                    children: [
                        { type: 'tab', name: currentLang === 'RO' ? 'Descriere' : 'Description', component: 'description' },
                        { type: 'tab', name: currentLang === 'RO' ? 'Notițe' : 'Notes', component: 'notes' },
                        { type: 'tab', name: currentLang === 'RO' ? 'Desen' : 'Paint', component: 'paint' },
                    ],
                },
                // ── Middle: Result (top) + Submissions + Diff (bottom)
                {
                    type: 'row',
                    weight: 35,
                    children: [
                        {
                            type: 'tabset',
                            weight: 55,
                            children: [
                                { type: 'tab', name: currentLang === 'RO' ? 'Rezultat' : 'Result', component: 'testresult' },
                            ],
                        },
                        {
                            type: 'tabset',
                            weight: 45,
                            children: [
                                { type: 'tab', name: currentLang === 'RO' ? 'Submisii' : 'Submissions', component: 'submissions' },
                                { type: 'tab', name: 'Diff', component: 'diff' },
                            ],
                        },
                    ],
                },
                // ── Right: Editor ──────────────────────────────────
                {
                    type: 'tabset',
                    weight: 35,
                    children: [
                        { type: 'tab', name: currentLang === 'RO' ? 'Cod' : 'Code', component: 'editor' },
                    ],
                },
            ],
        },
    };
}

/**
 * Owns the FlexLayout model for the problem workspace: restores a saved layout
 * from storage (falling back to the localized default), persists changes, blocks
 * tab renames, and supports resetting to the default.
 */
export function useEditorLayout(lang: string) {
    // Keep latest lang in a ref so resetLayout stays referentially stable while
    // still producing a layout in the current language.
    const langRef = useRef(lang);
    useEffect(() => { langRef.current = lang; }, [lang]);

    const [model, setModel] = useState(() => {
        try {
            const saved = storage.get(STORAGE_KEYS.problemLayout);
            if (saved) {
                return FlexLayout.Model.fromJson(JSON.parse(saved));
            }
        } catch {
            // If loading fails, use default
        }
        return FlexLayout.Model.fromJson(getDefaultLayout(lang));
    });

    // Called BEFORE action is applied — only used to block rename
    const handleLayoutAction = useCallback((action: FlexLayout.Action) => {
        return action.type === 'FlexLayout_RenameTab' ? undefined : action;
    }, []);

    // Called AFTER the model is updated — correct place to persist the layout
    const handleLayoutSave = useCallback((updatedModel: FlexLayout.Model) => {
        try {
            storage.set(STORAGE_KEYS.problemLayout, JSON.stringify(updatedModel.toJson()));
        } catch {
            // Silently fail if localStorage is unavailable
        }
    }, []);

    const resetLayout = useCallback(() => {
        storage.remove(STORAGE_KEYS.problemLayout);
        setModel(FlexLayout.Model.fromJson(getDefaultLayout(langRef.current)));
    }, []);

    return { model, handleLayoutAction, handleLayoutSave, resetLayout };
}
