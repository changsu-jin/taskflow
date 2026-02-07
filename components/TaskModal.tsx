"use client";

import { useState, useEffect } from "react";
import { Task, Status, Priority, COLUMNS, STATUS_CONFIG, PRIORITY_CONFIG } from "@/lib/types";

interface TaskModalProps {
  mode: "add" | "edit";
  task?: Task | null;
  defaultStatus?: Status;
  onSave: (data: Partial<Task>) => void;
  onDelete?: (id: string) => void;
  onClose: () => void;
}

export default function TaskModal({ mode, task, defaultStatus, onSave, onDelete, onClose }: TaskModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<Status>(defaultStatus || "TODO");
  const [priority, setPriority] = useState<Priority>("MEDIUM");
  const [dueDate, setDueDate] = useState("");

  useEffect(() => {
    if (mode === "edit" && task) {
      setTitle(task.title);
      setDescription(task.description || "");
      setStatus(task.status);
      setPriority(task.priority);
      setDueDate(task.dueDate ? task.dueDate.split("T")[0] : "");
    }
  }, [mode, task]);

  const handleSubmit = () => {
    if (!title.trim()) return;
    onSave({
      ...(mode === "edit" && task ? { id: task.id } : {}),
      title: title.trim(),
      description: description.trim() || null,
      status,
      priority,
      dueDate: dueDate || null,
    });
  };

  return (
    <div
      className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl p-7 w-[420px] shadow-2xl max-h-[85vh] overflow-auto animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-5">
          <h2 className="font-sora text-lg font-bold text-text-primary">
            {mode === "add" ? "새 할일 추가" : "할일 수정"}
          </h2>
          {mode === "edit" && onDelete && task && (
            <button
              onClick={() => onDelete(task.id)}
              className="px-3 py-1.5 rounded-md text-xs font-medium bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
            >
              삭제
            </button>
          )}
        </div>

        {/* Title */}
        <div className="mb-3.5">
          <label className="text-xs font-semibold text-text-secondary block mb-1.5">제목 *</label>
          <input
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="할일 제목을 입력하세요"
            className="w-full h-10 rounded-lg border border-border px-3 text-sm"
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          />
        </div>

        {/* Description */}
        <div className="mb-3.5">
          <label className="text-xs font-semibold text-text-secondary block mb-1.5">설명</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="상세 설명 (선택)"
            rows={3}
            className="w-full rounded-lg border border-border p-3 text-sm resize-y"
          />
        </div>

        {/* Priority & Due Date */}
        <div className="flex gap-3 mb-3.5">
          <div className="flex-1">
            <label className="text-xs font-semibold text-text-secondary block mb-1.5">우선순위</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as Priority)}
              className="w-full h-10 rounded-lg border border-border px-3 text-sm bg-white"
            >
              <option value="HIGH">🔴 높음</option>
              <option value="MEDIUM">🟡 보통</option>
              <option value="LOW">⚪ 낮음</option>
            </select>
          </div>
          <div className="flex-1">
            <label className="text-xs font-semibold text-text-secondary block mb-1.5">마감일</label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full h-10 rounded-lg border border-border px-3 text-sm"
            />
          </div>
        </div>

        {/* Status */}
        <div className="mb-5">
          <label className="text-xs font-semibold text-text-secondary block mb-1.5">상태</label>
          <div className="flex gap-2">
            {COLUMNS.map((s) => (
              <button
                key={s}
                onClick={() => setStatus(s)}
                className="flex-1 h-9 rounded-lg text-xs font-medium transition-colors"
                style={{
                  background: status === s ? STATUS_CONFIG[s].color : "#F3F4F6",
                  color: status === s ? "#fff" : "#6B7685",
                }}
              >
                {STATUS_CONFIG[s].icon} {STATUS_CONFIG[s].label}
              </button>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2.5">
          <button
            onClick={onClose}
            className="flex-1 h-11 rounded-xl text-sm font-semibold bg-gray-100 text-text-secondary hover:bg-gray-200 transition-colors"
          >
            취소
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 h-11 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-todo to-purple-500 hover:opacity-90 transition-opacity"
          >
            {mode === "add" ? "추가하기" : "저장하기"}
          </button>
        </div>
      </div>
    </div>
  );
}
