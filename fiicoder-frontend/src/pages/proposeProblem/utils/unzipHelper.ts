import JSZip from 'jszip';
import type { ProblemFile, TestCase, FileCategory, ProposeProblemForm } from '../types/proposeProblem';
import { packTranslation } from '../../../utils/translationPacker';

export type ZipWarningCode =
    | 'NO_METADATA'
    | 'INVALID_METADATA'
    | 'IMAGE_IN_STATEMENT'
    | 'NO_STATEMENT'
    | 'INVALID_TIME_LIMIT'
    | 'INVALID_MEMORY_LIMIT'
    | 'EMPTY_TITLE'
    | 'TITLE_TOO_LONG'
    | 'INVALID_DIFFICULTY'
    | 'UNPARSEABLE_LIMITS'
    | 'UNKNOWN_TAGS'
    | 'ORPHAN_TEST_FILES'
    | 'INCOMPLETE_TEST_PAIRS'
    | 'TOO_MANY_TESTS'
    | 'FILES_IN_ROOT'
    | 'LARGE_CONTENT';

export interface ZipWarning {
    code: ZipWarningCode;
    message: string;
}

export class ZipImportError extends Error {
    code: string;
    constructor(message: string, code: string) {
        super(message);
        this.name = 'ZipImportError';
        this.code = code;
    }
}

const VALID_DIFFICULTIES = new Set(['easy', 'medium', 'hard', 'contest']);
const DIFFICULTY_FROM_NUMBER: Record<number, ProposeProblemForm['difficulty']> = {
    1: 'easy', 2: 'medium', 3: 'hard', 4: 'contest',
};

// Max total uncompressed text content we'll load without warning (50 MB)
const LARGE_CONTENT_THRESHOLD = 50 * 1024 * 1024;

function detectWrapperFolder(zip: JSZip): string | null {
    const entries = Object.keys(zip.files).filter(p => !zip.files[p].dir);
    if (entries.length === 0) return null;
    const firstSegment = entries[0].split('/')[0];
    if (entries.every(p => p.startsWith(firstSegment + '/'))) return firstSegment;
    return null;
}

interface ParseResult {
    files: ProblemFile[];
    tests: TestCase[];
    generatorScript: string;
    orphanTestFiles: string[];
    rootFiles: string[];
    totalBytes: number;
}

async function parseZipContents(zip: JSZip): Promise<ParseResult> {
    const files: ProblemFile[] = [];
    const tests: TestCase[] = [];
    let generatorScript = '';
    const orphanTestFiles: string[] = [];
    const rootFiles: string[] = [];
    let totalBytes = 0;

    for (const [relativePath, zipEntry] of Object.entries(zip.files)) {
        if (zipEntry.dir) continue;

        // Detect encrypted entries (JSZip throws a recognisable message)
        // We probe lazily — if we hit it, we re-throw as a typed error.

        // Files placed directly in files/ (not in a subfolder) are ignored by the sandbox
        if (/^files\/[^/]+$/.test(relativePath)) {
            rootFiles.push(relativePath.replace('files/', ''));
            continue;
        }

        const filesMatch = relativePath.match(/^files\/([^/]+)\/([^/]+)$/);
        if (filesMatch) {
            const category = filesMatch[1];
            const name = filesMatch[2];
            let content: string;
            try {
                content = await zipEntry.async('string');
            } catch (e) {
                const msg = e instanceof Error ? e.message : '';
                if (msg.toLowerCase().includes('encrypt') || msg.toLowerCase().includes('password')) {
                    throw new ZipImportError(
                        'Arhiva este protejată cu parolă. Dezarhivează și re-arhivează fără parolă.',
                        'ENCRYPTED',
                    );
                }
                throw e;
            }
            totalBytes += content.length;

            if (category === 'raw_tests') {
                const testMatch = name.match(/^(.+)\.(in|ok|out)$/);
                if (testMatch) {
                    const stem = testMatch[1];
                    const extension = testMatch[2];
                    let test = tests.find(t => t.id === stem);
                    if (!test) {
                        test = { id: stem, input: '', output: '', subtaskIds: [], source: 'manual' };
                        tests.push(test);
                    }
                    if (extension === 'in') test.input = content;
                    else if (extension === 'ok' || extension === 'out') test.output = content;
                } else {
                    orphanTestFiles.push(name);
                }
            } else if (['sources', 'checkers', 'validators', 'generators', 'interactors'].includes(category)) {
                files.push({
                    id: `${category}-${name}-${Date.now()}`,
                    name,
                    size: content.length,
                    category: category as FileCategory,
                    content,
                });
            }
        }

        if (relativePath === 'metadata/tests.gen') {
            generatorScript = await zipEntry.async('string');
            totalBytes += generatorScript.length;
        }
    }

    tests.sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true, sensitivity: 'base' }));
    return { files, tests, generatorScript, orphanTestFiles, rootFiles, totalBytes };
}

