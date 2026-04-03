"use client";

import { useState } from "react";
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
      <div className="p-6 space-y-4 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-3/4" />
        <div className="h-4 bg-gray-200 rounded w-1/2" />
        <div className="h-4 bg-gray-200 rounded w-1/3" />
        <div className="mt-6 space-y-2">
          <div className="h-4 bg-gray-200 rounded w-full" />
          <div className="h-4 bg-gray-200 rounded w-full" />
          <div className="h-4 bg-gray-200 rounded w-5/6" />
          <div className="h-4 bg-gray-200 rounded w-4/6" />
        </div>
      </div>
    );
  }

  if (!email) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400 text-sm">
        Select an email to view
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
        <div className="flex items-start justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            {email.subject}
          </h2>
          <button
            onClick={handleGenerateDraft}
            disabled={generatingDraft}
            className="flex-shrink-0 ml-4 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {generatingDraft ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Generating...
              </span>
            ) : (
              "Generate Reply"
            )}
          </button>
        </div>
        <div className="text-sm text-gray-600 space-y-1 mb-6">
          <div>
            <span className="font-medium text-gray-700">From:</span>{" "}
            {email.from_address}
          </div>
          {email.to_address && (
            <div>
              <span className="font-medium text-gray-700">To:</span>{" "}
              {email.to_address}
            </div>
          )}
          <div>
            <span className="font-medium text-gray-700">Date:</span>{" "}
            {formattedDate}
          </div>
        </div>
        {draftError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-700">
            {draftError}
          </div>
        )}
        <hr className="mb-6 border-gray-200" />
        <div className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">
          {email.body_text}
        </div>
      </div>

      {draft && (
        <DraftEditor
          draft={draft.draft_body}
          subject={draft.subject}
          toAddress={draft.to_address}
          onClose={() => setDraft(null)}
        />
      )}
    </div>
  );
}
