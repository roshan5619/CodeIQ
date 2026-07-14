"use client";

import { useEffect, useState } from "react";
import { postJson, ApiError } from "@/lib/streamFetch";
import {
  BadgeCheck,
  BrainCircuit,
  GitBranch,
  KeyRound,
  Loader2,
  ShieldQuestion,
  Trash2,
} from "lucide-react";

interface SettingsState {
  aiConfigured: boolean;
  githubConnected: boolean;
  secretConfigured: boolean;
}

function StatusRow({
  ok,
  okText,
  missingText,
}: {
  ok: boolean;
  okText: string;
  missingText: string;
}) {
  return (
    <span
      className={`flex w-fit items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-medium ${
        ok ? "bg-accent-soft text-accent" : "bg-warn-soft text-warn"
      }`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${ok ? "bg-accent" : "bg-warn"}`} />
      {ok ? okText : missingText}
    </span>
  );
}

export default function SettingsClient() {
  const [state, setState] = useState<SettingsState | null>(null);
  const [token, setToken] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ tone: "ok" | "err"; text: string } | null>(null);

  const refresh = async () => {
    const res = await fetch("/api/settings", { cache: "no-store" });
    if (res.ok) setState((await res.json()) as SettingsState);
  };

  useEffect(() => {
    let alive = true;
    fetch("/api/settings", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((s: SettingsState | null) => {
        if (alive && s) setState(s);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  const saveToken = async () => {
    if (!token.trim()) return;
    setSaving(true);
    setMessage(null);
    try {
      const res = await postJson<{ login: string }>("/api/settings", {
        githubToken: token.trim(),
      });
      setMessage({ tone: "ok", text: `Connected as @${res.login}.` });
      setToken("");
      await refresh();
    } catch (err) {
      setMessage({
        tone: "err",
        text: err instanceof ApiError ? err.message : "Failed to save token.",
      });
    } finally {
      setSaving(false);
    }
  };

  const disconnect = async () => {
    setSaving(true);
    setMessage(null);
    try {
      await postJson("/api/settings", { githubToken: null });
      setMessage({ tone: "ok", text: "GitHub disconnected — the stored token was deleted." });
      await refresh();
    } catch {
      setMessage({ tone: "err", text: "Failed to disconnect." });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4 p-6">
      {/* Anthropic */}
      <div className="glass rounded-2xl p-5">
        <div className="mb-3 flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent-soft text-accent">
            <BrainCircuit size={18} />
          </span>
          <div>
            <h2 className="text-sm font-semibold">Anthropic API</h2>
            <p className="text-xs text-mute">Powers all analysis, refactoring and review</p>
          </div>
        </div>
        {state ? (
          <StatusRow
            ok={state.aiConfigured}
            okText="ANTHROPIC_API_KEY configured"
            missingText="Not configured — running on demo data"
          />
        ) : (
          <Loader2 size={14} className="animate-spin text-mute" />
        )}
        {state && !state.aiConfigured && (
          <div className="mt-3 rounded-xl bg-raised p-3 font-mono text-[11px] leading-relaxed text-mute">
            # .env.local (create it next to package.json)
            <br />
            ANTHROPIC_API_KEY=&quot;sk-ant-...&quot;
            <br />
            <span className="text-faint"># then restart: npm run dev</span>
          </div>
        )}
      </div>

      {/* GitHub */}
      <div className="glass rounded-2xl p-5">
        <div className="mb-3 flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-soft text-violet">
            <GitBranch size={18} />
          </span>
          <div>
            <h2 className="text-sm font-semibold">GitHub</h2>
            <p className="text-xs text-mute">
              Repo browsing and AI pull-request reviews (fine-grained PAT, repo read scope)
            </p>
          </div>
        </div>

        {state && (
          <div className="mb-3">
            <StatusRow
              ok={state.githubConnected}
              okText="Token connected (encrypted at rest)"
              missingText="Not connected"
            />
          </div>
        )}

        <div className="flex gap-2">
          <div className="relative flex-1">
            <KeyRound
              size={13}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-faint"
            />
            <input
              type="password"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="github_pat_… or ghp_…"
              className="w-full rounded-xl border border-stroke bg-raised py-2 pl-9 pr-3 font-mono text-xs text-ink outline-none transition-colors placeholder:text-faint focus:border-accent"
              onKeyDown={(e) => {
                if (e.key === "Enter") void saveToken();
              }}
            />
          </div>
          <button
            onClick={saveToken}
            disabled={saving || !token.trim()}
            className="flex items-center gap-1.5 rounded-xl bg-accent px-4 py-2 text-xs font-semibold text-bg transition-transform hover:scale-[1.03] disabled:opacity-40"
          >
            {saving ? <Loader2 size={13} className="animate-spin" /> : <BadgeCheck size={13} />}
            Connect
          </button>
          {state?.githubConnected && (
            <button
              onClick={disconnect}
              disabled={saving}
              className="flex items-center gap-1.5 rounded-xl border border-stroke px-3 py-2 text-xs font-semibold text-mute transition-colors hover:border-danger hover:text-danger disabled:opacity-40"
              title="Delete the stored token"
            >
              <Trash2 size={13} />
            </button>
          )}
        </div>

        {message && (
          <p
            className={`mt-3 rounded-xl px-3 py-2 text-xs ${
              message.tone === "ok"
                ? "bg-accent-soft text-accent"
                : "bg-danger-soft text-danger"
            }`}
          >
            {message.text}
          </p>
        )}

        {state && !state.secretConfigured && state.githubConnected && (
          <p className="mt-3 flex items-start gap-2 rounded-xl bg-warn-soft px-3 py-2 text-xs leading-relaxed text-warn">
            <ShieldQuestion size={13} className="mt-0.5 shrink-0" />
            CODEIQ_SECRET is not set — the token is only obfuscated, not strongly
            encrypted. Add CODEIQ_SECRET to .env.local (see .env.example) and
            reconnect.
          </p>
        )}
      </div>
    </div>
  );
}
