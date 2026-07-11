import { Settings } from "lucide-react";
import Placeholder from "@/components/ui/Placeholder";

export const metadata = { title: "Settings" };

export default function SettingsPage() {
  return (
    <Placeholder
      icon={Settings}
      title="Settings"
      body="Anthropic API key status, GitHub token, live-analysis preferences and theme options will be configurable here."
    />
  );
}
