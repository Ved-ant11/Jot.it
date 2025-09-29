"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import toast from "react-hot-toast";

export default function ShareDialog({ documentId }: { documentId: string }) {
  const [email, setEmail] = useState("");
  const [isSharing, setIsSharing] = useState(false);
  const [open, setOpen] = useState(false);

  const handleShare = async () => {
    setIsSharing(true);
    const sharePromise = fetch("/api/documents/share", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ documentId, email }),
    }).then(async (res) => {
      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.message || "Failed to share document.");
      }
      return res.json();
    });

    toast.promise(sharePromise, {
      loading: "Sending invitation...",
      success: `Invitation sent to ${email}!`,
      error: (err) => err.message,
    });

    try {
      await sharePromise;
      setOpen(false);
    } catch (error) {
      // Error is handled by the toast
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="text-black">Share</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Share Document</DialogTitle>
          <DialogDescription>
            Enter the email address of the user you want to invite as a
            collaborator.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="email" className="text-right">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="col-span-3"
            />
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="ghost">Cancel</Button>
          </DialogClose>
          <Button
            onClick={handleShare}
            disabled={isSharing}
            className="bg-indigo-600 hover:bg-indigo-500 transition-colors duration-200 text-white"
          >
            {isSharing ? "Sharing..." : "Share Access"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
