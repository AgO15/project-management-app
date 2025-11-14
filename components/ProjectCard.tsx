// File: components/ProjectCard.tsx

"use client";

import Link from "next/link";
import { Project } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Clock } from "lucide-react";

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {

  const creationDate = new Date(project.created_at).toLocaleDateString();

  return (
    // 1. h-full para llenar la celda, flex-col para organizar verticalmente
    <Card className="flex flex-col h-full transition-shadow hover:shadow-md">
      
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full flex-shrink-0" style={{ backgroundColor: project.color || '#ccc' }} />
            <CardTitle className="line-clamp-1" title={project.name}>
              {project.name}
            </CardTitle>
          </div>
        </div>
        
        {/* Descripción en el Header (su lugar natural). line-clamp-3 limita el texto largo */}
        <CardDescription className="pt-2 line-clamp-3">
          {project.description || <span className="italic opacity-50">No description provided</span>}
        </CardDescription>
      </CardHeader>

      {/* 👇 2. EL TRUCO DEL ESPACIADOR (THE SPACER TRICK)
         Este div invisible tiene flex-1. Crecerá para ocupar TODO el espacio vacío 
         entre la descripción y el pie de página, empujando lo de abajo al fondo.
      */}
      <div className="flex-1" />

      {/* 3. Información de Estado y Fecha */}
      {/* Usamos un div manual aquí para controlar el padding exacto antes del botón */}
      <div className="px-6 pb-4 flex justify-between items-center text-sm text-muted-foreground">
          <span className="text-xs px-2 py-1 bg-muted rounded-md capitalize font-medium">
            {project.status}
          </span>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span>{creationDate}</span>
          </div>
      </div>
      
      {/* 4. Botón en el Footer */}
      <CardFooter className="pt-0">
        <Link href={`/dashboard/projects/${project.id}`} className="w-full block">
          <Button variant="outline" className="w-full">Open Project</Button>
        </Link>
      </CardFooter>

    </Card>
  );
}