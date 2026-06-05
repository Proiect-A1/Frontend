// Run with: npx esbuild --bundle --platform=node --format=cjs generatorValidator.test.ts | node
import { validateGeneratorScript } from './generatorValidator';

let passed = 0;
let failed = 0;

function test(name: string, script: string, expectValid: boolean, expectMsgContains?: string) {
    const result = validateGeneratorScript(script);
    const okValidity = result.valid === expectValid;
    const okMsg = expectMsgContains
        ? result.errors.some(e => e.message.includes(expectMsgContains))
        : true;

    if (okValidity && okMsg) {
        console.log(`  ✓ ${name}`);
        passed++;
    } else {
        console.log(`  ✗ ${name}`);
        if (!okValidity)
            console.log(`    expected valid=${expectValid}, got valid=${result.valid}`);
        if (!okMsg)
            console.log(`    expected message containing "${expectMsgContains}", got: ${JSON.stringify(result.errors.map(e => e.message))}`);
        failed++;
    }
}

function testWarning(name: string, script: string, expectWarnContains: string) {
    const result = validateGeneratorScript(script);
    const ok = result.warnings.some(w => w.message.includes(expectWarnContains));
    if (ok) {
        console.log(`  ✓ ${name}`);
        passed++;
    } else {
        console.log(`  ✗ ${name}`);
        console.log(`    expected warning containing "${expectWarnContains}", got: ${JSON.stringify(result.warnings.map(w => w.message))}`);
        failed++;
    }
}

console.log('\n=== generatorValidator tests ===\n');

// ──────────────────────────────────────────────
console.log('-- Empty / trivial --');

test('empty script',
    '',
    false, 'gol');

test('whitespace-only script',
    '   \n  \t  ',
    false, 'gol');

// ──────────────────────────────────────────────
console.log('\n-- Minimal valid scripts --');

test('minimal valid script',
    `#MAIN main\n#GEN gen\n#DEFGRP 100 all\n#IN all`,
    true);

test('valid example script from UI',
`#MAIN main
#DEFGRP 10 exemple
#DEFGRP 90 full

#VAL val 100 100
#CHECK check 100 100 10000

#IN exemple full
= exemplu.in

#NOTIN exemple
#GEN gen 100 100
< gen 34 56
2
3
4
5`,
    true);

// ──────────────────────────────────────────────
console.log('\n-- Case sensitivity (directives are case-sensitive) --');

test('#main lowercase is unknown directive',
    `#main main\n#GEN gen\n#DEFGRP 100 all\n#IN all`,
    false, 'Directivă necunoscută');

test('#gen lowercase is unknown directive',
    `#MAIN main\n#gen gen\n#DEFGRP 100 all\n#IN all`,
    false, 'Directivă necunoscută');

test('#MAIN uppercase is valid',
    `#MAIN main\n#GEN gen\n#DEFGRP 100 all\n#IN all`,
    true);

// ──────────────────────────────────────────────
console.log('\n-- = operator --');

test('= without filename',
    `#MAIN main\n#GEN gen\n#DEFGRP 100 all\n#IN all\n=`,
    false, '„="');

test('= with extra tokens (exact 2 required)',
    `#MAIN main\n#GEN gen\n#DEFGRP 100 all\n#IN all\n= file.in extra`,
    false, '„="');

test('= with valid filename',
    `#MAIN main\n#GEN gen\n#DEFGRP 100 all\n#IN all\n= test.in`,
    true);

test('= with / in filename',
    `#MAIN main\n#GEN gen\n#DEFGRP 100 all\n#IN all\n= path/test.in`,
    false, '/');

test('= with \\ in filename',
    `#MAIN main\n#GEN gen\n#DEFGRP 100 all\n#IN all\n= path\\test.in`,
    false, '\\');

// ──────────────────────────────────────────────
console.log('\n-- < operator --');

test('< without generator',
    `#MAIN main\n#GEN gen\n#DEFGRP 100 all\n#IN all\n<`,
    false, '„<"');

