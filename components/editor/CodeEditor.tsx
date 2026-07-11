"use client";

import { useEffect, useRef } from "react";
import Editor, { type Monaco, type OnMount } from "@monaco-editor/react";
import type { editor } from "monaco-editor";
import { useWorkbench } from "@/lib/store";
import { LANGUAGES } from "@/lib/types";

function defineTheme(monaco: Monaco) {
  monaco.editor.defineTheme("codeiq-dark", {
    base: "vs-dark",
    inherit: true,
    rules: [
      { token: "comment", foreground: "5f6b80", fontStyle: "italic" },
      { token: "keyword", foreground: "a78bfa" },
      { token: "string", foreground: "35e0c3" },
      { token: "number", foreground: "fbbf24" },
      { token: "type", foreground: "7dd3fc" },
      { token: "function", foreground: "7dd3fc" },
      { token: "identifier", foreground: "e7edf7" },
    ],
    colors: {
      "editor.background": "#0c1018",
      "editor.foreground": "#e7edf7",
      "editor.lineHighlightBackground": "#12182666",
      "editorLineNumber.foreground": "#3d4a5f",
      "editorLineNumber.activeForeground": "#93a0b4",
      "editorIndentGuide.background1": "#1a2234",
      "editor.selectionBackground": "#35e0c333",
      "editorCursor.foreground": "#35e0c3",
      "editorWidget.background": "#121826",
      "editorWidget.border": "#26314a",
      "editorGutter.background": "#0c1018",
      "scrollbarSlider.background": "#94a3b833",
      "scrollbarSlider.hoverBackground": "#94a3b855",
    },
  });
}

export default function CodeEditor() {
  const { code, language, insight, focusRange, setCode } = useWorkbench();
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const monacoRef = useRef<Monaco | null>(null);
  const decorationsRef = useRef<editor.IEditorDecorationsCollection | null>(
    null,
  );

  const monacoLanguage =
    LANGUAGES.find((l) => l.id === language)?.monaco ?? "plaintext";

  const handleMount: OnMount = (editorInstance, monaco) => {
    editorRef.current = editorInstance;
    monacoRef.current = monaco;
    decorationsRef.current = editorInstance.createDecorationsCollection();
  };

  // Line decorations for bug/security findings.
  useEffect(() => {
    const monaco = monacoRef.current;
    const collection = decorationsRef.current;
    if (!monaco || !collection) return;

    const decorations: editor.IModelDeltaDecoration[] = [];

    for (const bug of insight?.bugs ?? []) {
      decorations.push({
        range: new monaco.Range(bug.line, 1, bug.line, 1),
        options: {
          isWholeLine: true,
          className:
            bug.severity === "critical" || bug.severity === "high"
              ? "codeiq-line-danger"
              : "codeiq-line-warn",
          glyphMarginClassName: "codeiq-glyph-bug",
          glyphMarginHoverMessage: {
            value: `**${bug.title}** (${bug.confidence}% confidence)\n\n${bug.detail}`,
          },
        },
      });
    }

    for (const finding of insight?.security ?? []) {
      decorations.push({
        range: new monaco.Range(finding.line, 1, finding.line, 1),
        options: {
          isWholeLine: true,
          className: "codeiq-line-danger",
          glyphMarginClassName: "codeiq-glyph-security",
          glyphMarginHoverMessage: {
            value: `**${finding.category}** (${finding.confidence}% confidence)\n\n${finding.detail}`,
          },
        },
      });
    }

    if (focusRange) {
      decorations.push({
        range: new monaco.Range(focusRange.start, 1, focusRange.end, 1),
        options: { isWholeLine: true, className: "codeiq-line-focus" },
      });
    }

    collection.set(decorations);
  }, [insight, focusRange]);

  // Scroll to a focused range when a finding card is clicked.
  useEffect(() => {
    if (focusRange && editorRef.current) {
      editorRef.current.revealLinesInCenter(focusRange.start, focusRange.end);
    }
  }, [focusRange]);

  return (
    <div className="h-full w-full overflow-hidden">
      <Editor
        height="100%"
        language={monacoLanguage}
        value={code}
        theme="codeiq-dark"
        beforeMount={defineTheme}
        onMount={handleMount}
        onChange={(value) => setCode(value ?? "")}
        loading={
          <div className="flex h-full items-center justify-center text-sm text-mute">
            Loading editor…
          </div>
        }
        options={{
          fontSize: 13.5,
          fontFamily:
            "var(--font-geist-mono), ui-monospace, 'Cascadia Code', monospace",
          fontLigatures: true,
          minimap: { enabled: false },
          glyphMargin: true,
          scrollBeyondLastLine: false,
          smoothScrolling: true,
          cursorBlinking: "smooth",
          cursorSmoothCaretAnimation: "on",
          padding: { top: 14, bottom: 14 },
          renderLineHighlight: "all",
          automaticLayout: true,
          tabSize: 4,
          wordWrap: "off",
          bracketPairColorization: { enabled: true },
        }}
      />
    </div>
  );
}
