import Workbench from "@/components/workbench/Workbench";
import { prisma } from "@/lib/db";
import type { Language, Mode } from "@/lib/types";

export const metadata = { title: "Workbench" };
export const dynamic = "force-dynamic";

export default async function WorkbenchPage({
  searchParams,
}: {
  searchParams: Promise<{ snippet?: string }>;
}) {
  const { snippet: snippetId } = await searchParams;

  let initialSnippet = null;
  if (snippetId) {
    const snippet = await prisma.snippet
      .findUnique({ where: { id: snippetId } })
      .catch(() => null);
    if (snippet) {
      initialSnippet = {
        id: snippet.id,
        code: snippet.code,
        language: snippet.language as Language,
        mode: snippet.mode as Mode,
      };
    }
  }

  return <Workbench initialSnippet={initialSnippet} />;
}
