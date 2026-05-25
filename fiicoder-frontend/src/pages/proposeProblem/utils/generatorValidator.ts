// Syntactic + semantic validator for the FiiCoder generator DSL.
//
// Grammar (from utils/generatorLanguage.ts):
//   #MAIN <name>
//   #VAL | #VALIDATOR <name> <args...>
//   #GEN | #GENERATOR <name> <args...>
//   #CHECK | #CHECKER <name> <args...>
//   #INT | #INTERACTOR <name> <args...>
//   #DEFGRP | #DEFGROUP <points: float> <name: string>
//   #GRP | #GROUP <points: float>
//   #IN | #SETIN <group names...>
//   #ADDIN <group names...>
//   #NOTIN <group names...>
//   #TEST <points: float> <generator args...>
//   = <filename>          - copy raw test file
//   < <generator> <args>  - use specific generator
//   <args...>             - append args to current #GEN
//   // comment
//
// Runtime checks (does the generator actually compile and produce valid output)
// are NOT done here — those need the sandbox. This validator catches syntax
// errors, unknown directives, dangling references and most arithmetic mistakes.

import type {
    GeneratorValidationError,
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
    stripped: string;
    tokens: string[];
}

function tokenize(script: string): TokenizedLine[] {
    return script.split(/\r?\n/).map((raw, idx) => {
        const lineNumber = idx + 1;
        // Strip line comments but keep the original line for offset reporting.
        const commentIdx = raw.indexOf('//');
        const stripped = (commentIdx >= 0 ? raw.slice(0, commentIdx) : raw).trim();
        const tokens = stripped.length > 0 ? stripped.split(/\s+/) : [];
        return { lineNumber, raw, stripped, tokens };
    });
}

function isFloat(token: string): boolean {
    return /^[+-]?(\d+(\.\d+)?|\.\d+)$/.test(token);
}





export function validateGeneratorScript(
    script: string,
): GeneratorValidationResult {
    const errors: GeneratorValidationError[] = [];

    if (script.trim().length === 0) {
        return {
            valid: false,
            errors: [{ line: 1, col: 1, message: 'Scriptul de generare este gol.' }],
        };
    }

    const lines = tokenize(script);

    const definedGroups = new Set<string>();
    let mainDeclared = false;
    let activeGroupsHaveBeenSet = false; // either #DEFGRP/#GRP made one, or #IN set them
    let totalGroupPoints = 0;
    let totalTestPoints = 0;
    let hasAnyGenerator = false;

    for (const line of lines) {
        if (line.tokens.length === 0) continue;

        const first = line.tokens[0];

        // Line-level operators (= filename, < generator args ...)
        if (first === '=') {
            if (line.tokens.length < 2) {
                errors.push({
                    line: line.lineNumber,
                    col: 1,
                    message: 'Operatorul „=" trebuie urmat de un nume de fișier (ex: `= exemplu.in`).',
                });
                continue;
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

            hasAnyGenerator = true;
            continue;
        }

        // Unknown directive — anything starting with # that we don't recognise.
        if (first.startsWith('#')) {
            const upper = first.toUpperCase();
            const canonical = KNOWN_DIRECTIVES[upper];
            if (!canonical) {
                errors.push({
                    line: line.lineNumber,
                    col: line.raw.indexOf(first) + 1,
                    message: `Directivă necunoscută „${first}". Directive valide: ${Object.keys(KNOWN_DIRECTIVES).join(', ')}.`,
                });
                continue;
            }

            switch (canonical) {
                case '#MAIN': {
                    if (line.tokens.length < 2) {
                        errors.push({
                            line: line.lineNumber,
                            col: 1,
                            message: '#MAIN trebuie urmat de numele soluției principale.',
                        });
                        break;
                    }
                    if (mainDeclared) {
                        errors.push({
                            line: line.lineNumber,
                            col: 1,
                            message: '#MAIN este declarat de mai multe ori. Folosește o singură soluție principală.',
                        });
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
                            message: `${first} trebuie urmat de numele fișierului și opțional argumente.`,
                        });
                        break;
                    }
                    if (canonical === '#GEN') hasAnyGenerator = true;
                    break;
                }

                case '#DEFGRP': {
                    if (line.tokens.length < 3) {
                        errors.push({
                            line: line.lineNumber,
                            col: 1,
                            message: '#DEFGRP necesită puncte și nume: `#DEFGRP <puncte> <nume>`.',
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
                        totalGroupPoints += parseFloat(pts);
                    }
                    if (definedGroups.has(name)) {
                        errors.push({
                            line: line.lineNumber,
                            col: line.raw.indexOf(name) + 1,
                            message: `Grupul „${name}" este definit de mai multe ori.`,
                        });
                    }
                    definedGroups.add(name);
                    activeGroupsHaveBeenSet = true;
                    break;
                }

                case '#GRP': {
                    if (line.tokens.length < 2) {
                        errors.push({
                            line: line.lineNumber,
                            col: 1,
                            message: '#GRP necesită un punctaj: `#GRP <puncte>`.',
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
                        totalGroupPoints += parseFloat(pts);
                    }
                    activeGroupsHaveBeenSet = true;
                    break;
                }

                case '#IN':
                case '#ADDIN':
                case '#NOTIN': {
                    if (line.tokens.length < 2) {
                        errors.push({
                            line: line.lineNumber,
                            col: 1,
                            message: `${first} necesită cel puțin un nume de grup.`,
                        });
                        break;
                    }
                    for (let i = 1; i < line.tokens.length; i++) {
                        const grp = line.tokens[i];
                        if (!definedGroups.has(grp)) {
                            errors.push({
                                line: line.lineNumber,
                                col: line.raw.indexOf(grp) + 1,
                                message: `Grupul „${grp}" nu este definit — folosește #DEFGRP înainte.`,
                            });
                        }
                    }
                    if (canonical === '#IN') activeGroupsHaveBeenSet = true;
                    break;
                }

                case '#TEST': {
                    if (line.tokens.length < 2) {
                        errors.push({
                            line: line.lineNumber,
                            col: 1,
                            message: '#TEST necesită un punctaj: `#TEST <puncte> <args...>`.',
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
                        totalTestPoints += parseFloat(pts);
                    }
                    if (!activeGroupsHaveBeenSet) {
                        errors.push({
                            line: line.lineNumber,
                            col: 1,
                            message: '#TEST apare înainte de orice grup activ (#DEFGRP / #GRP / #IN).',
                        });
                    }
                    break;
                }
            }
            continue;
        }

        // Bare arguments (continuation of last directive) — no checks here, but
        // we don't reject them either; the line was just a list of args.
    }

    if (!mainDeclared) {
        errors.push({
            line: 1,
            col: 1,
            message: 'Lipsește #MAIN — declară soluția principală cu `#MAIN <sursă>`.',
        });
    }

    if (!hasAnyGenerator) {
        errors.push({
            line: 1,
            col: 1,
            message: 'Scriptul nu folosește niciun generator (#GEN sau operatorul „<"). Adaugă cel puțin unul.',
        });
    }

    if (totalGroupPoints > 0 && Math.abs(totalGroupPoints - 100) > 0.01) {
        errors.push({
            line: 1,
            col: 1,
            message: `Suma punctelor pe grupuri este ${totalGroupPoints}, nu 100. Verifică #DEFGRP / #GRP.`,
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
    };
}
