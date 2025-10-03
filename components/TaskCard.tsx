// File: components/TaskCard.tsx

"use client";

import { Task } from "@/lib/types";
import { TaskNotes } from "./task-notes"; // <-- Correctamente importado
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { MoreHorizontal, Pencil, Copy, Trash2 } from "lucide-react";

interface TaskCardProps {
  task: Task;
}

export function TaskCard({ task }: TaskCardProps) {
  const handleEdit = () => {
    alert(`Editing task: ${task.title}`);
  };

  const handleDuplicate = () => {
    alert(`Duplicating task: ${task.title}`);
  };

  const handleDelete = () => {
    if (confirm(`Are you sure you want to delete "${task.title}"?`)) {
      alert(`Deleting task: ${task.title}`);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between">
        <div>
          <CardTitle>{task.title}</CardTitle>
          <CardDescription>{task.description}</CardDescription>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="flex-shrink-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onSelect={handleEdit}>
              <Pencil className="mr-2 h-4 w-4" />
              <span>Edit</span>
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={handleDuplicate}>
              <Copy className="mr-2 h-4 w-4" />
              <span>Duplicate</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={handleDelete}
              className="text-red-500 focus:bg-red-50 focus:text-red-600"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              <span>Delete</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>

      {/* --- CÓDIGO ACTUALIZADO AQUÍ --- */}
      <CardContent className="pt-4 border-t mt-2">
        {/* Le pasamos el ID de la tarea y sus notas al componente hijo */}
        <TaskNotes taskId={task.id} projectId={task.project_id} notes={task.notes} />
      </CardContent>
    </Card>
  );
}