test('< with generator (valid)',
    `#MAIN main\n#DEFGRP 100 all\n#IN all\n< gen 1 2 3`,
    true);

// ──────────────────────────────────────────────
console.log('\n-- Unknown directive --');

test('unknown directive #FOO',
    `#MAIN main\n#GEN gen\n#DEFGRP 100 all\n#IN all\n#FOO bar`,
    false, 'Directivă necunoscută');

// ──────────────────────────────────────────────
console.log('\n-- #MAIN --');

test('#MAIN missing name',
    `#MAIN\n#GEN gen\n#DEFGRP 100 all\n#IN all`,
    false, '#MAIN necesită');

test('#MAIN with extra tokens (exact 2 required)',
    `#MAIN main extra\n#GEN gen\n#DEFGRP 100 all\n#IN all`,
    false, '#MAIN necesită');

test('#MAIN with dot in name',
    `#MAIN main.cpp\n#GEN gen\n#DEFGRP 100 all\n#IN all`,
    false, 'nu trebuie să conțină punct');

test('#MAIN redeclared (backend overwrites silently — valid)',
    `#MAIN main\n#MAIN main2\n#GEN gen\n#DEFGRP 100 all\n#IN all`,
    true);

test('no #MAIN at all',
    `#GEN gen\n#DEFGRP 100 all\n#IN all`,
    false, 'Lipsește #MAIN');

// ──────────────────────────────────────────────
console.log('\n-- #GEN / #VAL / #CHECK / #INT --');

test('#GEN without filename',
    `#MAIN main\n#GEN\n#DEFGRP 100 all\n#IN all`,
    false, 'trebuie urmat');

test('#GEN with dot in executable name',
    `#MAIN main\n#GEN gen.cpp\n#DEFGRP 100 all\n#IN all`,
    false, 'nu trebuie să conțină punct');

test('#VAL without filename',
    `#MAIN main\n#GEN gen\n#VAL\n#DEFGRP 100 all\n#IN all`,
    false, 'trebuie urmat');

test('#VAL with dot in name',
    `#MAIN main\n#GEN gen\n#VAL val.cpp\n#DEFGRP 100 all\n#IN all`,
    false, 'nu trebuie să conțină punct');

test('#CHECK with dot in name',
    `#MAIN main\n#GEN gen\n#CHECK chk.cpp\n#DEFGRP 100 all\n#IN all`,
    false, 'nu trebuie să conțină punct');

test('#INT with dot in name',
    `#MAIN main\n#GEN gen\n#INT iact.cpp\n#DEFGRP 100 all\n#IN all`,
    false, 'nu trebuie să conțină punct');

test('#GENERATOR alias works',
    `#MAIN main\n#GENERATOR gen\n#DEFGRP 100 all\n#IN all`,
    true);

test('#VALIDATOR alias works',
    `#MAIN main\n#GEN gen\n#VALIDATOR val\n#DEFGRP 100 all\n#IN all`,
    true);

test('#CHECKER alias works',
    `#MAIN main\n#GEN gen\n#CHECKER chk\n#DEFGRP 100 all\n#IN all`,
    true);

test('#INTERACTOR alias works',
    `#MAIN main\n#GEN gen\n#INTERACTOR iact\n#DEFGRP 100 all\n#IN all`,
    true);

test('no #GEN but uses < per-test (valid)',
    `#MAIN main\n#DEFGRP 100 all\n#IN all\n< gen 1\n< gen 2`,
    true);

test('no #GEN but uses = copies (valid)',
    `#MAIN main\n#DEFGRP 100 all\n#IN all\n= test1.in\n= test2.in`,
    true);

test('no generator at all — still valid at syntax level (backend catches at test level)',
    `#MAIN main\n#DEFGRP 100 all\n#IN all`,
    true);

// ──────────────────────────────────────────────
console.log('\n-- #DEFGRP --');

test('#DEFGRP missing both args',
    `#MAIN main\n#GEN gen\n#DEFGRP`,
    false, '#DEFGRP necesită');

test('#DEFGRP missing name (only points)',
    `#MAIN main\n#GEN gen\n#DEFGRP 100`,
    false, '#DEFGRP necesită');

