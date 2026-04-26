import { Link, useParams } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage, translations } from "../language/Language";
import { useAuth } from "../services/AuthContext";
import { submissionService } from "../services/submissionService";
import { problemService } from "../services/problemService";
import type { Problem } from "../types/problem";
import Editor, { type OnMount } from "@monaco-editor/react";
import { useTheme } from "../services/ThemeContext";
import { languageService, type LanguageDTO } from "../services/languageService";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";

// IMPORTANT: Fără acest import, formulele nu vor avea stilurile matematice corecte
import "katex/dist/katex.min.css";

const monacoLanguageMap: Record<string, string> = {
  "C++": "cpp",
  Python: "python",
  Java: "java",
  JavaScript: "javascript",
  Rust: "rust",
};

const monacoThemes: Record<
  string,
  {
    accent: string;
    text: string;
    textMuted: string;
    textSubtle: string;
    editorBg: string;
    codeBg: string;
    accentSecondary: string;
  }
> = {
  rose: {
    accent: "#ff5eb6",
    accentSecondary: "#a78bfa",
    text: "#ffe8f6",
    textMuted: "#b39aad",
    textSubtle: "#8a7099",
    editorBg: "#0a0812",
    codeBg: "#120e1c",
  },
  nord: {
    accent: "#88c0d0",
    accentSecondary: "#5e81ac",
    text: "#eceff4",
    textMuted: "#7b88a1",
    textSubtle: "#616e88",
    editorBg: "#242933",
    codeBg: "#2e3440",
  },
};

function applyMonacoTheme(monaco: any, themeName: string) {
  const palette = monacoThemes[themeName] || monacoThemes.rose;

  monaco.editor.defineTheme("fiicoder-dark", {
    base: "vs-dark",
    inherit: true,
    rules: [
      {
        token: "comment",
        foreground: palette.textMuted.replace("#", ""),
        fontStyle: "italic",
      },
      { token: "keyword", foreground: palette.accent.replace("#", "") },
      { token: "string", foreground: palette.accentSecondary.replace("#", "") },
      { token: "number", foreground: palette.accent.replace("#", "") },
      { token: "type", foreground: palette.accentSecondary.replace("#", "") },
      { token: "function", foreground: palette.accent.replace("#", "") },
      { token: "variable", foreground: palette.text.replace("#", "") },
    ],
    colors: {
      "editor.background": palette.editorBg,
      "editor.foreground": palette.text,
      "editor.lineHighlightBackground": palette.codeBg,
      "editor.selectionBackground": `${palette.accent}4d`,
      "editor.inactiveSelectionBackground": `${palette.accent}26`,
      "editorLineNumber.foreground": palette.textSubtle,
      "editorLineNumber.activeForeground": palette.accent,
      "editorCursor.foreground": palette.accent,
      "editorIndentGuide.background": `${palette.accent}1f`,
      "editorIndentGuide.activeBackground": `${palette.accent}59`,
      "editor.selectionHighlightBackground": `${palette.accent}33`,
      "editorBracketMatch.background": `${palette.accent}40`,
      "editorBracketMatch.border": `${palette.accent}99`,
      "scrollbarSlider.background": `${palette.accent}26`,
      "scrollbarSlider.hoverBackground": `${palette.accent}4d`,
      "scrollbarSlider.activeBackground": `${palette.accent}80`,
    },
  });
  monaco.editor.setTheme("fiicoder-dark");
}

