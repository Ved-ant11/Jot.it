"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import React from "react";

export default function HomePage() {
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateNew = async () => {
    setIsCreating(true);
    try {
      const response = await fetch("/api/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: "" }), 
      });

      if (!response.ok) throw new Error("Failed to create document.");

      const data = await response.json();
      const newDocId = data.documentId;

      router.push(`/documents/${newDocId}`);
    } catch (error) {
      console.error("Creation error:", error);
      alert("Error: Could not create a new document.");
      setIsCreating(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-white mb-8">Jot<span className="text-indigo-600">.It</span></h1>
        <button
          onClick={handleCreateNew}
          disabled={isCreating}
          className="px-8 py-4 bg-cyan-600 text-white font-bold text-xl rounded-lg shadow-lg hover:bg-cyan-700 disabled:bg-gray-500 transition-colors duration-200"
        >
          {isCreating ? "Creating..." : "Create New Document"}
        </button>
      </div>
    </div>
  );
}
