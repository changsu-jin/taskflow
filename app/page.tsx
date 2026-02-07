"use client";

import { useState, useEffect, useCallback } from "react";
import { DragDropContext, DropResult } from "@hello-pangea/dnd";
import { Project, Task, Status, Priority, COLUMNS } from "@/lib/types";
import * as api from "@/lib/api";
import Sidebar from "@/components/Sidebar";
import KanbanColumn from "@/components/KanbanColumn";
import TaskModal from "@/components/TaskModal";

export default function Home() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterPriority, setFilterPriority] = useState<Priority | "ALL">("ALL");
  const [loading, setLoading] = useState(true);

  // Modal state
  const [modalMode, setModalMode] = useState<"add" | "edit" | null>(null);
  const [modalTask, setModalTask] = useState<Task | null>(null);
  const [addToStatus, setAddToStatus] = useState<Status>("TODO");

  // ── Data Loading ──
  const loadProjects = useCallback(async () => {
    try {
      const data = await api.fetchProjects();
      setProjects(data);
      // Use functional update to avoid stale closure on selectedProjectId
      setSelectedProjectId((prev) => {
        if (!prev && data.length > 0) return data[0].id;
        return prev;
      });
    } catch (err) {
      console.error("Failed to load projects:", err);
    }
  }, []);

  const loadTasks = useCallback(async () => {
    if (!selectedProjectId) return;
    try {
      const data = await api.fetchTasks(selectedProjectId);
      setTasks(data);
    } catch (err) {
      console.error("Failed to load tasks:", err);
    }
  }, [selectedProjectId]);

  useEffect(() => {
    loadProjects().then(() => setLoading(false));
  }, [loadProjects]);

  useEffect(() => {
    if (selectedProjectId) loadTasks();
  }, [selectedProjectId, loadTasks]);

  // ── Filtered Tasks ──
  const filteredTasks = tasks.filter((t) => {
    if (searchQuery && !t.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (filterPriority !== "ALL" && t.priority !== filterPriority) return false;
    return true;
  });

  const getColumnTasks = (status: Status) =>
    filteredTasks.filter((t) => t.status === status).sort((a, b) => a.order - b.order);

  // ── Stats ──
  const stats = {
    total: tasks.length,
    done: tasks.filter((t) => t.status === "DONE").length,
    overdue: tasks.filter(
      (t) => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== "DONE"
    ).length,
  };

  // ── Project Actions ──
  const handleCreateProject = async (data: { name: string; description?: string; color: string }) => {
    try {
      const project = await api.createProject(data);
      await loadProjects();
      setSelectedProjectId(project.id);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSelectProject = (id: string) => {
    setSelectedProjectId(id);
    setSearchQuery("");
    setFilterPriority("ALL");
  };

  // ── Task Actions ──
  const handleAddTask = async (data: Partial<Task>) => {
    try {
      await api.createTask({
        title: data.title!,
        description: data.description || undefined,
        status: data.status || addToStatus,
        priority: data.priority || "MEDIUM",
        dueDate: data.dueDate || undefined,
        projectId: selectedProjectId,
      });
      await loadTasks();
      await loadProjects();
      setModalMode(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateTask = async (data: Partial<Task>) => {
    if (!data.id) return;
    try {
      await api.updateTask(data.id, data);
      await loadTasks();
      await loadProjects();
      setModalMode(null);
      setModalTask(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteTask = async (id: string) => {
    try {
      await api.deleteTask(id);
      await loadTasks();
      await loadProjects();
      setModalMode(null);
      setModalTask(null);
    } catch (err) {
      console.error(err);
    }
  };

  // ── Drag & Drop ──
  const handleDragEnd = async (result: DropResult) => {
    const { draggableId, destination } = result;
    if (!destination) return;

    const newStatus = destination.droppableId as Status;
    const task = tasks.find((t) => t.id === draggableId);
    if (!task || task.status === newStatus) return;

    // Optimistic update
    setTasks((prev) =>
      prev.map((t) => (t.id === draggableId ? { ...t, status: newStatus } : t))
    );

    try {
      await api.updateTask(draggableId, { status: newStatus, order: destination.index });
      await loadProjects();
    } catch (err) {
      console.error(err);
      await loadTasks(); // Revert on error
    }
  };

  // ── Current Project ──
  const currentProject = projects.find((p) => p.id === selectedProjectId);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-bg">
        <div className="text-center">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-todo to-purple-500 flex items-center justify-center text-white font-sora font-bold text-xl mb-3 mx-auto animate-pulse">
            T
          </div>
          <p className="text-sm text-text-secondary">Loading TaskFlow...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-bg">
      {/* ── Header ── */}
      <header className="h-14 bg-surface border-b border-border flex items-center px-5 justify-between shrink-0 z-20">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 rounded-md hover:bg-gray-100 transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M3 5h14M3 10h14M3 15h14" stroke="#6B7685" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-todo to-purple-500 flex items-center justify-center text-white font-sora font-bold text-sm">
              T
            </div>
            <span className="font-sora font-bold text-lg text-text-primary">TaskFlow</span>
          </div>
        </div>

        {/* Search */}
        <div className="relative w-[280px]">
          <svg className="absolute left-2.5 top-[9px]" width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle cx="7" cy="7" r="5" stroke="#9CA3AF" strokeWidth="1.5" />
            <path d="M11 11l3.5 3.5" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <input
            type="text"
            placeholder="할일 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-[34px] rounded-lg border border-border pl-8 pr-3 text-[13px] bg-gray-50"
          />
        </div>

        {/* Priority Filter */}
        <div className="flex gap-1.5 items-center">
          {(["ALL", "HIGH", "MEDIUM", "LOW"] as const).map((p) => (
            <button
              key={p}
              onClick={() => setFilterPriority(p)}
              className="px-2.5 py-1 rounded-md text-xs font-medium transition-colors"
              style={{
                background: filterPriority === p
                  ? p === "ALL"
                    ? "#6366F1"
                    : { HIGH: "#EF4444", MEDIUM: "#F59E0B", LOW: "#6B7685" }[p]
                  : "#F3F4F6",
                color: filterPriority === p ? "#fff" : "#6B7685",
              }}
            >
              {p === "ALL" ? "전체" : { HIGH: "높음", MEDIUM: "보통", LOW: "낮음" }[p]}
            </button>
          ))}
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* ── Sidebar ── */}
        <Sidebar
          projects={projects}
          selectedId={selectedProjectId}
          onSelect={handleSelectProject}
          onCreateProject={handleCreateProject}
          isOpen={sidebarOpen}
          stats={stats}
        />

        {/* ── Main Content ── */}
        <main className="flex-1 overflow-hidden flex flex-col">
          {/* Project Header */}
          {currentProject && (
            <div className="px-6 pt-4 pb-3 shrink-0">
              <div className="flex items-center gap-2.5 mb-1">
                <div className="w-3.5 h-3.5 rounded" style={{ background: currentProject.color }} />
                <h1 className="font-sora text-xl font-bold text-text-primary">
                  {currentProject.name}
                </h1>
              </div>
              {currentProject.description && (
                <p className="text-[13px] text-text-secondary pl-6">{currentProject.description}</p>
              )}
            </div>
          )}

          {/* Kanban Board */}
          <DragDropContext onDragEnd={handleDragEnd}>
            <div className="flex-1 flex gap-4 px-6 pb-6 overflow-x-auto overflow-y-hidden">
              {COLUMNS.map((status) => (
                <KanbanColumn
                  key={status}
                  status={status}
                  tasks={getColumnTasks(status)}
                  onAddClick={(s) => {
                    setAddToStatus(s);
                    setModalMode("add");
                  }}
                  onTaskClick={(task) => {
                    setModalTask(task);
                    setModalMode("edit");
                  }}
                />
              ))}
            </div>
          </DragDropContext>
        </main>
      </div>

      {/* ── Modals ── */}
      {modalMode === "add" && (
        <TaskModal
          mode="add"
          defaultStatus={addToStatus}
          onSave={handleAddTask}
          onClose={() => setModalMode(null)}
        />
      )}
      {modalMode === "edit" && modalTask && (
        <TaskModal
          mode="edit"
          task={modalTask}
          onSave={handleUpdateTask}
          onDelete={handleDeleteTask}
          onClose={() => {
            setModalMode(null);
            setModalTask(null);
          }}
        />
      )}
    </div>
  );
}
