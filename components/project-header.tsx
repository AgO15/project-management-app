"use client";

import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { updateProjectField } from "@/app/actions";
import { EditableText } from "@/components/EditableText";

// This interface matches the one you provided
interface Project {
  id: string;
  name: string;
  description: string | null;
  color: string;
  status: string;
  created_at: string;
  updated_at: string;
}

interface ProjectHeaderProps {
  project: Project;
}

export function ProjectHeader({ project }: ProjectHeaderProps) {
  const handleSaveName = async (newName: string) => {
    const result = await updateProjectField(project.id, "name", newName);
    if (result.success) {
      toast.success("Project name updated.");
    } else {
      toast.error(result.error);
    }
  };

  const handleSaveDescription = async (newDescription: string) => {
    const result = await updateProjectField(project.id, "description", newDescription);
    if (result.success) {
      toast.success("Project description updated.");
    } else {
      toast.error(result.error);
    }
  };

  return (
    <div className="p-4 border-b">
      <div className="flex justify-between items-start gap-4">
        <div className="flex items-start gap-4 flex-grow">
          <div
            className="w-4 h-4 rounded-full mt-2 flex-shrink-0"
            style={{ backgroundColor: project.color }}
          />
          <div className="flex-grow">
            {/* New container for title and badge */}
            <div className="flex items-center gap-3">
              <EditableText
                as="h1"
                initialValue={project.name}
                onSave={handleSaveName}
              />
              <Badge variant={project.status === "active" ? "default" : "secondary"}>
                {project.status}
              </Badge>
            </div>
            
            <EditableText
              as="textarea"
              initialValue={project.description || ""}
              onSave={handleSaveDescription}
            />
          </div>
        </div>
      </div>
    </div>
  );
}