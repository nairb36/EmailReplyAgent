"use client";

import LoginButton from "./LoginButton";

export default function Navbar() {
  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-3">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <h1 className="text-xl font-semibold text-gray-900">
          EmailReplyAgent
        </h1>
        <LoginButton />
      </div>
    </nav>
  );
}
