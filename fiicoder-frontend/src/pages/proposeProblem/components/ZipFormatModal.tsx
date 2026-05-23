import { useState } from 'react';
import { useLanguage } from '../../../language/Language';

export default function ZipFormatModal() {
    const [open, setOpen] = useState(false);
    const { lang } = useLanguage();
    const ro = lang === 'RO';

    return (
        <>
            <button
                type="button"
                onClick={() => setOpen(true)}
                title={ro ? 'Format arhivă ZIP' : 'ZIP archive format'}
                className="inline-flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm border-2 border-(--accent)/50 bg-(--accent)/10 hover:bg-(--accent)/20 transition-colors text-(--text-muted) hover:text-(--text-h)"
            >
                ?
            </button>

            {open && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
                    onClick={() => setOpen(false)}
                >
                    <div
                        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border-2 border-(--accent) bg-(--surface-card) p-6 md:p-8 custom-scrollbar"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            type="button"
                            onClick={() => setOpen(false)}
                            className="absolute top-4 right-4 text-(--text-muted) hover:text-(--text-h) transition-colors"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>

                        <h2 className="text-xl font-bold text-(--text-h) mb-1">
                            {ro ? 'Format arhivă ZIP' : 'ZIP Archive Format'}
                        </h2>
                        <p className="text-sm text-(--text-muted) mb-6">
                            {ro
                                ? 'Structura exactă pe care trebuie să o respecte arhiva pentru import corect. Exportul din platformă generează automat formatul corect.'
                                : 'The exact structure your archive must follow for correct import. Exporting from the platform always generates the correct format.'}
                        </p>

                        {/* 1. Folder structure */}
                        <Section title={ro ? '1. Structura folderelor' : '1. Folder structure'}>
                            <pre className="text-xs font-mono bg-(--surface-muted) rounded-xl p-4 text-(--text-h) leading-relaxed overflow-x-auto">
{`archive.zip
├── metadata/
│   ├── metadata.json        ← obligatoriu
│   └── tests.gen            ← opțional
├── statements/
│   └── ro/
│       └── statement.tex    ← obligatoriu pentru import enunț
└── files/
    ├── sources/             ← soluție de referință
    ├── validators/          ← validator de intrare
    ├── generators/          ← generator de teste
    ├── checkers/            ← checker de ieșire
    ├── interactors/         ← interactor (marchează problema ca interactivă)
    └── raw_tests/           ← teste manuale
        ├── 1.in
        ├── 1.ok
        ├── 2.in
        └── 2.ok`}
                            </pre>
                            <Warn>
                                {ro
                                    ? 'Fișierele puse direct în files/ (nu într-un subfolder) sunt ignorate complet. Orice sursă trebuie să fie în files/sources/, files/validators/ etc.'
                                    : 'Files placed directly in files/ (not in a subfolder) are completely ignored. Every source must be inside files/sources/, files/validators/, etc.'}
                            </Warn>
                        </Section>

                        {/* 2. metadata.json */}
                        <Section title="2. metadata.json">
                            <pre className="text-xs font-mono bg-(--surface-muted) rounded-xl p-4 text-(--text-h) leading-relaxed overflow-x-auto">
{`{
  "title":        "Suma Maximă",
  "time_limit":   1.0,
  "memory_limit": 256,
  "difficulty":   "MEDIUM",
  "tags":         ["Programare dinamică", "Clasa a X-a"]
}`}
                            </pre>
                            <div className="mt-3 space-y-2.5">
                                <Field
                                    name="title"
                                    type="string"
                                    desc={ro ? 'Titlul problemei. Unic pe platformă.' : 'Problem title. Must be unique on the platform.'}
                                    warn={ro ? 'Nu "problemId" sau "name".' : 'Not "problemId" or "name".'}
                                />
                                <Field
                                    name="time_limit"
                                    type="number"
                                    desc={ro ? 'Limită de timp în secunde. Interval: 0.1 – 30.0. Poate fi zecimal (ex: 1.5).' : 'Time limit in seconds. Range: 0.1 – 30.0. Can be decimal (e.g. 1.5).'}
                                    warn={ro ? 'Nu milisecunde. Nu "timeLimit" (camelCase). 69696 nu este valid.' : 'Not milliseconds. Not "timeLimit" (camelCase). 69696 is not valid.'}
                                />
                                <Field
                                    name="memory_limit"
                                    type="number"
                                    desc={ro ? 'Limită de memorie în MB. Interval: 16 – 1024. Număr întreg.' : 'Memory limit in MB. Range: 16 – 1024. Integer.'}
                                    warn={ro ? 'Nu bytes. Nu "memoryLimit" (camelCase). 468435456 bytes ≠ 256 MB.' : 'Not bytes. Not "memoryLimit" (camelCase). 468435456 bytes ≠ 256 MB.'}
                                />
                                <Field
                                    name="difficulty"
                                    type="string"
                                    desc={ro ? 'Unul dintre exact trei valori posibile (uppercase):' : 'One of exactly three possible values (uppercase):'}
                                />
                                <div className="ml-4 flex gap-2 flex-wrap">
                                    {['"EASY"', '"MEDIUM"', '"HARD"'].map(v => (
                                        <code key={v} className="text-xs px-2 py-0.5 rounded-lg bg-(--surface-muted) border border-(--accent)/20 text-(--accent) font-mono">{v}</code>
                                    ))}
                                </div>
                                <p className="ml-4 text-xs text-amber-400">{ro ? 'Nu număr (0, 1, 2). Nu lowercase ("easy"). Nu "NORMAL" sau altceva.' : 'Not a number (0, 1, 2). Not lowercase ("easy"). Not "NORMAL" or anything else.'}</p>
                                <Field
                                    name="tags"
                                    type="array"
                                    desc={ro ? 'Listă de string-uri. Tagurile trebuie să existe deja pe platformă. Poate fi array gol [].' : 'Array of strings. Tags must already exist on the platform. Can be empty [].'}
                                />
                            </div>
                        </Section>

                        {/* 3. Statement */}
                        <Section title={ro ? '3. Enunț' : '3. Statement'}>
                            <p className="text-sm text-(--text-muted) mb-2">
                                {ro ? 'Calea exactă, obligatorie:' : 'Exact required path:'}
                            </p>
                            <pre className="text-xs font-mono bg-(--surface-muted) rounded-xl p-3 text-(--accent)">
                                statements/ro/statement.tex
                            </pre>
                            <Warn>
                                {ro
                                    ? 'statements/en/ nu este importat. statement.md nu este importat. Doar .tex în ro/.'
                                    : 'statements/en/ is not imported. statement.md is not imported. Only .tex inside ro/.'}
                            </Warn>
                        </Section>

                        {/* 4. Raw tests */}
                        <Section title={ro ? '4. Teste manuale (raw_tests/)' : '4. Manual tests (raw_tests/)'}>
                            <p className="text-sm text-(--text-muted) mb-3">
                                {ro
                                    ? 'Fiecare test = un fișier .in și un fișier .ok (sau .out), cu același număr:'
                                    : 'Each test = one .in file and one .ok (or .out) file, with the same number:'}
                            </p>
                            <div className="grid grid-cols-2 gap-3 mb-3">
                                <div className="rounded-xl border border-green-500/30 bg-green-500/5 p-3">
                                    <p className="text-xs font-bold text-green-400 mb-2">✓ {ro ? 'Corect' : 'Correct'}</p>
                                    <pre className="text-xs font-mono text-(--text-h) leading-relaxed">
{`1.in  ↔  1.ok
2.in  ↔  2.ok
10.in ↔  10.ok`}
                                    </pre>
                                </div>
                                <div className="rounded-xl border border-red-500/30 bg-red-500/5 p-3">
                                    <p className="text-xs font-bold text-red-400 mb-2">✗ {ro ? 'Greșit' : 'Wrong'}</p>
                                    <pre className="text-xs font-mono text-(--text-h) leading-relaxed">
{`1-strength.in
test_01.in
01.input
1.txt`}
                                    </pre>
                                </div>
                            </div>
                            <p className="text-xs text-(--text-muted)">
                                {ro
                                    ? 'Testele fără pereche (.in fără .ok sau invers) sunt ignorate. Numerotarea poate începe de la 0 sau 1.'
                                    : 'Unpaired tests (.in without .ok or vice versa) are ignored. Numbering can start from 0 or 1.'}
                            </p>
                        </Section>

                        {/* 5. tests.gen */}
                        <Section title={ro ? '5. Script generator (tests.gen)' : '5. Generator script (tests.gen)'}>
                            <p className="text-sm text-(--text-muted) mb-3">
                                {ro
                                    ? 'Fișier opțional. Definește cum se generează testele automat. Sintaxă:'
                                    : 'Optional file. Defines how tests are generated automatically. Syntax:'}
                            </p>
                            <pre className="text-xs font-mono bg-(--surface-muted) rounded-xl p-4 text-(--text-h) leading-relaxed overflow-x-auto">
{`#MAIN solution       ← numele sursei principale (fără extensie)
#DEFGRP 30 small     ← subtask "small" cu 30% din punctaj
#DEFGRP 70 large     ← subtask "large" cu 70% din punctaj
#VAL val             ← numele validatorului (fără extensie)

#IN small large      ← testele de aici aparțin grupurilor "small" și "large"
= 1.in               ← include test manual din raw_tests/ (doar numele fișierului)

#NOTIN small         ← testele de aici NU mai aparțin lui "small"
#IN large
< gen 100000 -10000 10000   ← generează test cu comanda: gen 100000 -10000 10000
< gen 100000 0 10000`}
                            </pre>
                            <div className="mt-3 space-y-1.5">
                                <Directive name="#MAIN" desc={ro ? 'Numele binarului soluție (fără extensie). Obligatoriu.' : 'Solution binary name (no extension). Required.'} />
                                <Directive name="#DEFGRP" desc={ro ? '<procente> <nume> — definește un subtask. Procentele tuturor grupurilor trebuie să sumeze 100.' : '<percent> <name> — defines a subtask. All group percentages must sum to 100.'} />
                                <Directive name="#VAL" desc={ro ? '<nume_validator> — validatorul din files/validators/ (fără extensie).' : '<validator_name> — validator from files/validators/ (no extension).'} />
                                <Directive name="#IN" desc={ro ? '<grup1> [grup2...] — testele ce urmează aparțin acestor grupuri.' : '<group1> [group2...] — following tests belong to these groups.'} />
                                <Directive name="#NOTIN" desc={ro ? '<grup> — testele ce urmează nu mai aparțin acestui grup.' : '<group> — following tests no longer belong to this group.'} />
                                <Directive name="=" desc={ro ? '<fisier.in> — include un test manual din raw_tests/ (doar numele, nu calea completă).' : '<file.in> — include a manual test from raw_tests/ (filename only, not full path).'} warn={ro ? '"= 0-strength.in" nu funcționează dacă fișierul se numește "0-strength.in" — testul trebuie să se numească "0.in".' : '"= 0-strength.in" will not work if the file is named "0-strength.in" — the test file must be named "0.in".'} />
                                <Directive name="<" desc={ro ? '<comanda> [argumente] — generează un test apelând generatorul cu argumentele date.' : '<command> [args] — generates a test by calling the generator with given arguments.'} />
                            </div>
                        </Section>

                        {/* 6. Interactive */}
                        <Section title={ro ? '6. Probleme interactive' : '6. Interactive problems'} last>
                            <p className="text-sm text-(--text-muted)">
                                {ro
                                    ? 'O problemă este marcată automat ca interactivă dacă arhiva conține cel puțin un fișier în '
                                    : 'A problem is automatically marked as interactive if the archive contains at least one file in '}
                                <code className="text-xs font-mono text-(--accent)">files/interactors/</code>
                                {ro ? '. Nu există un flag separat în metadata.json.' : '. There is no separate flag in metadata.json.'}
                            </p>
                        </Section>
                    </div>
                </div>
            )}
        </>
    );
}

