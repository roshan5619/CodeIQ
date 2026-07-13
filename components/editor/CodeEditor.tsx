"use client";

import { useEffect, useRef } from "react";
import Editor, { type Monaco, type OnMount } from "@monaco-editor/react";
import type { editor } from "monaco-editor";
import { useWorkbench } from "@/lib/store";
import { LANGUAGES } from "@/lib/types";
import { defineCodeIQTheme } from "./theme";

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
        beforeMount={defineCodeIQTheme}
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
