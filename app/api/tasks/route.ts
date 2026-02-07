import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// GET /api/tasks?projectId=xxx&status=TODO&priority=HIGH
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("projectId");
    const status = searchParams.get("status");
    const priority = searchParams.get("priority");
    const search = searchParams.get("search");

    const where: Record<string, unknown> = {};
    if (projectId) where.projectId = projectId;
    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (search) where.title = { contains: search }; // SQLite contains is case-insensitive for ASCII

    const tasks = await prisma.task.findMany({
      where,
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
      include: { project: { select: { name: true, color: true } } },
    });

    return NextResponse.json(tasks);
  } catch {
    return NextResponse.json({ error: "Failed to fetch tasks" }, { status: 500 });
  }
}

// POST /api/tasks
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, status, priority, dueDate, projectId } = body;

    if (!title?.trim() || !projectId) {
      return NextResponse.json({ error: "Title and projectId required" }, { status: 400 });
    }

    const validStatuses = ["TODO", "IN_PROGRESS", "DONE"];
    const validPriorities = ["HIGH", "MEDIUM", "LOW"];
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json({ error: "Invalid status value" }, { status: 400 });
    }
    if (priority && !validPriorities.includes(priority)) {
      return NextResponse.json({ error: "Invalid priority value" }, { status: 400 });
    }

    // Get max order for the target status column
    const maxOrder = await prisma.task.aggregate({
      where: { projectId, status: status || "TODO" },
      _max: { order: true },
    });

    const task = await prisma.task.create({
      data: {
        title: title.trim(),
        description: description?.trim() || null,
        status: status || "TODO",
        priority: priority || "MEDIUM",
        dueDate: dueDate ? new Date(dueDate) : null,
        order: (maxOrder._max.order ?? -1) + 1,
        projectId,
      },
      include: { project: { select: { name: true, color: true } } },
    });

    return NextResponse.json(task, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create task" }, { status: 500 });
  }
}
