'use client';
import React from 'react';
import { useState } from 'react';

export default function EditorPage() {
  const [text, setText] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  
  const handleSave = async () => {
    setIsSaving(true); 
    try {
      const response = await fetch("/api/save", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: text }), 
      });

      if (!response.ok) {
        throw new Error("Failed to save the document.");
      }

      const data = await response.json();
      console.log("Success:", data);
      alert(`Document saved successfully with ID: ${data.documentId}`);
    } catch (error) {
      console.error("Save error:", error);
      alert("Error: Could not save the document.");
    } finally {
      setIsSaving(false); 
    }
  };
  return (
    <main className="flex min-h-screen flex-col items-center p-12 bg-gray-900 text-white">
      <div className="w-full max-w-5xl flex justify-between items-center mb-8">
        <h1 className="text-5xl font-bold text-pink-200">Jot<span className="text-blue-500">.It</span></h1>

        <button
          onClick={handleSave}
          disabled={isSaving}
          className="px-6 py-2 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-opacity-75 disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors duration-200"
        >
          {isSaving ? "Saving..." : "Save"}
        </button>
      </div>

      <div className="w-full max-w-5xl h-[70vh] bg-slate-900 rounded-lg shadow-xl border border-gray-700">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="w-full h-full bg-transparent text-white p-10 text-lg resize-none outline-none"
          placeholder="Start your masterpiece..."
        ></textarea>
      </div>
      <p className="mt-4 text-gray-400">Character Count: {text.length}</p>
    </main>
  );
}