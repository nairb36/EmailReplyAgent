"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { EmailDetail as EmailDetailType, DraftResponse, ThreadResponse } from "@/types/email";
import { apiFetch } from "@/lib/api";
import DraftEditor from "./DraftEditor";
import LlmContextPanel from "./LlmContextPanel";
import { PROVIDER_LOGOS } from "./ProviderLogos";

const PROVIDERS = [
  { id: "openai", label: "OpenAI", storageKey: "openai_api_key" },
  { id: "anthropic", label: "Anthropic", storageKey: "anthropic_api_key" },
  { id: "gemini", label: "Gemini", storageKey: "gemini_api_key" },
];

interface EmailDetailProps {
  email: EmailDetailType | null;
  loading: boolean;
  thread?: ThreadResponse | null;
}

export default function EmailDetail({ email, loading, thread }: EmailDetailProps) {
  const { data: session } = useSession();
  const [draft, setDraft] = useState<DraftResponse | null>(null);
  const [generatingDraft, setGeneratingDraft] = useState(false);
  const [draftError, setDraftError] = useState<string | null>(null);
  const [provider, setProvider] = useState("openai");
  const [showProviderMenu, setShowProviderMenu] = useState(false);

  // Clear draft when switching emails
  useEffect(() => {
    setDraft(null);
    setDraftError(null);
  }, [email?.id]);

  function getSelectedProvider() {
    return PROVIDERS.find((p) => p.id === provider)!;
  }

  async function handleGenerateDraft() {
    if (!email || !session?.backendToken) return;

    const selected = getSelectedProvider();
    const apiKey = localStorage.getItem(selected.storageKey);
    if (!apiKey) {
      setDraftError(
        `No ${selected.label} API key set. Click "API Key" in the navbar to add one.`
      );
      return;
    }

    // For RAG embeddings, we need an OpenAI key if using a non-OpenAI provider
    const openaiKey = localStorage.getItem("openai_api_key");

    setGeneratingDraft(true);
    setDraftError(null);
    setShowProviderMenu(false);
    try {
      const data = await apiFetch<DraftResponse>("/api/drafts", {
        method: "POST",
        token: session.backendToken,
        body: JSON.stringify({
          message_id: email.id,
          api_key: apiKey,
          provider: provider,
          openai_api_key: provider !== "openai" ? openaiKey : undefined,
        }),
      });
      setDraft(data);
    } catch (err) {
      setDraftError(
        err instanceof Error ? err.message : "Failed to generate draft"
      );
    } finally {
      setGeneratingDraft(false);
    }
  }

  if (loading) {
    return (
      <div className="p-8 space-y-4 animate-pulse">
        <div className="h-7 bg-gradient-to-r from-gray-200 dark:from-gray-700 to-gray-100 dark:to-gray-800 rounded-lg w-3/4" />
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
        <div className="mt-8 space-y-3">
          <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-full" />
          <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-full" />
          <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-5/6" />
          <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-4/6" />
        </div>
      </div>
    );
  }

  if (!email) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-400 dark:text-gray-500">
        <svg className="h-16 w-16 mb-4 text-gray-200 dark:text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
        </svg>
        <p className="text-sm">Select an email to view</p>
      </div>
    );
  }

  // Use thread messages if available, otherwise fall back to single email
  const hasThread = thread && thread.messages.length > 1;

  function formatMessageDate(dateStr: string) {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  }

  function extractName(from: string): string {
    const match = from.match(/^"?([^"<]+)"?\s*</);
    return match ? match[1].trim() : from.split("@")[0];
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-6 flex-1 overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between mb-5">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white leading-tight">
            {email.subject}
          </h2>
          <div className="flex-shrink-0 ml-4 flex items-center gap-0 relative">
            {/* Generate button */}
            <button
              onClick={handleGenerateDraft}
              disabled={generatingDraft}
              className="inline-flex items-center gap-2 rounded-l-lg bg-gradient-to-r from-indigo-600 to-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:from-indigo-700 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {generatingDraft ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Generating...
                </>
              ) : (
                <>
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                  </svg>
                  Generate
                </>
              )}
            </button>
            {/* Provider dropdown toggle */}
            <button
              onClick={() => setShowProviderMenu(!showProviderMenu)}
              disabled={generatingDraft}
              className="inline-flex items-center gap-1 rounded-r-lg bg-gradient-to-r from-blue-600 to-blue-700 px-2.5 py-2 text-sm font-medium text-white shadow-sm border-l border-blue-500 hover:from-blue-700 hover:to-blue-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {(() => { const Logo = PROVIDER_LOGOS[provider]; return Logo ? <Logo className="h-3.5 w-3.5" /> : null; })()}
              <span className="text-xs">{getSelectedProvider().label}</span>
              <svg className={`h-3 w-3 transition-transform ${showProviderMenu ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
              </svg>
            </button>
            {/* Dropdown menu */}
            {showProviderMenu && (
              <div className="absolute right-0 top-full mt-1 w-40 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-10">
                {PROVIDERS.map((p) => {
                  const hasKey = typeof window !== "undefined" && !!localStorage.getItem(p.storageKey);
                  const Logo = PROVIDER_LOGOS[p.id];
                  return (
                    <button
                      key={p.id}
                      onClick={() => {
                        setProvider(p.id);
                        setShowProviderMenu(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-sm flex items-center justify-between transition-colors ${
                        provider === p.id
                          ? "bg-indigo-50 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 font-medium"
                          : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        {Logo && <Logo className="h-4 w-4" />}
                        {p.label}
                      </span>
                      <span className="flex items-center gap-1.5">
                        {hasKey ? (
                          <span className="h-2 w-2 rounded-full bg-emerald-500" />
                        ) : (
                          <span className="h-2 w-2 rounded-full bg-gray-300 dark:bg-gray-600" />
                        )}
                        {provider === p.id && (
                          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                          </svg>
                        )}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {draftError && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-700 dark:text-red-300 flex items-center gap-2">
            <svg className="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
            {draftError}
          </div>
        )}

        {/* Thread / Conversation View */}
        {hasThread ? (
          <div className="space-y-4">
            {thread!.messages.map((msg, idx) => (
              <div
                key={msg.id}
                className={`rounded-lg border p-4 ${
                  msg.is_sent
                    ? "bg-indigo-50 dark:bg-indigo-950/30 border-indigo-200 dark:border-indigo-800 ml-8"
                    : "bg-gray-50 dark:bg-gray-800 border-gray-100 dark:border-gray-700 mr-8"
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div
                    className={`h-8 w-8 rounded-full flex items-center justify-center text-white font-semibold text-xs ${
                      msg.is_sent
                        ? "bg-gradient-to-br from-indigo-500 to-violet-500"
                        : "bg-gradient-to-br from-indigo-500 to-blue-500"
                    }`}
                  >
                    {extractName(msg.from_address).charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                        {msg.is_sent ? "You" : extractName(msg.from_address)}
                      </span>
                      {msg.is_sent && (
                        <span className="text-xs bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 px-1.5 py-0.5 rounded font-medium">
                          Sent
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {formatMessageDate(msg.received_at)}
                    </div>
                  </div>
                </div>
                <div className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap leading-relaxed ml-11">
                  {msg.body_text}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            {/* Single email view (fallback) */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-6 border border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-3 mb-2">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-500 to-blue-500 flex items-center justify-center text-white font-semibold text-sm">
                  {email.from_address.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {email.from_address}
                  </div>
                  {email.to_address && (
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      To: {email.to_address}
                    </div>
                  )}
                </div>
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 ml-[52px]">
                {formatMessageDate(email.received_at)}
              </div>
            </div>

            {/* Email body */}
            <div className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap leading-relaxed">
              {email.body_text}
            </div>
          </>
        )}
      </div>

      {draft && <LlmContextPanel context={draft.llm_context} />}

      {draft && (
        <DraftEditor
          draftId={draft.draft_id}
          originalDraft={draft.draft_body}
          subject={draft.subject}
          toAddress={draft.to_address}
          threadId={draft.thread_id}
          messageId={draft.message_id}
          onClose={() => setDraft(null)}
          onSent={() => setDraft(null)}
        />
      )}
    </div>
  );
}
