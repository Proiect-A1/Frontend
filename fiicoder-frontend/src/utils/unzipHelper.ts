import JSZip from 'jszip';
import type { ProblemFile, TestCase, FileCategory } from '../types/proposeProblem';

export async function extractProblemZip(zipUrl: string): Promise<{ files: ProblemFile[]; tests: TestCase[]; generatorScript: string }> {
    const response = await fetch(zipUrl);
    if (!response.ok) {
        throw new Error('Failed to download problem zip archive');
    }
    
    const blob = await response.blob();
    const zip = await JSZip.loadAsync(blob);
    
    const files: ProblemFile[] = [];
    const tests: TestCase[] = [];
    let generatorScript = '';

    // Parse files inside files/ directory
    for (const [relativePath, zipEntry] of Object.entries(zip.files)) {
        if (zipEntry.dir) continue;
        
        // Match paths like "files/sources/main.cpp"
        const filesMatch = relativePath.match(/^files\/([^\/]+)\/([^\/]+)$/);
        if (filesMatch) {
            const category = filesMatch[1];
            const name = filesMatch[2];
            
            const content = await zipEntry.async('string');
            
            if (category === 'raw_tests') {
                // Handling manual tests
                // e.g. "1.in" or "1.ok"
                const testMatch = name.match(/^(\d+)\.(in|ok|out)$/);
                if (testMatch) {
                    const testIndexStr = testMatch[1];
                    const extension = testMatch[2];
                    
                    let test = tests.find(t => t.id === testIndexStr);
                    if (!test) {
                        test = {
                            id: testIndexStr,
                            input: '',
                            output: '',
                            subtaskIds: [],
                            source: 'manual'
                        };
                        tests.push(test);
                    }
                    
                    if (extension === 'in') {
                        test.input = content;
                    } else if (extension === 'ok' || extension === 'out') {
                        test.output = content;
                    }
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

        // Match metadata/tests.gen
        if (relativePath === 'metadata/tests.gen') {
            generatorScript = await zipEntry.async('string');
        }
    }

    // Sort tests by ID
    tests.sort((a, b) => parseInt(a.id) - parseInt(b.id));

    return { files, tests, generatorScript };
}
