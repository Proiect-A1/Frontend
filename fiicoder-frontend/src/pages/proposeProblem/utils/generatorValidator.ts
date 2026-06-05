// Syntactic + semantic validator for the FiiCoder generator DSL.
//
// Aligned with test_generation_script_compiler_task.cpp (backend reference).
//
// Grammar:
//   #MAIN <name>                        — exact 2 tokens, no dot in name
//   #VAL | #VALIDATOR <name> <args...>  — min 2 tokens, no dot in name
//   #GEN | #GENERATOR <name> <args...>  — min 2 tokens, no dot in name
//   #CHECK | #CHECKER <name> <args...>  — min 2 tokens, no dot in name
//   #INT | #INTERACTOR <name> <args...> — min 2 tokens, no dot in name
//   #DEFGRP | #DEFGROUP <pts> <name>    — exact 3 tokens, pts >= 0
//   #GRP | #GROUP <pts>                 — exact 2 tokens, pts >= 0
//   #IN | #SETIN [group names...]       — no args = clear active groups (valid)
//   #ADDIN [group names...]             — no args = redundant (warning)
//   #NOTIN [group names...]             — no args = redundant (warning)
//   #TEST <pts> <gen args...>           — min 3 tokens, pts >= 0
//   = <filename>                        — exact 2 tokens, no / or \ in filename
//   < <generator> <args>
//   <args...>                           — bare continuation args
//   // comment
//
// Directives are CASE-SENSITIVE (matches backend behaviour).
// Runtime checks (file existence, compilation) require the sandbox — not done here.

import type {
    GeneratorValidationError,
    GeneratorValidationWarning,
    GeneratorValidationResult,
} from '../types/proposeProblem';

const KNOWN_DIRECTIVES: Record<string, string> = {
    '#MAIN': '#MAIN',
    '#VAL': '#VAL',
    '#VALIDATOR': '#VAL',
    '#GEN': '#GEN',
    '#GENERATOR': '#GEN',
    '#CHECK': '#CHECK',
    '#CHECKER': '#CHECK',
    '#INT': '#INT',
    '#INTERACTOR': '#INT',
    '#DEFGRP': '#DEFGRP',
    '#DEFGROUP': '#DEFGRP',
    '#GRP': '#GRP',
    '#GROUP': '#GRP',
    '#IN': '#IN',
    '#SETIN': '#IN',
    '#ADDIN': '#ADDIN',
    '#NOTIN': '#NOTIN',
    '#TEST': '#TEST',
};

interface TokenizedLine {
    lineNumber: number;
    raw: string;
    tokens: string[];
}

function tokenize(script: string): TokenizedLine[] {
    return script.split(/\r?\n/).map((raw, idx) => {
        const lineNumber = idx + 1;
        // Backend strips comments token-by-token: if a token starts with //,
        // drop it and everything after; if // appears mid-token, trim to that point.
        const parts = raw.split(/\s+/).filter(Boolean);
        const tokens: string[] = [];
        for (const part of parts) {
            const ci = part.indexOf('//');
            if (ci === 0) break;
            if (ci > 0) { tokens.push(part.slice(0, ci)); break; }
            tokens.push(part);
        }
        return { lineNumber, raw, tokens };
    });
}

function isFloat(token: string): boolean {
    return /^[+-]?(\d+(\.\d+)?|\.\d+)$/.test(token);
}

