"use client";

import { useState, useEffect } from "react";
import { io, Socket } from "socket.io-client";
import toast from "react-hot-toast";
import Skeleton from "@/components/Skeleton";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export default function EditorPage({ params }: { params: { id: string } }) {
  const documentId = params.id;
  const [text, setText] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const newSocket = io(process.env.NEXT_PUBLIC_SOCKET_URL!);
    setSocket(newSocket);

    newSocket.emit("join-document", documentId);
    newSocket.on("receive-change", (newText: string) => setText(newText));

    return () => {
      newSocket.disconnect();
    };
  }, [documentId]);

  useEffect(() => {
    const fetchDocument = async () => {
      if (!documentId) return;
      setIsLoading(true);
      try {
        const response = await fetch(`/api/get-document/${documentId}`);
        if (!response.ok) throw new Error("Document not found");
        const data = await response.json();
        setText(data.document.content || "");
      } catch (error) {
        console.error("Failed to load document:", error);
        toast.error("Could not load the document.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDocument();
  }, [documentId]);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setText(newText);
    socket?.emit("text-change", { newText, documentId });
  };

  const handleSave = async () => {
    setIsSaving(true);
    const savePromise = fetch("/api/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, id: documentId }),
    }).then((res) => {
      if (!res.ok) throw new Error("Save failed");
      return res.json();
    });

    toast.promise(savePromise, {
      loading: "Saving document...",
      success: "Document saved successfully!",
      error: "Error: Could not save.",
    });

    try {
      await savePromise;
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center px-6 py-12 bg-[#0d0d0d] text-gray-200">
      <div className="w-full max-w-5xl flex justify-between items-center mb-10">
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
          Jot<span className="text-indigo-400">.It</span>
        </h1>
        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="px-6 py-2 text-lg font-medium bg-indigo-600 
                     hover:bg-indigo-500 active:bg-indigo-700
                     rounded-xl shadow-md transition-colors duration-200"
        >
          {isSaving ? "Saving..." : "Save"}
        </Button>
      </div>

      <div className="w-full max-w-5xl h-[70vh] bg-[#1a1a1a] rounded-2xl shadow-xl">
        {isLoading ? (
          <Skeleton />
        ) : (
          <Textarea
            value={text}
            onChange={handleTextChange}
            placeholder="Start typing your notes here..."
            className="w-full h-full bg-transparent text-gray-200 p-8 text-lg resize-none 
                       outline-none focus-visible:ring-1 focus-visible:ring-indigo-500
                       focus-visible:border-transparent transition-colors duration-300"
          />
        )}
      </div>

      <p className="mt-5 text-gray-500 text-sm">
        Character Count: <span className="text-gray-300">{text.length}</span>
      </p>
    </main>
  );
}
