"use client";

import { useState } from "react";

interface LlmContextPanelProps {
  context: string;
}

export default function LlmContextPanel({ context }: LlmContextPanelProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border-t-2 border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/50">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-6 py-3 text-sm font-medium text-amber-800 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <svg className="h-4 w-4 text-amber-600 dark:text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          LLM Context
        </div>
        <svg
          className={`h-4 w-4 text-amber-600 dark:text-amber-400 transition-transform ${expanded ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </button>
      {expanded && (
        <div className="px-6 pb-4">
          <pre className="text-xs text-amber-900 dark:text-amber-200 bg-amber-100/50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 rounded-lg p-4 overflow-x-auto whitespace-pre-wrap max-h-80 overflow-y-auto">
            {context}
          </pre>
        </div>
      )}
    </div>
  );
}
