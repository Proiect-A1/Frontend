import { useEffect, useState } from 'react';
import { submissionService } from '../services/submissionService';
import { problemService } from '../../../services/problemService';
import type { ProblemFindResponseDTO } from '../../../services/problemService';
import { languageService } from '../services/languageService';
import type { LanguageDTO, ProblemSubmissionDTO, ProblemTestDetailsDTO, HomeworkShortOptionDTO } from '../types/problemDetails';
import { storage, STORAGE_KEYS } from '../../../utils/storage';

interface UseProblemDataParams {
    problemTitle: string | undefined;
    isAuthenticated: boolean;
    // Latest UI language, read at error time for localized messages.
    langRef: React.MutableRefObject<string>;
}

/**
 * Loads everything the problem workspace needs: the problem itself, available
 * languages (and the default selection), test structure, and — when authenticated
 * — the user's recent submissions and applicable homework options.
 */
export function useProblemData({ problemTitle, isAuthenticated, langRef }: UseProblemDataParams) {
    const [problem, setProblem] = useState<ProblemFindResponseDTO | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [language, setLanguage] = useState(() => storage.get(STORAGE_KEYS.editorLanguage) ?? 'C++');
    const [availableLanguages, setAvailableLanguages] = useState<LanguageDTO[]>([]);
    const [selectedLanguageId, setSelectedLanguageId] = useState<string>('');

    const [recentSubmissions, setRecentSubmissions] = useState<ProblemSubmissionDTO[]>([]);
    const [problemTests, setProblemTests] = useState<ProblemTestDetailsDTO | null>(null);
    const [homeworkOptions, setHomeworkOptions] = useState<HomeworkShortOptionDTO[]>([]);

    useEffect(() => {
        let isMounted = true;

        async function fetchData() {
            if (!problemTitle || problemTitle === 'undefined') {
                if (isMounted) {
                    setError('Titlul problemei lipsește din URL.');
                    setLoading(false);
                }
                return;
            }

            try {
                const [problemDto, langs, testDetails] = await Promise.all([
                    problemService.getProblemByTitle(problemTitle),
                    languageService.getAll().catch(() => []),
                    submissionService.getTests(problemTitle).catch(() => null)
                ]);

                if (!isMounted) return;

                setProblem(problemDto);
                setAvailableLanguages(langs);
                setProblemTests(testDetails);
                if (langs.length > 0) {
                    const savedLangName = storage.get(STORAGE_KEYS.editorLanguage);
                    const savedLang = savedLangName ? langs.find(l => l.name === savedLangName) : null;
                    const cppLang = langs.find(l =>
                        l.name === 'C++' ||
                        l.name?.toLowerCase() === 'cpp' ||
                        l.name?.toLowerCase().includes('c++'),
                    );
                    const defaultLang = savedLang ?? cppLang ?? langs[0];
                    setSelectedLanguageId(defaultLang.id);
                    setLanguage(defaultLang.name);
                }

                if (isAuthenticated && problemTitle) {
                    submissionService
                        .getByProblem(problemTitle)
                        .then((data) => { if (isMounted) setRecentSubmissions(data); })
                        .catch((err) => console.error('Error fetching submissions:', err));

                    submissionService
                        .getHomeworkOptions(problemTitle)
                        .then((opts) => { if (isMounted) setHomeworkOptions(opts); })
                        .catch(() => {});
                }
            } catch (err: any) {
                if (isMounted) {
                    if (err?.status === 403) {
                        setError(
                            langRef.current === 'RO'
                                ? 'Nu aveți permisiunea de a vizualiza această problemă.'
                                : 'You do not have permission to view this problem.',
                        );
                    } else {
                        setError(
                            langRef.current === 'RO'
                                ? 'Eroare la încărcarea problemei.'
                                : 'Error loading problem.',
                        );
                    }
                }
            } finally {
                if (isMounted) setLoading(false);
            }
        }

        void fetchData();

        return () => {
            isMounted = false;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [problemTitle, isAuthenticated]);

    return {
        problem,
        loading,
        error,
        language,
        setLanguage,
        availableLanguages,
        setAvailableLanguages,
        selectedLanguageId,
        setSelectedLanguageId,
        recentSubmissions,
        setRecentSubmissions,
        problemTests,
        homeworkOptions,
    };
}
