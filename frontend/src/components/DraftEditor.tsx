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
    <div className="border-t border-gray-200 bg-gray-50 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Draft Reply</h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 text-xl leading-none"
        >
          &times;
        </button>
      </div>
      <div className="text-sm text-gray-600 space-y-1 mb-4">
        <div>
          <span className="font-medium text-gray-700">To:</span> {toAddress}
        </div>
        <div>
          <span className="font-medium text-gray-700">Subject:</span> {subject}
        </div>
      </div>
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        className="w-full h-48 p-3 border border-gray-300 rounded-lg text-sm text-gray-800 resize-y focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
      <p className="mt-2 text-xs text-gray-400">
        Review and edit the draft above. Sending will be available in Phase 3.
      </p>
    </div>
  );
}
