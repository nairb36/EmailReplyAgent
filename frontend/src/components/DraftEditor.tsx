"use client";

import { useState } from "react";

interface DraftEditorProps {
  draft: string;
  subject: string;
  toAddress: string;
  onClose: () => void;
}

export default function DraftEditor({
  draft,
  subject,
  toAddress,
  onClose,
}: DraftEditorProps) {
  const [body, setBody] = useState(draft);

  return (
    <div className="border-t-2 border-indigo-200 bg-gradient-to-b from-indigo-50 to-white p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <svg className="h-5 w-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
          </svg>
          <h3 className="text-lg font-semibold text-gray-900">AI Draft Reply</h3>
        </div>
        <button
          onClick={onClose}
          className="rounded-md p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <div className="text-sm text-gray-600 space-y-1 mb-4 bg-white rounded-md p-3 border border-gray-100">
        <div>
          <span className="font-medium text-gray-500">To:</span>{" "}
          <span className="text-gray-800">{toAddress}</span>
        </div>
        <div>
          <span className="font-medium text-gray-500">Subject:</span>{" "}
          <span className="text-gray-800">{subject}</span>
        </div>
      </div>
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        className="w-full h-48 p-4 border border-gray-200 rounded-lg text-sm text-gray-800 resize-y bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm"
      />
      <p className="mt-2 text-xs text-gray-400">
        Review and edit the draft above. Sending will be available in Phase 3.
      </p>
    </div>
  );
}
