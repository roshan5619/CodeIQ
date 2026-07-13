"use client";

import { DiffEditor } from "@monaco-editor/react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Modal from "@/components/ui/Modal";
import { defineCodeIQTheme } from "@/components/editor/theme";
import { useWorkbench } from "@/lib/store";
import { LANGUAGES } from "@/lib/types";
import { Check, Loader2, X } from "lucide-react";

export default function DiffModal() {
  const { diff, language, closeDiff, setCode, log } = useWorkbench();
  if (!diff) return null;

  const monacoLanguage =
    LANGUAGES.find((l) => l.id === language)?.monaco ?? "plaintext";

  const apply = () => {
    setCode(diff.modified);
    log("success", `Applied: ${diff.title}`);
    closeDiff();
  };

  return (
    <Modal title={diff.title} onClose={closeDiff} wide>
      <div className="flex h-[72vh] flex-col">
        <div className="min-h-0 flex-1">
          <DiffEditor
            original={diff.original}
            modified={diff.modified}
            language={monacoLanguage}
            theme="codeiq-dark"
            beforeMount={defineCodeIQTheme}
            options={{
              readOnly: true,
              renderSideBySide: true,
              minimap: { enabled: false },
              fontSize: 12.5,
              fontFamily:
                "var(--font-geist-mono), ui-monospace, 'Cascadia Code', monospace",
              scrollBeyondLastLine: false,
              automaticLayout: true,
              diffWordWrap: "off",
            }}
          />
        </div>

        {(diff.explanation || diff.streaming) && (
          <div className="max-h-40 shrink-0 overflow-y-auto border-t border-stroke bg-surface/60 px-5 py-3">
            {diff.streaming && !diff.explanation ? (
              <span className="flex items-center gap-2 text-xs text-mute">
                <Loader2 size={13} className="animate-spin" />
                Generating…
              </span>
            ) : (
              <div className="prose-codeiq text-xs leading-relaxed text-mute">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {diff.explanation}
                </ReactMarkdown>
              </div>
            )}
          </div>
        )}

        <div className="flex shrink-0 items-center justify-end gap-2 border-t border-stroke bg-surface/60 px-5 py-3">
          <button
            onClick={closeDiff}
            className="flex items-center gap-1.5 rounded-lg border border-stroke px-4 py-2 text-xs font-semibold text-mute transition-colors hover:text-ink"
          >
            <X size={13} />
            Reject
          </button>
          <button
            onClick={apply}
            disabled={diff.streaming || !diff.modified}
            className="flex items-center gap-1.5 rounded-lg bg-accent px-4 py-2 text-xs font-semibold text-bg transition-transform hover:scale-[1.03] disabled:cursor-not-allowed disabled:opacity-40"
          >
            {diff.streaming ? (
              <Loader2 size={13} className="animate-spin" />
            ) : (
              <Check size={13} />
            )}
            Apply changes
          </button>
        </div>
      </div>
    </Modal>
  );
}
