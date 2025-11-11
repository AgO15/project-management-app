// File: components/TaskCard.tsx (ACTUALIZADO)

"use client";

import { Task } from "@/lib/types";
import { TaskNotes } from "./task-notes"; // <-- Tu componente de notas existente
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
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"; // <-- Importar Collapsible
import { Badge } from "@/components/ui/badge"; // <-- Importar Badge
import {
  MoreHorizontal,
  Pencil,
  Copy,
  Trash2,
  Clock, // <-- Icono para Time Entries
  FileText, // <-- Icono para Files
  ChevronRight, // <-- Icono para desplegar
} from "lucide-react";
import React from "react"; // <-- Importar React

interface TaskCardProps {
  task: Task;
}

// --- Componentes Placeholder para el contenido (puedes moverlos a sus propios archivos si crecen) ---

function TaskTimeEntries({ taskId }: { taskId: string }) {
  // ⚠️ TODO: Aquí deberás hacer fetch de las entradas de tiempo reales
  const totalTime = "30m"; // Valor de ejemplo
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className="flex items-center justify-between">
        <CollapsibleTrigger asChild>
          <Button variant="ghost" size="sm" className="flex items-center gap-2 p-0 h-auto">
            <ChevronRight className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-90' : ''}`} />
            <Clock className="h-4 w-4" />
            <span className="text-sm">Time Entries</span>
          </Button>
        </CollapsibleTrigger>
        {totalTime && (
          <Badge variant="secondary" className="text-xs">{totalTime}</Badge>
        )}
      </div>
      <CollapsibleContent className="mt-2 pl-6">
        <p className="text-sm text-muted-foreground">Aquí se mostrarán las entradas de tiempo...</p>
      </CollapsibleContent>
    </Collapsible>
  );
}

function TaskFiles({ taskId }: { taskId: string }) {
  // ⚠️ TODO: Aquí deberás hacer fetch de los archivos
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <Button variant="ghost" size="sm" className="flex items-center gap-2 p-0 h-auto">
          <ChevronRight className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-90' : ''}`} />
          <FileText className="h-4 w-4" />
          <span className="text-sm">Files</span>
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="mt-2 pl-6">
        <p className="text-sm text-muted-foreground">Aquí se mostrarán los archivos...</p>
      </CollapsibleContent>
    </Collapsible>
  );
}

// --- Componente TaskCard Principal ---

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
          <CardDescription className="break-words">
            {task.description}
          </CardDescription>
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

      {/* --- CONTENIDO DE LA TARJETA ACTUALIZADO --- */}
      <CardContent className="pt-4 border-t mt-2 space-y-2">
        
        {/* 1. Sección de Time Entries (nuevo) */}
        <TaskTimeEntries taskId={task.id} />
        
        {/* 2. Sección de Notas (tu componente existente) */}
        <TaskNotes 
          taskId={task.id} 
          projectId={task.project_id} 
          notes={task.notes} 
        />
        
        {/* 3. Sección de Files (nuevo) */}
        <TaskFiles taskId={task.id} />
      
      </CardContent>
    </Card>
  );
}