export function validateGeneratorScript(
    script: string,
): GeneratorValidationResult {
    const errors: GeneratorValidationError[] = [];
    const warnings: GeneratorValidationWarning[] = [];

    if (script.trim().length === 0) {
        return {
            valid: false,
            errors: [{ line: 1, col: 1, message: 'Scriptul de generare este gol.' }],
            warnings: [],
        };
    }

    const lines = tokenize(script);

    // Named groups defined via #DEFGRP/#DEFGROUP.
    const definedGroups = new Set<string>();

    // Active group membership — mirrors backend's `current_groups` set.
    // Named groups use their name; anonymous #GRP groups use "__grp_N".
    const currentGroups = new Set<string>();
    let groupDirectiveName: string | null = null; // current #GRP anonymous group name
    let anonCounter = 0;

    // Clears the anonymous group created by the last #GRP (if any).
    // Called whenever #IN / #ADDIN / #NOTIN / #TEST is encountered.
    function clearGroupDirective() {
        if (groupDirectiveName !== null) {
            currentGroups.delete(groupDirectiveName);
            groupDirectiveName = null;
        }
    }

    let mainDeclared = false;
    let totalGroupPoints = 0;
    let totalTestPoints = 0;

    for (const line of lines) {
        if (line.tokens.length === 0) continue;

        const first = line.tokens[0];

        // ── Line-level operators ────────────────────────────────────────────
        if (first === '=') {
            if (line.tokens.length !== 2) {
                errors.push({
                    line: line.lineNumber,
                    col: 1,
                    message: 'Operatorul „=" necesită exact un argument — numele fișierului (ex: `= exemplu.in`).',
                });
                continue;
            }
            const filename = line.tokens[1];
            if (filename.includes('/') || filename.includes('\\')) {
                errors.push({
                    line: line.lineNumber,
                    col: line.raw.indexOf(filename) + 1,
                    message: `Numele fișierului „${filename}" nu trebuie să conțină / sau \\ — doar numele fișierului, fără cale (ex: \`= exemplu.in\`).`,
                });
            }
            if (currentGroups.size === 0) {
                errors.push({
                    line: line.lineNumber,
                    col: 1,
                    message: 'Acest test nu aparține niciunui subtask — folosește #IN / #GRP înainte.',
                });
            }
            continue;
        }

        if (first === '<') {
            if (line.tokens.length < 2) {
                errors.push({
                    line: line.lineNumber,
                    col: 1,
                    message: 'Operatorul „<" trebuie urmat de un generator (ex: `< gen 34 56`).',
                });
                continue;
            }
            if (currentGroups.size === 0) {
                errors.push({
                    line: line.lineNumber,
                    col: 1,
                    message: 'Acest test nu aparține niciunui subtask — folosește #IN / #GRP înainte.',
                });
            }
            continue;
        }

        // ── Directive handling ──────────────────────────────────────────────
        if (first.startsWith('#')) {
            // Case-sensitive lookup — matches backend behaviour.
            const canonical = KNOWN_DIRECTIVES[first];
            if (!canonical) {
                errors.push({
                    line: line.lineNumber,
                    col: line.raw.indexOf(first) + 1,
                    message: `Directivă necunoscută „${first}". Directivele sunt case-sensitive. Valide: ${Object.keys(KNOWN_DIRECTIVES).join(', ')}.`,
                });
                continue;
            }

            switch (canonical) {
                case '#MAIN': {
                    if (line.tokens.length !== 2) {
                        errors.push({
                            line: line.lineNumber,
                            col: 1,
                            message: '#MAIN necesită exact un argument — numele executabilului fără extensie (ex: `#MAIN main`).',
                        });
                        break;
                    }
                    const name = line.tokens[1];
                    if (name.includes('.')) {
                        errors.push({
                            line: line.lineNumber,
                            col: line.raw.indexOf(name) + 1,
                            message: `Numele executabilului „${name}" nu trebuie să conțină punct — nu folosi extensii (ex: \`#MAIN main\`, nu \`#MAIN main.cpp\`).`,
                        });
                        break;
                    }
                    mainDeclared = true;
                    break;
                }

                case '#GEN':
                case '#VAL':
                case '#CHECK':
                case '#INT': {
                    if (line.tokens.length < 2) {
                        errors.push({
                            line: line.lineNumber,
                            col: 1,
                            message: `${first} trebuie urmat de numele executabilului și opțional argumente.`,
                        });
                        break;
                    }
                    const execName = line.tokens[1];
                    if (execName.includes('.')) {
                        errors.push({
                            line: line.lineNumber,
                            col: line.raw.indexOf(execName) + 1,
                            message: `Numele executabilului „${execName}" nu trebuie să conțină punct — nu folosi extensii.`,
                        });
                    }
                    break;
                }

                case '#DEFGRP': {
                    if (line.tokens.length !== 3) {
                        errors.push({
                            line: line.lineNumber,
                            col: 1,
                            message: '#DEFGRP necesită exact două argumente: `#DEFGRP <puncte> <nume>`.',
                        });
                        break;
                    }
                    const pts = line.tokens[1];
                    const name = line.tokens[2];
                    if (!isFloat(pts)) {
                        errors.push({
                            line: line.lineNumber,
                            col: line.raw.indexOf(pts) + 1,
                            message: `Punctaj invalid „${pts}" — trebuie să fie un număr.`,
                        });
                    } else {
                        const ptsVal = parseFloat(pts);
                        if (ptsVal < 0) {
                            errors.push({
                                line: line.lineNumber,
                                col: line.raw.indexOf(pts) + 1,
                                message: `Punctajul grupului nu poate fi negativ (primit: ${pts}).`,
                            });
                        } else {
                            totalGroupPoints += ptsVal;
                        }
                    }
                    if (definedGroups.has(name)) {
                        errors.push({
                            line: line.lineNumber,
                            col: line.raw.indexOf(name) + 1,
                            message: `Grupul „${name}" este definit de mai multe ori.`,
                        });
                    }
                    definedGroups.add(name);
                    break;
                }

                case '#GRP': {
                    // Removes previous anonymous group, creates a new one.
                    clearGroupDirective();
                    if (line.tokens.length !== 2) {
                        errors.push({
                            line: line.lineNumber,
                            col: 1,
                            message: '#GRP necesită exact un argument: `#GRP <puncte>`.',
                        });
                        break;
                    }
                    const pts = line.tokens[1];
                    if (!isFloat(pts)) {
                        errors.push({
                            line: line.lineNumber,
                            col: line.raw.indexOf(pts) + 1,
                            message: `Punctaj invalid „${pts}" — trebuie să fie un număr.`,
                        });
                    } else {
                        const ptsVal = parseFloat(pts);
                        if (ptsVal < 0) {
                            errors.push({
                                line: line.lineNumber,
                                col: line.raw.indexOf(pts) + 1,
                                message: `Punctajul grupului nu poate fi negativ (primit: ${pts}).`,
                            });
                        } else {
                            totalGroupPoints += ptsVal;
                        }
                    }
                    const anonName = `__grp_${anonCounter++}`;
                    groupDirectiveName = anonName;
                    currentGroups.add(anonName);
                    break;
                }

                case '#IN': {
                    clearGroupDirective();
                    currentGroups.clear();
                    // #IN with no args = clear all active groups (valid, no warning).
                    for (let i = 1; i < line.tokens.length; i++) {
                        const grp = line.tokens[i];
                        if (!definedGroups.has(grp)) {
                            errors.push({
                                line: line.lineNumber,
                                col: line.raw.indexOf(grp) + 1,
                                message: `Grupul „${grp}" nu este definit — folosește #DEFGRP înainte de a-l referenția.`,
                            });
                        } else {
                            currentGroups.add(grp);
                        }
                    }
                    break;
                }

                case '#ADDIN': {
                    clearGroupDirective();
                    if (line.tokens.length < 2) {
                        warnings.push({
                            line: line.lineNumber,
                            col: 1,
                            message: `${first} fără argumente — comandă redundantă, nu are niciun efect.`,
                        });
                        break;
                    }
                    for (let i = 1; i < line.tokens.length; i++) {
                        const grp = line.tokens[i];
                        if (!definedGroups.has(grp)) {
                            errors.push({
                                line: line.lineNumber,
                                col: line.raw.indexOf(grp) + 1,
                                message: `Grupul „${grp}" nu este definit — folosește #DEFGRP înainte de a-l referenția.`,
                            });
                        } else {
                            currentGroups.add(grp);
                        }
                    }
                    break;
                }

                case '#NOTIN': {
                    clearGroupDirective();
                    if (line.tokens.length < 2) {
                        warnings.push({
                            line: line.lineNumber,
                            col: 1,
                            message: `${first} fără argumente — comandă redundantă, nu are niciun efect.`,
                        });
                        break;
                    }
                    for (let i = 1; i < line.tokens.length; i++) {
                        const grp = line.tokens[i];
                        if (!definedGroups.has(grp)) {
                            errors.push({
                                line: line.lineNumber,
                                col: line.raw.indexOf(grp) + 1,
                                message: `Grupul „${grp}" nu este definit — folosește #DEFGRP înainte de a-l referenția.`,
                            });
                        } else {
                            currentGroups.delete(grp);
                        }
                    }
                    break;
                }

                case '#TEST': {
                    // #TEST creates its own anonymous subtask — always has a group.
                    // Backend removes group_directive_gid before creating its own group.
                    clearGroupDirective();
                    if (line.tokens.length < 3) {
                        errors.push({
                            line: line.lineNumber,
                            col: 1,
                            message: '#TEST necesită punctaj și cel puțin un argument de generare: `#TEST <puncte> <args...>`.',
                        });
                        break;
                    }
                    const pts = line.tokens[1];
                    if (!isFloat(pts)) {
                        errors.push({
                            line: line.lineNumber,
                            col: line.raw.indexOf(pts) + 1,
                            message: `Punctaj invalid „${pts}" pentru #TEST.`,
                        });
                    } else {
                        const ptsVal = parseFloat(pts);
                        if (ptsVal < 0) {
                            errors.push({
                                line: line.lineNumber,
                                col: line.raw.indexOf(pts) + 1,
                                message: `Punctajul testului nu poate fi negativ (primit: ${pts}).`,
                            });
                        } else {
                            totalTestPoints += ptsVal;
                        }
                    }
                    break;
                }
            }
            continue;
        }

        // Bare arguments — continuation of last #GEN, always produces a test.
        if (currentGroups.size === 0) {
            errors.push({
                line: line.lineNumber,
                col: 1,
                message: 'Acest test nu aparține niciunui subtask — folosește #IN / #GRP înainte.',
            });
        }
    }

    if (!mainDeclared) {
        errors.push({
            line: 1,
            col: 1,
            message: 'Lipsește #MAIN — declară soluția principală cu `#MAIN <sursă>`.',
        });
    }

    if (totalTestPoints > 0 && totalGroupPoints > 0 && Math.abs(totalTestPoints - totalGroupPoints) > 0.01) {
        errors.push({
            line: 1,
            col: 1,
            message: `Suma punctelor pe #TEST (${totalTestPoints}) nu se potrivește cu suma pe grupuri (${totalGroupPoints}).`,
        });
    }

    return {
        valid: errors.length === 0,
        errors,
        warnings,
    };
}
