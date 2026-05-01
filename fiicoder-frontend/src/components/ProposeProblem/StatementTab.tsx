import { Controller, useFormContext } from "react-hook-form";
import { useState } from "react";
import Editor from "@monaco-editor/react";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import type { ProposeProblemForm } from "../../types/proposeProblem";

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

export default function StatementTab() {
  const { control } = useFormContext<ProposeProblemForm>();
  const [showPreview, setShowPreview] = useState(true);

  return (
    <div className="space-y-6 p-6 bg-theme-surface-card rounded-lg border border-theme-border">
      {/* Source URL */}
      <div className="space-y-2">
        <label className="text-theme-text font-semibold text-sm">URL Sursă (opțional)</label>
        <Controller
          name="sourceUrl"
          control={control}
          render={({ field }) => (
            <input
              {...field}
              placeholder="ex: https://codeforces.com/problemset/problem/1/A"
              className="w-full px-4 py-2 bg-theme-surface-secondary border accent-border rounded-lg text-theme-text placeholder-theme-text-muted focus:outline-none accent-ring transition-all"
            />
          )}
        />
      </div>

      {/* Preview Toggle */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setShowPreview(!showPreview)}
          className="px-4 py-2 accent-bg-subtle border accent-border rounded-lg accent-text hover:accent-hover transition-colors font-semibold text-sm"
        >
          {showPreview ? "Ascunde Preview" : "Arată Preview"}
        </button>
      </div>

      {/* Editor & Preview Layout */}
      <div className={`grid ${showPreview ? "grid-cols-2" : "grid-cols-1"} gap-6`}>
        {/* Monaco Editor */}
        <div className="space-y-2">
          <label className="text-theme-text text-sm font-semibold">Markdown Enunț</label>
          <Controller
            name="statement"
            control={control}
            rules={{ required: "Enunțul este obligatoriu" }}
            render={({ field }) => (
              <div className="border border-theme-border rounded-lg overflow-hidden h-96">
                <Editor
                  height="100%"
                  defaultLanguage="markdown"
                  theme="vs-dark"
                  value={field.value}
                  onChange={(val) => field.onChange(val || "")}
                  options={{
                    minimap: { enabled: false },
                    wordWrap: "on",
                    lineNumbers: "on",
                    scrollBeyondLastLine: false,
                  }}
                />
              </div>
            )}
          />
          <p className="text-xs text-theme-text-muted">
            Folosește <strong>Markdown</strong> pentru formatare. Poți folosi și <strong>LaTeX</strong> cu $...$ pentru ecuații.
          </p>
        </div>

        {/* Live Preview */}
        {showPreview && (
          <div className="space-y-2">
            <label className="text-theme-text text-sm font-semibold">Previzualizare</label>
            <Controller
              name="statement"
              control={control}
              render={({ field }) => (
                <div className="border border-theme-border rounded-lg p-4 h-96 overflow-y-auto bg-theme-surface-secondary custom-scrollbar text-theme-text leading-relaxed">
                  <ReactMarkdown
                    remarkPlugins={[remarkMath]}
                    rehypePlugins={[rehypeKatex]}
                    components={{
                      // Titluri
                      h1: ({ ...props }) => (
                        <h1
                          className="text-2xl font-bold accent-text mt-6 mb-3 border-b accent-border/30 pb-1"
                          {...props}
                        />
                      ),
                      h2: ({ ...props }) => (
                        <h2
                          className="text-xl font-bold accent-text mt-5 mb-2"
                          {...props}
                        />
                      ),
                      h3: ({ ...props }) => (
                        <h3
                          className="text-lg font-bold accent-text mt-4 mb-1"
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

                      // Cod inline
                      code: ({ className, children, ...props }: any) => {
                        if (className) {
                          // Cod în bloc (cu pre)
                          return (
                            <code
                              className={`${className} accent-text font-mono`}
                              {...props}
                            >
                              {children}
                            </code>
                          );
                        }
                        // Cod inline
                        return (
                          <code
                            className="accent-text font-mono accent-bg-subtle px-1.5 py-0.5 rounded text-sm"
                            {...props}
                          >
                            {children}
                          </code>
                        );
                      },

                      // Blocuri de cod
                      pre: ({ children, ...props }: any) => (
                        <div className="relative group my-4">
                          <pre
                            className="bg-theme-surface-card p-4 rounded-xl border accent-border/30 overflow-x-auto text-sm text-theme-text shadow-inner [&>code]:text-theme-text"
                            {...props}
                          >
                            {children}
                          </pre>
                        </div>
                      ),

                      // Citate
                      blockquote: ({ ...props }) => (
                        <blockquote
                          className="border-l-4 accent-border pl-4 italic text-theme-text-muted my-4"
                          {...props}
                        />
                      ),

                      // Link-uri
                      a: ({ ...props }) => (
                        <a
                          className="accent-text hover:opacity-80 underline"
                          target="_blank"
                          rel="noopener noreferrer"
                          {...props}
                        />
                      ),
                    }}
                  >
                    {unindent(field.value || "*Enunțul tău va apărea aici...*")}
                  </ReactMarkdown>
                </div>
              )}
            />
          </div>
        )}
      </div>

      {/* Template Helper */}
      <div className="p-4 accent-bg-subtle border accent-border/50 rounded-lg space-y-2">
        <h4 className="font-semibold accent-text">Template Rapid:</h4>
        <pre className="text-xs text-theme-text overflow-x-auto bg-theme-surface-secondary p-3 rounded">
{`# Descrierea Problemei

## Cerință
Descrie ce trebuie să facă soluția...

## Restricții
- $1 \\leq n \\leq 10^5$
- $0 \\leq a_i \\leq 10^9$

## Exemple

### Exemplul 1
**Input:**
\`\`\`
3
1 2 3
\`\`\`
**Output:**
\`\`\`
6
\`\`\``}
        </pre>
      </div>
    </div>
  );
}
