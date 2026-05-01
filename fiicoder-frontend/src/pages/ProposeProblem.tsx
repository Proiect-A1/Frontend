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
        className="w-full max-w-[95vw] rounded-2xl border-2 accent-border bg-theme-surface-card px-4 py-6 card-glow overflow-auto propose-problem-root"
        style={{ maxHeight: '90vh', marginTop: '-12px' }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-theme-text mb-2">Propune o Problemă</h1>
          <p className="text-theme-text-muted">
            Creează o nouă problemă și propune-o comunității. Va fi revizuită de moderatori înainte de a fi publicată.
          </p>
        </div>

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
            {/* Tabs Navigation */}
            <div className="flex flex-wrap gap-2 mb-6 accent-border pb-4 border-b">
              {TAB_OPTIONS.map((tab) => (
                <button
                  key={tab.value}
                  type="button"
                  onClick={() => setActiveTab(tab.value)}
                  className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                    activeTab === tab.value
                      ? "accent-bg-subtle accent-text accent-border border"
                      : "text-theme-text-muted hover:text-theme-text hover:accent-hover"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

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
            <div className="flex gap-4 justify-end pt-6 border-t accent-border">
              <button
                type="button"
                onClick={() => methods.reset()}
                className="px-6 py-2 border accent-border rounded-lg text-theme-text hover:accent-hover transition-colors font-semibold"
              >
                Resetează
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-8 py-2 accent-bg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-semibold transition-all"
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
