import JSZip from 'jszip';
import type { ProposeProblemForm } from '../types/proposeProblem';

export async function createProblemZip(formData: ProposeProblemForm): Promise<Blob> {
    const zip = new JSZip();

    // 1. files/
    const filesFolder = zip.folder('files');
    if (filesFolder) {
        formData.files.forEach(file => {
            const catFolder = filesFolder.folder(file.category);
            if (catFolder) {
                catFolder.file(file.name, file.content);
            }
        });

        // Add manual tests if any
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
        const metadataJson = {
            title: formData.title,
            time_limit: formData.timeLimit,
            memory_limit: formData.memoryLimit,
            difficulty: formData.difficulty.toUpperCase(),
            tags: formData.tags
        };
        metaFolder.file('metadata.json', JSON.stringify(metadataJson, null, 2));

        // tests.gen
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

    // Generate the blob
    return await zip.generateAsync({ type: 'blob' });
}
