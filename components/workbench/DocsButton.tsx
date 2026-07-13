"use client";

import { useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Modal from "@/components/ui/Modal";
import { useWorkbench } from "@/lib/store";
import { streamText, ApiError } from "@/lib/streamFetch";
import {
  Check,
  Copy,
  Download,
  FileText,
  Loader2,
  RefreshCcw,
} from "lucide-react";

const KINDS = [
  { id: "readme", label: "README", file: "README.md" },
  { id: "api", label: "API Docs", file: "API.md" },
  { id: "comments", label: "Comments", file: "commented-code.md" },
  { id: "architecture", label: "Architecture", file: "ARCHITECTURE.md" },
  { id: "flowchart", label: "Flowchart", file: "FLOWCHART.md" },
] as const;

type Kind = (typeof KINDS)[number]["id"];

export default function DocsButton() {
  const { code, language, log } = useWorkbench();
  const [open, setOpen] = useState(false);
  const [kind, setKind] = useState<Kind>("readme");
  const [content, setContent] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [copied, setCopied] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const generate = async (k: Kind) => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setKind(k);
    setContent("");
    setStreaming(true);
    try {
      await streamText(
        "/api/docs",
        { code, language, kind: k },
        setContent,
        controller.signal,
      );
      log("success", `Generated ${k} documentation.`);
    } catch (err) {
      if (err instanceof ApiError && err.code === "missing_api_key") {
        setContent(
          "**No API key configured.**\n\nAdd `ANTHROPIC_API_KEY` to `.env.local` and restart to generate documentation.",
        );
      } else if (!(err instanceof DOMException && err.name === "AbortError")) {
        setContent(
          `**Generation failed.**\n\n${err instanceof Error ? err.message : "Unknown error"}`,
        );
      }
    } finally {
      setStreaming(false);
    }
  };

  const openModal = () => {
    setOpen(true);
    if (!content) void generate("readme");
  };

  const close = () => {
    abortRef.current?.abort();
    setOpen(false);
  };

  const copy = async () => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const download = () => {
    const file = KINDS.find((k) => k.id === kind)?.file ?? "docs.md";
    const blob = new Blob([content], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = file;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <button
        onClick={openModal}
        className="flex items-center gap-1.5 rounded-lg border border-stroke bg-raised px-3 py-1.5 text-xs font-semibold text-ink transition-colors hover:border-stroke-strong"
      >
        <FileText size={13} className="text-info" />
        Docs
      </button>

      {open && (
        <Modal title="Documentation Generator" onClose={close} wide>
          <div className="flex h-[72vh] flex-col">
            <div className="flex shrink-0 items-center gap-1 border-b border-stroke bg-surface/60 px-4 py-2">
              {KINDS.map((k) => (
                <button
                  key={k.id}
                  onClick={() => generate(k.id)}
                  disabled={streaming}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors disabled:opacity-50 ${
                    kind === k.id
                      ? "bg-accent-soft text-accent"
                      : "text-mute hover:bg-raised hover:text-ink"
                  }`}
                >
                  {k.label}
                </button>
              ))}
              <div className="ml-auto flex items-center gap-1">
                <button
                  onClick={() => generate(kind)}
                  disabled={streaming}
                  className="rounded-lg p-1.5 text-mute transition-colors hover:bg-raised hover:text-ink disabled:opacity-50"
                  title="Regenerate"
                >
                  <RefreshCcw size={14} />
                </button>
                <button
                  onClick={copy}
                  disabled={!content || streaming}
                  className="rounded-lg p-1.5 text-mute transition-colors hover:bg-raised hover:text-ink disabled:opacity-50"
                  title="Copy markdown"
                >
                  {copied ? <Check size={14} className="text-accent" /> : <Copy size={14} />}
                </button>
                <button
                  onClick={download}
                  disabled={!content || streaming}
                  className="rounded-lg p-1.5 text-mute transition-colors hover:bg-raised hover:text-ink disabled:opacity-50"
                  title="Download .md"
                >
                  <Download size={14} />
                </button>
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-6 py-4">
              {!content && streaming ? (
                <span className="flex items-center gap-2 text-sm text-mute">
                  <Loader2 size={14} className="animate-spin" />
                  Writing {kind} documentation…
                </span>
              ) : (
                <div className="prose-codeiq">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
                  {streaming && (
                    <span className="ml-1 inline-block h-4 w-1.5 animate-pulse bg-accent" />
                  )}
                </div>
              )}
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}
