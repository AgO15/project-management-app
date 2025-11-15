"use client";

// ELIMINAMOS useState y useEffect. ¡Ya no los necesitamos!
import { toast } from "sonner";
import { updateProjectField } from "@/app/actions";
import { EditableText } from "@/components/EditableText";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useRouter } from "next/navigation"; // Importamos useRouter

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
  const router = useRouter(); // Usaremos router para refrescar

  const handleSaveName = async (newName: string) => {
    // ... (esta función no cambia)
    const result = await updateProjectField(project.id, "name", newName);
    if (result.success) {
      toast.success("Project name updated.");
    } else {
      toast.error(result.error);
    }
  };

  const handleSaveDescription = async (newDescription: string) => {
    // ... (esta función no cambia)
    const result = await updateProjectField(project.id, "description", newDescription);
    if (result.success) {
      toast.success("Project description updated.");
    } else {
      toast.error(result.error);
    }
  };

  // ESTA FUNCIÓN AHORA ES MÁS SIMPLE
  const handleStatusChange = (newStatus: string) => {
    // Si no hay valor nuevo (ej: clic en el mismo botón), no hacer nada
    if (!newStatus || newStatus === project.status) {
      return;
    }

    toast.info("Updating project status...");

    // Llamamos a la Server Action. No esperamos (fire-and-forget).
    // revalidatePath (en actions.ts) se encargará de refrescar los props.
    updateProjectField(project.id, "status", newStatus)
      .then((result) => {
        if (result.success) {
          toast.success("Status updated!");
          // Forzamos un refresh del router para asegurar que los datos se actualicen
          router.refresh(); 
        } else {
          toast.error(result.error);
        }
      });
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
                // AHORA LEE DIRECTAMENTE DEL PROP
                value={project.status} 
                onValueChange={handleStatusChange}
                className="flex gap-2 justify-start"
              >
                {/* CAMBIOS DE ESTILO: px-4 y whitespace-nowrap */}
                <ToggleGroupItem 
                  value="active" 
                  aria-label="Active" 
                  variant="outline"
                  className="px-4 whitespace-nowrap data-[state=on]:bg-primary data-[state=on]:text-primary-foreground hover:bg-primary/80 hover:text-primary-foreground"
                >
                  Active
                </ToggleGroupItem>
                <ToggleGroupItem 
                  value="paused" 
                  aria-label="Paused" 
                  variant="outline"
                  className="px-4 whitespace-nowrap data-[state=on]:bg-yellow-500 data-[state=on]:text-black hover:bg-yellow-500/80 hover:text-black"
                >
                  Paused
                </ToggleGroupItem>
                <ToggleGroupItem 
                  value="not_started" 
                  aria-label="Not Started" 
                  variant="outline"
                  className="px-4 whitespace-nowrap data-[state=on]:bg-destructive data-[state=on]:text-destructive-foreground hover:bg-destructive/80 hover:text-destructive-foreground"
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