test('#DEFGRP with extra token (exact 3 required)',
    `#MAIN main\n#GEN gen\n#DEFGRP 100 all extra\n#IN all`,
    false, '#DEFGRP necesită');

test('#DEFGRP invalid points',
    `#MAIN main\n#GEN gen\n#DEFGRP abc all\n#IN all`,
    false, 'Punctaj invalid');

test('#DEFGRP negative points',
    `#MAIN main\n#GEN gen\n#DEFGRP -10 all\n#IN all`,
    false, 'negativ');

test('#DEFGRP zero points (allowed)',
    `#MAIN main\n#GEN gen\n#DEFGRP 0 exemp\n#DEFGRP 100 all\n#IN exemp all`,
    true);

test('#DEFGRP duplicate group name',
    `#MAIN main\n#GEN gen\n#DEFGRP 50 all\n#DEFGRP 50 all\n#IN all`,
    false, 'definit de mai multe ori');

test('#DEFGROUP alias works',
    `#MAIN main\n#GEN gen\n#DEFGROUP 100 all\n#IN all`,
    true);

// ──────────────────────────────────────────────
console.log('\n-- #GRP --');

test('#GRP without points',
    `#MAIN main\n#GEN gen\n#GRP`,
    false, '#GRP necesită');

test('#GRP with extra token (exact 2 required)',
    `#MAIN main\n#GEN gen\n#GRP 100 extra`,
    false, '#GRP necesită');

test('#GRP invalid points',
    `#MAIN main\n#GEN gen\n#GRP xyz`,
    false, 'Punctaj invalid');

test('#GRP negative points',
    `#MAIN main\n#GEN gen\n#GRP -5`,
    false, 'negativ');

test('#GRP zero points (allowed)',
    `#MAIN main\n#GEN gen\n#GRP 0\n#GRP 100`,
    true);

test('#GROUP alias works',
    `#MAIN main\n#GEN gen\n#GROUP 100`,
    true);

// ──────────────────────────────────────────────
console.log('\n-- #IN / #ADDIN / #NOTIN --');

test('#IN without group names clears groups (valid)',
    `#MAIN main\n#GEN gen\n#DEFGRP 100 all\n#IN all\n#IN`,
    true);

test('#ADDIN without group names is redundant but valid',
    `#MAIN main\n#GEN gen\n#DEFGRP 100 all\n#IN all\n#ADDIN`,
    true);

test('#NOTIN without group names is redundant but valid',
    `#MAIN main\n#GEN gen\n#DEFGRP 100 all\n#IN all\n#NOTIN`,
    true);

test('#IN with undefined group',
    `#MAIN main\n#GEN gen\n#DEFGRP 100 all\n#IN ghost`,
    false, 'nu este definit');

test('#ADDIN with undefined group',
    `#MAIN main\n#GEN gen\n#DEFGRP 100 all\n#IN all\n#ADDIN ghost`,
    false, 'nu este definit');

test('#NOTIN with undefined group',
    `#MAIN main\n#GEN gen\n#DEFGRP 100 all\n#IN all\n#NOTIN ghost`,
    false, 'nu este definit');

test('#SETIN alias works',
    `#MAIN main\n#GEN gen\n#DEFGRP 100 all\n#SETIN all`,
    true);

// ──────────────────────────────────────────────
console.log('\n-- #TEST --');

test('#TEST without points',
    `#MAIN main\n#GEN gen\n#DEFGRP 100 all\n#IN all\n#TEST`,
    false, '#TEST necesită');

test('#TEST with points but no gen arg (min 3 required)',
    `#MAIN main\n#GEN gen\n#DEFGRP 100 all\n#IN all\n#TEST 10`,
    false, '#TEST necesită');

test('#TEST with invalid points',
    `#MAIN main\n#GEN gen\n#DEFGRP 100 all\n#IN all\n#TEST abc arg`,
    false, 'Punctaj invalid');

test('#TEST with negative points',
    `#MAIN main\n#GEN gen\n#DEFGRP 100 all\n#IN all\n#TEST -10 arg`,
    false, 'negativ');

