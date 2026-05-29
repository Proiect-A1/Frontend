import { useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';

/**
 * Keeps the active tab in sync with a URL query param so it survives a page
 * refresh, while a fresh navigation into the page (a link without the param)
 * naturally falls back to the default tab.
 *
 * The default tab is never written to the URL, keeping links clean. Unknown
 * values in the URL fall back to the default. Tab changes use `replace` so the
 * browser back button leaves the page instead of stepping through tabs.
 *
 * @param defaultTab  value used when the param is absent or invalid
 * @param options.paramName  query param to read/write (default: `'tab'`)
 * @param options.validValues  optional allow-list; anything else falls back to default
 */
export function useTabParam<T extends string>(
    defaultTab: T,
    options?: { paramName?: string; validValues?: readonly T[] },
): [T, (tab: T) => void] {
    const paramName = options?.paramName ?? 'tab';
    const validValues = options?.validValues;
    const [searchParams, setSearchParams] = useSearchParams();

    const raw = searchParams.get(paramName);
    const isValid =
        raw != null && (!validValues || (validValues as readonly string[]).includes(raw));
    const activeTab = (isValid ? raw : defaultTab) as T;

    const setActiveTab = useCallback(
        (tab: T) => {
            setSearchParams(
                (prev) => {
                    const next = new URLSearchParams(prev);
                    if (tab === defaultTab) {
                        next.delete(paramName);
                    } else {
                        next.set(paramName, tab);
                    }
                    return next;
                },
                { replace: true },
            );
        },
        [defaultTab, paramName, setSearchParams],
    );

    return [activeTab, setActiveTab];
}
