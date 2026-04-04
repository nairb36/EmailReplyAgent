"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { apiFetch } from "@/lib/api";
import FeedbackPanel from "./FeedbackPanel";
import type { SendResponse } from "@/types/email";

interface DraftEditorProps {
  draftId: string;
  originalDraft: string;
  subject: string;
  toAddress: string;
  threadId?: string;
  messageId?: string;
  onClose: () => void;
  onSent: () => void;
}

export default function DraftEditor({
  draftId,
  originalDraft,
  subject,
  toAddress,
  threadId,
  messageId,
  onClose,
  onSent,
}: DraftEditorProps) {
  const { data: session } = useSession();
  const [body, setBody] = useState(originalDraft);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSend() {
    if (!session?.backendToken) return;

    setSending(true);
    setError(null);
    try {
      await apiFetch<SendResponse>("/api/drafts/send", {
        method: "POST",
        token: session.backendToken,
        body: JSON.stringify({
          draft_id: draftId,
          final_body: body,
          subject,
          to_address: toAddress,
          thread_id: threadId,
          message_id: messageId,
        }),
      });
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send email");
    } finally {
      setSending(false);
    }
  }

  if (sent) {
    return (
      <div>
        <div className="border-t-2 border-emerald-200 dark:border-emerald-800 bg-gradient-to-b from-emerald-50 dark:from-emerald-950 to-white dark:to-gray-900 p-6">
          <div className="flex items-center gap-3 text-emerald-700 dark:text-emerald-400">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-lg font-semibold">Email sent successfully!</span>
          </div>
        </div>
        <FeedbackPanel draftId={draftId} onDone={onSent} />
      </div>
    );
  }

  return (
    <div className="border-t-2 border-indigo-200 dark:border-indigo-800 bg-gradient-to-b from-indigo-50 dark:from-indigo-950 to-white dark:to-gray-900 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <svg className="h-5 w-5 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
          </svg>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">AI Draft Reply</h3>
        </div>
        <button
          onClick={onClose}
          className="rounded-md p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1 mb-4 bg-white dark:bg-gray-800 rounded-md p-3 border border-gray-100 dark:border-gray-700">
        <div>
          <span className="font-medium text-gray-500 dark:text-gray-400">To:</span>{" "}
          <span className="text-gray-800 dark:text-gray-200">{toAddress}</span>
        </div>
        <div>
          <span className="font-medium text-gray-500 dark:text-gray-400">Subject:</span>{" "}
          <span className="text-gray-800 dark:text-gray-200">{subject}</span>
        </div>
      </div>
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        className="w-full h-48 p-4 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-800 dark:text-gray-200 resize-y bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm"
      />
      {error && (
        <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-700 dark:text-red-300 flex items-center gap-2">
          <svg className="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
          {error}
        </div>
      )}
      <div className="flex items-center justify-between mt-4">
        <p className="text-xs text-gray-400 dark:text-gray-500">
          Review and edit the draft before sending.
        </p>
        <button
          onClick={handleSend}
          disabled={sending || !body.trim()}
          className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-emerald-600 to-green-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:from-emerald-700 hover:to-green-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {sending ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Sending...
            </>
          ) : (
            <>
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
              </svg>
              Approve &amp; Send
            </>
          )}
        </button>
      </div>
    </div>
  );
}
