"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, Calendar, Clock, Edit, Trash2 } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import Link from "next/link"
import { useState, useRef } from "react"
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

  const handlePressStart = (e: React.TouchEvent | React.MouseEvent, project: Project) => {
    if (actionMenuProject) return; 
    e.preventDefault(); 
    setIsLongPress(false);
    
    // 👇 AQUÍ ESTÁ EL CAMBIO: 3000ms -> 1000ms
    pressTimer.current = setTimeout(() => {
      console.log("Long press activado!");
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

  const handleLinkClick = (e: React.MouseEvent) => {
    if (isLongPress) {
      e.preventDefault();
      setIsLongPress(false); 
    }
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
            className="hover:shadow-md transition-shadow flex flex-col h-full select-none"
            onMouseDown={(e) => handlePressStart(e, project)}
            onMouseUp={handlePressEnd}
            onMouseLeave={handlePressEnd} 
            onTouchStart={(e) => handlePressStart(e, project)}
            onTouchEnd={handlePressEnd}
          >
            
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: project.color }} />
                  <CardTitle className="text-lg">{project.name}</CardTitle>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="hidden md:inline-flex">
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
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">&nbsp;</p> 
              )}

              <div className="flex items-center justify-between">
                <Badge variant={project.status === "active" ? "default" : "secondary"}>{project.status}</Badge>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {new Date(project.updated_at).toLocaleDateString()}
                </div>
              </div>

              <Link href={`/projects/${project.id}`} className="mt-auto" onClickCapture={handleLinkClick}>
                <Button className="w-full mt-4 bg-transparent" variant="outline">
                  Open Project
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* EL DRAWER (POP-UP DE MÓVIL) */}
      <Drawer open={!!actionMenuProject} onOpenChange={(isOpen) => !isOpen && setActionMenuProject(null)}>
        <DrawerContent>
          <DrawerHeader className="text-left">
            <DrawerTitle>{actionMenuProject?.name}</DrawerTitle>
          </DrawerHeader>
          
          <div className="p-4 pt-0">
            <Button onClick={() => handleEditProject(actionMenuProject!)} variant="outline" className="w-full justify-start gap-2">
              <Edit className="h-4 w-4" />
              Edit Project
            </Button>
            
            <Button onClick={() => handleDeleteProject(actionMenuProject!)} variant="outline" className="w-full justify-start gap-2 mt-2 text-destructive">
              <Trash2 className="h-4 w-4" />
              Delete Project
            </Button>
            
            <DrawerClose asChild className="mt-4">
              <Button variant="outline" className="w-full">Cancel</Button>
            </DrawerClose>
          </div>
        </DrawerContent>
      </Drawer>
    </>
  )
}