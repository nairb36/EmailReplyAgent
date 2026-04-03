"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { EmailDetail as EmailDetailType, DraftResponse } from "@/types/email";
import { apiFetch } from "@/lib/api";
import DraftEditor from "./DraftEditor";

interface EmailDetailProps {
  email: EmailDetailType | null;
  loading: boolean;
}

export default function EmailDetail({ email, loading }: EmailDetailProps) {
  const { data: session } = useSession();
  const [draft, setDraft] = useState<DraftResponse | null>(null);
  const [generatingDraft, setGeneratingDraft] = useState(false);
  const [draftError, setDraftError] = useState<string | null>(null);

  // Clear draft when switching emails
  useEffect(() => {
    setDraft(null);
    setDraftError(null);
  }, [email?.id]);

  async function handleGenerateDraft() {
    if (!email || !session?.backendToken) return;

    const apiKey = localStorage.getItem("openai_api_key");
    if (!apiKey) {
      setDraftError(
        'No OpenAI API key set. Click "API Key" in the navbar to add one.'
      );
      return;
    }

    setGeneratingDraft(true);
    setDraftError(null);
    try {
      const data = await apiFetch<DraftResponse>("/api/drafts", {
        method: "POST",
        token: session.backendToken,
        body: JSON.stringify({
          message_id: email.id,
          openai_api_key: apiKey,
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
        <div className="h-7 bg-gradient-to-r from-gray-200 to-gray-100 rounded-lg w-3/4" />
        <div className="h-4 bg-gray-200 rounded w-1/2" />
        <div className="h-4 bg-gray-200 rounded w-1/3" />
        <div className="mt-8 space-y-3">
          <div className="h-4 bg-gray-100 rounded w-full" />
          <div className="h-4 bg-gray-100 rounded w-full" />
          <div className="h-4 bg-gray-100 rounded w-5/6" />
          <div className="h-4 bg-gray-100 rounded w-4/6" />
        </div>
      </div>
    );
  }

  if (!email) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-400">
        <svg className="h-16 w-16 mb-4 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
        </svg>
        <p className="text-sm">Select an email to view</p>
      </div>
    );
  }

  const date = new Date(email.received_at);
  const formattedDate = date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

  return (
    <div className="flex flex-col h-full">
      <div className="p-6 flex-1 overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between mb-5">
          <h2 className="text-xl font-semibold text-gray-900 leading-tight">
            {email.subject}
          </h2>
          <button
            onClick={handleGenerateDraft}
            disabled={generatingDraft}
            className="flex-shrink-0 ml-4 inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-indigo-600 to-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:from-indigo-700 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {generatingDraft ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Generating...
              </>
            ) : (
              <>
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
                </svg>
                Generate Reply
              </>
            )}
          </button>
        </div>

        {/* Metadata card */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6 border border-gray-100">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-500 to-blue-500 flex items-center justify-center text-white font-semibold text-sm">
              {email.from_address.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="text-sm font-medium text-gray-900">
                {email.from_address}
              </div>
              {email.to_address && (
                <div className="text-xs text-gray-500">
                  To: {email.to_address}
                </div>
              )}
            </div>
          </div>
          <div className="text-xs text-gray-500 ml-[52px]">
            {formattedDate}
          </div>
        </div>

        {draftError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 flex items-center gap-2">
            <svg className="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
            {draftError}
          </div>
        )}

        {/* Email body */}
        <div className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">
          {email.body_text}
        </div>
      </div>

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
