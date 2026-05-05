import type { ProposeProblemForm } from "../types/proposeProblem";

/**
 * Mock problem proposals for demonstration and testing
 */

export const mockProposals: ProposeProblemForm[] = [
  {
    title: "Two Sum",
    difficulty: "easy",
    timeLimit: 1,
    memoryLimit: 256,
    isInteractive: false,
    tags: ["Array", "Hash Table"],
    statement: `# Two Sum

## Descriere
Dat un șir de numere întregi \`nums\` și un întreg \`target\`, returnează indicii celor două numere care se adună la \`target\`.

Poți presupune că fiecare input are **exact o soluție** și nu poți folosi același element de două ori.

## Cerință
Returnează indicii în orice ordine.

## Restricții
- $2 \\leq \\text{nums.length} \\leq 10^4$
- $-10^9 \\leq \\text{nums[i]} \\leq 10^9$
- $-10^9 \\leq \\text{target} \\leq 10^9$

## Exemple

### Exemplul 1
**Input:**
\`\`\`
nums = [2,7,11,15], target = 9
\`\`\`
**Output:**
\`\`\`
[0,1]
\`\`\`

### Exemplul 2
**Input:**
\`\`\`
nums = [3,2,4], target = 6
\`\`\`
**Output:**
\`\`\`
[1,2]
\`\`\``,
    sourceUrl: "https://leetcode.com/problems/two-sum/",
    tests: [
      {
        id: "test_1",
        input: "4 9\n2 7 11 15",
        output: "0 1",
        subtaskIds: ["subtask_1"],
        points: 1,
        source: 'manual',
      },
      {
        id: "test_2",
        input: "3 6\n3 2 4",
        output: "1 2",
        subtaskIds: ["subtask_1"],
        points: 1,
        source: 'manual',
      },
      {
        id: "test_3",
        input: "2 0\n0 0",
        output: "0 1",
        subtaskIds: ["subtask_2"],
        points: 1,
        source: 'manual',
      },
      {
        id: "test_4",
        input: "5 15\n1 2 3 4 5",
        output: "4 3",
        subtaskIds: ["subtask_2"],
        points: 1,
        source: 'manual',
      },
    ],
    subtasks: [
      {
        id: "subtask_1",
        title: "Soluție Brute Force O(n²)",
        points: 50,
        testIds: ["test_1", "test_2"],
      },
      {
        id: "subtask_2",
        title: "Soluție Optimizată O(n) cu Hash Map",
        points: 50,
        testIds: ["test_3", "test_4"],
      },
    ],
    generatorScript: '',
    files: [],
    attachments: [],
    visibility: "public",
  },

  {
    title: "Fibonacci Sequence",
    difficulty: "easy",
    timeLimit: 0.5,
    memoryLimit: 128,
    isInteractive: false,
    tags: ["Recursion", "Dynamic Programming"],
    statement: `# Fibonacci Sequence

## Descriere
Calculează al n-lea număr Fibonacci.

Secvența Fibonacci este definită ca:
- $F(0) = 0$
- $F(1) = 1$
- $F(n) = F(n-1) + F(n-2)$ pentru $n \\geq 2$

## Cerință
Returnează valoarea $F(n)$ modulo $10^9 + 7$.

## Restricții
- $0 \\leq n \\leq 10^5$

## Exemple
$F(0) = 0$
$F(1) = 1$
$F(2) = 1$
$F(5) = 5$
$F(10) = 55$`,
    tests: [
      {
        id: "fib_1",
        input: "0",
        output: "0",
        subtaskIds: ["fib_easy"],
        points: 1,
        source: 'manual',
      },
      {
        id: "fib_2",
        input: "1",
        output: "1",
        subtaskIds: ["fib_easy"],
        points: 1,
        source: 'manual',
      },
      {
        id: "fib_3",
        input: "10",
        output: "55",
        subtaskIds: ["fib_medium"],
        points: 1,
        source: 'manual',
      },
      {
        id: "fib_4",
        input: "100000",
        output: "517691607",
        subtaskIds: ["fib_hard"],
        points: 1,
        source: 'manual',
      },
    ],
    subtasks: [
      {
        id: "fib_easy",
        title: "Valori Mici (n ≤ 10)",
        points: 20,
        testIds: ["fib_1", "fib_2"],
      },
      {
        id: "fib_medium",
        title: "Valori Medii (n ≤ 1000)",
        points: 40,
        testIds: ["fib_3"],
      },
      {
        id: "fib_hard",
        title: "Valori Mari (n ≤ 100000)",
        points: 40,
        testIds: ["fib_4"],
      },
    ],
    generatorScript: '',
    files: [],
    attachments: [],
    visibility: "public",
  },

  {
    title: "Longest Palindromic Substring",
    difficulty: "medium",
    timeLimit: 1.5,
    memoryLimit: 512,
    isInteractive: false,
    tags: ["String", "Dynamic Programming"],
    statement: `# Longest Palindromic Substring

## Descriere
Dat un șir de caractere, găsește cel mai lung substring palindromic.

Un **palindrom** este un cuvânt care se citește la fel înainte și înapoi.

## Cerință
Returnează cel mai lung substring palindromic din șir.

## Restricții
- $1 \\leq \\text{s.length} \\leq 1000$
- Șirul conține doar litere și cifre

## Exemplu
- Input: "babad"
- Output: "bab" sau "aba" (ambele sunt corecte)`,
    tests: [
      {
        id: "pal_1",
        input: "babad",
        output: "bab",
        subtaskIds: ["pal_brute"],
        source: 'manual',
      },
      {
        id: "pal_2",
        input: "cbbd",
        output: "bb",
        subtaskIds: ["pal_opt"],
        source: 'manual',
      },
    ],
    subtasks: [
      {
        id: "pal_brute",
        title: "Brute Force O(n³)",
        points: 40,
        testIds: ["pal_1"],
      },
      {
        id: "pal_opt",
        title: "Optimizat O(n²) sau O(n)",
        points: 60,
        testIds: ["pal_2"],
      },
    ],
    generatorScript: '',
    files: [],
    attachments: [],
    visibility: "private",
  },
];

/**
 * Get a random mock proposal for demo purposes
 */
export const getRandomMockProposal = (): ProposeProblemForm => {
  return mockProposals[Math.floor(Math.random() * mockProposals.length)];
};

/**
 * Get all mock proposals
 */
export const getAllMockProposals = (): ProposeProblemForm[] => {
  return mockProposals;
};