export default function ProblemDetails() {
  const { problemId } = useParams();
  const { lang } = useLanguage();
  const t = translations[lang];
  const { isAuthenticated } = useAuth();
  const { theme } = useTheme();

  const [problem, setProblem] = useState<Problem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("C++");
  const [isOpen, setIsOpen] = useState(false);
  const [status, setStatus] = useState<null | "pending" | "valid" | "invalid">(null);
  const monacoRef = useRef<any>(null);
  const [availableLanguages, setAvailableLanguages] = useState<LanguageDTO[]>([]);
  const [selectedLanguageId, setSelectedLanguageId] = useState<string>("");

  const handleEditorMount: OnMount = (_editor, monaco) => {
    monacoRef.current = monaco;
    applyMonacoTheme(monaco, theme);
  };

  useEffect(() => {
    if (monacoRef.current) {
      applyMonacoTheme(monacoRef.current, theme);
    }
  }, [theme]);

  useEffect(() => {
    let isMounted = true;
    async function fetchLanguages() {
      try {
        const data = await languageService.getAll();
        if (!isMounted) return;
        setAvailableLanguages(data);
        if (data.length > 0) {
          setSelectedLanguageId(data[0].id);
          setLanguage(data[0].name);
        }
      } catch (err) {
        console.error("Eroare la încărcarea limbajelor:", err);
      }
    }
    fetchLanguages();
    return () => { isMounted = false; };
  }, []);

  useEffect(() => {
    let isMounted = true;
    async function fetchProblemDetails() {
      if (!problemId) {
        if (isMounted) {
          setError("ID-ul problemei lipsește din URL.");
          setLoading(false);
        }
        return;
      }
      try {
        const dto = await problemService.getProblemByTitle(problemId);
        if (!isMounted) return;
        const formattedProblem: Problem = {
          id: dto.title,
          title: dto.title,
          shortDescription: dto.description.substring(0, 120) + "...",
          statement: dto.description,
          difficulty: dto.difficulty || "MEDIUM",
          tags: dto.tags || [],
        };
        setProblem(formattedProblem);
      } catch (err) {
        if (isMounted) setError("Problema nu a putut fi găsită.");
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    fetchProblemDetails();
    return () => { isMounted = false; };
  }, [problemId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!problem || !code.trim() || !selectedLanguageId) return;
    setStatus("pending");
    try {
      const response = await submissionService.submit({
        problem_title: problem.title,
        languageId: selectedLanguageId,
        code: code,
      });
      const checkStatus = setInterval(async () => {
        try {
          const result = await submissionService.getStatus(response.submissionId);
          if (result.status !== "IDLE") {
            clearInterval(checkStatus);
            setStatus(result.status === "OK" ? "valid" : "invalid");
            setTimeout(() => setStatus(null), 4000);
          }
        } catch (err) {
          clearInterval(checkStatus);
          setStatus(null);
        }
      }, 2000);
    } catch (err) {
      setStatus(null);
    }
  };

  if (loading) {
    return (
      <div className="w-full flex justify-center items-center h-[calc(100svh-11rem)]">
        <div className="animate-spin w-12 h-12 border-4 border-pink-500/30 border-t-pink-500 rounded-full" />
      </div>
    );
  }

  if (error || !problem) {
    return (
      <div className="w-full text-center p-8 text-red-400 theme-surface-card backdrop-blur-lg border-2 border-red-500/30 rounded-2xl">
        <h2 className="text-xl font-bold mb-2">Eroare</h2>
        <p>{error || "Problema nu a fost găsită."}</p>
        <Link to="/problems" className="text-pink-300 underline mt-4 inline-block">Înapoi</Link>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-6">
      <div className="grid gap-6 xl:grid-cols-3">
        <div className="h-auto overflow-visible xl:h-[calc(100svh-11rem)] xl:overflow-y-auto p-8 theme-surface-card backdrop-blur-lg border-2 border-pink-500/30 rounded-2xl card-glow custom-scrollbar">
          <p className="text-xs font-semibold uppercase tracking-wider text-pink-400">
            {lang === "RO" ? "Problemă: " : "Problem: "} {problem.title}
          </p>
          <h1 className="text-3xl font-bold text-pink-200 mb-2">{problem.title}</h1>
          {problem.tags.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-1.5">
              {problem.tags.map((tag) => (
                <span key={tag} className="px-2.5 py-0.5 rounded-full text-xs font-semibold border border-pink-500/25 bg-pink-500/10 text-pink-300/90">{tag}</span>
              ))}
            </div>
          )}
          <div className="page-line-horizontal" />
          
          <div className="text-pink-100/85 leading-relaxed markdown-container">
            <ReactMarkdown
              remarkPlugins={[remarkMath]}
              rehypePlugins={[rehypeKatex]}
              components={{
                h1: ({ ...props }) => <h1 className="text-2xl font-bold text-pink-200 mt-6 mb-3 border-b border-pink-500/20 pb-1" {...props} />,
                h2: ({ ...props }) => <h2 className="text-xl font-bold text-pink-200 mt-5 mb-2" {...props} />,
                p: ({ ...props }) => <p className="mb-4 whitespace-pre-wrap" {...props} />,
                // Randare cod și exemple
                code: ({ node, inline, className, children, ...props }: any) => {
                  return inline ? (
                    <code className="bg-pink-500/10 text-pink-300 px-1.5 py-0.5 rounded-md text-sm font-mono border border-pink-500/20" {...props}>{children}</code>
                  ) : (
                    <div className="relative group my-4">
                      <div className="rounded-xl overflow-hidden border border-pink-500/20 theme-surface-editor shadow-inner bg-black/20">
                        <code className="block p-4 text-sm font-mono text-pink-200 overflow-x-auto" {...props}>{children}</code>
                      </div>
                    </div>
                  );
                },
                ul: ({ ...props }) => <ul className="list-disc list-inside mb-4 space-y-1 text-pink-200/90" {...props} />,
              }}
            >
              {`# Test\n\nFormulă: $x^2 + y^2 = z^2$`}
            </ReactMarkdown>
          </div>
        </div>

        <div className="h-auto overflow-visible xl:h-[calc(100svh-11rem)] xl:overflow-y-auto p-8 theme-surface-card backdrop-blur-lg border-2 border-pink-500/30 rounded-2xl card-glow custom-scrollbar flex flex-col">
          {isAuthenticated ? (
            <div className="flex-1 flex flex-col h-full">
              <div className="flex items-center justify-between mb-6 shrink-0">
                <h2 className="text-xl font-bold text-pink-200">{t.submitTitle}</h2>
                <div className="relative w-32">
                  <button onClick={() => setIsOpen(!isOpen)} className="w-full flex items-center justify-between theme-surface-input border border-pink-500/30 rounded-xl px-4 py-2 text-sm text-pink-100 outline-none transition hover:border-pink-400">
                    {language} <motion.span animate={{ rotate: isOpen ? 180 : 0 }}>▼</motion.span>
                  </button>
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.12 }} className="absolute z-50 w-full theme-surface-dropdown border border-pink-500/40 rounded-xl shadow-2xl overflow-hidden">
                        {availableLanguages.map((langItem) => (
                          <button key={langItem.id} onClick={() => { setSelectedLanguageId(langItem.id); setLanguage(langItem.name); setIsOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-pink-100 hover:bg-pink-500/20 transition-colors">
                            {langItem.name} {langItem.version && `(${langItem.version})`}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
              <form onSubmit={handleSubmit} className="flex-1 flex flex-col gap-4">
                <div className="relative flex-1 rounded-2xl overflow-hidden border border-pink-500/20 theme-surface-editor min-h-75">
                  <Editor
                    height="100%"
                    language={monacoLanguageMap[language] || "cpp"}
                    value={code}
                    onChange={(val) => setCode(val || "")}
                    theme="fiicoder-dark"
                    onMount={handleEditorMount}
                    options={{
                      fontSize: 14,
                      minimap: { enabled: false },
                      automaticLayout: true,
                      wordWrap: "on",
                    }}
                  />
                </div>
                <button type="submit" disabled={status === "pending"} className="w-full shrink-0 bg-pink-500/20 border border-pink-400/50 py-4 rounded-2xl font-bold text-pink-100 outline-none transition hover:border-pink-400 hover:bg-pink-500/30 hover:-translate-y-0.5">
                  {status === "pending" ? t.evalPending : t.evalBtn}
                </button>
              </form>
            </div>
          ) : (
             <div className="flex flex-col items-center justify-center h-full gap-5 py-12 text-center">
                <h3 className="text-lg font-bold text-pink-200">Autentifică-te</h3>
                <p className="text-sm text-pink-300/60">Trebuie să fii logat pentru a trimite soluții.</p>
                <Link to="/login" className="px-6 py-2.5 rounded-xl border border-pink-400/50 bg-pink-500/20 text-sm font-bold text-pink-100 transition hover:border-pink-400">Log In</Link>
             </div>
          )}
        </div>

        <div className="h-auto overflow-visible xl:h-[calc(100svh-11rem)] xl:overflow-y-auto p-8 theme-surface-card backdrop-blur-lg border-2 border-pink-500/30 rounded-2xl card-glow custom-scrollbar">
          <h2 className="text-xl font-bold text-pink-200 mb-2">Test Panel</h2>
          <div className="page-line-horizontal" />
          <p className="text-pink-100/85">Placeholder.</p>
        </div>
      </div>
      
      {/* ── NOTIFICATION ── */}
      <AnimatePresence>
        {status && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.12 }} className="fixed bottom-8 right-8 z-100">
            <div className={`relative overflow-hidden px-8 py-5 rounded-2xl border-2 backdrop-blur-2xl ${status === "pending" ? "border-pink-500/50 theme-surface-card text-pink-200" : status === "valid" ? "border-green-500/50 bg-green-500/10 text-green-300" : "border-red-500/50 bg-red-500/10 text-red-300"}`}>
              <div className="flex items-center gap-4">
                <div className={`w-3 h-3 rounded-full animate-pulse ${status === "pending" ? "bg-pink-500" : status === "valid" ? "bg-green-500" : "bg-red-500"}`} />
                <div>
                  <h4 className="text-xs uppercase tracking-widest font-bold opacity-60">{t.systemEval}</h4>
                  <p className="text-lg font-mono">{status === "pending" ? t.checking : status === "valid" ? "VALID" : "INVALID"}</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}