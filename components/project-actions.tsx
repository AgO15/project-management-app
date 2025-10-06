"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Pencil, Eye, Trash2 } from "lucide-react";

interface ProjectActionsProps {
  projectId: string;
}

export function ProjectActions({ projectId }: ProjectActionsProps) {
  const router = useRouter();

  const handleView = () => {
    router.push(`/dashboard/projects/${projectId}`);
  };

  const handleEdit = () => {
    // If there's a dedicated edit page, navigate there; otherwise focus inline editors
    const editable = document.querySelector('[data-editable="project-name"]') as HTMLElement | null;
    if (editable) editable.focus();
  };

  const handleDelete = async () => {
    const confirmed = confirm("Are you sure you want to delete this project? This cannot be undone.");
    if (!confirmed) return;
    try {
      const res = await fetch(`/api/files/delete?scope=project&id=${projectId}`, { method: "DELETE" });
      // NOTE: replace with real delete endpoint when available
      if (!res.ok) throw new Error("Delete failed");
      router.push("/dashboard");
    } catch (e) {
      alert((e as Error).message);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Project actions">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onSelect={handleView}>
          <Eye className="mr-2 h-4 w-4" />
          <span>View Details</span>
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={handleEdit}>
          <Pencil className="mr-2 h-4 w-4" />
          <span>Edit Project</span>
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={handleDelete} className="text-red-500">
          <Trash2 className="mr-2 h-4 w-4" />
          <span>Delete Project</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}


