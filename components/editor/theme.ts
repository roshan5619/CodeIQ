import type { Monaco } from "@monaco-editor/react";

let defined = false;

export function defineCodeIQTheme(monaco: Monaco) {
  if (defined) return;
  defined = true;
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
      "diffEditor.insertedTextBackground": "#35e0c322",
      "diffEditor.removedTextBackground": "#fb718522",
      "diffEditor.insertedLineBackground": "#35e0c314",
      "diffEditor.removedLineBackground": "#fb718514",
    },
  });
}
