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
            <div
                style={{
                    minHeight: '100dvh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '24px',
                    background: 'var(--bg-color, #090812)',
                    color: 'var(--text, #e5e9f0)',
                    fontFamily: 'system-ui, -apple-system, sans-serif',
                }}
            >
                <div
                    style={{
                        maxWidth: '540px',
                        width: '100%',
                        border: '2px solid var(--accent, #ff5eb6)',
                        borderRadius: '24px',
                        padding: '28px',
                        background: 'rgba(0,0,0,0.25)',
                        backdropFilter: 'blur(6px)',
                    }}
                >
                    <h1 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '12px' }}>
                        {chunkProblem ? 'Versiune nouă disponibilă' : 'Ceva a mers prost'}
                    </h1>
                    <p style={{ marginBottom: '20px', opacity: 0.85 }}>
                        {chunkProblem
                            ? 'Aplicația a primit un update. Reîncărcăm pagina ca să primești ultima versiune.'
                            : 'A apărut o eroare neașteptată. Poți reîncerca sau te poți întoarce la pagina principală.'}
                    </p>
                    <details
                        style={{
                            marginBottom: '20px',
                            fontSize: '12px',
                            opacity: 0.6,
                        }}
                    >
                        <summary style={{ cursor: 'pointer' }}>Detalii tehnice</summary>
                        <pre
                            style={{
                                marginTop: '8px',
                                whiteSpace: 'pre-wrap',
                                wordBreak: 'break-word',
                            }}
                        >
                            {error.name}: {error.message}
                        </pre>
                    </details>
                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                        <button
                            onClick={this.handleReload}
                            style={{
                                padding: '10px 18px',
                                borderRadius: '999px',
                                border: '2px solid var(--accent, #ff5eb6)',
                                background:
                                    'color-mix(in srgb, var(--accent, #ff5eb6) 20%, transparent)',
                                color: 'inherit',
                                fontWeight: 700,
                                cursor: 'pointer',
                            }}
                        >
                            Reîncarcă pagina
                        </button>
                        <button
                            onClick={this.handleReset}
                            style={{
                                padding: '10px 18px',
                                borderRadius: '999px',
                                border: '2px solid rgba(255,255,255,0.2)',
                                background: 'transparent',
                                color: 'inherit',
                                fontWeight: 700,
                                cursor: 'pointer',
                            }}
                        >
                            Înapoi la pagina principală
                        </button>
                    </div>
                </div>
            </div>
        );
    }
}
