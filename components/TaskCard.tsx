"use client";

import { Task, PRIORITY_CONFIG } from "@/lib/types";
import { Draggable } from "@hello-pangea/dnd";

interface TaskCardProps {
  task: Task;
  index: number;
  onClick: (task: Task) => void;
}

function getDueDateDisplay(dateStr: string | null) {
  if (!dateStr) return null;
  // Parse date safely - handle both ISO string and YYYY-MM-DD
  const dateOnly = dateStr.split("T")[0]; // Extract YYYY-MM-DD part
  const [year, month, day] = dateOnly.split("-").map(Number);
  const date = new Date(year, month - 1, day); // Local timezone
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = Math.ceil((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  const formatted = `${month}/${day}`;
  if (diff < 0) return { text: `${formatted} (지남)`, color: "#EF4444" };
  if (diff === 0) return { text: `${formatted} (오늘)`, color: "#F59E0B" };
  if (diff <= 2) return { text: `${formatted} (D-${diff})`, color: "#F59E0B" };
  return { text: formatted, color: "#6B7685" };
}

export default function TaskCard({ task, index, onClick }: TaskCardProps) {
  const pConfig = PRIORITY_CONFIG[task.priority];
  const due = getDueDateDisplay(task.dueDate);

  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={() => onClick(task)}
          className="bg-white rounded-[10px] border border-border p-3 cursor-grab relative overflow-hidden animate-slide-up group"
          style={{
            ...provided.draggableProps.style,
            boxShadow: snapshot.isDragging
              ? "0 8px 24px rgba(0,0,0,0.12)"
              : "0 1px 3px rgba(0,0,0,0.04)",
            transform: snapshot.isDragging
              ? `${provided.draggableProps.style?.transform} rotate(2deg)`
              : provided.draggableProps.style?.transform,
            animationDelay: `${index * 0.05}s`,
            animationFillMode: "backwards",
          }}
        >
          {/* Priority color bar */}
          <div
            className="absolute left-0 top-0 bottom-0 w-1"
            style={{ background: pConfig.color }}
          />

          <div className="pl-1.5">
            <h3
              className="text-sm font-semibold text-text-primary leading-snug"
              style={{
                textDecoration: task.status === "DONE" ? "line-through" : "none",
                opacity: task.status === "DONE" ? 0.5 : 1,
              }}
            >
              {task.title}
            </h3>

            {task.description && (
              <p className="text-xs text-text-secondary mt-1 leading-relaxed truncate">
                {task.description}
              </p>
            )}

            <div className="flex items-center gap-1.5 mt-2.5 flex-wrap">
              {/* Priority badge */}
              <span
                className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded"
                style={{ color: pConfig.color, background: pConfig.bg }}
              >
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: pConfig.color }} />
                {pConfig.label}
              </span>

              {/* Due date */}
              {due && (
                <span className="text-[11px] font-medium flex items-center gap-1" style={{ color: due.color }}>
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <rect x="1" y="2" width="10" height="9" rx="1.5" stroke={due.color} strokeWidth="1" />
                    <path d="M1 5h10" stroke={due.color} strokeWidth="1" />
                    <path d="M4 1v2M8 1v2" stroke={due.color} strokeWidth="1" strokeLinecap="round" />
                  </svg>
                  {due.text}
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </Draggable>
  );
}