test('#TEST with zero points (allowed)',
    `#MAIN main\n#GEN gen\n#DEFGRP 100 all\n#IN all\n#TEST 0 arg\n#TEST 100 arg`,
    true);

test('#TEST before any #DEFGRP is valid (creates its own subtask)',
    `#MAIN main\n#GEN gen\n#TEST 10 arg`,
    true);

// ──────────────────────────────────────────────
console.log('\n-- Point sum checks --');

test('group points can be any total',
    `#MAIN main\n#GEN gen\n#DEFGRP 50 a\n#DEFGRP 30 b\n#IN a b`,
    true);

test('test points mismatch group points',
    `#MAIN main\n#GEN gen\n#DEFGRP 100 all\n#IN all\n#TEST 50 arg\n#TEST 30 arg`,
    false, 'nu se potrivește');

test('test points == group points (valid)',
    `#MAIN main\n#GEN gen\n#DEFGRP 100 all\n#IN all\n#TEST 60 arg\n#TEST 40 arg`,
    true);

test('float point values accepted',
    `#MAIN main\n#GEN gen\n#DEFGRP 33.33 a\n#DEFGRP 33.33 b\n#DEFGRP 33.34 c\n#IN a b c`,
    true);

// ──────────────────────────────────────────────
console.log('\n-- No active subtask when test appears --');

test('= with empty currentGroups',
    `#MAIN main\n#GEN gen\n#DEFGRP 100 all\n= test.in`,
    false, 'nu aparține niciunui subtask');

test('< with empty currentGroups',
    `#MAIN main\n#GEN gen\n#DEFGRP 100 all\n< gen 1`,
    false, 'nu aparține niciunui subtask');

test('bare args with empty currentGroups',
    `#MAIN main\n#GEN gen\n#DEFGRP 100 all\n1 2 3`,
    false, 'nu aparține niciunui subtask');

test('= after #IN (valid)',
    `#MAIN main\n#GEN gen\n#DEFGRP 100 all\n#IN all\n= test.in`,
    true);

test('< after #GRP (valid)',
    `#MAIN main\n#DEFGRP 100 all\n#GRP 100\n< gen 1`,
    true);

test('#IN clears groups, then test errors',
    `#MAIN main\n#GEN gen\n#DEFGRP 100 all\n#IN all\n#IN\n= test.in`,
    false, 'nu aparține niciunui subtask');

test('#TEST always valid (creates own subtask)',
    `#MAIN main\n#GEN gen\n#TEST 10 arg`,
    true);

// ──────────────────────────────────────────────
console.log('\n-- Warnings --');

testWarning('#ADDIN without args → warning',
    `#MAIN main\n#GEN gen\n#DEFGRP 100 all\n#IN all\n#ADDIN`,
    'redundantă');

testWarning('#NOTIN without args → warning',
    `#MAIN main\n#GEN gen\n#DEFGRP 100 all\n#IN all\n#NOTIN`,
    'redundantă');

test('#IN without args → no warning, no error',
    `#MAIN main\n#GEN gen\n#DEFGRP 100 all\n#IN all\n#IN`,
    true);

// ──────────────────────────────────────────────
console.log('\n-- Comment handling --');

test('comments stripped correctly',
    `#MAIN main // solutia\n#GEN gen // gen\n#DEFGRP 100 all // grup\n#IN all`,
    true);

test('comment-only lines ignored',
    `// just a comment\n#MAIN main\n// another\n#GEN gen\n#DEFGRP 100 all\n#IN all`,
    true);

test('mid-token comment stripped',
    `#MAIN main\n#GEN gen\n#DEFGRP 100//comment all\n#IN all`,
    false); // "100//comment" is not a valid float → invalid pts

// ──────────────────────────────────────────────
console.log('\n── Results ──────────────────────────────');
console.log(`  Passed: ${passed}`);
console.log(`  Failed: ${failed}`);
console.log(`  Total:  ${passed + failed}`);
if (failed > 0) process.exit(1);
