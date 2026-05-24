import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
    children: ReactNode;
}

interface State {
    error: Error | null;
}

// Cheia sub care marcam un reload deja incercat (evitam bucle infinite la
// chunk-load-fail dupa deploy).
const RELOAD_FLAG_KEY = 'fiicoder_chunk_reload_attempted';

function isChunkLoadError(error: unknown): boolean {
    if (!(error instanceof Error)) return false;
    const message = error.message || '';
    const name = error.name || '';
    return (
        name === 'ChunkLoadError' ||
        /Loading chunk [\d]+ failed/i.test(message) ||
        /Failed to fetch dynamically imported module/i.test(message) ||
        /Importing a module script failed/i.test(message) ||
        /Unable to preload CSS/i.test(message)
    );
}

export default class ErrorBoundary extends Component<Props, State> {
    state: State = { error: null };

    static getDerivedStateFromError(error: Error): State {
        return { error };
    }

    componentDidCatch(error: Error, info: ErrorInfo) {
        // Log local pentru diagnostic; in productie n-avem o destinatie pentru telemetrie.
        console.error('[ErrorBoundary] caught render error:', error, info);

        if (isChunkLoadError(error)) {
            try {
                const alreadyReloaded = sessionStorage.getItem(RELOAD_FLAG_KEY);
                if (!alreadyReloaded) {
                    sessionStorage.setItem(RELOAD_FLAG_KEY, '1');
                    window.location.reload();
                }
            } catch {
                // sessionStorage poate fi blocat in Safari private; cadem pe fallback UI.
            }
        }
    }

    private handleReset = () => {
        try {
            sessionStorage.removeItem(RELOAD_FLAG_KEY);
        } catch {
            // ignore
        }
        window.location.href = '/';
    };

    private handleReload = () => {
        try {
            sessionStorage.removeItem(RELOAD_FLAG_KEY);
        } catch {
            // ignore
        }
        window.location.reload();
    };

    render() {
        const { error } = this.state;
        if (!error) return this.props.children;

        const chunkProblem = isChunkLoadError(error);

        return (
            <div className="min-h-dvh flex items-center justify-center p-6 bg-(--bg) text-(--text)">
                <div className="w-full max-w-135 rounded-3xl border-2 border-(--accent) p-6 bg-(--surface-card)">
                    <h1 className="text-2xl font-black mb-3 text-(--text-h)">
                        {chunkProblem ? 'Versiune nouă disponibilă' : 'Ceva a mers prost'}
                    </h1>
                    <p className="mb-5 opacity-85">
                        {chunkProblem
                            ? 'Aplicația a primit un update. Reîncărcăm pagina ca să primești ultima versiune.'
                            : 'A apărut o eroare neașteptată. Poți reîncerca sau te poți întoarce la pagina principală.'}
                    </p>
                    <details className="mb-5 text-xs opacity-60">
                        <summary className="cursor-pointer">Detalii tehnice</summary>
                        <pre className="mt-2 whitespace-pre-wrap wrap-break-words">
                            {error.name}: {error.message}
                        </pre>
                    </details>
                    <div className="flex flex-wrap gap-3">
                        <button
                            onClick={this.handleReload}
                            className="px-4 py-2.5 rounded-full border-2 border-(--accent) bg-[color-mix(in_srgb,var(--accent,#ff5eb6)_20%,var(--surface-card,transparent))] text-(--text-h) font-bold"
                        >
                            Reîncarcă pagina
                        </button>
                        <button
                            onClick={this.handleReset}
                            className="px-4 py-2.5 rounded-full border-2 border-[color-mix(in_srgb,var(--text,#e5e9f0)_20%,transparent)] bg-[color-mix(in_srgb,var(--surface-card,transparent)_40%,transparent)] text-(--text) font-bold"
                        >
                            Înapoi la pagina principală
                        </button>
                    </div>
                </div>
            </div>
        );
    }
}
