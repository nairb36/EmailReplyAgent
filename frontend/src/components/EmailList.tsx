"use client";

import { EmailSummary } from "@/types/email";

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function extractName(from: string): string {
  const match = from.match(/^"?([^"<]+)"?\s*</);
  return match ? match[1].trim() : from.split("@")[0];
}

interface EmailListProps {
  emails: EmailSummary[];
  onSelect: (id: string) => void;
  selectedId: string | null;
}

export default function EmailList({
  emails,
  onSelect,
  selectedId,
}: EmailListProps) {
  if (emails.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500 text-sm">
        No emails found
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-100">
      {emails.map((email) => (
        <button
          key={email.id}
          onClick={() => onSelect(email.id)}
          className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors ${
            selectedId === email.id ? "bg-blue-50 border-l-2 border-blue-600" : ""
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium text-gray-900 truncate max-w-[70%]">
              {extractName(email.from_address)}
            </span>
            <span className="text-xs text-gray-500 flex-shrink-0">
              {formatDate(email.received_at)}
            </span>
          </div>
          <div className="text-sm text-gray-800 truncate">{email.subject}</div>
          <div className="text-xs text-gray-500 truncate mt-0.5">
            {email.snippet}
          </div>
        </button>
      ))}
    </div>
  );
}
