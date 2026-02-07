import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

type Params = { params: { id: string } };

// GET /api/tasks/[id]
export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const task = await prisma.task.findUnique({
      where: { id: params.id },
      include: { project: { select: { name: true, color: true } } },
    });
    if (!task) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(task);
  } catch {
    return NextResponse.json({ error: "Failed to fetch task" }, { status: 500 });
  }
}

// PUT /api/tasks/[id] - Update task (including status change via drag)
export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const body = await request.json();
    const data: Record<string, unknown> = {};

    if (body.title !== undefined) data.title = body.title.trim();
    if (body.description !== undefined) data.description = body.description?.trim() || null;
    if (body.status !== undefined) data.status = body.status;
    if (body.priority !== undefined) data.priority = body.priority;
    if (body.order !== undefined) data.order = body.order;
    if (body.dueDate !== undefined) data.dueDate = body.dueDate ? new Date(body.dueDate) : null;

    const task = await prisma.task.update({
      where: { id: params.id },
      data,
      include: { project: { select: { name: true, color: true } } },
    });

    return NextResponse.json(task);
  } catch {
    return NextResponse.json({ error: "Failed to update task" }, { status: 500 });
  }
}

// DELETE /api/tasks/[id]
export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    await prisma.task.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete task" }, { status: 500 });
  }
}
