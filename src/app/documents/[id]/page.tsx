"use client";

import { useState, useEffect, useRef, useLayoutEffect } from "react";
import { useSession } from "next-auth/react";
import { io, Socket } from "socket.io-client";
import toast from "react-hot-toast";
import getCaretCoordinates from "textarea-caret";
import Skeleton from "@/components/Skeleton";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import ShareDialog from "@/components/ShareDialog";

type ActiveUser = {
  id: string;
  name: string | null;
  image: string | null;
};

type CursorData = {
  position: number;
  user: ActiveUser;
};

const colorFromId = (id: string) => {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  const c = (hash & 0x00ffffff).toString(16).toUpperCase();
  return "#" + "00000".substring(0, 6 - c.length) + c;
};

export default function EditorPage({ params }: { params: { id: string } }) {
  const documentId = params.id;
  const { data: session } = useSession();
  const throttleTimeout = useRef<NodeJS.Timeout | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [text, setText] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeUsers, setActiveUsers] = useState<ActiveUser[]>([]);
  const [cursors, setCursors] = useState<{ [id: string]: CursorData }>({});
  const [cursorCoords, setCursorCoords] = useState<{
    [id: string]: { top: number; left: number };
  }>({});

  useEffect(() => {
    if (!session?.user) return;

    const newSocket = io(process.env.NEXT_PUBLIC_SOCKET_URL!);
    setSocket(newSocket);

    newSocket.emit("join-document", { documentId, user: session.user });
    newSocket.on("update-user-list", (users: ActiveUser[]) => {
      setActiveUsers(users);
    });
    newSocket.on("receive-change", (newText: string) => setText(newText));
    newSocket.on("receive-cursor-change", (data: CursorData) => {
      if (data.user.id !== session.user.id) {
        setCursors((prev) => ({ ...prev, [data.user.id]: data }));
      }
    });

    return () => {
      newSocket.disconnect();
    };
  }, [documentId, session]);

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

  useLayoutEffect(() => {
    const newCoords: { [id: string]: { top: number; left: number } } = {};
    const textarea = textareaRef.current;
    if (!textarea) return;

    Object.values(cursors).forEach(({ position, user }) => {
      if (user?.id) {
        newCoords[user.id] = getCaretCoordinates(textarea, position);
      }
    });
    setCursorCoords(newCoords);
  }, [cursors, text]);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setText(newText);
    socket?.emit("text-change", { newText, documentId });
  };

  const handleCursorChange = (e: React.SyntheticEvent<HTMLTextAreaElement>) => {
    const position = e.currentTarget.selectionStart;
    if (throttleTimeout.current) {
      clearTimeout(throttleTimeout.current);
    }
    throttleTimeout.current = setTimeout(() => {
      if (socket && session?.user) {
        socket.emit("cursor-change", {
          documentId,
          position,
          user: session.user,
        });
      }
    }, 50);
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
        <div className="flex items-center gap-4">
          <div className="flex -space-x-4">
            <TooltipProvider>
              {activeUsers.map((user) => (
                <Tooltip key={user.id}>
                  <TooltipTrigger>
                    <Avatar>
                      <AvatarImage
                        src={user.image || ""}
                        alt={user.name || "User"}
                      />
                      <AvatarFallback>
                        {user.name?.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{user.name}</p>
                  </TooltipContent>
                </Tooltip>
              ))}
            </TooltipProvider>
          </div>
          <ShareDialog documentId={documentId} />
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
      </div>

      <div className="w-full max-w-5xl h-[70vh] bg-[#1a1a1a] rounded-2xl shadow-xl relative">
        {isLoading ? (
          <Skeleton />
        ) : (
          <>
            <Textarea
              ref={textareaRef}
              value={text}
              onChange={handleTextChange}
              onSelect={handleCursorChange}
              onScroll={handleCursorChange}
              placeholder="Start typing your notes here..."
              className="w-full h-full bg-transparent text-gray-200 p-8 text-lg resize-none 
                         outline-none focus-visible:ring-1 focus-visible:ring-indigo-500
                         focus-visible:border-transparent transition-colors duration-300 relative z-10 caret-white"
            />
            <div className="absolute top-0 left-0 p-8 w-full h-full pointer-events-none z-20">
              {Object.entries(cursorCoords).map(([id, coords]) => {
                const user = cursors[id]?.user;
                if (!user || user.id === session?.user?.id || !coords)
                  return null;
                const userColor = colorFromId(user.id);
                return (
                  <div
                    key={user.id}
                    className="absolute transition-transform duration-100 ease-linear"
                    style={{
                      transform: `translate(${coords.left}px, ${coords.top}px)`,
                    }}
                  >
                    <div
                      className="w-0.5 h-6"
                      style={{ backgroundColor: userColor }}
                    />
                    <div
                      className="absolute text-white text-xs px-2 py-0.5 rounded"
                      style={{
                        backgroundColor: userColor,
                        whiteSpace: "nowrap",
                        top: "-1.5rem",
                      }}
                    >
                      {user.name}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      <p className="mt-5 text-gray-500 text-sm">
        Character Count: <span className="text-gray-300">{text.length}</span>
      </p>
    </main>
  );
}
