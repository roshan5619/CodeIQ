"use client";

import { useWorkbench } from "@/lib/store";
import LearningPanel from "../coach/LearningPanel";
import InterviewPanel from "../coach/InterviewPanel";
import CompetitivePanel from "../coach/CompetitivePanel";

export default function CoachTab() {
  const mode = useWorkbench((s) => s.mode);

  switch (mode) {
    case "learning":
      return <LearningPanel />;
    case "interview":
      return <InterviewPanel />;
    case "competitive":
      return <CompetitivePanel />;
    default:
      return (
        <p className="p-6 text-center text-sm text-mute">
          Pick Learning, Interview or Competitive in the toolbar to unlock
          coaching.
        </p>
      );
  }
}
