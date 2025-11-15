"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, Calendar, Clock, Edit, Trash2 } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import Link from "next/link"
import { useState, useRef } from "react"
import { useRouter } from "next/navigation" // 1. IMPORTAR useRouter
import { 
  Drawer, 
  DrawerContent, 
  DrawerHeader, 
  DrawerTitle, 
  DrawerClose 
} from "@/components/ui/drawer"

interface Project {
  id: string
  name: string
  description: string | null
  color: string
  status: string
  created_at: string
  updated_at: string
}

interface ProjectListProps {
  projects: Project[]
}

export function ProjectList({ projects }: ProjectListProps) {
  
  const [actionMenuProject, setActionMenuProject] = useState<Project | null>(null);
  const [isLongPress, setIsLongPress] = useState(false);
  const pressTimer = useRef<NodeJS.Timeout | null>(null);
  const router = useRouter(); // 2. INICIALIZAR useRouter

  const handlePressStart = (e: React.TouchEvent | React.MouseEvent, project: Project) => {
    // No iniciar un nuevo timer si el menú ya está abierto
    if (actionMenuProject) return; 
    
    // Prevenir selección de texto (ya lo teníamos)
    e.preventDefault(); 
    setIsLongPress(false);
    
    pressTimer.current = setTimeout(() => {
      setIsLongPress(true); 
      setActionMenuProject(project); 
    }, 1000); // 1 segundo
  };

  const handlePressEnd = () => {
    if (pressTimer.current) {
      clearTimeout(pressTimer.current);
      pressTimer.current = null;
    }
  };

  // 3. NUEVA FUNCIÓN para manejar el clic en la tarjeta
  const handleCardClick = (projectId: string) => {
    if (isLongPress) {
      // Si fue un long press, reseteamos el flag y NO navegamos
      setIsLongPress(false);
      return;
    }
    // Si fue un tap normal, navegamos
    router.push(`/projects/${projectId}`);
  };

  const handleEditProject = (project: Project) => {
    alert(`Editando: ${project.name}`);
    setActionMenuProject(null);
  };

  const handleDeleteProject = (project: Project) => {
    if (confirm(`Seguro que quieres borrar "${project.name}"?`)) {
      alert(`Borrando: ${project.name}`);
      setActionMenuProject(null);
    }
  };
  
  if (projects.length === 0) {
    // ... (Tu estado vacío no cambia) ...
    return (
      <div className="text-center py-12">
        <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
      	<Calendar className="h-8 w-8 text-muted-foreground" />
    	</div>
    	<h3 className="text-lg font-medium text-foreground mb-2">No projects yet</h3>
    	<p className="text-muted-foreground mb-4">Create your first project to get started with task management</p>
      </div>
    )
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 grid-auto-rows-fr">
        {projects.map((project) => (
          
          <Card 
            key={project.id} 
            className="transition-colors flex flex-col h-full select-none border border-border hover:border-primary cursor-pointer" // 4. AÑADIDO cursor-pointer
            onMouseDown={(e) => handlePressStart(e, project)}
            onMouseUp={handlePressEnd}
            onMouseLeave={handlePressEnd} 
            onTouchStart={(e) => handlePressStart(e, project)}
            onTouchEnd={handlePressEnd}
            onClick={() => handleCardClick(project.id)} // 5. AÑADIDO onClick
          >
            
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3" style={{ backgroundColor: project.color, filter: 'saturate(1.5) brightness(1.2)' }} />
                  <CardTitle className="text-lg">{project.name}</CardTitle>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="hidden md:inline-flex hover:bg-secondary"
                      onClick={(e) => {
                        e.stopPropagation(); // Evitar que el clic en el menú dispare el clic de la tarjeta
                        setIsLongPress(true); // Prevenir navegación si se hace clic accidentalmente
                      }}
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href={`/projects/${project.id}`}>View Details</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleEditProject(project)}>Edit Project</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleDeleteProject(project)} className="text-destructive">Delete Project</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            
            <CardContent className="flex-1 flex flex-col">
              {project.description ? (
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{project.description}</p>
              ) : (
                // 6. CORREGIDO el error de tipeo </Sip>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">&nbsp;</p> 
              )}

              <div className="flex items-center justify-between">
                <Badge variant={project.status === "active" ? "default" : "secondary"}>{project.status}</Badge>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {new Date(project.updated_at).toLocaleDateString()}
                </div>
              </div>

              {/* El Link se queda pero el Botón se oculta en móvil */}
              <Link 
                href={`/projects/${project.id}`} 
                className="mt-auto" 
                onClick={(e) => e.stopPropagation()} // Evitar doble navegación
                tabIndex={-1} // Quitar de la navegación por teclado (la tarjeta ya lo hace)
              >
                <Button 
                  className="w-full mt-4 hidden md:flex hover:bg-primary hover:text-primary-foreground" // 7. OCULTO en móvil (hidden), VISIBLE en desktop (md:flex)
                  variant="outline"
                >
                  Open Project
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ... (Tu componente Drawer no cambia) ... */}
      <Drawer open={!!actionMenuProject} onOpenChange={(isOpen) => !isOpen && setActionMenuProject(null)}>
        <DrawerContent>
          <DrawerHeader className="text-left">
            <DrawerTitle>{actionMenuProject?.name}</DrawerTitle>
          </DrawerHeader>
          
          <div className="p-4 pt-0">
            <Button onClick={() => handleEditProject(actionMenuProject!)} variant="ghost" className="w-full justify-start gap-2 hover:bg-secondary">
              <Edit className="h-4 w-4" />
              Edit Project
            </Button>
            
            <Button onClick={() => handleDeleteProject(actionMenuProject!)} variant="ghost" className="w-full justify-start gap-2 mt-2 text-destructive hover:bg-destructive hover:text-destructive-foreground">
              <Trash2 className="h-4 w-4" />
              Delete Project
            </Button>
            
            <DrawerClose asChild className="mt-4">
              <Button variant="outline" className="w-full hover:bg-secondary">Cancel</Button>
            </DrawerClose>
          </div>
        </DrawerContent>
      </Drawer>
    </>
  )
}