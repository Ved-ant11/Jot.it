import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { text, id } = body;

    let document;

    if (id) {
      document = await prisma.document.update({
        where: { id: id },
        data: { content: text },
      });
      console.log("✅ Document updated in database:", document);
    } else {
      document = await prisma.document.create({
        data: { content: text },
      });
      console.log("✅ New document saved to database:", document);
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
