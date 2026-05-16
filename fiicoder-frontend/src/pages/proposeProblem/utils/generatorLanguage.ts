/**
 * Monaco Editor custom language definition for the FiiCoder generator scripting language.
 *
 * Grammar summary:
 *   #MAIN <name>
 *   #VAL | #VALIDATOR <name> <args...>
 *   #GEN | #GENERATOR <name> <args...>
 *   #CHECK | #CHECKER <name> <args...>
 *   #INT | #INTERACTOR <name> <args...>
 *   #DEFGRP | #DEFGROUP <points: float> <name: string>
 *   #GRP | #GROUP <points: float>
 *   #IN | #SETIN <group names...>
 *   #ADDIN <group names...>
 *   #NOTIN <group names...>
 *   #TEST <points: float> <generator args...>
 *   = <filename>          — copy raw test file
 *   < <generator> <args>  — use specific generator
 *   <args...>             — append args to current #GEN
 *   // comment
 */

const LANGUAGE_ID = 'fiicoder-gen';

export function registerGeneratorLanguage(monaco: any) {
    // Don't register twice
    if (monaco.languages.getLanguages().some((lang: any) => lang.id === LANGUAGE_ID)) {
        return LANGUAGE_ID;
    }

    monaco.languages.register({ id: LANGUAGE_ID });

    // Monarch tokenizer
    monaco.languages.setMonarchTokensProvider(LANGUAGE_ID, {
        defaultToken: 'source',

        directives: [
            '#MAIN',
            '#VAL', '#VALIDATOR',
            '#GEN', '#GENERATOR',
            '#CHECK', '#CHECKER',
            '#INT', '#INTERACTOR',
            '#DEFGRP', '#DEFGROUP',
            '#GRP', '#GROUP',
            '#IN', '#SETIN',
            '#ADDIN',
            '#NOTIN',
            '#TEST',
        ],

        tokenizer: {
            root: [
                // Comments
                [/\/\/.*$/, 'comment'],

                // Directives (must be at word boundary)
                [/#[A-Z]+/, {
                    cases: {
                        '@directives': 'keyword.directive',
                        '@default': 'invalid',
                    },
                }],

                // Copy-file operator at line start
                [/^=\s/, 'operator.copy'],
                [/=\s/, 'operator.copy'],

                // Generator redirect operator
                [/^<\s/, 'operator.generator'],
                [/<\s/, 'operator.generator'],

                // Numbers (integers and floats)
                [/\b\d+(\.\d+)?\b/, 'number'],

                // Filenames (with extensions)
                [/[a-zA-Z_][a-zA-Z0-9_]*\.[a-zA-Z]+/, 'string.filename'],

                // Identifiers (generator names, group names, etc.)
                [/[a-zA-Z_][a-zA-Z0-9_]*/, 'identifier'],

                // Whitespace
                [/\s+/, 'white'],
            ],
        },
    });

    // Language configuration (brackets, comments, auto-closing)
    monaco.languages.setLanguageConfiguration(LANGUAGE_ID, {
        comments: {
            lineComment: '//',
        },
        autoClosingPairs: [],
        surroundingPairs: [],
    });

    // Completion provider
    monaco.languages.registerCompletionItemProvider(LANGUAGE_ID, {
        provideCompletionItems: (_model: any, position: any) => {
            const suggestions = [
                // Primary directives
                { label: '#MAIN', insertText: '#MAIN ${1:main}', detail: 'Set main solution', sortText: '01' },
                { label: '#GEN', insertText: '#GEN ${1:gen} ${2:args}', detail: 'Set default generator', sortText: '02' },
                { label: '#GENERATOR', insertText: '#GENERATOR ${1:gen} ${2:args}', detail: 'Set default generator (long form)', sortText: '02' },
                { label: '#VAL', insertText: '#VAL ${1:val} ${2:args}', detail: 'Set validator', sortText: '03' },
                { label: '#VALIDATOR', insertText: '#VALIDATOR ${1:val} ${2:args}', detail: 'Set validator (long form)', sortText: '03' },
                { label: '#CHECK', insertText: '#CHECK ${1:check} ${2:args}', detail: 'Set checker', sortText: '04' },
                { label: '#CHECKER', insertText: '#CHECKER ${1:check} ${2:args}', detail: 'Set checker (long form)', sortText: '04' },
                { label: '#INT', insertText: '#INT ${1:interactor} ${2:args}', detail: 'Set interactor', sortText: '05' },
                { label: '#INTERACTOR', insertText: '#INTERACTOR ${1:interactor} ${2:args}', detail: 'Set interactor (long form)', sortText: '05' },

                // Group directives
                { label: '#DEFGRP', insertText: '#DEFGRP ${1:points} ${2:group_name}', detail: 'Define a test group with points', sortText: '06' },
                { label: '#DEFGROUP', insertText: '#DEFGROUP ${1:points} ${2:group_name}', detail: 'Define a test group (long form)', sortText: '06' },
                { label: '#GRP', insertText: '#GRP ${1:points}', detail: 'Anonymous group with points', sortText: '07' },
                { label: '#GROUP', insertText: '#GROUP ${1:points}', detail: 'Anonymous group (long form)', sortText: '07' },

                // Group membership
                { label: '#IN', insertText: '#IN ${1:group1} ${2:group2}', detail: 'Set active groups for tests', sortText: '08' },
                { label: '#SETIN', insertText: '#SETIN ${1:group1} ${2:group2}', detail: 'Set active groups (long form)', sortText: '08' },
                { label: '#ADDIN', insertText: '#ADDIN ${1:group_name}', detail: 'Add group to active set', sortText: '09' },
                { label: '#NOTIN', insertText: '#NOTIN ${1:group_name}', detail: 'Remove group from active set', sortText: '10' },

                // Test directive
                { label: '#TEST', insertText: '#TEST ${1:points} ${2:args}', detail: 'Define a test with points', sortText: '11' },
            ].map((s) => ({
                ...s,
                kind: monaco.languages.CompletionItemKind.Keyword,
                insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                range: {
                    startLineNumber: position.lineNumber,
                    startColumn: position.column - 1,
                    endLineNumber: position.lineNumber,
                    endColumn: position.column,
                },
            }));

            return { suggestions };
        },
        triggerCharacters: ['#'],
    });

    return LANGUAGE_ID;
}

export { LANGUAGE_ID };
