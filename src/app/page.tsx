"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import { FileText } from "lucide-react";

type Document = {
  id: string;
  content: string | null;
  updatedAt: string;
};

export default function HomePage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isCreating, setIsCreating] = useState(false);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === "authenticated") {
      const fetchDocuments = async () => {
        try {
          const response = await fetch("/api/get-my-documents");
          if (!response.ok) {
            throw new Error("Failed to fetch documents");
          }
          const data = await response.json();
          setDocuments(data.documents);
        } catch (error) {
          toast.error("Could not fetch your documents.");
        } finally {
          setIsLoading(false);
        }
      };
      fetchDocuments();
    } else if (status === "unauthenticated") {
      setIsLoading(false);
    }
  }, [status]);

  const handleCreateNew = async () => {
    setIsCreating(true);
    const createPromise = fetch("/api/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: "" }),
    }).then((res) => {
      if (!res.ok) throw new Error("Failed to create.");
      return res.json();
    });

    toast.promise(createPromise, {
      loading: "Creating new document...",
      success: "New document created!",
      error: "Could not create document.",
    });

    try {
      const data = await createPromise;
      router.push(`/documents/${data.documentId}`);
    } catch (error) {
      setIsCreating(false);
    }
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black text-white">
        <p>Loading...</p>
      </div>
    );
  }

  if (status === "authenticated") {
    return (
      <main className="container mx-auto p-8 min-h-screen bg-black">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-white">Your Documents</h1>
          <Button onClick={handleCreateNew} disabled={isCreating}>
            {isCreating ? "Creating..." : "Create New Document"}
          </Button>
        </div>
        {documents.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {documents.map((doc) => (
              <Link href={`/documents/${doc.id}`} key={doc.id}>
                <Card className="hover:border-cyan-400 transition-colors bg-slate-800 border-slate-700 text-white">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText size={20} />
                      Document
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-slate-400 truncate h-10">
                      {doc.content || "Empty document..."}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-white">You don&apos;t have any documents yet.</p>
            <p className="text-white mt-4">
              Click{" "}
              <span className="font-bold text-amber-400">
                Create New Document
              </span>{" "}
              to get started!
            </p>
          </div>
        )}
      </main>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-black">
      <Card className="w-[400px] bg-slate-900 border-slate-800 text-white">
        <CardHeader className="text-center">
          <CardTitle className="text-4xl font-bold mb-2 text-amber-400">
            Jot<span className="text-indigo-500">.It</span>
          </CardTitle>
          <CardDescription className="text-slate-400">
            Your real-time collaborative notepad. Please sign in to continue.
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
