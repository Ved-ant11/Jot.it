"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";

export default function Header() {
  const { data: session, status } = useSession();

  return (
    <header className="bg-black text-white shadow-md sticky top-0 z-50 border-b border-gray-800">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/">
          <h1 className="text-2xl font-bold text-amber-400">
            Jot<span className="text-indigo-500">.It</span>
          </h1>
        </Link>

        {status === "loading" ? (
          <div className="h-10 w-10 rounded-full bg-slate-700 animate-pulse" />
        ) : session ? (
          <DropdownMenu>
            <DropdownMenuTrigger>
              <Avatar>
                <AvatarImage
                  src={session.user?.image || ""}
                  alt="User avatar"
                  className="bg-indigo-800"
                />
                <AvatarFallback>
                  {session.user?.name?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>{session.user?.name}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={() => signOut({ callbackUrl: "/" })}>
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button
            onClick={() => signIn("google")}
            className="hover:bg-slate-700 transition duration-300"
          >
            Sign in with Google
          </Button>
        )}
      </div>
    </header>
  );
}
