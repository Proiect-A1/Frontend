import { lazy, type ComponentType } from 'react';

// Retry pentru import-uri dinamice: dupa un deploy, indexul vechi tine in
// memorie hash-urile vechi, iar fetch-ul pentru chunk-ul nou poate da 404
// pana cand reteaua/CDN-ul propaga. Reincercam de cateva ori inainte sa
// lasam EroareBoundary sa decida.
export function lazyWithRetry<T extends ComponentType<unknown>>(
    factory: () => Promise<{ default: T }>,
    attempts = 3,
    backoffMs = 400,
) {
    return lazy(async () => {
        let lastError: unknown;
        for (let attempt = 0; attempt < attempts; attempt += 1) {
            try {
                return await factory();
            } catch (error) {
                lastError = error;
                if (attempt < attempts - 1) {
                    await new Promise((resolve) =>
                        setTimeout(resolve, backoffMs * (attempt + 1)),
                    );
                }
            }
        }
        throw lastError;
    });
}
