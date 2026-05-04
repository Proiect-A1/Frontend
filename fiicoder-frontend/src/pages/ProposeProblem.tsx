import { useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { motion } from 'framer-motion';
import { proposeProblemService } from '../services/proposeProblemService';
import type { ProposeProblemForm } from '../types/proposeProblem';

import GeneralTab from '../components/ProposeProblem/GeneralTab';
import StatementTab from '../components/ProposeProblem/StatementTab';
import GeneratorTab from '../components/ProposeProblem/GeneratorTab';
import TestsTab from '../components/ProposeProblem/TestsTab';
import SubtasksTab from '../components/ProposeProblem/SubtasksTab';
import FilesTab from '../components/ProposeProblem/AttachmentsTab';
import RunTab from '../components/ProposeProblem/RunTab';
import AccessTab from '../components/ProposeProblem/AccessTab';
import { pageVariants } from '../utils/motionConfig';
import { useLanguage } from '../language/Language';

const defaultValues: ProposeProblemForm = {
    title: '',
    difficulty: 'medium',
    timeLimit: 1,
    memoryLimit: 256,
    tags: [],
    statement: '',
    sourceUrl: '',
    generatorScript: '',
    tests: [],
    subtasks: [],
    files: [],
    attachments: [],
    visibility: 'private',
    allowedUsers: [],
    allowedGroups: [],
};

const tabs = [
    { id: 'general', labelRO: 'General', labelEN: 'General' },
    { id: 'statement', labelRO: 'Enunț', labelEN: 'Statement' },
    { id: 'generator', labelRO: 'Generator', labelEN: 'Generator' },
    { id: 'tests', labelRO: 'Teste Manuale', labelEN: 'Manual Tests' },
    { id: 'subtasks', labelRO: 'Subtask-uri', labelEN: 'Subtasks' },
    { id: 'files', labelRO: 'Fișiere', labelEN: 'Files' },
    { id: 'run', labelRO: 'Rulează', labelEN: 'Run' },
    { id: 'access', labelRO: 'Acces', labelEN: 'Access' },
];

export default function ProposeProblem() {
    const [activeTab, setActiveTab] = useState('general');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState('');

    const methods = useForm<ProposeProblemForm>({
        defaultValues,
        mode: 'onChange',
    });

    const onSubmit = async (data: ProposeProblemForm) => {
        setIsSubmitting(true);
        setSubmitStatus('idle');
        try {
            await proposeProblemService.submitProposal(data);
            setSubmitStatus('success');
            methods.reset();
            // TODO: redirect to success page or show toast
        } catch (error) {
            setSubmitStatus('error');
            setErrorMessage(error instanceof Error ? error.message : 'An error occurred');
        } finally {
            setIsSubmitting(false);
        }
    };

    const { lang } = useLanguage();

    return (
        <div className="w-full flex justify-center h-auto xl:flex-1 xl:min-h-0">
            <motion.div
                className="w-full max-w-7xl rounded-2xl border-2 border-(--accent) bg-(--surface-card) backdrop-blur-sm px-5 py-6 md:px-8 md:py-8 h-auto overflow-visible xl:h-full xl:overflow-y-auto custom-scrollbar"
                variants={pageVariants}
                initial="hidden"
                animate="visible"
            >
                {/* Header cu titlu stânga și tabs dreapta */}
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
                    <h1 className="text-3xl font-bold text-(--text-h)">Propune o Problemă</h1>

                    {/* Tabs Navigation */}
                    <div className="flex flex-wrap gap-2 lg:justify-end">
                        {tabs.map((tab) => {
                            const isActive = activeTab === tab.id;
                            const baseClasses =
                                'px-3 py-1.5 rounded-full text-xs sm:text-sm font-bold border-2 transition-all duration-200 flex items-center justify-center cursor-pointer outline-none';

                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`${baseClasses} ${
                                        isActive
                                            ? 'bg-(--accent)/25 border-(--accent) text-(--text-h)'
                                            : 'bg-transparent border-(--accent)/50 text-(--text) hover:bg-(--accent)/15 hover:text-(--text-h) hover:-translate-y-0.5'
                                    }`}
                                >
                                    {lang === 'RO' ? tab.labelRO : tab.labelEN}
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div className="page-line-horizontal mb-6" />

                {/* Status Messages */}
                {submitStatus === 'success' && (
                    <div className="mb-6 p-4 success-box border rounded-xl text-theme-text">
                        ✓ Propunerea ta a fost trimisă cu succes! Vei fi notificat când va fi
                        revizuită.
                    </div>
                )}
                {submitStatus === 'error' && (
                    <div className="mb-6 p-4 error-box border rounded-xl text-theme-text">
                        ✗ Eroare: {errorMessage}
                    </div>
                )}

                <FormProvider {...methods}>
                    <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-6">
                        {/* Tabs Content */}
                        <div>
                            {activeTab === 'general' && <GeneralTab />}
                            {activeTab === 'statement' && <StatementTab />}
                            {activeTab === 'generator' && <GeneratorTab />}
                            {activeTab === 'tests' && <TestsTab />}
                            {activeTab === 'subtasks' && <SubtasksTab />}
                            {activeTab === 'files' && <FilesTab />}
                            {activeTab === 'run' && <RunTab />}
                            {activeTab === 'access' && <AccessTab />}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-4 justify-end pt-3">
                            <button
                                type="button"
                                onClick={() => methods.reset()}
                                className="inline-flex items-center justify-center px-4 py-2 text-sm rounded-xl font-semibold border border-(--accent)/50 bg-(--accent)/10 hover:bg-(--accent)/20 transition-colors"
                            >
                                Resetează
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="inline-flex items-center justify-center px-4 py-2 text-sm rounded-xl font-semibold border border-(--accent)/50 bg-(--accent)/10 hover:bg-(--accent)/20 transition-colors"
                            >
                                {isSubmitting ? 'Se trimite...' : 'Trimite Propunere'}
                            </button>
                        </div>
                    </form>
                </FormProvider>
            </motion.div>
        </div>
    );
}
