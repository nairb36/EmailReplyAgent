"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import EmailList from "@/components/EmailList";
import EmailDetailComponent from "@/components/EmailDetail";
import { apiFetch } from "@/lib/api";
import type { EmailSummary, EmailDetail, EmailListResponse } from "@/types/email";

export default function Dashboard() {
  const { data: session, status } = useSession({ required: true });
  const [emails, setEmails] = useState<EmailSummary[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [emailDetail, setEmailDetail] = useState<EmailDetail | null>(null);
  const [loadingEmails, setLoadingEmails] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!session?.backendToken) return;

    async function fetchEmails() {
      setLoadingEmails(true);
      setError(null);
      try {
        const data = await apiFetch<EmailListResponse>("/api/emails", {
          token: session!.backendToken,
        });
        setEmails(data.messages);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch emails");
      } finally {
        setLoadingEmails(false);
      }
    }

    fetchEmails();
  }, [session?.backendToken]);

  async function handleSelectEmail(id: string) {
    if (!session?.backendToken) return;
    setSelectedId(id);
    setLoadingDetail(true);
    try {
      const detail = await apiFetch<EmailDetail>(`/api/emails/${id}`, {
        token: session.backendToken,
      });
      setEmailDetail(detail);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch email");
    } finally {
      setLoadingDetail(false);
    }
  }

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        {/* Email List */}
        <div className="w-[380px] flex-shrink-0 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 overflow-y-auto">
          {loadingEmails ? (
            <div className="p-4 space-y-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="animate-pulse space-y-2">
                  <div className="flex justify-between">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16" />
                  </div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full" />
                </div>
              ))}
            </div>
          ) : error && emails.length === 0 ? (
            <div className="p-6 text-center">
              <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-3 text-sm text-blue-600 dark:text-blue-400 hover:underline"
              >
                Try again
              </button>
            </div>
          ) : (
            <EmailList
              emails={emails}
              onSelect={handleSelectEmail}
              selectedId={selectedId}
            />
          )}
        </div>

        {/* Email Detail */}
        <div className="flex-1 bg-gray-50 dark:bg-gray-950 overflow-y-auto">
          <EmailDetailComponent email={emailDetail} loading={loadingDetail} />
        </div>
      </div>
    </div>
  );
}
