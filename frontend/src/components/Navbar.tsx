"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import LoginButton from "./LoginButton";
import ApiKeyInput from "./ApiKeyInput";

export default function Navbar() {
  const pathname = usePathname();
  const [showApiKey, setShowApiKey] = useState(false);
  const [hasApiKey, setHasApiKey] = useState(false);

  useEffect(() => {
    setHasApiKey(!!localStorage.getItem("openai_api_key"));
  }, []);

  function handleCloseApiKey() {
    setShowApiKey(false);
    setHasApiKey(!!localStorage.getItem("openai_api_key"));
  }

  return (
    <>
      <nav className="bg-white border-b border-gray-200 px-6 py-3 shadow-sm">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-indigo-600 to-blue-600 flex items-center justify-center">
              <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-gray-900">
              EmailReply<span className="text-indigo-600">Agent</span>
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className={`rounded-lg px-3 py-1.5 text-sm transition-colors ${
                pathname === "/dashboard"
                  ? "bg-indigo-50 text-indigo-700 font-medium"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              Inbox
            </Link>
            <Link
              href="/knowledge"
              className={`rounded-lg px-3 py-1.5 text-sm transition-colors ${
                pathname === "/knowledge"
                  ? "bg-indigo-50 text-indigo-700 font-medium"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              Knowledge Base
            </Link>
            <div className="w-px h-6 bg-gray-200" />
            <button
              onClick={() => setShowApiKey(true)}
              className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
            >
              {hasApiKey ? (
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-100">
                  <svg className="h-3 w-3 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                </span>
              ) : (
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-red-100">
                  <span className="text-red-600 text-xs font-bold leading-none">!</span>
                </span>
              )}
              API Key
            </button>
            <LoginButton />
          </div>
        </div>
      </nav>
      {showApiKey && <ApiKeyInput onClose={handleCloseApiKey} />}
    </>
  );
}
