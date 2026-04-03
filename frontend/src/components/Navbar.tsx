"use client";

import { useState } from "react";
import LoginButton from "./LoginButton";
import ApiKeyInput from "./ApiKeyInput";

export default function Navbar() {
  const [showApiKey, setShowApiKey] = useState(false);

  return (
    <>
      <nav className="bg-white border-b border-gray-200 px-6 py-3">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <h1 className="text-xl font-semibold text-gray-900">
            EmailReplyAgent
          </h1>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowApiKey(true)}
              className="rounded-md bg-gray-100 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-200 transition-colors"
            >
              API Key
            </button>
            <LoginButton />
          </div>
        </div>
      </nav>
      {showApiKey && <ApiKeyInput onClose={() => setShowApiKey(false)} />}
    </>
  );
}
