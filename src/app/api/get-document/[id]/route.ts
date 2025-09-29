import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    );
  }

  const currentUserId = session.user.id;

  try {
    const documentId = params.id;
    const document = await prisma.document.findFirst({
      where: {
        id: documentId,
        OR: [
          {
            authorId: currentUserId,
          },
          {
            permissions: {
              some: {
                userId: currentUserId,
              },
            },
          },
        ],
      },
    });

    if (!document) {
      return NextResponse.json(
        {
          success: false,
          message: "Document not found or you do not have permission.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, document });
  } catch (error) {
    console.error("Error fetching document:", error);
    return NextResponse.json(
      { success: false, message: "An error occurred." },
      { status: 500 }
    );
  }
}
