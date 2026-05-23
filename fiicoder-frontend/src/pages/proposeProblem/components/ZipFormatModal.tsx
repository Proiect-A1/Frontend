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
                    className="fixed inset-0 z-50 flex justify-center p-4 pt-20"
                    style={{ backgroundColor: 'rgba(0,0,0,0.6)', alignItems: 'flex-start' }}
                    onClick={() => setOpen(false)}
                >
                    <div
                        className="relative w-full max-w-2xl max-h-[80vh] overflow-y-auto rounded-3xl border-2 border-(--accent) bg-(--surface-card) p-6 md:p-8 custom-scrollbar"
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
                                ? 'Structura exactă pe care trebuie să o respecte arhiva pentru import corect. Dacă nu ești sigur, folosește butonul Export ZIP după ce completezi formularul — arhiva generată automat este întotdeauna în formatul corect.'
                                : 'The exact structure your archive must follow for correct import. If unsure, use the Export ZIP button after filling the form — the auto-generated archive is always in the correct format.'}
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
│   └── ro/
│       └── statement.tex
└── files/
    ├── sources/
    ├── validators/
    ├── generators/
    ├── checkers/
    ├── interactors/
    └── raw_tests/
        ├── 1.in
        ├── 1.ok
        ├── 2.in
        └── 2.ok`}
                                </pre>
                                <div className="space-y-2 text-xs text-(--text-muted)">
                                    {[
                                        {
                                            path: 'metadata.json',
                                            note: ro ? 'OBLIGATORIU. Conține titlul, limitele și dificultatea problemei.' : 'REQUIRED. Contains title, limits and difficulty.',
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
                                            note: ro ? 'Soluția de referință (ex: solution.cpp). Folosită pentru verificare internă.' : 'Reference solution (e.g. solution.cpp). Used for internal checking.',
                                        },
                                        {
                                            path: 'validators/',
                                            note: ro ? 'Validator de intrare — verifică că fișierele .in respectă formatul.' : 'Input validator — checks that .in files match the expected format.',
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
                                    ? 'Fișierele puse direct în files/ (nu într-un subfolder) sunt ignorate complet la import. Exemplu: files/solution.cpp nu va fi importat — trebuie să fie files/sources/solution.cpp.'
                                    : 'Files placed directly in files/ (not in a subfolder) are completely ignored on import. Example: files/solution.cpp will not be imported — it must be files/sources/solution.cpp.'}
                            </Warn>
                        </Section>

                        {/* 2. metadata.json */}
                        <Section title="2. metadata.json">
                            <p className="text-sm text-(--text-muted) mb-3">
                                {ro
                                    ? 'Fișier JSON cu 5 câmpuri. Toate sunt obligatorii în afară de tags. Numele câmpurilor sunt cu underscore (snake_case), nu camelCase.'
                                    : 'JSON file with 5 fields. All are required except tags. Field names use underscore (snake_case), not camelCase.'}
                            </p>
                            <pre className="text-xs font-mono bg-(--surface-muted) rounded-xl p-4 text-(--text-h) leading-relaxed overflow-x-auto">
{`{
  "title":        "Suma Maximă",
  "time_limit":   1.0,
  "memory_limit": 256,
  "difficulty":   "MEDIUM",
  "tags":         ["Programare dinamică", "Clasa a X-a"]
}`}
                            </pre>
                            <div className="mt-4 space-y-4">
                                <Field
                                    name="title"
                                    type="string"
                                    desc={ro
                                        ? 'Titlul problemei, exact cum va apărea pe platformă. Trebuie să fie unic — dacă există deja o problemă cu același titlu, importul va eșua.'
                                        : 'Problem title, exactly as it will appear on the platform. Must be unique — if a problem with the same title already exists, import will fail.'}
                                    warn={ro
                                        ? 'Câmpul se numește "title", nu "problemId", "name" sau altceva. Dacă lipsește, titlul va rămâne gol.'
                                        : 'The field is called "title", not "problemId", "name" or anything else. If missing, the title will be left empty.'}
                                />
                                <Field
                                    name="time_limit"
                                    type="number"
                                    desc={ro
                                        ? 'Limita de timp per test, în secunde. Acceptă valori zecimale. Interval valid: 0.1 până la 30.0. Exemple: 1.0, 1.5, 2.0.'
                                        : 'Time limit per test, in seconds. Accepts decimal values. Valid range: 0.1 to 30.0. Examples: 1.0, 1.5, 2.0.'}
                                    warn={ro
                                        ? 'Unitatea este secunde, nu milisecunde. Câmpul se numește "time_limit" cu underscore, nu "timeLimit". Valoarea 69696 (milisecunde) nu este validă — ar trebui să fie 69.696, dar depășește limita de 30s.'
                                        : 'Unit is seconds, not milliseconds. Field is called "time_limit" with underscore, not "timeLimit". Value 69696 (milliseconds) is invalid — it should be 69.696, but that exceeds the 30s limit.'}
                                />
                                <Field
                                    name="memory_limit"
                                    type="number"
                                    desc={ro
                                        ? 'Limita de memorie per test, în megabytes (MB). Trebuie să fie număr întreg. Interval valid: 16 până la 1024. Exemple: 64, 256, 512.'
                                        : 'Memory limit per test, in megabytes (MB). Must be an integer. Valid range: 16 to 1024. Examples: 64, 256, 512.'}
                                    warn={ro
                                        ? 'Unitatea este MB, nu bytes. 256 MB = 268.435.456 bytes — nu pune valoarea în bytes. Câmpul se numește "memory_limit" cu underscore, nu "memoryLimit".'
                                        : 'Unit is MB, not bytes. 256 MB = 268,435,456 bytes — do not put the value in bytes. Field is called "memory_limit" with underscore, not "memoryLimit".'}
                                />
                                <div>
                                    <Field
                                        name="difficulty"
                                        type="string"
                                        desc={ro
                                            ? 'Dificultatea problemei. Trebuie să fie exact unul dintre cele trei string-uri de mai jos, cu majuscule:'
                                            : 'Problem difficulty. Must be exactly one of the three strings below, uppercase:'}
                                    />
                                    <div className="ml-4 mt-2 flex gap-2 flex-wrap">
                                        {['"EASY"', '"MEDIUM"', '"HARD"'].map(v => (
                                            <code key={v} className="text-xs px-2 py-0.5 rounded-lg bg-(--surface-muted) border border-(--accent)/20 text-(--accent) font-mono">{v}</code>
                                        ))}
                                    </div>
                                    <p className="ml-4 mt-1.5 text-xs text-amber-400">
                                        {ro
                                            ? '⚠ Nu număr (0, 1, 2 nu sunt valide). Nu lowercase ("easy" nu merge). Nu alte valori ("NORMAL", "MEDIUM-HARD" etc.).'
                                            : '⚠ Not a number (0, 1, 2 are not valid). Not lowercase ("easy" doesn\'t work). No other values ("NORMAL", "MEDIUM-HARD" etc.).'}
                                    </p>
                                </div>
                                <Field
                                    name="tags"
                                    type="string[]"
                                    desc={ro
                                        ? 'Listă de etichete. Fiecare etichetă trebuie să existe deja pe platformă — dacă pui un tag inexistent, importul va eșua. Poate fi array gol [] dacă nu vrei etichete.'
                                        : 'List of tags. Each tag must already exist on the platform — if you include a non-existent tag, import will fail. Can be empty [] if you don\'t want any tags.'}
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
                        </Section>

                        {/* 4. Raw tests */}
                        <Section title={ro ? '4. Teste manuale (files/raw_tests/)' : '4. Manual tests (files/raw_tests/)'}>
                            <p className="text-sm text-(--text-muted) mb-3">
                                {ro
                                    ? 'Fiecare test manual constă din exact două fișiere: un fișier de intrare (.in) și un fișier cu răspunsul așteptat (.ok sau .out). Cele două fișiere trebuie să aibă același număr în nume.'
                                    : 'Each manual test consists of exactly two files: an input file (.in) and an expected output file (.ok or .out). Both files must share the same number in their name.'}
                            </p>
                            <div className="grid grid-cols-2 gap-3 mb-3">
                                <div className="rounded-xl border border-green-500/30 bg-green-500/5 p-3">
                                    <p className="text-xs font-bold text-green-400 mb-2">✓ {ro ? 'Corect' : 'Correct'}</p>
                                    <pre className="text-xs font-mono text-(--text-h) leading-relaxed">
{`1.in  ↔  1.ok
2.in  ↔  2.ok
0.in  ↔  0.ok
10.in ↔  10.ok`}
                                    </pre>
                                </div>
                                <div className="rounded-xl border border-red-500/30 bg-red-500/5 p-3">
                                    <p className="text-xs font-bold text-red-400 mb-2">✗ {ro ? 'Greșit — ignorat' : 'Wrong — ignored'}</p>
                                    <pre className="text-xs font-mono text-(--text-h) leading-relaxed">
{`1-strength.in
test_01.in
01.input
input1.txt`}
                                    </pre>
                                </div>
                            </div>
                            <p className="text-xs text-(--text-muted)">
                                {ro
                                    ? 'Un fișier fără pereche (ex: există 3.in dar nu există 3.ok) este ignorat complet. Numerotarea poate începe de la 0 sau 1 și poate fi discontinuă (1, 2, 5, 6 funcționează).'
                                    : 'An unpaired file (e.g. 3.in exists but 3.ok does not) is completely ignored. Numbering can start from 0 or 1 and can be non-consecutive (1, 2, 5, 6 works).'}
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
                                        ? '<procente> <nume> — definește un subtask. Procentele tuturor subtask-urilor definite trebuie să sumeze exact 100.'
                                        : '<percent> <name> — defines a subtask. The percentages of all defined subtasks must sum to exactly 100.'}
                                />
                                <Directive
                                    name="#VAL"
                                    desc={ro
                                        ? '<nume> — validatorul din files/validators/, fără extensie. Ex: dacă ai files/validators/val.cpp, scrie #VAL val.'
                                        : '<name> — validator from files/validators/, without extension. E.g. if you have files/validators/val.cpp, write #VAL val.'}
                                />
                                <Directive
                                    name="#IN"
                                    desc={ro
                                        ? '<grup1> [grup2...] — toate testele de după această linie (până la următorul #IN sau #NOTIN) aparțin subtask-urilor specificate.'
                                        : '<group1> [group2...] — all tests after this line (until the next #IN or #NOTIN) belong to the specified subtasks.'}
                                />
                                <Directive
                                    name="#NOTIN"
                                    desc={ro
                                        ? '<grup> — testele de după această linie nu mai aparțin subtask-ului specificat, chiar dacă aparțineau înainte.'
                                        : '<group> — tests after this line no longer belong to the specified subtask, even if they did before.'}
                                />
                                <Directive
                                    name="="
                                    desc={ro
                                        ? '<fisier.in> — include un test manual existent din files/raw_tests/. Scrie doar numele fișierului, nu calea completă.'
                                        : '<file.in> — includes an existing manual test from files/raw_tests/. Write only the filename, not the full path.'}
                                    warn={ro
                                        ? 'Dacă testul se numește files/raw_tests/1.in, scrie "= 1.in". Dacă se numește "0-strength.in", redenumește-l în "1.in" — altfel va fi ignorat.'
                                        : 'If the test is files/raw_tests/1.in, write "= 1.in". If it\'s named "0-strength.in", rename it to "1.in" — otherwise it will be ignored.'}
                                />
                                <Directive
                                    name="<"
                                    desc={ro
                                        ? '<comanda> [argumente] — generează un test nou rulând generatorul cu argumentele date. Generatorul trebuie să existe în files/generators/ și să fie declarat cu #MAIN sau apelat după numele binarului.'
                                        : '<command> [arguments] — generates a new test by running the generator with the given arguments. The generator must exist in files/generators/.'}
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
                {warn && <span className="text-amber-400 block mt-1">⚠ {warn}</span>}
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
                {warn && <span className="text-amber-400 block mt-1">⚠ {warn}</span>}
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
