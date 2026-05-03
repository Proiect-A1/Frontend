import { Link, useParams } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage, translations } from "../language/Language";
import { useAuth } from "../services/AuthContext";
import { submissionService } from "../services/submissionService";
import { problemService } from "../services/problemService";
import type { ProblemFindResponseDTO } from "../services/problemService";
import Editor, { type OnMount } from "@monaco-editor/react";
import { useTheme } from "../services/ThemeContext";
import { languageService, type LanguageDTO } from "../services/languageService";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";

// Utility to fix database indentation issues for Markdown
function unindent(str: string): string {
  if (!str) return "";
  const lines = str.split("\n");

  let minIndent = Infinity;
  for (let i = 1; i < lines.length; i++) {
    if (lines[i].trim().length > 0) {
      const match = lines[i].match(/^[ \t]*/);
      if (match) {
        minIndent = Math.min(minIndent, match[0].length);
      }
    }
  }

  if (minIndent === Infinity || minIndent === 0) return str;

  return lines
    .map((line, index) => {
      if (index === 0) return line;
      if (line.trim().length === 0) return "";
      const regex = new RegExp(`^[ \\t]{1,${minIndent}}`);
      return line.replace(regex, "");
    })
    .join("\n");
}

// mapare limbaj UI -> identificator Monaco
const monacoLanguageMap: Record<string, string> = {
  "C++": "cpp",
  Python: "python",
  Java: "java",
  JavaScript: "javascript",
  Rust: "rust",
};

