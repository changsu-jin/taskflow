import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

type Params = { params: { id: string } };

// GET /api/projects/[id]
export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const project = await prisma.project.findUnique({
      where: { id: params.id },
      include: { tasks: { orderBy: { order: "asc" } } },
    });
    if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(project);
  } catch {
    return NextResponse.json({ error: "Failed to fetch project" }, { status: 500 });
  }
}

// PUT /api/projects/[id]
export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const body = await request.json();
    const project = await prisma.project.update({
      where: { id: params.id },
      data: {
        name: body.name?.trim(),
        description: body.description?.trim() || null,
        color: body.color,
      },
    });
    return NextResponse.json(project);
  } catch {
    return NextResponse.json({ error: "Failed to update project" }, { status: 500 });
  }
}

// DELETE /api/projects/[id]
export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    await prisma.project.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete project" }, { status: 500 });
  }
}
