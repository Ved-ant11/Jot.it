import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function POST(request: Request) {
  // --- DIAGNOSTIC LOG ---
  // This will help us see what the server thinks the session is.
  const session = await getServerSession(authOptions);
  console.log("[API /api/save] SESSION CHECK:", session);
  // ----------------------

  if (!session?.user?.id) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    );
  }

  const currentUserId = session.user.id;

  try {
    const body = await request.json();
    const { text, id } = body;

    let document;

    if (id) {
      const documentToUpdate = await prisma.document.findUnique({
        where: { id: id },
      });

      if (documentToUpdate?.authorId !== currentUserId) {
        return NextResponse.json(
          { success: false, message: "Forbidden" },
          { status: 403 }
        );
      }

      document = await prisma.document.update({
        where: { id: id },
        data: { content: text },
      });
    } else {
      document = await prisma.document.create({
        data: {
          content: text,
          authorId: currentUserId,
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: "Document saved successfully!",
      documentId: document.id,
    });
  } catch (error) {
    console.error("Error in /api/save:", error);
    return NextResponse.json(
      { success: false, message: "An error occurred." },
      { status: 500 }
    );
  }
}
