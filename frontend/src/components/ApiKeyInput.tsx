"use client";

import { useState, useEffect } from "react";

interface ApiKeyInputProps {
  onClose: () => void;
}

export default function ApiKeyInput({ onClose }: ApiKeyInputProps) {
  const [key, setKey] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("openai_api_key") || "";
    setKey(saved);
  }, []);

  function handleSave() {
    if (key.trim()) {
      localStorage.setItem("openai_api_key", key.trim());
    } else {
      localStorage.removeItem("openai_api_key");
    }
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          OpenAI API Key
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          Your key is stored in your browser only and never sent to our servers
          — it goes directly to OpenAI.
        </p>
        <input
          type="password"
          value={key}
          onChange={(e) => setKey(e.target.value)}
          placeholder="sk-..."
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <div className="flex justify-end gap-3 mt-4">
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
