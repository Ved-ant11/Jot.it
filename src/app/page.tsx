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
import { FileText, PenLine, Share2, Zap, Lock } from "lucide-react";
import { motion } from "framer-motion";
import { signIn } from "next-auth/react";

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
          if (!response.ok) throw new Error("Failed to fetch documents");
          const data = await response.json();
          setDocuments(data.documents);
        } catch {
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
    } catch {
      setIsCreating(false);
    }
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-neutral-950 text-gray-200">
        <p className="animate-pulse text-lg">Loading…</p>
      </div>
    );
  }

  if (status === "authenticated") {
    return (
      <main className="relative min-h-screen bg-neutral-950 text-gray-200">
        <div className="container mx-auto px-6 pt-20 pb-28">
          <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 mb-16">
            <h1 className="text-4xl font-extrabold tracking-tight text-white">
              Your Documents
            </h1>
            <Button
              onClick={handleCreateNew}
              disabled={isCreating}
              className="bg-gray-100 text-neutral-900 hover:bg-white transition-colors font-semibold"
            >
              {isCreating ? "Creating…" : "Create New Document"}
            </Button>
          </header>

          {documents.length > 0 ? (
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {documents.map((doc) => (
                <Link href={`/documents/${doc.id}`} key={doc.id}>
                  <Card className="group bg-neutral-900 border border-neutral-800 hover:border-gray-400/50 transition-colors rounded-xl">
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-lg font-semibold group-hover:text-white">
                        <FileText size={20} className="text-white" />
                        Document
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-400 text-sm line-clamp-3 min-h-[3rem]">
                        {doc.content || "Empty document…"}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-24">
              <p className="text-xl text-gray-300 mb-4">
                You don&apos;t have any documents yet.
              </p>
              <p className="text-gray-400">
                Click{" "}
                <span className="font-semibold text-white">
                  Create New Document
                </span>{" "}
                to start.
              </p>
            </div>
          )}
        </div>
      </main>
    );
  }

  return (
    <div className="bg-neutral-950 text-gray-200 min-h-screen">
      <section className="container mx-auto px-6 pt-24 pb-16 text-center">
        <h1
          className="text-5xl sm:text-6xl font-extrabold mb-6 tracking-tight 
             text-white [text-shadow:_0_0_12px_rgb(255_255_255_/_0.6),_0_0_24px_rgb(200_200_255_/_0.4)]"
        >
          Jot
          <span className="text-gray-300 [text-shadow:_0_0_12px_rgb(180_180_255_/_0.7),_0_0_24px_rgb(180_180_255_/_0.4)]">
            .it
          </span>
        </h1>
        <p className="max-w-2xl mx-auto text-gray-400 text-lg mb-10">
          A minimal, real-time workspace for thoughts, notes, and ideas.
          Collaborative, private, and beautifully simple.
        </p>
        <div className="flex justify-center gap-4">
          <Button
            // onClick={handleCreateNew}
            onClick={() => signIn("google")}
            disabled={isCreating}
            className="bg-gray-100 text-neutral-900 hover:bg-white font-semibold px-6 hover:shadow-lg transition-shadow duration-200"
          >
            {isCreating ? "Creating…" : "Start Writing"}
          </Button>
        </div>
      </section>

      <section className="relative w-full overflow-hidden py-20 bg-neutral-950">
        <div
          className="absolute top-0 left-0 w-32 h-full pointer-events-none z-10
                  bg-gradient-to-r from-neutral-950 to-transparent"
        />
        <div
          className="absolute top-0 right-0 w-32 h-full pointer-events-none z-10
                  bg-gradient-to-l from-neutral-950 to-transparent"
        />

        <motion.div
          className="flex gap-16 min-w-max"
          animate={{ x: [0, "-50%"] }}
          transition={{
            duration: 30,
            ease: "linear",
            repeat: Infinity,
          }}
        >
          <Feature
            icon={<PenLine size={32} />}
            title="Instant Notes"
            desc="Capture thoughts with zero friction."
          />
          <Feature
            icon={<Share2 size={32} />}
            title="Live Collaboration"
            desc="Edit together in real time."
          />
          <Feature
            icon={<Zap size={32} />}
            title="Fast & Lightweight"
            desc="Snappy on any device."
          />
          <Feature
            icon={<Lock size={32} />}
            title="Secure"
            desc="Private & encrypted documents."
          />
          <Feature
            icon={<PenLine size={32} />}
            title="Instant Notes"
            desc="Capture thoughts with zero friction."
          />
          <Feature
            icon={<Share2 size={32} />}
            title="Live Collaboration"
            desc="Edit together in real time."
          />
          <Feature
            icon={<Zap size={32} />}
            title="Fast & Lightweight"
            desc="Snappy on any device."
          />
          <Feature
            icon={<Lock size={32} />}
            title="Secure"
            desc="Private & encrypted documents."
          />
        </motion.div>
      </section>

      <section className="bg-neutral-900/40 border-t border-neutral-800 py-20">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-4 text-white">
            Ready to jot it down?
          </h2>
          <p className="text-gray-400 mb-8">
            Start your first document in seconds.
          </p>
          <Button
            onClick={() => signIn("google")}
            className="hover:bg-slate-700 transition duration-300"
          >
            Sign in with Google
          </Button>
        </div>
      </section>
    </div>
  );
}

function Feature({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <div className="flex flex-col items-center gap-4 px-4">
      <div className="text-gray-300">{icon}</div>
      <h3 className="text-xl font-semibold text-white">{title}</h3>
      <p className="text-gray-400 text-sm max-w-xs">{desc}</p>
    </div>
  );
}
