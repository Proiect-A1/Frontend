import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { useLanguage, translations } from '../../../language/Language';
import { useTheme } from '../../../contexts/ThemeContext';
import { unindent } from '../utils/textUtils';
import { unpackTranslation } from '../../../utils/translationPacker';
import { useTabParam } from '../../../hooks/useTabParam';
import { useProblemData } from './useProblemData';
import { useEvaluationStream } from './useEvaluationStream';
import { useEditorLayout } from './useEditorLayout';
import { useEditorShortcuts } from './useEditorShortcuts';
import { useMonacoEditorTheme } from './useMonacoEditorTheme';

/**
 * Aggregates the problem-workspace concerns (data loading, evaluation stream,
 * editor layout, Monaco theming, keyboard shortcuts) into the single hook the
 * page consumes. Each concern lives in its own focused hook; this composer wires
 * them together and exposes a stable, flat shape to the UI.
 */
export function useProblemDetails() {
    const { problemTitle } = useParams();
    const { lang } = useLanguage();
    const t = translations[lang];
    const { isAuthenticated } = useAuth();
    const { theme, customColors } = useTheme();

    // Shared editor buffer (written by the editor, read by submit + unload guard).
    const codeRef = useRef('');
    const [isOpen, setIsOpen] = useState(false);
    const [selectedHomeworkId, setSelectedHomeworkId] = useState<string | null>(null);

    // Latest UI language for error messages produced inside async flows.
    const langRef = useRef(lang);
    useEffect(() => { langRef.current = lang; }, [lang]);

    const data = useProblemData({ problemTitle, isAuthenticated, langRef });

    const [activeTab, setActiveTab] = useTabParam<'testresult' | 'submissions'>('testresult', {
        validValues: ['testresult', 'submissions'],
    });

    const evaluation = useEvaluationStream({
        problem: data.problem,
        problemTitle,
        problemTests: data.problemTests,
        selectedLanguageId: data.selectedLanguageId,
        selectedHomeworkId,
        isAuthenticated,
        lang,
        codeRef,
        setActiveTab,
        onSubmissionsRefresh: data.setRecentSubmissions,
    });

    useEditorShortcuts({ isAuthenticated, codeRef, onSubmit: evaluation.handleSubmit });

    const layout = useEditorLayout(lang);
    const { editorRef, handleEditorMount } = useMonacoEditorTheme(theme, customColors);

    const handleCodeChange = useCallback((val: string | undefined) => {
        codeRef.current = val ?? '';
    }, []);

    const setEditorCode = useCallback((code: string) => {
        codeRef.current = code;
        editorRef.current?.getModel()?.setValue(code);
    }, [editorRef]);

    const processedDescription = useMemo(() => {
        if (!data.problem?.description) return '';
        const unpackedDescription = unpackTranslation(data.problem.description, lang);
        return unindent(unpackedDescription.replace(/\\\\/g, '\\'));
    }, [data.problem?.description, lang]);

    return {
        lang,
        t,
        isAuthenticated,
        problem: data.problem,
        loading: data.loading,
        error: data.error,
        language: data.language,
        setLanguage: data.setLanguage,
        isOpen,
        setIsOpen,
        status: evaluation.status,
        setStatus: evaluation.setStatus,
        availableLanguages: data.availableLanguages,
        setAvailableLanguages: data.setAvailableLanguages,
        selectedLanguageId: data.selectedLanguageId,
        setSelectedLanguageId: data.setSelectedLanguageId,
        recentSubmissions: data.recentSubmissions,
        activeTab,
        setActiveTab,
        evalTests: evaluation.evalTests,
        evalSubtasks: evaluation.evalSubtasks,
        evalSummary: evaluation.evalSummary,
        evalStatus: evaluation.evalStatus,
        evalError: evaluation.evalError,
        evalElapsedMs: evaluation.evalElapsedMs,
        processedDescription,
        model: layout.model,
        handleCodeChange,
        handleEditorMount,
        setEditorCode,
        handleSubmit: evaluation.handleSubmit,
        handleLayoutAction: layout.handleLayoutAction,
        handleLayoutSave: layout.handleLayoutSave,
        resetLayout: layout.resetLayout,
        problemTitle,
        problemTests: data.problemTests,
        codeRef,
        homeworkOptions: data.homeworkOptions,
        selectedHomeworkId,
        setSelectedHomeworkId,
    };
}
