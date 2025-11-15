"use client";

import { useState } from "react"; 
import { toast } from "sonner";
import { updateProjectField } from "@/app/actions";
import { EditableText } from "@/components/EditableText";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

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
  const [currentStatus, setCurrentStatus] = useState(project.status);

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

  const handleStatusChange = async (newStatus: string) => {
    if (!newStatus || newStatus === currentStatus) {
      return;
    }

    const oldStatus = currentStatus;
    setCurrentStatus(newStatus); 
    
    toast.info("Updating project status...");

    const result = await updateProjectField(project.id, "status", newStatus);

    if (result.success) {
      toast.success("Status updated to: " + newStatus);
    } else {
      toast.error(result.error);
      setCurrentStatus(oldStatus); 
    }
  };

  return (
    <div className="px-3 sm:px-4 py-3 border-b border-border">
      <div className="flex justify-between items-start gap-3 sm:gap-4">
        <div className="flex items-start gap-2 sm:gap-4 flex-grow">
          <div className="flex-grow">
            {/* Title */}
            <div className="flex items-start gap-2 sm:gap-3">
              <div
                className="w-3 h-3 sm:w-4 sm:h-4 mt-2 flex-shrink-0"
                style={{ backgroundColor: project.color, filter: 'saturate(1.5) brightness(1.2)' }}
              />
              <EditableText
                as="h1"
                initialValue={project.name}
                onSave={handleSaveName}
              />
            </div>
            
            {/* "Semaphore" ToggleGroup */}
            <div className="mt-2">
              <ToggleGroup
                type="single"
                value={currentStatus}
                // 👇 ¡AQUÍ ESTÁ EL ARREGLO!
                onValueChange={handleStatusChange}
                className="flex gap-2 justify-start"
              >
                <ToggleGroupItem 
                  value="active" 
                  aria-label="Active" 
                  variant="outline"
                  className="px-3 whitespace-nowrap data-[state=on]:bg-primary data-[state=on]:text-primary-foreground hover:bg-primary/80 hover:text-primary-foreground"
                >
                  Active
                </ToggleGroupItem>
                <ToggleGroupItem 
                  value="paused" 
                  aria-label="Paused" 
                  variant="outline"
                  className="px-3 whitespace-nowrap data-[state=on]:bg-yellow-500 data-[state=on]:text-black hover:bg-yellow-500/80 hover:text-black"
                >
                  Paused
                </ToggleGroupItem>
                <ToggleGroupItem 
                  value="not_started" 
                  aria-label="Not Started" 
                  variant="outline"
                  className="px-3 whitespace-nowrap data-[state=on]:bg-destructive data-[state=on]:text-destructive-foreground hover:bg-destructive/80 hover:text-destructive-foreground"
                >
                  Not Started
                </ToggleGroupItem>
              </ToggleGroup>
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