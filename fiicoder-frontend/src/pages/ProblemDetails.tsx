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
import { profileService, type RecentSubmissionDTO } from "../services/profileService";

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
  const [recentSubmissions, setRecentSubmissions] = useState<RecentSubmissionDTO[]>([]);
  const [activeTab, setActiveTab] = useState<'testcase' | 'testresult' | 'submissions'>('testcase');
  
  // Resizable logic
  const [leftWidth, setLeftWidth] = useState(40); // Percentage
  const [consoleHeight, setConsoleHeight] = useState(300); // Pixels
  
  const isResizingHorizontal = useRef(false);
  const isResizingVertical = useRef(false);

  const startResizingHorizontal = () => { isResizingHorizontal.current = true; document.body.style.cursor = 'col-resize'; };
  const startResizingVertical = () => { isResizingVertical.current = true; document.body.style.cursor = 'row-resize'; };
  
  const stopResizing = () => { 
    isResizingHorizontal.current = false; 
    isResizingVertical.current = false; 
    document.body.style.cursor = 'default'; 
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
        if (isResizingHorizontal.current) {
            const newLeftWidth = (e.clientX / window.innerWidth) * 100;
            if (newLeftWidth > 20 && newLeftWidth < 70) setLeftWidth(newLeftWidth);
        }
        if (isResizingVertical.current) {
            const newHeight = window.innerHeight - e.clientY - 100; // Account for footer/padding
            if (newHeight > 100 && newHeight < window.innerHeight * 0.7) setConsoleHeight(newHeight);
        }
    };
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', stopResizing);
    return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', stopResizing);
    };
  }, []);

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

    async function fetchRecentSubmissions() {
      try {
        const data = await profileService.getMyProfile(1, 50);
        if (!isMounted) return;
        // Filtrăm doar submisiile pentru problema curentă
        const filtered = data.recentSubmissions.content.filter(
          (s) => s.problemTitle === problemTitle
        );
        setRecentSubmissions(filtered);
      } catch (err) {
        console.error("Eroare la încărcarea submisiilor recente:", err);
      }
    }

    fetchLanguages();
    fetchRecentSubmissions();
    return () => {
      isMounted = false;
    };
  }, [isAuthenticated, problemTitle]);

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
      } catch (err: any) {
        if (isMounted) {
          if (err?.status === 403) {
            setError(lang === 'RO' ? "Nu aveți permisiunea de a vizualiza această problemă (probabil este privată)." : "You do not have permission to view this problem (it might be private).");
          } else if (err?.status === 404) {
            setError(lang === 'RO' ? "Problema nu a fost găsită." : "Problem not found.");
          } else {
            setError(
              lang === 'RO' ? "Problema nu a putut fi găsită sau a apărut o eroare de server." : "The problem could not be found or a server error occurred."
            );
          }
        }
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
      <div className="w-full text-center p-8 text-red-400 bg-(--surface-card) backdrop-blur-sm border-2 border-red-500/30 rounded-2xl">
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

  const problemContent = (
    <>
      <p className="text-xs font-semibold uppercase tracking-wider text-(--accent)">
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
            h1: ({ ...props }) => (
              <h1 className="text-2xl font-bold text-(--text) mt-6 mb-3 border-b border-(--accent)/20 pb-1" {...props} />
            ),
            h2: ({ ...props }) => (
              <h2 className="text-xl font-bold text-(--text) mt-5 mb-2" {...props} />
            ),
            p: ({ ...props }) => <p className="mb-4 whitespace-pre-wrap" {...props} />,
            ul: ({ ...props }) => <ul className="list-disc pl-6 mb-4 space-y-1" {...props} />,
            ol: ({ ...props }) => <ol className="list-decimal pl-6 mb-4 space-y-1" {...props} />,
            li: ({ ...props }) => <li className="ml-2" {...props} />,
            span: ({ className, children, ...props }: any) => {
              if (className && className.includes("katex")) {
                return <span className={`${className} text-(--accent)`} {...props}>{children}</span>;
              }
              return <span className={className} {...props}>{children}</span>;
            },
            code: ({ className, children, ...props }: any) => (
              <code className={`text-(--accent) font-mono ${className || ""}`} {...props}>{children}</code>
            ),
            pre: ({ children, ...props }: any) => (
              <div className="relative group my-4">
                <pre className="bg-(--surface-input) p-4 rounded-xl border border-(--accent)/20 overflow-x-auto text-sm text-(--text) shadow-inner" {...props}>
                  {children}
                </pre>
              </div>
            ),
          }}
        />
      </div>
    </>
  );

  const editorContent = isAuthenticated ? (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      <div className="flex items-center justify-between mb-6 shrink-0">
        <h2 className="text-xl font-bold text-(--text)">{t.submitTitle}</h2>
        <div className="relative w-32">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="w-full flex items-center justify-between bg-(--surface-input) border border-(--accent)/30 rounded-xl px-4 py-2 text-sm text-(--text-h) outline-none transition hover:border-(--accent)"
          >
            {language}
            <motion.span animate={{ rotate: isOpen ? 180 : 0 }}>▼</motion.span>
          </button>
          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.12 }}
                className="absolute z-50 w-full bg-(--surface-dropdown) border border-(--accent)/40 rounded-xl shadow-2xl overflow-hidden"
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
                    {langItem.name} {langItem.version && `(${langItem.version})`}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex-1 flex flex-col gap-4 overflow-hidden">
        <div className="relative flex-1 rounded-2xl overflow-hidden border border-(--accent)/20 bg-(--surface-editor) min-h-0">
          <Editor
            height="100%"
            language={monacoLanguageMap[language] || "cpp"}
            value={code}
            onChange={(val) => setCode(val || "")}
            theme="fiicoder-dark"
            onMount={handleEditorMount}
            loading={<div className="animate-spin w-8 h-8 border border-(--accent)/50 border-t-(--accent) rounded-full" />}
            options={{
              fontSize: 14,
              fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
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
      </form>
    </div>
  ) : (
    <div className="flex flex-col items-center justify-center h-full gap-5 py-12">
      <div className="shrink-0 w-16 h-16 rounded-full bg-(--accent)/10 border border-(--accent)/50 flex items-center justify-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 text-(--accent)/70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
        </svg>
      </div>
      <div className="text-center">
        <h3 className="text-lg font-bold text-(--text) mb-1">{lang === "RO" ? "Trimite soluții" : "Submit Solutions"}</h3>
        <p className="text-sm text-(--text-muted) max-w-xs">{lang === "RO" ? "Trebuie să te autentifici pentru a trimite rezolvări." : "You need to log in to submit solutions."}</p>
      </div>
      <Link to="/login" className="px-6 py-2.5 rounded-xl border border-(--accent)/50 bg-(--accent)/20 text-sm font-bold text-(--text-h) transition hover:border-(--accent) hover:bg-(--accent)/30">
        {lang === "RO" ? "Autentifică-te" : "Log In"}
      </Link>
    </div>
  );

  const infoPanelContent = (
    <div className="h-full flex flex-col">
      <div className="flex items-center gap-6 mb-4 shrink-0 px-2">
        <button
          onClick={() => setActiveTab('testcase')}
          className={`flex items-center gap-2 text-xs font-black transition-all ${activeTab === 'testcase' ? 'text-(--accent)' : 'text-(--text-muted) hover:text-(--text)'}`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${activeTab === 'testcase' ? 'bg-(--accent)' : 'bg-transparent'}`} />
          {lang === 'RO' ? 'Date de Test' : 'Testcase'}
        </button>
        <button
          onClick={() => setActiveTab('testresult')}
          className={`flex items-center gap-2 text-xs font-black transition-all ${activeTab === 'testresult' ? 'text-(--accent)' : 'text-(--text-muted) hover:text-(--text)'}`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${activeTab === 'testresult' ? 'bg-(--accent)' : 'bg-transparent'}`} />
          {lang === 'RO' ? 'Rezultat' : 'Test Result'}
        </button>
        <button
          onClick={() => setActiveTab('submissions')}
          className={`flex items-center gap-2 text-xs font-black transition-all ${activeTab === 'submissions' ? 'text-(--accent)' : 'text-(--text-muted) hover:text-(--text)'}`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${activeTab === 'submissions' ? 'bg-(--accent)' : 'bg-transparent'}`} />
          {lang === 'RO' ? 'Submisii' : 'Submissions'}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar bg-black/10 rounded-xl p-4 border-2 border-(--accent)/10">
        {activeTab === 'testcase' ? (
          <div className="space-y-4">
            <div className="flex gap-2">
              {['Case 1', 'Case 2', 'Case 3'].map((c, i) => (
                <button key={i} className="px-3 py-1 rounded-lg bg-(--accent)/10 border border-(--accent)/20 text-[10px] font-bold text-(--text-muted) hover:text-(--accent)">
                  {c}
                </button>
              ))}
            </div>
            <div className="space-y-2">
              <p className="text-[10px] font-black uppercase text-(--accent) tracking-tighter">Input =</p>
              <textarea 
                className="w-full bg-(--surface-input) border-2 border-(--accent)/20 rounded-xl p-3 outline-none text-xs font-mono text-(--text) focus:border-(--accent)/50 transition-all" 
                placeholder="Ex: 2 3"
                rows={3} 
              />
            </div>
          </div>
        ) : activeTab === 'testresult' ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-4">
            <div className="w-12 h-12 rounded-full bg-(--accent)/5 border-2 border-dashed border-(--accent)/20 flex items-center justify-center mb-3">
               <span className="text-xl opacity-30">▶</span>
            </div>
            <p className="text-xs text-(--text-muted) italic">
                {lang === 'RO' ? 'Rulează codul pentru a vedea rezultatele testelor.' : 'Run your code to see test results.'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {!isAuthenticated ? (
              <p className="text-sm text-(--text-muted) italic">{lang === 'RO' ? 'Autentifică-te pentru istoricul tău.' : 'Log in to see history.'}</p>
            ) : recentSubmissions.length > 0 ? (
              recentSubmissions.map((sub, idx) => (
                <div key={idx} className="p-3 rounded-xl border-2 border-(--accent)/20 bg-(--accent)/5 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-(--text-h)">{new Date(sub.submissionDate).toLocaleDateString()}</p>
                    <p className="text-[10px] text-(--text-muted) font-mono">Score: {sub.score}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border-2 ${sub.status === 'OK' ? 'border-green-500/40 bg-green-500/10 text-green-300' : 'border-red-500/40 bg-red-500/10 text-red-300'}`}>
                    {sub.status}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-sm text-(--text-muted) italic">{lang === 'RO' ? 'Nu ai încă submisii.' : 'No submissions yet.'}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Desktop Workspace: 2-Column Main Split */}
      <div className="hidden xl:flex gap-0 w-full h-[calc(100svh-11rem)]">
        {/* Left Area: Problem Description */}
        <div 
            style={{ width: `${leftWidth}%` }}
            className="h-full overflow-y-auto p-8 bg-(--surface-card) backdrop-blur-sm border-2 border-(--accent) rounded-2xl custom-scrollbar shrink-0"
        >
          {problemContent}
        </div>

        {/* Horizontal Resizer (Left-Right) */}
        <div 
            onMouseDown={startResizingHorizontal}
            className="w-4 group cursor-col-resize flex items-center justify-center transition-all hover:w-6 shrink-0"
        >
            <div className="w-1 h-12 rounded-full bg-(--accent)/20 group-hover:bg-(--accent) transition-colors" />
        </div>

        {/* Right Area: Vertical Split (Editor on top, Console on bottom) */}
        <div 
            style={{ width: `${100 - leftWidth}%` }}
            className="h-full flex flex-col min-w-0"
        >
            {/* Top: Editor */}
            <div className="flex-1 min-h-0 p-8 bg-(--surface-card) backdrop-blur-sm border-2 border-(--accent) rounded-2xl flex flex-col">
                {editorContent}
            </div>

            {/* Vertical Resizer (Top-Bottom) */}
            <div 
                onMouseDown={startResizingVertical}
                className="h-4 group cursor-row-resize flex items-center justify-center transition-all hover:h-6 shrink-0"
            >
                <div className="h-1 w-12 rounded-full bg-(--accent)/20 group-hover:bg-(--accent) transition-colors" />
            </div>

            {/* Bottom: Console */}
            <div 
                style={{ height: `${consoleHeight}px` }}
                className="shrink-0 p-6 bg-(--surface-card) backdrop-blur-sm border-2 border-(--accent) rounded-2xl overflow-hidden"
            >
                {infoPanelContent}
            </div>

            {/* Workspace Toolbar (Status Bar) */}
            <div className="mt-4 h-12 shrink-0 bg-(--surface-card) border-2 border-(--accent) rounded-xl flex items-center justify-between px-4">
                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => setConsoleHeight(consoleHeight > 100 ? 60 : 300)}
                        className="text-[10px] font-black text-(--text-muted) hover:text-(--accent) flex items-center gap-2 uppercase tracking-tighter transition-colors group"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 opacity-50 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {lang === 'RO' ? 'Consolă' : 'Console'}
                    </button>
                    <div className="w-px h-4 bg-(--accent)/20" />
                    <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${status === 'pending' ? 'bg-amber-500 animate-pulse' : 'bg-green-500'}`} />
                        <span className="text-[10px] font-bold text-(--text-subtle) uppercase tracking-widest">
                            {status === 'pending' ? (lang === 'RO' ? 'Evaluare...' : 'Evaluating...') : (lang === 'RO' ? 'Sistem Activ' : 'System Ready')}
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button 
                        onClick={handleSubmit}
                        className="px-4 py-1.5 rounded-lg bg-(--surface-input) border-2 border-(--accent)/30 text-[10px] font-black text-(--text-h) hover:border-(--accent) hover:bg-(--accent)/10 transition-all flex items-center gap-2 group"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 text-(--accent) group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z" />
                        </svg>
                        {lang === 'RO' ? 'Rulează' : 'Run'}
                    </button>
                    <button 
                        onClick={handleSubmit}
                        disabled={status === "pending"}
                        className="px-6 py-1.5 rounded-lg bg-(--accent) border-2 border-(--accent) text-[10px] font-black text-(--surface-card) hover:bg-transparent hover:text-(--accent) transition-all flex items-center gap-2 group"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                        {status === "pending" ? (lang === 'RO' ? 'Trimitere...' : 'Submitting...') : (lang === 'RO' ? 'Trimite' : 'Submit')}
                    </button>
                </div>
            </div>
        </div>
      </div>

      {/* Mobile View: Standard Stacked Grid */}
      <div className="xl:hidden flex flex-col gap-6">
        <div className="p-6 bg-(--surface-card) backdrop-blur-sm border-2 border-(--accent) rounded-2xl">
          {problemContent}
        </div>
        <div className="p-6 bg-(--surface-card) backdrop-blur-sm border-2 border-(--accent) rounded-2xl min-h-[400px] flex flex-col">
          {editorContent}
        </div>
        <div className="p-6 bg-(--surface-card) backdrop-blur-sm border-2 border-(--accent) rounded-2xl">
          {infoPanelContent}
        </div>
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
  );
}
