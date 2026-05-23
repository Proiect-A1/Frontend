import JSZip from 'jszip';
import type { ProposeProblemForm } from '../types/proposeProblem';

const DIFFICULTY_NUM: Record<string, number> = { easy: 1, medium: 2, hard: 3, contest: 4 };

export async function createProblemZip(formData: ProposeProblemForm): Promise<Blob> {
    const zip = new JSZip();
    const memoryBytes = formData.memoryLimit * 1024 * 1024;
    const isInteractive = formData.isInteractive || formData.files.some(f => f.category === 'interactors');

    // 1. files/
    const filesFolder = zip.folder('files');
    if (filesFolder) {
        formData.files.forEach(file => {
            const catFolder = filesFolder.folder(file.category);
            if (catFolder) {
                catFolder.file(file.name, file.content);
            }
        });

        if (formData.tests && formData.tests.length > 0) {
            const testsFolder = filesFolder.folder('raw_tests');
            if (testsFolder) {
                formData.tests.forEach((test, index) => {
                    if (test.source === 'manual') {
                        testsFolder.file(`${index + 1}.in`, test.input);
                        testsFolder.file(`${index + 1}.ok`, test.output);
                    }
                });
            }
        }
    }

    // 2. metadata/
    const metaFolder = zip.folder('metadata');
    if (metaFolder) {
        const diffStr = formData.difficulty.toUpperCase();
        const diffNum = DIFFICULTY_NUM[formData.difficulty.toLowerCase()] ?? 2;

        const timeLimitMs = Math.round(formData.timeLimit * 1000);

        // Includes both backend (snake_case) and sandbox (camelCase) fields.
        // time_limit: seconds (snake_case used for re-import via unzipHelper)
        // timeLimit: milliseconds (what the sandbox worker expects)
        // memory_limit / memoryLimit: bytes for both
        const metadataJson = {
            // backend / re-import fields
            title: formData.title,
            time_limit: String(formData.timeLimit),
            memory_limit: String(memoryBytes),
            difficulty: diffStr,
            tags: formData.tags,
            // sandbox fields
            problemId: formData.title,
            timeLimit: timeLimitMs,
            memoryLimit: memoryBytes,
            difficultyLevel: diffNum,
            revId: 0,
            problemStyle: 'IOI',
            problemType: isInteractive ? 'Interactive' : 'Batch',
            inputFile: 'stdin',
            outputFile: 'stdout',
            authors: [] as string[],
        };
        metaFolder.file('metadata.json', JSON.stringify(metadataJson, null, 2));
        metaFolder.file('tests.gen', formData.generatorScript || '');
    }

    // 3. statements/
    const statFolder = zip.folder('statements');
    if (statFolder) {
        const roFolder = statFolder.folder('ro');
        if (roFolder) {
            roFolder.file('statement.tex', formData.statement);
        }
    }

    return await zip.generateAsync({ type: 'blob' });
}
