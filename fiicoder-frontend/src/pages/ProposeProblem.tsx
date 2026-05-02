import { useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { motion } from "framer-motion";
import { proposeProblemService } from "../services/proposeProblemService";
import type { ProposeProblemForm } from "../types/proposeProblem";

import GeneralTab from "../components/ProposeProblem/GeneralTab";
import StatementTab from "../components/ProposeProblem/StatementTab";
import TestsTab from "../components/ProposeProblem/TestsTab";
import SubtasksTab from "../components/ProposeProblem/SubtasksTab";
import AttachmentsTab from "../components/ProposeProblem/AttachmentsTab";
import AccessTab from "../components/ProposeProblem/AccessTab";

const defaultValues: ProposeProblemForm = {
  title: "",
  difficulty: "medium",
  timeLimit: 1,
  memoryLimit: 256,
  tags: [],
  statement: "",
  sourceUrl: "",
  tests: [],
  subtasks: [],
  attachments: [],
  visibility: "private",
  allowedUsers: [],
  allowedGroups: [],
};

const TAB_OPTIONS = [
  { value: "general", label: "General" },
  { value: "statement", label: "Enunț" },
  { value: "tests", label: "Teste" },
  { value: "subtasks", label: "Subtask-uri" },
  { value: "attachments", label: "Fișiere" },
  { value: "access", label: "Acces" },
];

export default function ProposeProblem() {
  const [activeTab, setActiveTab] = useState("general");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const methods = useForm<ProposeProblemForm>({
    defaultValues,
    mode: "onChange",
  });

  const onSubmit = async (data: ProposeProblemForm) => {
    setIsSubmitting(true);
    setSubmitStatus("idle");
    try {
      await proposeProblemService.submitProposal(data);
      setSubmitStatus("success");
      methods.reset();
      // TODO: redirect to success page or show toast
    } catch (error) {
      setSubmitStatus("error");
      setErrorMessage(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full flex justify-center items-start min-h-screen py-2 px-2">
      <motion.div
        className="w-full max-w-[95vw] rounded-2xl border border-[var(--accent)]/50 theme-surface-card backdrop-blur-sm px-4 py-6 card-glow overflow-auto custom-scrollbar"
        style={{ maxHeight: '90vh', marginTop: '-12px' }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Header cu titlu stânga și tabs dreapta */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
          <h1 className="text-3xl font-bold text-[var(--text-h)]">Propune o Problemă</h1>

          {/* Tabs Navigation */}
          <div className="flex flex-wrap gap-2">
            {TAB_OPTIONS.map((tab) => (
              <button
                key={tab.value}
                type="button"
                onClick={() => setActiveTab(tab.value)}
                className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all duration-200 border ${
                  activeTab === tab.value
                    ? "bg-[var(--accent)]/30 border-[var(--accent)] text-[var(--text-h)] shadow-[0_0_12px_color-mix(in_srgb,var(--accent)_30%,transparent)]"
                    : "bg-[var(--accent)]/5 border-[var(--accent)]/25 text-[var(--text-muted)] hover:border-[var(--accent)]/60 hover:bg-[var(--accent)]/15 hover:text-[var(--text-h)]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="page-line-horizontal mb-6" />

        {/* Status Messages */}
        {submitStatus === "success" && (
          <div className="mb-6 p-4 success-box border rounded-lg text-theme-text">
            ✓ Propunerea ta a fost trimisă cu succes! Vei fi notificat când va fi revizuită.
          </div>
        )}
        {submitStatus === "error" && (
          <div className="mb-6 p-4 error-box border rounded-lg text-theme-text">
            ✗ Eroare: {errorMessage}
          </div>
        )}

        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-6">
            {/* Tabs Content */}
            <div>
              {activeTab === "general" && <GeneralTab />}
              {activeTab === "statement" && <StatementTab />}
              {activeTab === "tests" && <TestsTab />}
              {activeTab === "subtasks" && <SubtasksTab />}
              {activeTab === "attachments" && <AttachmentsTab />}
              {activeTab === "access" && <AccessTab />}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 justify-end pt-6 border-t border-[var(--accent)]/30">
              <button
                type="button"
                onClick={() => methods.reset()}
                className="px-6 py-2 rounded-xl border border-[var(--accent)]/50 bg-[var(--accent)]/10 text-[var(--text-h)] font-semibold transition-all duration-200 hover:bg-[var(--accent)]/30 hover:border-[var(--accent)] hover:-translate-y-0.5 outline-none"
              >
                Resetează
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-8 py-2 rounded-xl bg-[var(--accent)] text-[#090812] font-bold transition-all duration-200 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-0.5 shadow-[0_0_15px_color-mix(in_srgb,var(--accent)_50%,transparent)]"
              >
                {isSubmitting ? "Se trimite..." : "Trimite Propunere"}
              </button>
            </div>
          </form>
        </FormProvider>
      </motion.div>
    </div>
  );
}
