import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// GET /api/projects - List all projects with task counts
export async function GET() {
  try {
    const projects = await prisma.project.findMany({
      include: {
        _count: { select: { tasks: true } },
        tasks: {
          select: { status: true },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    const result = projects.map((p) => ({
      id: p.id,
      name: p.name,
      description: p.description,
      color: p.color,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
      taskCount: p._count.tasks,
      activeCount: p.tasks.filter((t) => t.status !== "DONE").length,
      doneCount: p.tasks.filter((t) => t.status === "DONE").length,
    }));

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch projects" }, { status: 500 });
  }
}

// POST /api/projects - Create new project
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, color } = body;

    if (!name?.trim()) {
      return NextResponse.json({ error: "Project name is required" }, { status: 400 });
    }

    const project = await prisma.project.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        color: color || "#6366F1",
      },
    });

    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create project" }, { status: 500 });
  }
}
