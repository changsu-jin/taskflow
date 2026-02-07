"use client";

import { Project, PROJECT_COLORS } from "@/lib/types";
import { useState } from "react";

interface SidebarProps {
  projects: Project[];
  selectedId: string;
  onSelect: (id: string) => void;
  onCreateProject: (data: { name: string; description?: string; color: string }) => void;
  isOpen: boolean;
  stats: { total: number; done: number; overdue: number };
}

export default function Sidebar({ projects, selectedId, onSelect, onCreateProject, isOpen, stats }: SidebarProps) {
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState(PROJECT_COLORS[0]);

  const progressPercent = stats.total > 0 ? Math.round((stats.done / stats.total) * 100) : 0;

  const handleSubmit = () => {
    if (!name.trim()) return;
    onCreateProject({ name: name.trim(), description: description.trim() || undefined, color });
    setName("");
    setDescription("");
    setColor(PROJECT_COLORS[0]);
    setShowForm(false);
  };

  return (
    <aside
      className="bg-surface border-r border-border flex flex-col shrink-0 transition-all duration-300 overflow-hidden"
      style={{ width: isOpen ? 240 : 0 }}
    >
      <div className="p-3 pt-4 flex-1 overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-2 mb-2">
          <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wider">
            Projects
          </span>
          <button
            onClick={() => setShowForm(!showForm)}
            className="w-6 h-6 rounded-md bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-text-secondary text-lg leading-none transition-colors"
          >
            +
          </button>
        </div>

        {/* New Project Form */}
        {showForm && (
          <div className="mx-1 mb-3 p-3 rounded-lg border border-border bg-bg animate-scale-in">
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="프로젝트 이름"
              className="w-full h-8 rounded-md border border-border px-2 text-sm mb-2"
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            />
            <input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="설명 (선택)"
              className="w-full h-8 rounded-md border border-border px-2 text-sm mb-2"
            />
            <div className="flex gap-1.5 mb-2">
              {PROJECT_COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className="w-5 h-5 rounded-full transition-transform"
                  style={{
                    background: c,
                    transform: color === c ? "scale(1.2)" : "scale(1)",
                    boxShadow: color === c ? `0 0 0 2px white, 0 0 0 3px ${c}` : "none",
                  }}
                />
              ))}
            </div>
            <div className="flex gap-2">
              <button onClick={() => setShowForm(false)} className="flex-1 h-7 rounded-md bg-gray-100 text-xs text-text-secondary font-medium">
                취소
              </button>
              <button onClick={handleSubmit} className="flex-1 h-7 rounded-md bg-todo text-white text-xs font-medium">
                생성
              </button>
            </div>
          </div>
        )}

        {/* Project List */}
        {projects.map((p) => (
          <div
            key={p.id}
            onClick={() => onSelect(p.id)}
            className="flex items-center gap-2.5 py-2 px-3 rounded-lg cursor-pointer mb-0.5 transition-colors"
            style={{
              background: selectedId === p.id ? "#F4F5F7" : "transparent",
              borderLeft: selectedId === p.id ? `3px solid ${p.color}` : "3px solid transparent",
            }}
          >
            <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: p.color }} />
            <span
              className="text-sm flex-1 truncate"
              style={{ fontWeight: selectedId === p.id ? 600 : 400 }}
            >
              {p.name}
            </span>
            {(p.activeCount ?? 0) > 0 && (
              <span className="text-[11px] font-semibold text-text-secondary bg-gray-100 px-1.5 py-0.5 rounded-full shrink-0">
                {p.activeCount}
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Stats Footer */}
      <div className="p-4 border-t border-border">
        <div className="text-xs font-semibold text-text-primary mb-2.5">프로젝트 현황</div>
        <div className="flex justify-between mb-2">
          <span className="text-xs text-text-secondary">진행률</span>
          <span className="text-xs font-semibold text-text-primary">{progressPercent}%</span>
        </div>
        <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden mb-3">
          <div
            className="h-full rounded-full bg-gradient-to-r from-todo to-purple-500 transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <div className="grid grid-cols-3 gap-1.5 text-center">
          {[
            { label: "전체", value: stats.total, color: "#6366F1" },
            { label: "완료", value: stats.done, color: "#10B981" },
            { label: "지연", value: stats.overdue, color: "#EF4444" },
          ].map((s) => (
            <div key={s.label} className="py-1">
              <div className="text-lg font-bold font-sora" style={{ color: s.color }}>{s.value}</div>
              <div className="text-[11px] text-text-muted">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
