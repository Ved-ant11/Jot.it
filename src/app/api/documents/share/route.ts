import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const currentUserId = session.user.id;

  try {
    const { documentId, email } = await request.json();

    // 1. Find the document to verify the current user is the author
    const document = await prisma.document.findUnique({
      where: { id: documentId },
    });

    if (document?.authorId !== currentUserId) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    // 2. Find the user to invite by their email
    const userToInvite = await prisma.user.findUnique({
      where: { email: email },
    });

    if (!userToInvite) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Prevent sharing with oneself
    if (userToInvite.id === currentUserId) {
      return NextResponse.json(
        { message: "You cannot share a document with yourself" },
        { status: 400 }
      );
    }

    // 3. Create the permission record
    const newPermission = await prisma.documentPermission.create({
      data: {
        documentId: documentId,
        userId: userToInvite.id,
      },
    });

    return NextResponse.json({ success: true, permission: newPermission });
  } catch (error) {
    console.error("Error sharing document:", error);
    return NextResponse.json(
      { message: "An error occurred while sharing the document" },
      { status: 500 }
    );
  }
}
