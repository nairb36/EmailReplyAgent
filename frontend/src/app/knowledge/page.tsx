"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import { apiFetch } from "@/lib/api";
import type { KBItem, KBListResponse } from "@/types/knowledge";

export default function KnowledgeBase() {
  const { data: session, status } = useSession({ required: true });
  const [items, setItems] = useState<KBItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    if (!session?.backendToken) return;
    fetchItems();
  }, [session?.backendToken]);

  async function fetchItems() {
    if (!session?.backendToken) return;
    setLoading(true);
    try {
      const data = await apiFetch<KBListResponse>("/api/knowledge", {
        token: session.backendToken,
      });
      setItems(data.items);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch items");
    } finally {
      setLoading(false);
    }
  }

  async function handleAdd() {
    if (!session?.backendToken || !title.trim() || !content.trim()) return;

    const apiKey = localStorage.getItem("openai_api_key");
    if (!apiKey) {
      setError('No OpenAI API key set. Click "API Key" in the navbar.');
      return;
    }

    setAdding(true);
    setError(null);
    try {
      const item = await apiFetch<KBItem>("/api/knowledge", {
        method: "POST",
        token: session.backendToken,
        body: JSON.stringify({
          title: title.trim(),
          content: content.trim(),
          openai_api_key: apiKey,
        }),
      });
      setItems([item, ...items]);
      setTitle("");
      setContent("");
      setShowForm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add item");
    } finally {
      setAdding(false);
    }
  }

  async function handleDelete(id: string) {
    if (!session?.backendToken) return;
    try {
      await apiFetch(`/api/knowledge/${id}`, {
        method: "DELETE",
        token: session.backendToken,
      });
      setItems(items.filter((item) => item.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete item");
    }
  }

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      <Navbar />
      <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-950">
        <div className="max-w-3xl mx-auto px-6 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Knowledge Base
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Add context that the AI will use when drafting replies.
              </p>
            </div>
            <button
              onClick={() => setShowForm(!showForm)}
              className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-indigo-600 to-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:from-indigo-700 hover:to-blue-700 transition-all"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Add Document
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-700 dark:text-red-300 flex items-center gap-2">
              <svg className="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
              {error}
              <button onClick={() => setError(null)} className="ml-auto text-red-400 hover:text-red-600 dark:hover:text-red-300">&times;</button>
            </div>
          )}

          {/* Add Form */}
          {showForm && (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm p-5 mb-6">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                New Knowledge Document
              </h3>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Title (e.g., Company FAQ, Product Info, Policies)"
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg text-sm mb-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Paste the content here. This will be used as context when generating email replies..."
                rows={8}
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg text-sm resize-y bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              <div className="flex justify-end gap-3 mt-3">
                <button
                  onClick={() => {
                    setShowForm(false);
                    setTitle("");
                    setContent("");
                  }}
                  className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAdd}
                  disabled={adding || !title.trim() || !content.trim()}
                  className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-indigo-600 to-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:from-indigo-700 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {adding ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Saving...
                    </>
                  ) : (
                    "Save Document"
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Items List */}
          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-5 animate-pulse">
                  <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-3" />
                  <div className="h-4 bg-gray-100 dark:bg-gray-600 rounded w-full mb-2" />
                  <div className="h-4 bg-gray-100 dark:bg-gray-600 rounded w-5/6" />
                </div>
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-12 text-center">
              <svg className="h-12 w-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
              </svg>
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                No documents yet. Add knowledge to improve AI-generated replies.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm p-5 hover:border-gray-300 dark:hover:border-gray-600 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                      {item.title}
                    </h3>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="rounded-md p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors flex-shrink-0 ml-3"
                      title="Delete"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                      </svg>
                    </button>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap line-clamp-4">
                    {item.content}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-3">
                    Added {new Date(item.created_at).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
