"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, Calendar, Clock } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import Link from "next/link"

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
    // 1. 👇 FORZAR FILAS DE IGUAL ALTURA AQUÍ
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 grid-auto-rows-fr">
      {projects.map((project) => (
        
        // 2. 👇 FORZAR TARJETA A LLENAR Y SER FLEX-COL
        <Card key={project.id} className="hover:shadow-md transition-shadow flex flex-col h-full">
          
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: project.color }} />
                <CardTitle className="text-lg">{project.name}</CardTitle>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href={`/projects/${project.id}`}>View Details</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>Edit Project</DropdownMenuItem>
                  <DropdownMenuItem className="text-destructive">Delete Project</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardHeader>
          
          {/* 3. 👇 FORZAR CONTENIDO A CRECER (flex-1) */}
          <CardContent className="flex-1 flex flex-col">
            {project.description ? (
              <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{project.description}</p>
            ) : (
              // Relleno invisible para mantener espaciado
              <p className="text-sm text-muted-foreground mb-4 line-clamp-2">&nbsp;</p> 
            )}

            <div className="flex items-center justify-between">
              <Badge variant={project.status === "active" ? "default" : "secondary"}>{project.status}</Badge>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                {new Date(project.updated_at).toLocaleDateString()}
              </div>
            </div>

            {/* 4. 👇 EMPUJAR BOTÓN AL FONDO CON mt-auto */}
            <Link href={`/projects/${project.id}`} className="mt-auto">
              <Button className="w-full mt-4 bg-transparent" variant="outline">
                Open Project
              </Button>
            </Link>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}