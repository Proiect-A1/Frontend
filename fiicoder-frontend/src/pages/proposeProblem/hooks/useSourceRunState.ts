import { useState, useCallback } from 'react';
import type { SubtaskRunResult } from '../types/proposeProblem';

interface SourceRunHistory {
    score: number;
    maxScore: number;
    timestamp: string;
    subtasks: SubtaskRunResult[];
}

function generateMockRunResult(fileName: string): SourceRunHistory {
    const isMain = fileName.toLowerCase().includes('main');
    const subtasks: SubtaskRunResult[] = [
        {
            subtaskId: 'st_1',
            name: 'Subtask 1 - Brute Force',
            scored: 30,
            maxPoints: 30,
            tests: [
                {
                    testId: '000',
                    verdict: 'OK',
                    time: 0.02,
                    memory: 4.2,
                    points: 10,
                    maxPoints: 10,
                },
                {
                    testId: '001',
                    verdict: 'OK',
                    time: 0.05,
                    memory: 4.5,
                    points: 10,
                    maxPoints: 10,
                },
                {
                    testId: '002',
                    verdict: 'OK',
                    time: 0.01,
                    memory: 3.8,
                    points: 10,
                    maxPoints: 10,
                },
            ],
        },
        {
            subtaskId: 'st_2',
            name: 'Subtask 2 - Optimizat',
            scored: isMain ? 70 : 14,
            maxPoints: 70,
            tests: [
                {
                    testId: '003',
                    verdict: isMain ? 'OK' : 'WA',
                    time: 0.03,
                    memory: 5.1,
                    points: isMain ? 14 : 0,
                    maxPoints: 14,
                },
                {
                    testId: '004',
                    verdict: 'OK',
                    time: 0.12,
                    memory: 6.2,
                    points: 14,
                    maxPoints: 14,
                },
                {
                    testId: '005',
                    verdict: isMain ? 'OK' : 'TLE',
                    time: isMain ? 0.45 : 2.1,
                    memory: 12.3,
                    points: isMain ? 14 : 0,
                    maxPoints: 14,
                },
                {
                    testId: '006',
                    verdict: isMain ? 'OK' : 'WA',
                    time: 0.22,
                    memory: 8.0,
                    points: isMain ? 14 : 0,
                    maxPoints: 14,
                },
                {
                    testId: '007',
                    verdict: isMain ? 'OK' : 'MLE',
                    time: 0.33,
                    memory: isMain ? 15 : 280,
                    points: isMain ? 14 : 0,
                    maxPoints: 14,
                },
            ],
        },
    ];
    return {
        score: subtasks.reduce((s, st) => s + st.scored, 0),
        maxScore: subtasks.reduce((s, st) => s + st.maxPoints, 0),
        timestamp: new Date().toISOString(),
        subtasks,
    };
}

export function useSourceRunState() {
    const [runningFileId, setRunningFileId] = useState<string | null>(null);
    const [runHistory, setRunHistory] = useState<Record<string, SourceRunHistory>>({});
    const [expandedResults, setExpandedResults] = useState<Set<string>>(new Set());
    const [expandedSubtasks, setExpandedSubtasks] = useState<Set<string>>(new Set());

    const handleRunSource = useCallback(async (fileId: string, fileName: string) => {
        setRunningFileId(fileId);
        try {
            await new Promise((resolve) => setTimeout(resolve, 2000));
            const result = generateMockRunResult(fileName);
            setRunHistory((prev) => ({ ...prev, [fileId]: result }));
            setExpandedResults((prev) => new Set(prev).add(fileId));
            setExpandedSubtasks(new Set(result.subtasks.map((s) => `${fileId}_${s.subtaskId}`)));
        } finally {
            setRunningFileId(null);
        }
    }, []);

    const toggleResults = useCallback((fileId: string) => {
        setExpandedResults((prev) => {
            const next = new Set(prev);
            if (next.has(fileId)) next.delete(fileId);
            else next.add(fileId);
            return next;
        });
    }, []);

    const toggleSubtask = useCallback((key: string) => {
        setExpandedSubtasks((prev) => {
            const next = new Set(prev);
            if (next.has(key)) next.delete(key);
            else next.add(key);
            return next;
        });
    }, []);

    const clearFileHistory = useCallback((fileId: string) => {
        setRunHistory((prev) => {
            const next = { ...prev };
            delete next[fileId];
            return next;
        });
    }, []);

    return {
        runningFileId,
        runHistory,
        expandedResults,
        expandedSubtasks,
        handleRunSource,
        toggleResults,
        toggleSubtask,
        clearFileHistory,
    };
}

export type { SourceRunHistory };