// Palete de culori hardcodate per temă pentru Monaco Editor.
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
  cream: {
    accent: "#d4a574",
    accentSecondary: "#b76857",
    text: "#f5f1e8",
    textMuted: "#a89080",
    textSubtle: "#8a7560",
    editorBg: "#1a1612",
    codeBg: "#2a2420",
  },
  sage: {
    accent: "#7a9e7e",
    accentSecondary: "#5a7e78",
    text: "#e8ebe7",
    textMuted: "#7a8f7c",
    textSubtle: "#667069",
    editorBg: "#1a1e1a",
    codeBg: "#242823",
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
  const { problemTitle} = useParams();

  const { lang } = useLanguage();
  const t = translations[lang];
  const { isAuthenticated } = useAuth();
  const { theme } = useTheme();

  const [problem, setProblem] = useState<ProblemFindResponseDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("C++");
  const [isOpen, setIsOpen] = useState(false);
  const [status, setStatus] = useState<null | "pending" | "valid" | "invalid">(
    null,
  );
  const monacoRef = useRef<any>(null);

  const [availableLanguages, setAvailableLanguages] = useState<LanguageDTO[]>(
    [],
  );
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
    if (!isAuthenticated) return;

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
    return () => {
      isMounted = false;
    };
  }, [isAuthenticated]);

  useEffect(() => {
    let isMounted = true;

    async function fetchProblemDetails() {
      if (!problemTitle || problemTitle === "undefined") {
        if (isMounted) {
          setError("Titlul problemei lipsește din URL.");
          setLoading(false);
        }
        return;
      }

      try {
        const dto = await problemService.getProblemByTitle(problemTitle);

        if (!isMounted) return;

        setProblem(dto);
      } catch (err) {
        if (isMounted)
          setError(
            "Problema nu a putut fi găsită sau a apărut o eroare de server.",
          );
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchProblemDetails();

    return () => {
      isMounted = false;
    };
  }, [problemTitle]);

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

  if (loading) {
    return (
      <div className="w-full flex justify-center items-center h-[calc(100svh-11rem)]">
        <div className="animate-spin w-12 h-12 border-4 border-(--accent)/30 border-t-(--accent) rounded-full" />
      </div>
    );
  }

  if (error || !problem) {
    return (
      <div className="w-full text-center p-8 text-red-400 theme-surface-card backdrop-blur-sm border-2 border-red-500/30 rounded-2xl">
        <h2 className="text-xl font-bold mb-2">Eroare</h2>
        <p>{error || "Problema nu a fost găsită."}</p>
        <Link
          to="/problems"
          className="text-(--accent) underline mt-4 inline-block"
        >
          Înapoi la lista de probleme
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-6">
      <div className="grid gap-6 xl:grid-cols-3">
        <div className="h-auto overflow-visible xl:h-[calc(100svh-11rem)] xl:overflow-y-auto p-8 theme-surface-card backdrop-blur-sm border-2 border-(--accent) rounded-2xl custom-scrollbar">
          <p className="text-xs font-semibold uppercase tracking-wider accent-text">
            {lang === "RO" ? "Problemă: " : "Problem: "} {problem.title}
          </p>
          <h1 className="text-3xl font-bold text-(--text) mb-2">
            {problem.title}
          </h1>
          {problem.tags.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-1.5">
              {problem.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2.5 py-0.5 rounded-full text-xs font-semibold border border-(--accent)/25 bg-(--accent)/10 text-(--text-muted)"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
          <div className="page-line-horizontal" />
          <div className="text-(--text) leading-relaxed">
            <ReactMarkdown
              remarkPlugins={[remarkMath]}
              rehypePlugins={[rehypeKatex]}
              children={unindent(problem.description.replace(/\\\\/g, "\\"))}
              components={{
                // Titluri
                h1: ({ ...props }) => (
                  <h1
                    className="text-2xl font-bold text-(--text) mt-6 mb-3 border-b border-(--accent)/20 pb-1"
                    {...props}
                  />
                ),
                h2: ({ ...props }) => (
                  <h2
                    className="text-xl font-bold text-(--text) mt-5 mb-2"
                    {...props}
                  />
                ),

                // Paragrafe
                p: ({ ...props }) => (
                  <p className="mb-4 whitespace-pre-wrap" {...props} />
                ),

                // Liste
                ul: ({ ...props }) => (
                  <ul className="list-disc pl-6 mb-4 space-y-1" {...props} />
                ),
                ol: ({ ...props }) => (
                  <ol className="list-decimal pl-6 mb-4 space-y-1" {...props} />
                ),
                li: ({ ...props }) => <li className="ml-2" {...props} />,

                // Formule matematice inline
                span: ({ className, children, ...props }: any) => {
                  if (className && className.includes("katex")) {
                    return (
                      <span className={`${className} accent-text`} {...props}>
                        {children}
                      </span>
                    );
                  }
                  return (
                    <span className={className} {...props}>
                      {children}
                    </span>
                  );
                },

                // Cod inline (ex: `sortare.in`)
                code: ({ className, children, ...props }: any) => {
                  return (
                    <code
                      className={`accent-text font-mono ${className || ""}`}
                      {...props}
                    >
                      {children}
                    </code>
                  );
                },

                // Wrapper-ul <pre> pentru blocuri de cod mari (ex: Input/Output)
                pre: ({ children, ...props }: any) => (
                  <div className="relative group my-4">
                    <pre
                      className="theme-surface-input p-4 rounded-xl border border-(--accent)/20 overflow-x-auto text-sm text-(--text) shadow-inner [&>code]:text-(--text)"
                      {...props}
                    >
                      {children}
                    </pre>
                  </div>
                ),
              }}
            />
          </div>
        </div>

        <div className="h-auto overflow-visible xl:h-[calc(100svh-11rem)] xl:overflow-y-auto p-8 theme-surface-card backdrop-blur-sm border border-(--accent)/50 rounded-2xl card-glow custom-scrollbar flex flex-col">
          {isAuthenticated ? (
            <div className="flex-1 flex flex-col h-full">
              <div className="flex items-center justify-between mb-6 shrink-0">
                <h2 className="text-xl font-bold text-(--text)">
                  {t.submitTitle}
                </h2>
                <div className="relative w-32">
                  <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="w-full flex items-center justify-between theme-surface-input border border-(--accent)/30 rounded-xl px-4 py-2 text-sm text-(--text-h) outline-none transition hover:border-(--accent)"
                  >
                    {language}
                    <motion.span animate={{ rotate: isOpen ? 180 : 0 }}>
                      ▼
                    </motion.span>
                  </button>
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.12 }}
                        className="absolute z-50 w-full theme-surface-dropdown border border-(--accent)/40 rounded-xl shadow-2xl overflow-hidden"
                      >
                        {availableLanguages.map((langItem) => (
                          <button
                            key={langItem.id}
                            onClick={() => {
                              setSelectedLanguageId(langItem.id);
                              setLanguage(langItem.name);
                              setIsOpen(false);
                            }}
                            className="w-full text-left px-4 py-2 text-sm text-(--text-h) hover:bg-(--accent)/20 transition-colors"
                          >
                            {langItem.name}{" "}
                            {langItem.version && `(${langItem.version})`}
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
                <div className="relative flex-1 rounded-2xl overflow-hidden border border-(--accent)/20 theme-surface-editor min-h-75">
                  <Editor
                    height="100%"
                    language={monacoLanguageMap[language] || "cpp"}
                    value={code}
                    onChange={(val) => setCode(val || "")}
                    theme="fiicoder-dark"
                    onMount={handleEditorMount}
                    loading={
                      <div className="flex items-center justify-center h-full">
                        <div className="animate-spin w-8 h-8 border border-(--accent)/50 border-t-(--accent) rounded-full" />
                      </div>
                    }
                    options={{
                      fontSize: 14,
                      fontFamily:
                        "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
                      fontLigatures: true,
                      minimap: { enabled: false },
                      scrollBeyondLastLine: false,
                      padding: { top: 16, bottom: 16 },
                      lineNumbersMinChars: 3,
                      renderLineHighlight: "gutter",
                      smoothScrolling: true,
                      cursorBlinking: "smooth",
                      cursorSmoothCaretAnimation: "on",
                      bracketPairColorization: { enabled: true },
                      automaticLayout: true,
                      wordWrap: "on",
                    }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={status === "pending"}
                  className="w-full shrink-0 bg-(--accent)/20 border border-(--accent)/50 py-4 rounded-2xl font-bold text-(--text-h) outline-none transition hover:border-(--accent) hover:bg-(--accent)/30 hover:-translate-y-0.5"
                >
                  {status === "pending" ? t.evalPending : t.evalBtn}
                </button>
              </form>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full gap-5 py-12">
              <div className="shrink-0 w-16 h-16 rounded-full bg-(--accent)/10 border border-(--accent)/50 flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-7 h-7 text-(--accent)/70"
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
                <h3 className="text-lg font-bold text-(--text) mb-1">
                  {lang === "RO" ? "Trimite soluții" : "Submit Solutions"}
                </h3>
                <p className="text-sm text-(--text-muted) max-w-xs">
                  {lang === "RO"
                    ? "Trebuie să te autentifici pentru a trimite rezolvări la probleme."
                    : "You need to log in to submit solutions to problems."}
                </p>
              </div>
              <Link
                to="/login"
                className="px-6 py-2.5 rounded-xl border border-(--accent)/50 bg-(--accent)/20 text-sm font-bold text-(--text-h) transition hover:border-(--accent) hover:bg-(--accent)/30 hover:-translate-y-0.5"
              >
                {lang === "RO" ? "Autentifică-te" : "Log In"}
              </Link>
            </div>
          )}
        </div>

        <div className="h-auto overflow-visible xl:h-[calc(100svh-11rem)] xl:overflow-y-auto p-8 theme-surface-card backdrop-blur-sm border border-(--accent)/50 rounded-2xl card-glow custom-scrollbar">
          <h2 className="text-xl font-bold text-(--text) mb-2">Test Panel</h2>
          <div className="page-line-horizontal" />
          <p className="text-(--text)">
            This is an empty panel placeholder.
          </p>
        </div>

        <div className="flex justify-start shrink-0">
          <Link to="/problems" className="relative inline-block group">
            <div className="flex items-center gap-2 text-(--text-muted) font-semibold text-sm hover:text-(--text-h) transition-colors cursor-pointer">
              <span>←</span>
              <span>{t.backToList}</span>
            </div>
          </Link>
        </div>
      </div>

      <AnimatePresence>
        {status && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.12 }}
            className="fixed bottom-8 right-8 z-100"
          >
            <div
              className={`relative overflow-hidden px-8 py-5 rounded-2xl border-2 backdrop-blur-2xl shadow-[0_10px_40px_rgba(0,0,0,0.5)] ${
                status === "pending"
                  ? "border-(--accent)/50 theme-surface-card text-(--text)"
                  : status === "valid"
                    ? "border-green-500/50 bg-green-500/10 text-green-300"
                    : "border-red-500/50 bg-red-500/10 text-red-300"
              }`}
            >
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: status === "pending" ? 2 : 4 }}
                className={`absolute bottom-0 left-0 h-1 w-full origin-left ${
                  status === "pending"
                    ? "bg-(--accent)"
                    : status === "valid"
                      ? "bg-green-500"
                      : "bg-red-500"
                }`}
              />
              <div className="flex items-center gap-4">
                <div
                  className={`w-3 h-3 rounded-full animate-pulse ${
                    status === "pending"
                      ? "bg-(--accent)"
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
