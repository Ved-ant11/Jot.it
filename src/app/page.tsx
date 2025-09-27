"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function HomePage() {
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateNew = async () => {
    setIsCreating(true);
    const createPromise = fetch("/api/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: "" }),
    }).then((res) => {
      if (!res.ok) throw new Error("Failed to create document.");
      return res.json();
    });

    toast.promise(createPromise, {
      loading: "Creating new document...",
      success: "New document created!",
      error: "Error: Could not create document.",
    });

    try {
      const data = await createPromise;
      router.push(`/documents/${data.documentId}`);
    } catch (err) {
      console.error(err);
      setIsCreating(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#0d0d0d] text-gray-200">
      {/* Gradient border wrapper */}
      <div className="relative p-[2px] rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-amber-400 animate-gradient-x">
        <Card className="w-[400px] bg-[#1a1a1a] text-gray-200 rounded-2xl shadow-xl">
          <CardHeader className="text-center">
            <CardTitle className="text-4xl font-extrabold tracking-tight">
              <span className="text-amber-400">Jot</span>
              <span className="text-indigo-400">.It</span>
            </CardTitle>
            <CardDescription className="text-gray-400 text-sm mt-1">
              Real-time collaborative notepad.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <Button
              onClick={handleCreateNew}
              disabled={isCreating}
              size="lg"
              className="w-full bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700
                         transition-colors duration-200 rounded-xl font-medium"
            >
              {isCreating ? "Creating..." : "Create New Document"}
            </Button>
          </CardContent>

          <CardFooter>
            <p className="text-xs text-gray-500 mx-auto">Next.js • Socket.IO</p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
