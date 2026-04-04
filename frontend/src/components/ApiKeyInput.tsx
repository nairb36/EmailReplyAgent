"use client";

import { useState, useEffect } from "react";
import { PROVIDER_LOGOS } from "./ProviderLogos";

interface ApiKeyInputProps {
  onClose: () => void;
}

const PROVIDERS = [
  { id: "openai", label: "OpenAI", placeholder: "sk-...", storageKey: "openai_api_key" },
  { id: "anthropic", label: "Anthropic", placeholder: "sk-ant-...", storageKey: "anthropic_api_key" },
  { id: "gemini", label: "Gemini", placeholder: "AI...", storageKey: "gemini_api_key" },
];

export default function ApiKeyInput({ onClose }: ApiKeyInputProps) {
  const [keys, setKeys] = useState<Record<string, string>>({});

  useEffect(() => {
    const loaded: Record<string, string> = {};
    for (const p of PROVIDERS) {
      loaded[p.id] = localStorage.getItem(p.storageKey) || "";
    }
    setKeys(loaded);
  }, []);

  function handleSave() {
    for (const p of PROVIDERS) {
      const val = keys[p.id]?.trim();
      if (val) {
        localStorage.setItem(p.storageKey, val);
      } else {
        localStorage.removeItem(p.storageKey);
      }
    }
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          API Keys
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
          Keys are stored in your browser only. Add at least one to generate drafts.
        </p>
        <p className="text-xs text-amber-600 dark:text-amber-400 mb-5 flex items-center gap-1.5">
          <svg className="h-3.5 w-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
          OpenAI key is required for Knowledge Base (RAG) features, even when using other providers.
        </p>
        <div className="space-y-4">
          {PROVIDERS.map((p) => {
            const Logo = PROVIDER_LOGOS[p.id];
            return (
            <div key={p.id}>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {Logo && <Logo className="h-4 w-4" />}
                {p.label}
                {keys[p.id]?.trim() ? (
                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/50">
                    <svg className="h-3 w-3 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  </span>
                ) : null}
              </label>
              <input
                type="password"
                value={keys[p.id] || ""}
                onChange={(e) => setKeys({ ...keys, [p.id]: e.target.value })}
                placeholder={p.placeholder}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            );
          })}
        </div>
        <div className="flex justify-end gap-3 mt-5">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
