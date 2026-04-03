"use client";

import { EmailDetail as EmailDetailType } from "@/types/email";

interface EmailDetailProps {
  email: EmailDetailType | null;
  loading: boolean;
}

export default function EmailDetail({ email, loading }: EmailDetailProps) {
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
    <div className="p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        {email.subject}
      </h2>
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
      <hr className="mb-6 border-gray-200" />
      <div className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">
        {email.body_text}
      </div>
    </div>
  );
}
