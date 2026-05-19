import JSZip from 'jszip';
import type { ProblemFile, TestCase, FileCategory, ProposeProblemForm } from '../types/proposeProblem';

async function parseZipContents(zip: JSZip): Promise<{ files: ProblemFile[]; tests: TestCase[]; generatorScript: string }> {
    const files: ProblemFile[] = [];
    const tests: TestCase[] = [];
    let generatorScript = '';

    for (const [relativePath, zipEntry] of Object.entries(zip.files)) {
        if (zipEntry.dir) continue;

        const filesMatch = relativePath.match(/^files\/([^\/]+)\/([^\/]+)$/);
        if (filesMatch) {
            const category = filesMatch[1];
            const name = filesMatch[2];
            const content = await zipEntry.async('string');

            if (category === 'raw_tests') {
                const testMatch = name.match(/^(\d+)\.(in|ok|out)$/);
                if (testMatch) {
                    const testIndexStr = testMatch[1];
                    const extension = testMatch[2];
                    let test = tests.find(t => t.id === testIndexStr);
                    if (!test) {
                        test = { id: testIndexStr, input: '', output: '', subtaskIds: [], source: 'manual' };
                        tests.push(test);
                    }
                    if (extension === 'in') test.input = content;
                    else if (extension === 'ok' || extension === 'out') test.output = content;
                }
            } else if (['sources', 'checkers', 'validators', 'generators', 'interactors'].includes(category)) {
                files.push({
                    id: `${category}-${name}-${Date.now()}`,
                    name,
                    size: content.length,
                    category: category as FileCategory,
                    content
                });
            }
        }

        if (relativePath === 'metadata/tests.gen') {
            generatorScript = await zipEntry.async('string');
        }
    }

    tests.sort((a, b) => parseInt(a.id) - parseInt(b.id));
    return { files, tests, generatorScript };
}

export async function extractProblemZip(zipUrl: string): Promise<{ files: ProblemFile[]; tests: TestCase[]; generatorScript: string }> {
    const response = await fetch(zipUrl);
    if (!response.ok) throw new Error('Failed to download problem zip archive');
    const zip = await JSZip.loadAsync(await response.blob());
    return parseZipContents(zip);
}

export async function extractProblemZipFromBlob(blob: Blob): Promise<ProposeProblemForm> {
    const zip = await JSZip.loadAsync(blob);
    const { files, tests, generatorScript } = await parseZipContents(zip);

    let title = '';
    let timeLimit = 1;
    let memoryLimit = 256;
    let difficulty: ProposeProblemForm['difficulty'] = 'medium';
    let tags: string[] = [];
    let statement = '';

    const metadataEntry = zip.files['metadata/metadata.json'];
    if (metadataEntry) {
        try {
            const meta = JSON.parse(await metadataEntry.async('string'));
            title = meta.title || '';
            timeLimit = meta.time_limit || 1;
            memoryLimit = meta.memory_limit || 256;
            difficulty = (meta.difficulty || 'MEDIUM').toLowerCase() as ProposeProblemForm['difficulty'];
            tags = meta.tags || [];
        } catch { /* malformed metadata — keep defaults */ }
    }

    const statementEntry = zip.files['statements/ro/statement.tex'];
    if (statementEntry) {
        statement = await statementEntry.async('string');
    }

    return {
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
        allowedUsers: [],
        allowedGroups: [],
    };
}
