import { Code2 } from "lucide-react";
import Placeholder from "@/components/ui/Placeholder";

export const metadata = { title: "Workbench" };

export default function WorkbenchPage() {
  return (
    <Placeholder
      icon={Code2}
      title="Workbench"
      body="The live editor with real-time AI analysis lands here next — Monaco editor, complexity insights, bug detection and optimization coaching."
    />
  );
}
