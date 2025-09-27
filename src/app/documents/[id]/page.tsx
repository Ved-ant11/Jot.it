"use client";

import { useState, useEffect } from "react";
import { io, Socket } from "socket.io-client";
import React from "react";

export default function EditorPage({ params }: { params: { id: string } }) {
  const documentId = params.id;
  const [text, setText] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  // Store the socket connection in state to prevent race conditions
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const newSocket = io(process.env.NEXT_PUBLIC_SOCKET_URL!);
    setSocket(newSocket);

    newSocket.emit("join-document", documentId);
    newSocket.on("receive-change", (newText: string) => {
      setText(newText);
    });

    return () => {
      newSocket.disconnect();
    };
  }, [documentId]);

  useEffect(() => {
    const fetchDocument = async () => {
      if (!documentId) return;
      try {
        const response = await fetch(`/api/get-document/${documentId}`);
        if (!response.ok) {
          throw new Error("Document not found");
        }
        const data = await response.json();
        setText(data.document.content || "");
      } catch (error) {
        console.error("Failed to load document:", error);
      }
    };

    fetchDocument();
  }, [documentId]);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setText(newText);
    if (socket) {
      socket.emit("text-change", { newText, documentId });
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch("/api/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: text, id: documentId }),
      });
      if (!response.ok) throw new Error("Failed to save document.");
      alert("Document saved successfully!");
    } catch (error) {
      console.error("Save error:", error);
      alert("Error: Could not save document.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center p-12 bg-gray-900 text-white">
      <div className="w-full max-w-5xl flex justify-between items-center mb-8">
        <h1 className="text-5xl font-bold text-cyan-400">
          Jot<span className="text-indigo-600">.It</span>
        </h1>
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
          onChange={handleTextChange}
          className="w-full h-full bg-transparent text-white p-10 text-lg resize-none outline-none"
          placeholder="Start typing your notes here..."
        />
      </div>
      <p className="mt-4 text-gray-400">Character Count: {text.length}</p>
    </main>
  );
}
