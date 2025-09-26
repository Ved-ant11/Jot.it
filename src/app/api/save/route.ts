import { NextResponse } from "next/server";
import prisma from "../../../lib/prisma";
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { text } = body;

    const newDocument = await prisma.document.create({
      data: {
        content: text,
      },
    });

    console.log("New document created: ", newDocument);

    return NextResponse.json({
      success: true,
      message: "Data received successfully!",
      documentId: newDocument.id,
    });
  } catch (error) {
    console.error("Error in /api/save:", error);
    return NextResponse.json(
      { success: false, message: "An error occurred." },
      { status: 500 }
    );
  }
}