export async function extractProblemZip(zipUrl: string): Promise<{ files: ProblemFile[]; tests: TestCase[]; generatorScript: string }> {
    const response = await fetch(zipUrl);
    if (!response.ok) {
        if (response.status === 403 || response.status === 401) {
            throw new Error('Link-ul de descărcare a expirat sau accesul a fost refuzat. Reîncarcă pagina.');
        }
        if (response.status === 404) {
            throw new Error('Arhiva ZIP nu a fost găsită pe server. Este posibil să nu fi fost încărcată încă.');
        }
        throw new Error(`Descărcarea arhivei a eșuat (HTTP ${response.status}).`);
    }
    let zip: JSZip;
    try {
        zip = await JSZip.loadAsync(await response.blob());
    } catch (err) {
        const msg = err instanceof Error ? err.message : '';
        if (msg.includes('compression') || msg.includes('unknown')) {
            throw new Error('Arhiva folosește un algoritm de compresie neacceptat.');
        }
        throw new Error('Arhiva ZIP este coruptă sau nu poate fi citită.');
    }
    const { files, tests, generatorScript } = await parseZipContents(zip);
    return { files, tests, generatorScript };
}

export async function extractProblemZipFromBlob(
    blob: Blob,
    availableTagTitles?: string[],
): Promise<{ form: ProposeProblemForm; warnings: ZipWarning[] }> {
    let zip: JSZip;
    try {
        zip = await JSZip.loadAsync(blob);
    } catch (err) {
        const msg = err instanceof Error ? err.message : '';
        if (msg.includes('compression') || msg.includes('unknown')) {
            throw new ZipImportError(
                'Arhiva folosește un algoritm de compresie neacceptat. Recreează ZIP-ul cu un client standard (WinRAR, 7-Zip, zip pe Linux/Mac).',
                'BAD_COMPRESSION',
            );
        }
        throw new ZipImportError('Arhiva ZIP este coruptă sau nu poate fi citită.', 'CORRUPTED');
    }

    const wrapper = detectWrapperFolder(zip);
    if (wrapper) {
        throw new ZipImportError(
            `Arhiva conține un folder wrapper „${wrapper}/". Conținutul trebuie să fie direct la rădăcina arhivei, nu într-un subfolder. Vezi butonul „Format ZIP" pentru structura corectă.`,
            'WRAPPER_FOLDER',
        );
    }

    const warnings: ZipWarning[] = [];
    let parseResult: ParseResult;
    try {
        parseResult = await parseZipContents(zip);
    } catch (err) {
        if (err instanceof ZipImportError) throw err;
        const msg = err instanceof Error ? err.message : '';
        if (msg.toLowerCase().includes('encrypt') || msg.toLowerCase().includes('password')) {
            throw new ZipImportError(
                'Arhiva este protejată cu parolă. Dezarhivează și re-arhivează fără parolă.',
                'ENCRYPTED',
            );
        }
        throw new ZipImportError('Eroare la citirea fișierelor din arhivă.', 'READ_ERROR');
    }

    const { files, tests, generatorScript, orphanTestFiles, rootFiles, totalBytes } = parseResult;

    if (totalBytes > LARGE_CONTENT_THRESHOLD) {
        const mb = (totalBytes / (1024 * 1024)).toFixed(0);
        warnings.push({ code: 'LARGE_CONTENT', message: `Conținutul dezarhivat este mare (~${mb} MB). Editorul poate fi mai lent. Ia în considerare generarea automată a testelor via tests.gen în loc de teste manuale.` });
    }

    let title = '';
    let timeLimit = 1;
    let memoryLimit = 256;
    let difficulty: ProposeProblemForm['difficulty'] = 'medium';
    let tags: string[] = [];
    let statement = '';

    const metadataEntry = zip.files['metadata/metadata.json'];
    if (!metadataEntry) {
        warnings.push({ code: 'NO_METADATA', message: 'Nu s-a găsit metadata/metadata.json — titlul, limitele și dificultatea vor fi cele implicite.' });
    } else {
        try {
            const meta = JSON.parse(await metadataEntry.async('string'));

            title = (meta.title || meta.problemId || '').trim();

            // time limit: snake_case = seconds, camelCase = milliseconds
            const rawTime = meta.time_limit ?? meta.timeLimit;
            if (rawTime != null) {
                const parsed = parseFloat(String(rawTime));
                if (isNaN(parsed)) {
                    warnings.push({ code: 'UNPARSEABLE_LIMITS', message: `Valoarea „time_limit" (${rawTime}) nu este un număr valid — s-a folosit 1s implicit.` });
                } else {
                    timeLimit = meta.time_limit != null ? parsed : parsed / 1000;
                }
            }

            // memory limit: both fields store bytes
            const rawMem = meta.memory_limit ?? meta.memoryLimit;
            if (rawMem != null) {
                const memBytes = parseInt(String(rawMem));
                if (isNaN(memBytes) || memBytes <= 0) {
                    warnings.push({ code: 'UNPARSEABLE_LIMITS', message: `Valoarea „memory_limit" (${rawMem}) nu este validă — s-au folosit 256 MB implicit.` });
                } else {
                    memoryLimit = Math.round(memBytes / (1024 * 1024));
                    if (memoryLimit === 0) {
                        warnings.push({ code: 'UNPARSEABLE_LIMITS', message: `„memory_limit" (${rawMem}) pare a fi în MB, nu în bytes — se așteaptă bytes (256 MB = 268435456). S-au folosit 256 MB implicit.` });
                        memoryLimit = 256;
                    }
                }
            }

            // difficulty: accept string name OR sandbox numeric level as fallback
            const rawDiff = String(meta.difficulty || '').toLowerCase().trim();
            if (VALID_DIFFICULTIES.has(rawDiff)) {
                difficulty = rawDiff as ProposeProblemForm['difficulty'];
            } else if (rawDiff) {
                // try numeric fallback (difficultyLevel field used by sandbox)
                const numericFallback = DIFFICULTY_FROM_NUMBER[parseInt(String(meta.difficultyLevel ?? ''))];
                if (numericFallback) {
                    difficulty = numericFallback;
                } else {
                    warnings.push({ code: 'INVALID_DIFFICULTY', message: `Dificultatea „${meta.difficulty}" nu este recunoscută (valori valide: EASY, MEDIUM, HARD, CONTEST) — s-a folosit MEDIUM implicit.` });
                }
            } else if (meta.difficultyLevel != null) {
                // difficulty field absent, but difficultyLevel present
                const numericFallback = DIFFICULTY_FROM_NUMBER[parseInt(String(meta.difficultyLevel))];
                if (numericFallback) difficulty = numericFallback;
            }

            // tags: must be an array of non-empty strings
            const rawTags = meta.tags;
            if (rawTags != null && !Array.isArray(rawTags)) {
                warnings.push({ code: 'INVALID_METADATA', message: `Câmpul „tags" din metadata nu este un array — etichetele au fost ignorate.` });
            } else {
                tags = (Array.isArray(rawTags) ? rawTags : [])
                    .filter((t: unknown): t is string => typeof t === 'string' && t.trim().length > 0)
                    .map((t: string) => t.trim());
            }

            if (!title) {
                warnings.push({ code: 'EMPTY_TITLE', message: 'metadata.json nu conține un titlu — completează câmpul „Titlu" manual înainte de submit.' });
            } else if (title.length > 100) {
                warnings.push({ code: 'TITLE_TOO_LONG', message: `Titlul depășește 100 de caractere (${title.length}) și va fi respins la submit.` });
            }

            if (timeLimit < 0.1 || timeLimit > 30) {
                warnings.push({ code: 'INVALID_TIME_LIMIT', message: `Limita de timp importată (${timeLimit}s) este în afara intervalului acceptat [0.1 – 30s] și va fi respinsă la submit.` });
            }
            if (memoryLimit < 16 || memoryLimit > 1024) {
                warnings.push({ code: 'INVALID_MEMORY_LIMIT', message: `Limita de memorie importată (${memoryLimit} MB) este în afara intervalului acceptat [16 – 1024 MB] și va fi respinsă la submit.` });
            }
        } catch (e) {
            if (e instanceof ZipImportError) throw e;
            warnings.push({ code: 'INVALID_METADATA', message: 'metadata.json conține JSON invalid — s-au folosit valorile implicite.' });
        }
    }

    // Tag validation + case normalization against platform tags
    if (availableTagTitles && availableTagTitles.length > 0 && tags.length > 0) {
        const canonicalMap = new Map(availableTagTitles.map(t => [t.toLowerCase(), t]));
        const validTags: string[] = [];
        const unknownTags: string[] = [];
        for (const tag of tags) {
            const canonical = canonicalMap.get(tag.toLowerCase());
            if (canonical) {
                validTags.push(canonical); // use exact platform capitalisation
            } else {
                unknownTags.push(tag);
            }
        }
        if (unknownTags.length > 0) {
            warnings.push({
                code: 'UNKNOWN_TAGS',
                message: `Etichetele „${unknownTags.join('", „')}" nu există pe platformă și au fost eliminate automat — altfel submit-ul ar fi eșuat.`,
            });
        }
        tags = validTags;
    }

    // Statement
    const roPaths = ['statements/ro/statement.tex', 'statements/ro/statement.md'];
    const enPaths = ['statements/en/statement.tex', 'statements/en/statement.md'];

    const roEntry = roPaths.map(p => zip.files[p]).find(Boolean);
    const enEntry = enPaths.map(p => zip.files[p]).find(Boolean);

    if (!roEntry && !enEntry) {
        warnings.push({ code: 'NO_STATEMENT', message: 'Nu s-a găsit niciun enunț (statements/ro/ sau statements/en/) — câmpul va fi gol.' });
    }

    const roText = roEntry ? await roEntry.async('string') : '';
    const enText = enEntry ? await enEntry.async('string') : '';

    // Detect packed JSON produced by a previous platform export (has "_encoded" key)
    // Avoid false-positive on LaTeX files that happen to start with '{'
    const looksLikePacked = roText.trimStart().startsWith('{') &&
        (roText.includes('"_encoded"') || (roText.includes('"ro"') && roText.includes('"en"')));

    if (looksLikePacked) {
        statement = roText;
    } else {
        statement = packTranslation(roText, enText);
    }

    if ((roText + enText).includes('![')) {
        warnings.push({ code: 'IMAGE_IN_STATEMENT', message: 'Enunțul conține referințe la imagini (![...]) care nu sunt suportate și nu vor fi afișate.' });
    }

    // Test integrity checks
    const incompletePairs = tests.filter(t => !t.input || !t.output);
    if (incompletePairs.length > 0) {
        const ids = incompletePairs.map(t => t.id).join(', ');
        warnings.push({ code: 'INCOMPLETE_TEST_PAIRS', message: `${incompletePairs.length} test(e) nu au ambele fișiere (.in și .ok): nr. ${ids}. Testele incomplete vor fi ignorate la evaluare.` });
    }

    if (orphanTestFiles.length > 0) {
        const preview = orphanTestFiles.slice(0, 5).join(', ') + (orphanTestFiles.length > 5 ? ` și încă ${orphanTestFiles.length - 5}` : '');
        warnings.push({ code: 'ORPHAN_TEST_FILES', message: `${orphanTestFiles.length} fișier(e) din raw_tests/ au format necunoscut și au fost ignorate: ${preview}. Fișierele trebuie să se termine în .in, .ok sau .out.` });
    }

    if (tests.length > 200) {
        warnings.push({ code: 'TOO_MANY_TESTS', message: `Arhiva conține ${tests.length} teste manuale. Un număr mare poate îngreuna editorul — ia în considerare generarea automată via tests.gen.` });
    }

    if (rootFiles.length > 0) {
        const preview = rootFiles.slice(0, 5).join(', ') + (rootFiles.length > 5 ? ` și încă ${rootFiles.length - 5}` : '');
        warnings.push({ code: 'FILES_IN_ROOT', message: `${rootFiles.length} fișier(e) puse direct în files/ au fost ignorate: ${preview}. Trebuie să fie în subfolderul corespunzător (ex: files/sources/).` });
    }

    const hasContent = files.length > 0 || tests.length > 0 || generatorScript || title;
    if (!hasContent) {
        throw new ZipImportError(
            'Arhiva nu conține fișiere recunoscute. Verifică că structura respectă formatul așteptat (butonul „Format ZIP").',
            'EMPTY_ZIP',
        );
    }

    return {
        form: {
            title,
            statement,
            difficulty,
            timeLimit,
            memoryLimit,
            tags,
            visibility: 'private',
            isInteractive: files.some(f => f.category === 'interactors'),
            generatorScript,
            tests,
            subtasks: [],
            files,
            attachments: [],
        },
        warnings,
    };
}
