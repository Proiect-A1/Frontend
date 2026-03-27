import type { Problem } from "../types/problem";

export const problemSummaries: Problem[] = [
  {
    id: 1,
    title: "Problem 1",
    shortDescription: "Find the sum of two integers read from input.",
    statement:
      "Given two integers a and b, print their sum. This is a warm-up problem for parsing and basic arithmetic.",
    difficulty: "Ușor",
  },
  {
    id: 2,
    title: "Problem 2",
    shortDescription: "Count vowels in a lowercase string.",
    statement:
      "Given a lowercase string s, compute how many characters are vowels from the set {a, e, i, o, u}.",
    difficulty: "Ușor",
  },
  {
    id: 3,
    title: "Problem 3",
    shortDescription: "Return the maximum value from a list of numbers.",
    statement:
      "Given n integers, output the largest number. Assume n is at least 1.",
    difficulty: "Mediu",
  },
  {
    id: 4,
    title: "Problem 4",
    shortDescription: "Check if a number is a palindrome.",
    statement:
      "Given an integer x, determine whether it reads the same from left to right and right to left.",
    difficulty: "Mediu",
  },
  {
    id: 5,
    title: "Problem 5",
    shortDescription: "Compute factorial n! for n up to 12.",
    statement:
      "Given an integer n, compute the product 1 * 2 * ... * n. Constraints keep the result inside 32-bit signed integer.",
    difficulty: "Greu",
  },
  {
    id: 6,
    title: "Problem 6",
    shortDescription: "Sort numbers in ascending order.",
    statement:
      "Given n integers, print them sorted in non-decreasing order.",
    difficulty: "Ușor",
  },
  {
    id: 7,
    title: "Problem 7",
    shortDescription: "Sort numbers in descending order.",
    statement:
      "Given n integers, print them sorted in non-increasing order.",
    difficulty: "Ușor",
  },
  {
    id: 8,
    title: "Problem 8",
    shortDescription: "Find the maximum element in an array.",
    statement:
      "Given an array of n integers, find the largest element.",
    difficulty: "Mediu",
  },
];
