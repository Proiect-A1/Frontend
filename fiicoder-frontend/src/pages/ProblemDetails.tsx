import { Link, useParams } from "react-router-dom";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { problemSummaries } from "./problemData";
import { useLanguage, translations } from "../language/Language";
import { useAuth } from "../services/AuthContext";
import { submissionService } from "../services/submissionService";

export default function ProblemDetails() {
  const { problemId } = useParams();
  const problem = problemSummaries.find((item) => item.id === problemId);

  const { lang } = useLanguage();
  const t = translations[lang];
  const { isAuthenticated, username } = useAuth();

  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("C++");
  const [isOpen, setIsOpen] = useState(false);
  const [status, setStatus] = useState<null | "pending" | "valid" | "invalid">(
    null,
  );

  const languages = ["C++", "Python", "Java", "JavaScript", "Rust"];

  const userUuidMap: Record<string, string> = {
    admin: "02c52893-bb4d-4d53-83c9-0eaa13d0863b",
    student_test: "9fd27efc-323c-46d3-b3fb-5f356f8eda36",
    testuser: "57f4fac5-e804-45f4-98a5-71c0c4b9ad6c",
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!problem || !code.trim()) return;
    setStatus("pending");

    try {
      const resolvedUserId = userUuidMap[username || ""] || username || "";
      const response = await submissionService.submit({
        problem_id: problem.id,
        user_id: resolvedUserId,
        code: code,
      });

      const checkStatus = setInterval(async () => {
        try {
          const result = await submissionService.getStatus(
            response.submissionId,
          );

          if (result.status !== "IDLE") {
            clearInterval(checkStatus);
            if (result.status === "OK") {
              setStatus("valid");
            } else {
              setStatus("invalid");
            }
            setTimeout(() => setStatus(null), 4000);
          }
        } catch (err) {
          clearInterval(checkStatus);
          setStatus(null);
          console.error("Eroare la verificarea statusului:", err);
        }
      }, 2000);
    } catch (err) {
      setStatus(null);
      console.error("Eroare la trimiterea submisiei:", err);
    }
  };

  if (!problem)
    return <div className="p-8 text-pink-200">Error! Problem not found.</div>;

  return (
    <div className="w-full flex flex-col gap-6">
      {/* 3-column grid */}
      <div className="grid gap-6 xl:grid-cols-3">
        {/* column 1 - Problem description */}
        <div className="h-auto overflow-visible xl:h-[calc(100svh-11rem)] xl:overflow-y-auto p-8 bg-[#151221]/80 backdrop-blur-lg border-2 border-pink-500/30 rounded-2xl card-glow custom-scrollbar">
          <p className="text-xs font-semibold uppercase tracking-wider text-pink-400">
            Problem #{problem.id}
          </p>
          <h1 className="text-3xl font-bold text-pink-200 mb-2">
            {problem.title}
          </h1>
          <div className="page-line-horizontal" />
          <p className="text-pink-100/85 leading-relaxed whitespace-pre-wrap">
            {problem.statement}
          </p>
        </div>

        {/* column 2 - Submission */}
        <div className="h-auto overflow-visible xl:h-[calc(100svh-11rem)] xl:overflow-y-auto p-8 bg-[#151221]/80 backdrop-blur-lg border-2 border-pink-500/30 rounded-2xl card-glow custom-scrollbar flex flex-col">
          {isAuthenticated ? (
            <div className="flex-1 flex flex-col h-full">
              <div className="flex items-center justify-between mb-6 shrink-0">
                <h2 className="text-xl font-bold text-pink-200">
                  {t.submitTitle}
                </h2>
                <div className="relative w-32">
                  <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="w-full flex items-center justify-between bg-[#0f0c18] border border-pink-500/30 rounded-xl px-4 py-2 text-sm text-pink-100 outline-none transition hover:border-pink-400"
                  >
                    {language}
                    <motion.span animate={{ rotate: isOpen ? 180 : 0 }}>
                      ▼
                    </motion.span>
                  </button>
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 5 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute z-50 w-full bg-[#1a1629] border border-pink-500/40 rounded-xl shadow-2xl overflow-hidden"
                      >
                        {languages.map((lang) => (
                          <button
                            key={lang}
                            onClick={() => {
                              setLanguage(lang);
                              setIsOpen(false);
                            }}
                            className="w-full text-left px-4 py-2 text-sm text-pink-100 hover:bg-pink-500/20 transition-colors"
                          >
                            {lang}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              <form
                onSubmit={handleSubmit}
                className="flex-1 flex flex-col gap-4"
              >
                <div className="relative group flex-1">
                  <textarea
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder={t.placeholderCode}
                    className="w-full h-full min-h-50 resize-none bg-[#0a0812] border border-pink-500/20 rounded-2xl p-6 pb-70 font-mono text-sm text-pink-100 outline-none focus:border-pink-500/50 transition-all shadow-inner custom-scrollbar"
                  />
                  <div className="absolute top-4 right-4 text-xs font-mono text-pink-500/30 group-focus-within:text-pink-500/60">
                    {language.toLowerCase()}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={status === "pending"}
                  className="w-full shrink-0 bg-pink-500/20 border border-pink-400/50 py-4 rounded-2xl font-bold text-pink-100 outline-none transition hover:border-pink-400 hover:bg-pink-500/30 hover:-translate-y-0.5"
                >
                  {status === "pending" ? t.evalPending : t.evalBtn}
                </button>
              </form>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full gap-5 py-12">
              <div className="shrink-0 w-16 h-16 rounded-full bg-pink-500/10 border-2 border-pink-500/30 flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-7 h-7 text-pink-400/70"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
                  />
                </svg>
              </div>
              <div className="text-center">
                <h3 className="text-lg font-bold text-pink-200 mb-1">
                  {lang === "RO" ? "Trimite soluții" : "Submit Solutions"}
                </h3>
                <p className="text-sm text-pink-300/60 max-w-xs">
                  {lang === "RO"
                    ? "Trebuie să te autentifici pentru a trimite rezolvări la probleme."
                    : "You need to log in to submit solutions to problems."}
                </p>
              </div>
              <Link
                to="/login"
                className="px-6 py-2.5 rounded-xl border border-pink-400/50 bg-pink-500/20 text-sm font-bold text-pink-100 transition hover:border-pink-400 hover:bg-pink-500/30 hover:-translate-y-0.5"
              >
                {lang === "RO" ? "Autentifică-te" : "Log In"}
              </Link>
            </div>
          )}
        </div>

        {/* column 3 - empty test panel */}
        <div className="h-auto overflow-visible xl:h-[calc(100svh-11rem)] xl:overflow-y-auto p-8 bg-[#151221]/80 backdrop-blur-lg border-2 border-pink-500/30 rounded-2xl card-glow custom-scrollbar">
          <h2 className="text-xl font-bold text-pink-200 mb-2">Test Panel</h2>
          <div className="page-line-horizontal" />
          <p className="text-pink-100/85">
            This is an empty panel placeholder.
          </p>
        </div>
        {/* ── BACK BUTTON ── */}
        <div className="flex justify-start shrink-0">
          <Link to="/problems" className="relative inline-block group">
            <motion.div
              className="flex items-center gap-2 text-pink-300/70 font-semibold text-sm hover:text-pink-100 transition-colors cursor-pointer"
              whileHover="hover"
            >
              <motion.span
                variants={{ hover: { x: -5 } }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                ←
              </motion.span>
              <span>{t.backToList}</span>

              <motion.div
                className="absolute -bottom-0.5 left-6 h-px bg-pink-400/60"
                initial={{ width: 0 }}
                variants={{ hover: { width: "calc(100% - 24px)" } }}
                transition={{ duration: 0.3 }}
              />
            </motion.div>
          </Link>
        </div>
      </div>

      {/* ── NOTIFICATION ── */}
      <AnimatePresence>
        {status && (
          <motion.div
            initial={{ x: 400, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 400, opacity: 0 }}
            className="fixed bottom-8 right-8 z-100"
          >
            <div
              className={`relative overflow-hidden px-8 py-5 rounded-2xl border-2 backdrop-blur-2xl shadow-[0_10px_40px_rgba(0,0,0,0.5)] ${
                status === "pending"
                  ? "border-pink-500/50 bg-[#151221]/90 text-pink-200"
                  : status === "valid"
                    ? "border-green-500/50 bg-[#0d1a12]/90 text-green-300"
                    : "border-red-500/50 bg-[#1a0d0d]/90 text-red-300"
              }`}
            >
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: status === "pending" ? 2 : 4 }}
                className={`absolute bottom-0 left-0 h-1 w-full origin-left ${
                  status === "pending"
                    ? "bg-pink-500"
                    : status === "valid"
                      ? "bg-green-500"
                      : "bg-red-500"
                }`}
              />
              <div className="flex items-center gap-4">
                <div
                  className={`w-3 h-3 rounded-full animate-pulse ${
                    status === "pending"
                      ? "bg-pink-500"
                      : status === "valid"
                        ? "bg-green-500"
                        : "bg-red-500"
                  }`}
                />
                <div>
                  <h4 className="text-xs uppercase tracking-widest font-bold opacity-60">
                    {t.systemEval}
                  </h4>
                  <p className="text-lg font-mono tracking-tight">
                    {status === "pending"
                      ? t.checking
                      : status === "valid"
                        ? "VALID"
                        : "INVALID"}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
