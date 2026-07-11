import { GitPullRequest } from "lucide-react";
import Placeholder from "@/components/ui/Placeholder";

export const metadata = { title: "GitHub" };

export default function GitHubPage() {
  return (
    <Placeholder
      icon={GitPullRequest}
      title="GitHub Intelligence"
      body="Connect a GitHub token in Settings to browse repositories, review pull requests with line-anchored AI comments, and export professional reviews."
    />
  );
}
