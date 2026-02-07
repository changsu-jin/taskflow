"use client";

import { Task, Status, STATUS_CONFIG } from "@/lib/types";
import { Droppable } from "@hello-pangea/dnd";
import TaskCard from "./TaskCard";

interface KanbanColumnProps {
  status: Status;
  tasks: Task[];
  onAddClick: (status: Status) => void;
  onTaskClick: (task: Task) => void;
}

export default function KanbanColumn({ status, tasks, onAddClick, onTaskClick }: KanbanColumnProps) {
  const config = STATUS_CONFIG[status];

  return (
    <div className="flex-1 min-w-[280px] max-w-[380px] flex flex-col min-h-0">
      {/* Column Header */}
      <div className="flex items-center gap-2 px-1 py-2 mb-2">
        <span className="text-base leading-none">{config.icon}</span>
        <span className="text-sm font-semibold text-text-primary">{config.label}</span>
        <span
          className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
          style={{ color: config.color, background: `${config.color}15` }}
        >
          {tasks.length}
        </span>
        <div className="flex-1" />
        <button
          onClick={() => onAddClick(status)}
          className="w-6 h-6 rounded-md bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-lg text-text-secondary leading-none transition-colors"
        >
          +
        </button>
      </div>

      {/* Droppable Area */}
      <Droppable droppableId={status}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className="flex-1 overflow-y-auto p-1 rounded-xl flex flex-col gap-2 transition-colors duration-200"
            style={{
              background: snapshot.isDraggingOver ? `${config.color}08` : "transparent",
              border: snapshot.isDraggingOver
                ? `2px dashed ${config.color}40`
                : "2px dashed transparent",
            }}
          >
            {tasks.map((task, index) => (
              <TaskCard key={task.id} task={task} index={index} onClick={onTaskClick} />
            ))}
            {provided.placeholder}

            {tasks.length === 0 && !snapshot.isDraggingOver && (
              <div className="p-6 text-center text-text-muted text-sm border border-dashed border-border rounded-xl">
                할일을 드래그하여 이동하세요
              </div>
            )}
          </div>
        )}
      </Droppable>
    </div>
  );
}