function Section({ title, children, last = false }: { title: string; children: React.ReactNode; last?: boolean }) {
    return (
        <div className={last ? '' : 'mb-6 pb-6 border-b border-(--accent)/15'}>
            <h3 className="text-sm font-bold text-(--text-h) uppercase tracking-wider mb-3">{title}</h3>
            {children}
        </div>
    );
}

function Field({ name, type, desc, warn }: { name: string; type: string; desc: string; warn?: string }) {
    return (
        <div className="flex gap-2 text-xs items-start">
            <div className="shrink-0 flex items-center gap-1.5 pt-0.5">
                <span className="font-mono text-(--accent)">{name}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-(--surface-muted) text-(--text-subtle) border border-(--accent)/15">{type}</span>
            </div>
            <span className="text-(--text-muted)">
                {desc}
                {warn && <span className="text-amber-400 block mt-0.5">{warn}</span>}
            </span>
        </div>
    );
}

function Directive({ name, desc, warn }: { name: string; desc: string; warn?: string }) {
    return (
        <div className="flex gap-2 text-xs items-start">
            <code className="font-mono text-(--accent) shrink-0 pt-0.5 min-w-[64px]">{name}</code>
            <span className="text-(--text-muted)">
                {desc}
                {warn && <span className="text-amber-400 block mt-0.5">⚠ {warn}</span>}
            </span>
        </div>
    );
}

function Warn({ children }: { children: React.ReactNode }) {
    return (
        <div className="mt-3 flex gap-2 items-start text-xs text-amber-400 bg-amber-400/5 border border-amber-400/20 rounded-xl p-3">
            <svg className="w-3.5 h-3.5 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            </svg>
            <span>{children}</span>
        </div>
    );
}
