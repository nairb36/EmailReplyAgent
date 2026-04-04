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

function getInitial(from: string): string {
  const name = extractName(from);
  return name.charAt(0).toUpperCase();
}

const avatarColors = [
  "from-indigo-500 to-blue-500",
  "from-emerald-500 to-teal-500",
  "from-amber-500 to-orange-500",
  "from-rose-500 to-pink-500",
  "from-violet-500 to-purple-500",
  "from-cyan-500 to-sky-500",
];

function getAvatarColor(email: string): string {
  let hash = 0;
  for (let i = 0; i < email.length; i++) {
    hash = email.charCodeAt(i) + ((hash << 5) - hash);
  }
  return avatarColors[Math.abs(hash) % avatarColors.length];
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
      <div className="flex flex-col items-center justify-center h-full text-gray-400 dark:text-gray-500">
        <svg className="h-12 w-12 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 13.5h3.86a2.25 2.25 0 012.012 1.244l.256.512a2.25 2.25 0 002.013 1.244h3.218a2.25 2.25 0 002.013-1.244l.256-.512a2.25 2.25 0 012.013-1.244h3.859m-19.5.338V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18v-4.162c0-.224-.034-.447-.1-.661L19.24 5.338a2.25 2.25 0 00-2.15-1.588H6.911a2.25 2.25 0 00-2.15 1.588L2.35 13.177a2.25 2.25 0 00-.1.661z" />
        </svg>
        <p className="text-sm">No emails found</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-100 dark:divide-gray-800">
      {emails.map((email) => {
        const isSelected = selectedId === email.id;
        return (
          <button
            key={email.id}
            onClick={() => onSelect(email.id)}
            className={`w-full text-left px-4 py-3.5 transition-colors ${
              isSelected
                ? "bg-indigo-50 dark:bg-indigo-950/50 border-l-3 border-indigo-600"
                : "hover:bg-gray-50 dark:hover:bg-gray-800 border-l-3 border-transparent"
            }`}
          >
            <div className="flex gap-3">
              <div
                className={`h-9 w-9 rounded-full bg-gradient-to-br ${getAvatarColor(
                  email.from_address
                )} flex items-center justify-center text-white text-xs font-semibold flex-shrink-0 mt-0.5`}
              >
                {getInitial(email.from_address)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <span className={`text-sm truncate max-w-[70%] ${isSelected ? "font-semibold text-indigo-900 dark:text-indigo-300" : "font-medium text-gray-900 dark:text-gray-100"}`}>
                    {extractName(email.from_address)}
                  </span>
                  <span className="text-xs text-gray-400 dark:text-gray-500 flex-shrink-0 ml-2">
                    {formatDate(email.received_at)}
                  </span>
                </div>
                <div className={`text-sm truncate ${isSelected ? "text-indigo-800 dark:text-indigo-200" : "text-gray-700 dark:text-gray-300"}`}>
                  {email.subject}
                </div>
                <div className="text-xs text-gray-400 dark:text-gray-500 truncate mt-0.5">
                  {email.snippet}
                </div>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
