"use client";

import Link from "next/link";
import { Project } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Clock } from "lucide-react";
import { cn } from "@/lib/utils"; // Importamos cn para mezclar clases limpiamente

interface ProjectCardProps {
  project: Project;
}

// Definimos los estilos según el estatus para que coincidan con el Header
const statusStyles: Record<string, string> = {
  active: "bg-primary/20 text-primary border-primary/30", // Verde Neón
  paused: "bg-yellow-500/20 text-yellow-500 border-yellow-500/30", // Amarillo
  not_started: "bg-destructive/20 text-destructive border-destructive/30", // Rojo
  completed: "bg-blue-500/20 text-blue-500 border-blue-500/30", // Azul (extra por si acaso)
  archived: "bg-muted text-muted-foreground border-border", // Gris
};

export function ProjectCard({ project }: ProjectCardProps) {

  const creationDate = new Date(project.created_at).toLocaleDateString();
  
  // Obtenemos el estilo correspondiente, o usamos gris por defecto
  const statusClass = statusStyles[project.status] || statusStyles.archived;

  // Formateamos el texto (ej: "not_started" -> "Not Started")
  const statusLabel = project.status.replace(/_/g, " ");

  return (
    <Card className="flex flex-col justify-between h-full transition-all hover:shadow-md hover:border-primary/50">
      
      <div className="flex-1 flex flex-col">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {/* El punto de color también respeta el color del proyecto si existe */}
              <span className="h-3 w-3 rounded-full" style={{ backgroundColor: project.color || '#ccc' }} />
              <CardTitle className="line-clamp-1">{project.name}</CardTitle>
            </div>
          </div>
          <CardDescription className="pt-2 line-clamp-3">
             {project.description || <span>&nbsp;</span>}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="mt-auto pt-4">
          <Link href={`/projects/${project.id}`}>
            <Button variant="outline" className="w-full hover:bg-primary/10 hover:text-primary hover:border-primary">
              Open Project
            </Button>
          </Link>
        </CardContent>
      </div>
      
      <CardFooter className="flex justify-between items-center text-sm text-muted-foreground pt-4 border-t border-border/50">
        {/* 👇 AQUÍ ESTÁ EL CAMBIO DE COLOR 👇 */}
        <span className={cn("text-xs px-2.5 py-1 rounded-md capitalize border font-medium transition-colors", statusClass)}>
          {statusLabel}
        </span>
        
        <div className="flex items-center gap-2 text-xs opacity-70">
          <Clock className="h-3 w-3" />
          <span> 
            {creationDate}
          </span>
        </div>
      </CardFooter>
    </Card>
  );
}