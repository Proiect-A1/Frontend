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
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-full font-semibold border-2 border-amber-400/60 bg-amber-400/10 hover:bg-amber-400/20 transition-colors text-amber-400"
            >
                <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                {ro ? 'Format ZIP' : 'ZIP Format'}
            </button>

            {open && (
                <div
                    className="fixed inset-0 z-50 flex justify-center p-6 pt-28"
                    style={{ backgroundColor: 'rgba(0,0,0,0.6)', alignItems: 'flex-start' }}
                    onClick={() => setOpen(false)}
                >
                    <div
                        className="relative w-full max-w-4xl max-h-[75vh] overflow-y-auto rounded-3xl border-2 border-(--accent) bg-(--surface-modal) p-6 md:p-8 custom-scrollbar"
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
                                ? 'Structura exactă pe care trebuie să o respecte arhiva pentru import corect. Dacă nu ești sigur, folosește butonul Export ZIP după ce completezi formularul - arhiva generată automat este întotdeauna în formatul corect.'
                                : 'The exact structure your archive must follow for correct import. If unsure, use the Export ZIP button after filling the form - the auto-generated archive is always in the correct format.'}
                        </p>

                        {/* 1. Folder structure */}
                        <Section title={ro ? '1. Structura folderelor' : '1. Folder structure'}>
                            <div className="grid md:grid-cols-2 gap-3">
                                <pre className="text-xs font-mono bg-(--surface-muted) rounded-xl p-4 text-(--text-h) leading-relaxed overflow-x-auto">
{`archive.zip
├── metadata/
│   ├── metadata.json
│   └── tests.gen
├── statements/
│   ├── ro/
│   │   └── statement.tex
│   └── en/
│       └── statement.tex
└── files/
    ├── sources/
    │   └── main.cpp
    ├── validators/
    │   └── val.cpp
    ├── generators/
    │   └── gen.cpp
    ├── checkers/
    │   └── check.cpp
    ├── interactors/
    │   └── inter.cpp
    └── raw_tests/
        ├── 1.in
        ├── 1.ok
        ├── strength.1.in
        └── strength.1.ok`}
                                </pre>
                                <div className="space-y-2 text-xs text-(--text-muted)">
                                    {[
                                        {
                                            path: 'metadata.json',
                                            note: ro ? 'OBLIGATORIU. Conține titlul, limitele (timp în secunde, memorie în bytes) și dificultatea problemei.' : 'REQUIRED. Contains title, limits (time in seconds, memory in bytes) and difficulty.',
                                            accent: true,
                                        },
                                        {
                                            path: 'tests.gen',
                                            note: ro ? 'Opțional. Script pentru generarea automată a testelor.' : 'Optional. Script for automatic test generation.',
                                        },
                                        {
                                            path: 'statement.tex/.md',
                                            note: ro ? 'Enunțul problemei. Acceptat în ro/ și/sau en/.' : 'Problem statement. Accepted in ro/ and/or en/.',
                                            accent: true,
                                        },
                                        {
                                            path: 'sources/',
                                            note: ro ? 'Soluția de referință (ex: main.cpp). Folosită pentru verificare internă.' : 'Reference solution (e.g. main.cpp). Used for internal checking.',
                                        },
                                        {
                                            path: 'validators/',
                                            note: ro ? 'Validator de intrare - verifică că fișierele .in respectă formatul.' : 'Input validator - checks that .in files match the expected format.',
                                        },
                                        {
                                            path: 'generators/',
                                            note: ro ? 'Generator de teste. Apelat din tests.gen cu comanda < gen [argumente].' : 'Test generator. Called from tests.gen with < gen [arguments].',
                                        },
                                        {
                                            path: 'checkers/',
                                            note: ro ? 'Checker personalizat de ieșire. Necesar când răspunsul corect nu e unic.' : 'Custom output checker. Needed when the correct answer is not unique.',
                                        },
                                        {
                                            path: 'interactors/',
                                            note: ro ? 'Interactor pentru probleme interactive. Prezența unui fișier aici marchează automat problema ca interactivă.' : 'Interactor for interactive problems. Having any file here automatically marks the problem as interactive.',
                                        },
                                        {
                                            path: 'raw_tests/',
                                            note: ro ? 'Teste manuale. Fiecare test = un fișier .in + un fișier .ok cu același număr.' : 'Manual tests. Each test = one .in file + one .ok file with the same number.',
                                        },
                                    ].map(({ path, note, accent }) => (
                                        <div key={path} className="flex items-start gap-2">
                                            <code className={`font-mono shrink-0 leading-relaxed ${accent ? 'text-(--accent)' : 'text-(--text-subtle)'}`}>{path}</code>
                                            <span className="leading-relaxed">{note}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <Warn>
                                {ro
                                    ? 'Fișierele puse direct în files/ (nu într-un subfolder) sunt ignorate complet la import. Exemplu: files/main.cpp nu va fi importat - trebuie să fie files/sources/main.cpp.'
                                    : 'Files placed directly in files/ (not in a subfolder) are completely ignored on import. Example: files/main.cpp will not be imported - it must be files/sources/main.cpp.'}
                            </Warn>
                            <Warn>
                                {ro
                                    ? 'Arhiva nu trebuie să conțină un folder wrapper cu același nume. Dacă creezi ZIP-ul prin right-click pe un folder, ajungi cu o structură de tipul archive.zip/archive/files/... în loc de archive.zip/files/... - sandbox-ul va eșua silențios. Conținutul trebuie să fie direct la rădăcina arhivei.'
                                    : 'The archive must not contain a wrapper folder with the same name. If you create the ZIP by right-clicking a folder, you end up with a structure like archive.zip/archive/files/... instead of archive.zip/files/... - the sandbox will fail silently. The contents must be directly at the archive root.'}
                            </Warn>
                        </Section>

                        {/* 2. metadata.json */}
                        <Section title="2. metadata.json">
                            <p className="text-sm text-(--text-muted) mb-3">
                                {ro
                                    ? 'Fișierul conține câmpuri pentru ambii consumatori: backend-ul platformei (snake_case, string-uri) și sandbox-ul de evaluare (camelCase, numere). Exportul generat automat include toate câmpurile necesare.'
                                    : 'The file contains fields for both consumers: the platform backend (snake_case, strings) and the evaluation sandbox (camelCase, numbers). The auto-generated export includes all required fields.'}
                            </p>
                            <pre className="text-xs font-mono bg-(--surface-muted) rounded-xl p-4 text-(--text-h) leading-relaxed overflow-x-auto">
{`{
  "title":        "Suma Maximă",      ← titlul problemei (re-import)
  "problemId":    "Suma Maximă",      ← sandbox: același titlu

  "time_limit":   "1.0",              ← re-import: string, în SECUNDE
  "timeLimit":    1000,               ← sandbox: număr, în MILISECUNDE (1s = 1000ms)

  "memory_limit": "268435456",        ← re-import: string, în BYTES
  "memoryLimit":  268435456,          ← sandbox: număr, în BYTES (256 MB = 268435456)

  "difficulty":   "MEDIUM",           ← string ("EASY"/"MEDIUM"/"HARD"/"CONTEST")
  "difficultyLevel": 2,               ← sandbox: număr (1=EASY, 2=MEDIUM, 3=HARD, 4=CONTEST)

  "tags":         ["Programare dinamică"],
  "revId":        0,
  "problemStyle": "IOI",
  "problemType":  "Batch",            ← "Interactive" dacă există fișiere în interactors/
  "inputFile":    "stdin",
  "outputFile":   "stdout",
  "authors":      []
}`}
                            </pre>
                            <div className="mt-4 space-y-4">
                                <Field
                                    name="title / problemId"
                                    type="string"
                                    desc={ro
                                        ? 'Titlul problemei - același string în ambele câmpuri. Trebuie să fie unic pe platformă. Dacă lipsește "title", se citește "problemId" ca fallback.'
                                        : 'Problem title - same string in both fields. Must be unique on the platform. If "title" is missing, "problemId" is used as fallback.'}
                                />
                                <Field
                                    name="time_limit / timeLimit"
                                    type="string / number"
                                    desc={ro
                                        ? 'Două reprezentări ale aceleiași limite. "time_limit" e string în SECUNDE (ex: "1.5") - folosit la re-import. "timeLimit" e număr în MILISECUNDE (ex: 1500) - citit de sandbox la evaluare. Exportul automat face conversia corect.'
                                        : 'Two representations of the same limit. "time_limit" is a string in SECONDS (e.g. "1.5") - used on re-import. "timeLimit" is a number in MILLISECONDS (e.g. 1500) - read by the sandbox during evaluation. The auto-export converts correctly.'}
                                    warn={ro
                                        ? 'Atenție: "timeLimit" e în milisecunde, NU secunde. 1 secundă = 1000. Dacă pui 1.0 în loc de 1000, submission-ul tău va TLE pe orice test.'
                                        : 'Warning: "timeLimit" is in milliseconds, NOT seconds. 1 second = 1000. If you put 1.0 instead of 1000, your submission will TLE on every test.'}
                                />
                                <Field
                                    name="memory_limit / memoryLimit"
                                    type="string / number"
                                    desc={ro
                                        ? 'Limita de memorie per test, în BYTES. Backend-ul îl citește ca string, sandbox-ul ca număr. 256 MB = 268.435.456 bytes. 64 MB = 67.108.864 bytes.'
                                        : 'Memory limit per test, in BYTES. Backend reads it as string, sandbox as number. 256 MB = 268,435,456 bytes. 64 MB = 67,108,864 bytes.'}
                                    warn={ro
                                        ? 'Valoarea este în BYTES, nu MB. Nu pune 256 - pune 268435456. Exportul automat face conversia corect din valoarea în MB introdusă în formular.'
                                        : 'Value is in BYTES, not MB. Do not put 256 - put 268435456. The auto-export converts correctly from the MB value entered in the form.'}
                                />
                                <div>
                                    <Field
                                        name="difficulty / difficultyLevel"
                                        type="string / number"
                                        desc={ro
                                            ? 'Dificultatea problemei. Backend-ul citește string cu majuscule; sandbox-ul citește număr (1–4):'
                                            : 'Problem difficulty. Backend reads uppercase string; sandbox reads number (1–4):'}
                                    />
                                    <div className="ml-4 mt-2 flex gap-3 flex-wrap items-center text-xs">
                                        {[{ s: '"EASY"', n: 1 }, { s: '"MEDIUM"', n: 2 }, { s: '"HARD"', n: 3 }, { s: '"CONTEST"', n: 4 }].map(({ s, n }) => (
                                            <span key={s} className="flex items-center gap-1">
                                                <code className="px-2 py-0.5 rounded-lg bg-(--surface-muted) border border-(--accent)/20 text-(--accent) font-mono">{s}</code>
                                                <span className="text-(--text-subtle)">→ {n}</span>
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                <Field
                                    name="tags"
                                    type="string[]"
                                    desc={ro
                                        ? 'Listă de etichete. Fiecare etichetă trebuie să existe deja pe platformă. Poate fi array gol [].'
                                        : 'List of tags. Each tag must already exist on the platform. Can be empty [].'}
                                />
                                <Field
                                    name="problemType"
                                    type="string"
                                    desc={ro
                                        ? '"Batch" pentru probleme standard, "Interactive" pentru probleme interactive. Detectat automat la export dacă există fișiere în files/interactors/.'
                                        : '"Batch" for standard problems, "Interactive" for interactive problems. Auto-detected on export if files exist in files/interactors/.'}
                                />
                            </div>
                        </Section>

                        {/* 3. Statement */}
                        <Section title={ro ? '3. Enunț' : '3. Statement'}>
                            <p className="text-sm text-(--text-muted) mb-3">
                                {ro
                                    ? 'Importul citește automat ambele limbi dacă există. Extensiile acceptate pentru fiecare: .tex (LaTeX) sau .md (Markdown).'
                                    : 'Import automatically reads both languages if present. Accepted extensions for each: .tex (LaTeX) or .md (Markdown).'}
                            </p>
                            <div className="space-y-2 mb-3">
                                {[
                                    { path: 'statements/ro/statement.tex', label: ro ? 'enunț în română (LaTeX)' : 'Romanian statement (LaTeX)' },
                                    { path: 'statements/ro/statement.md',  label: ro ? 'enunț în română (Markdown)' : 'Romanian statement (Markdown)' },
                                    { path: 'statements/en/statement.tex', label: ro ? 'enunț în engleză (LaTeX)' : 'English statement (LaTeX)' },
                                    { path: 'statements/en/statement.md',  label: ro ? 'enunț în engleză (Markdown)' : 'English statement (Markdown)' },
                                ].map(({ path, label }) => (
                                    <div key={path} className="flex items-center gap-3 text-xs">
                                        <code className="font-mono text-(--accent) bg-(--surface-muted) px-2 py-1 rounded-lg shrink-0">{path}</code>
                                        <span className="text-(--text-muted)">{label}</span>
                                    </div>
                                ))}
                            </div>
                            <p className="text-xs text-(--text-muted)">
                                {ro
                                    ? 'Poți include una sau ambele limbi. Dacă lipsesc ambele, enunțul va fi gol. Utilizatorul va vedea varianta corespunzătoare limbii selectate în interfață.'
                                    : 'You can include one or both languages. If both are missing, the statement will be empty. Users will see the version matching the language selected in the interface.'}
                            </p>
                            <Warn>
                                {ro
                                    ? 'Imaginile (PNG, JPG, SVG etc.) nu sunt suportate în enunț. Nu include fișiere imagine în arhivă și nu folosi sintaxa ![](imagine.png) în Markdown - imaginea nu va fi afișată.'
                                    : 'Images (PNG, JPG, SVG, etc.) are not supported in statements. Do not include image files in the archive and do not use ![](image.png) Markdown syntax - the image will not be displayed.'}
                            </Warn>
                        </Section>

                        {/* 4. Raw tests */}
                        <Section title={ro ? '4. Teste manuale (files/raw_tests/)' : '4. Manual tests (files/raw_tests/)'}>
                            <p className="text-sm text-(--text-muted) mb-3">
                                {ro
                                    ? 'Fiecare test manual constă din exact două fișiere: un fișier de intrare (.in) și un fișier cu răspunsul așteptat (.ok sau .out). Numele de bază (fără extensie) trebuie să fie identic pentru cele două fișiere — poți folosi orice nume (numeric sau text).'
                                    : 'Each manual test consists of exactly two files: an input file (.in) and an expected output file (.ok or .out). The base name (without extension) must match between the two files — you can use any name (numeric or text).'}
                            </p>
                            <div className="grid grid-cols-2 gap-3 mb-3">
                                <div className="rounded-xl border border-green-500/30 bg-green-500/5 p-3">
                                    <p className="text-xs font-bold text-green-400 mb-2 flex items-center gap-1"><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" /></svg>{ro ? 'Corect' : 'Correct'}</p>
                                    <pre className="text-xs font-mono text-(--text-h) leading-relaxed">
{`1.in           ↔  1.ok
strength.1.in  ↔  strength.1.ok
sample_a.in    ↔  sample_a.ok
10.in          ↔  10.ok`}
                                    </pre>
                                </div>
                                <div className="rounded-xl border border-red-500/30 bg-red-500/5 p-3">
                                    <p className="text-xs font-bold text-red-400 mb-2 flex items-center gap-1"><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>{ro ? 'Greșit - ignorat' : 'Wrong - ignored'}</p>
                                    <pre className="text-xs font-mono text-(--text-h) leading-relaxed">
{`01.input       (extensie .input)
input1.txt     (extensie .txt)
1.in (fără 1.ok / 1.out perechea)`}
                                    </pre>
                                </div>
                            </div>
                            <p className="text-xs text-(--text-muted)">
                                {ro
                                    ? 'Un fișier fără pereche (ex: există 3.in dar nu există 3.ok / 3.out) este ignorat complet. Extensiile acceptate sunt .in pentru intrare și .ok sau .out pentru ieșirea așteptată.'
                                    : 'An unpaired file (e.g. 3.in exists but 3.ok / 3.out does not) is completely ignored. Accepted extensions are .in for input and .ok or .out for the expected output.'}
                            </p>
                        </Section>

                        {/* 5. tests.gen */}
                        <Section title={ro ? '5. Script generator (metadata/tests.gen)' : '5. Generator script (metadata/tests.gen)'}>
                            <p className="text-sm text-(--text-muted) mb-3">
                                {ro
                                    ? 'Fișier opțional care definește structura subtask-urilor și cum se generează testele automat. Fiecare linie este fie o directivă (începe cu #) fie o comandă de test (= sau <).'
                                    : 'Optional file that defines the subtask structure and how tests are generated automatically. Each line is either a directive (starts with #) or a test command (= or <).'}
                            </p>
                            <pre className="text-xs font-mono bg-(--surface-muted) rounded-xl p-4 text-(--text-h) leading-relaxed overflow-x-auto">
{`#MAIN solution        ← numele fișierului sursă principal din files/sources/ (fără extensie)
#DEFGRP 30 small      ← definește subtask-ul "small" cu 30% din punctaj
#DEFGRP 70 large      ← definește subtask-ul "large" cu 70% din punctaj
                         (toate procentele trebuie să sumeze 100)
#VAL val              ← numele validatorului din files/validators/ (fără extensie)

#IN small large       ← testele care urmează aparțin subtask-urilor "small" ȘI "large"
= 1.in                ← include testul manual files/raw_tests/1.in (doar numele, fără cale)

#NOTIN small          ← de aici înainte, testele NU mai aparțin lui "small"
#IN large             ← dar aparțin în continuare lui "large"
< gen 100 -1000 1000  ← generează un test rulând: files/generators/gen 100 -1000 1000
< gen 100000 0 9999   ← alt test generat cu alți parametri`}
                            </pre>
                            <div className="mt-4 space-y-3">
                                <Directive
                                    name="#MAIN"
                                    desc={ro
                                        ? 'Numele binarului soluție din files/sources/, fără extensie. Ex: dacă ai files/sources/solution.cpp, scrie #MAIN solution.'
                                        : 'Binary name of the solution from files/sources/, without extension. E.g. if you have files/sources/solution.cpp, write #MAIN solution.'}
                                />
                                <Directive
                                    name="#DEFGRP"
                                    desc={ro
                                        ? '<procente> <nume> - definește un subtask. Procentele tuturor subtask-urilor definite trebuie să sumeze exact 100.'
                                        : '<percent> <name> - defines a subtask. The percentages of all defined subtasks must sum to exactly 100.'}
                                />
                                <Directive
                                    name="#VAL"
                                    desc={ro
                                        ? '<nume> - validatorul din files/validators/, fără extensie. Ex: dacă ai files/validators/val.cpp, scrie #VAL val.'
                                        : '<name> - validator from files/validators/, without extension. E.g. if you have files/validators/val.cpp, write #VAL val.'}
                                />
                                <Directive
                                    name="#IN"
                                    desc={ro
                                        ? '<grup1> [grup2...] - toate testele de după această linie (până la următorul #IN sau #NOTIN) aparțin subtask-urilor specificate.'
                                        : '<group1> [group2...] - all tests after this line (until the next #IN or #NOTIN) belong to the specified subtasks.'}
                                />
                                <Directive
                                    name="#NOTIN"
                                    desc={ro
                                        ? '<grup> - testele de după această linie nu mai aparțin subtask-ului specificat, chiar dacă aparțineau înainte.'
                                        : '<group> - tests after this line no longer belong to the specified subtask, even if they did before.'}
                                />
                                <Directive
                                    name="="
                                    desc={ro
                                        ? '<fisier.in> - include un test manual existent din files/raw_tests/. Scrie doar numele fișierului (cu extensia .in), nu calea completă. Numele trebuie să fie identic cu cel din raw_tests/ — ex: pentru files/raw_tests/strength.1.in scrie "= strength.1.in".'
                                        : '<file.in> - includes an existing manual test from files/raw_tests/. Write only the filename (with .in extension), not the full path. The name must match exactly what is in raw_tests/ — e.g. for files/raw_tests/strength.1.in write "= strength.1.in".'}
                                />
                                <Directive
                                    name="<"
                                    desc={ro
                                        ? '<comanda> [argumente] - generează un test nou rulând generatorul cu argumentele date. Generatorul trebuie să existe în files/generators/ și să fie declarat cu #MAIN sau apelat după numele binarului.'
                                        : '<command> [arguments] - generates a new test by running the generator with the given arguments. The generator must exist in files/generators/.'}
                                />
                            </div>
                        </Section>

                        {/* 6. Interactive */}
                        <Section title={ro ? '6. Probleme interactive' : '6. Interactive problems'} last>
                            <p className="text-sm text-(--text-muted)">
                                {ro
                                    ? 'Nu există un câmp în metadata.json pentru probleme interactive. O problemă este marcată automat ca interactivă dacă arhiva conține cel puțin un fișier în '
                                    : 'There is no field in metadata.json for interactive problems. A problem is automatically marked as interactive if the archive contains at least one file in '}
                                <code className="text-xs font-mono text-(--accent)">files/interactors/</code>
                                {ro
                                    ? '. Dacă folderul interactors/ lipsește sau e gol, problema e tratată ca non-interactivă.'
                                    : '. If the interactors/ folder is missing or empty, the problem is treated as non-interactive.'}
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
                {warn && <span className="text-amber-400 flex items-start gap-1 mt-1"><svg className="w-3.5 h-3.5 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /></svg>{warn}</span>}
            </span>
        </div>
    );
}

function Directive({ name, desc, warn }: { name: string; desc: string; warn?: string }) {
    return (
        <div className="flex gap-2 text-xs items-start">
            <code className="font-mono text-(--accent) shrink-0 pt-0.5 min-w-[72px]">{name}</code>
            <span className="text-(--text-muted)">
                {desc}
                {warn && <span className="text-amber-400 flex items-start gap-1 mt-1"><svg className="w-3.5 h-3.5 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /></svg>{warn}</span>}
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
