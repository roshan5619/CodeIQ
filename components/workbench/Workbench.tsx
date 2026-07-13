"use client";

import { useEffect, useRef } from "react";
import { Group, Panel, Separator } from "react-resizable-panels";
import CodeEditor from "@/components/editor/CodeEditor";
import InsightsPanel from "./InsightsPanel";
import ConsolePanel from "./ConsolePanel";
import WorkbenchToolbar from "./WorkbenchToolbar";
import DiffModal from "./DiffModal";
import { useAnalysis } from "./useAnalysis";
import { useWorkbench } from "@/lib/store";
import type { Language, Mode } from "@/lib/types";

interface InitialSnippet {
  id: string;
  code: string;
  language: Language;
  mode: Mode;
}

function Handle({ orientation }: { orientation: "horizontal" | "vertical" }) {
  // orientation refers to the parent group's axis: in a horizontal group the
  // separator is a vertical bar, and vice versa.
  return (
    <Separator
      className={`group flex items-center justify-center bg-transparent transition-colors hover:bg-accent/10 ${
        orientation === "horizontal" ? "w-1.5" : "h-1.5"
      }`}
    >
      <div
        className={`rounded-full bg-stroke transition-colors group-hover:bg-accent/60 ${
          orientation === "horizontal" ? "h-8 w-[3px]" : "h-[3px] w-8"
        }`}
      />
    </Separator>
  );
}

export default function Workbench({
  initialSnippet = null,
}: {
  initialSnippet?: InitialSnippet | null;
}) {
  const { analyze } = useAnalysis();
  const loadSnippet = useWorkbench((s) => s.loadSnippet);
  const loadedRef = useRef(false);

  // Hydrate from a saved snippet exactly once (dashboard "open" flow).
  useEffect(() => {
    if (initialSnippet && !loadedRef.current) {
      loadedRef.current = true;
      loadSnippet(initialSnippet);
    }
  }, [initialSnippet, loadSnippet]);

  return (
    <div className="flex h-full flex-col">
      <DiffModal />
      <WorkbenchToolbar onAnalyze={analyze} />
      <div className="min-h-0 flex-1">
        <Group orientation="horizontal" className="h-full">
          <Panel id="editor-zone" defaultSize="62%" minSize="35%">
            <Group orientation="vertical" className="h-full">
              <Panel id="editor" defaultSize="74%" minSize="40%">
                <CodeEditor />
              </Panel>
              <Handle orientation="vertical" />
              <Panel id="console" defaultSize="26%" minSize="10%">
                <ConsolePanel />
              </Panel>
            </Group>
          </Panel>
          <Handle orientation="horizontal" />
          <Panel id="insights" defaultSize="38%" minSize="26%">
            <InsightsPanel />
          </Panel>
        </Group>
      </div>
    </div>
  );
}
