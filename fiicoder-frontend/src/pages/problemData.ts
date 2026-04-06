import type { Problem } from "../types/problem";

export const problemSummaries: Problem[] = [
  {
    id: "3f0acd46-b6e2-4190-9d1b-75c49902df2f",
    title: "sortare",
    shortDescription: "Se dă un șir de n numere naturale. Să se sorteze crescător șirul.",
    statement:
      `# Cerință

Se dă un șir de $n$ numere naturale. Să se sorteze crescător șirul.

# Date de intrare
Fișierul de intrare \`sortare.in\` conține pe prima linie un număr natural $n$. Pe următoarea linie se află $n$ numere, cele care trebuie sortate.

# Date de ieșire

Fișierul de ieșire \`sortare.out\` conține pe prima linie $n$ numere naturale, reprezentând șirul sortat.

# Restricții și precizări
* $1 \\leq n \\leq 1\\ 000\\ 000$
* $1 \\leq v_i \\leq 1\\ 000\\ 000\\ 000$, $1 \\leq i \\leq n$

# Exemplu

\`sortare.in\`
\`\`\`
6
11 8 15 20 5 2
\`\`\`

\`sortare.out\`
\`\`\`
2 5 8 11 15 20
\`\`\``,
    difficulty: "Easy",
  },
  {
    id: "6213ae07-a74a-4007-8b25-aab7c27e7344",
    title: "expresie",
    shortDescription: "Se citește un șir v de n numere întregi. Afișați rezultatul unei expresii cu sume triple.",
    statement:
      `# Cerință
Se citește un șir $v$ de $n$ numere întregi. Afișați rezultatul expresiei $ \\displaystyle \\sum_{i=1}^{n-2} \\sum_{j=i+1}^{n-1} \\sum_{k=j+1}^{n} v_i \\cdot v_j \\cdot v_k $.

# Date de intrare
Pe prima linie se află numărul natural $n$, iar pe a doua linie se află numerele din șirul $v$, separate prin exact un spațiu.

# Date de ieșire
Se afișează rezultatul expresiei din cerință.

# Restricții și precizări
- $3 \\leq n \\leq 100\\ 000$
- $-30 \\leq v_i \\leq 30, \\ i = \\overline{1..n}$

# Exemplu
\`stdin\`
\`\`\`
4
0 1 2 3
\`\`\`
\`stdout\`
\`\`\`
6
\`\`\`

## Explicație
$0 \\cdot 1 \\cdot 2 + 0 \\cdot 1 \\cdot 3 + 0 \\cdot 2 \\cdot 3 + 1 \\cdot 2 \\cdot 3 = 6$`,
    difficulty: "Medium",
  },
  {
    id: "a6b244b3-b80c-4098-9505-f1cc7e055f89",
    title: "snake",
    shortDescription: "Determinați câte perechi (L, R) formează o secvență snake într-un șir circular.",
    statement:
      `Considerăm un șir de K numere naturale nenule V = (V1,V2,V3, ...,VK), unde Vi reprezintă valoarea elementului din șir aflat pe poziția i (1 ≤ i ≤ K).

Vom nota cu compress(V) șirul obținut prin înlocuirea tuturor elementelor cu valori egale aflate pe poziții consecutive în șir cu un singur element având acea valoare. De exemplu, dacă V = (1, 1, 2, 2, 2, 4, 3, 3, 1, 1), atunci compress(V) va fi șirul (1, 2, 4, 3, 1).

Spunem că o poziție dintr-un șir este maxim local dacă valoarea de la acea poziție este strict mai mare decât elementele aflate pe pozițiile vecine. Spunem că o poziție dintr-un șir este minim local dacă valoarea de la acea poziție este strict mai mică decât elementele aflate pe pozițiile vecine.

Se dă șirul A de N numere naturale nenule. Numim secvență snake a șirului A o secvență S = (AL, AL+1, AL+2, ...AR) cu 1 ≤ L < R ≤ N cu proprietatea că fiecare poziție din șirul compress(S) este minim local sau maxim local.

Cerință: Să se determine câte perechi de poziții (L, R) cu 1 ≤ L < R ≤ N au proprietatea că secvența S = (AL, AL+1, AL+2, ...AR) este snake.`,
    difficulty: "Hard",
  },
  {
    id: "fb46579f-487c-4f17-9917-e10be93f986e",
    title: "Frumusel",
    shortDescription: "Aflați media frumuseților tuturor permutărilor unui șir circular modulo 10^9 + 7.",
    statement:
      `Se dă un număr N și un șir circular a = (a1, a2, ..., aN) (adică a1 și an sunt vecini) și definim frumusețea sa f(a) astfel:

f(a) = Σ(i=1..N) |ai − a(i mod N)+1|

Se dă un număr N și un șir v = (v1, v2, ..., vN) de N numere întregi pozitive distincte.
Trebuie să aflați media frumuseților tuturor permutărilor lui v modulo 10^9 + 7.

Date de intrare:
Pe prima linie un număr întreg N, (N ≤ 300000)
Pe a doua linie N numere întregi v1, v2, ..., vN, (0 ≤ vi ≤ 10^9, 1 ≤ i ≤ N)

Date de ieșire:
Un număr întreg X, egal cu rezultatul dorit modulo 10^9 + 7.`,
    difficulty: "Hard",
  },
];
