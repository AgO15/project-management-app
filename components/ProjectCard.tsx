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
    // 1. h-full y flex-col aseguran que todas las tarjetas midan lo mismo
    <Card className="flex flex-col h-full">
      
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full flex-shrink-0" style={{ backgroundColor: project.color || '#ccc' }} />
            <CardTitle className="line-clamp-1" title={project.name}>
              {project.name}
            </CardTitle>
          </div>
        </div>
      </CardHeader>

      {/* 2. flex-1 hace que este contenedor crezca para llenar el espacio vacío */}
      <CardContent className="flex-1 flex flex-col">
        
        {/* Descripción: Ocupa su espacio natural */}
        <CardDescription className="line-clamp-3 mb-4">
          {project.description || <span className="italic opacity-50">No description provided</span>}
        </CardDescription>

        {/* 3. mt-auto empuja esta fila (Estado y Fecha) hacia el fondo del Content */}
        <div className="mt-auto flex justify-between items-center text-sm text-muted-foreground pt-2">
            <span className="text-xs px-2 py-1 bg-muted rounded-md capitalize">
            {project.status}
            </span>
            <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span>{creationDate}</span>
            </div>
        </div>
      </CardContent>
      
      {/* 4. El botón vive en el Footer, siempre alineado abajo */}
      <CardFooter className="pt-0">
        <Link href={`/dashboard/projects/${project.id}`} className="w-full block">
          <Button variant="outline" className="w-full">Open Project</Button>
        </Link>
      </CardFooter>
    </Card>
  );
}