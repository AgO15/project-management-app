// File: components/ProjectCard.tsx

"use client";

import Link from "next/link";
import { Project } from "@/lib/types";
import { Button } from "@/components/ui/button"; // <-- ¡AQUÍ ESTÁ EL ARREGLO!
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Clock } from "lucide-react";

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {

  const creationDate = new Date(project.created_at).toLocaleDateString();

  return (
    // 1. h-full: Hace que todas las tarjetas tengan la misma altura
    //    justify-between: Empuja el footer (fecha/estado) al fondo
    <Card className="flex flex-col justify-between h-full transition-shadow hover:shadow-md">
      
      {/* 2. flex-1 y flex-col: Hacemos que este bloque (todo menos el footer)
             ocupe todo el espacio sobrante y se organice en columna */}
      <div className="flex-1 flex flex-col">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full" style={{ backgroundColor: project.color || '#ccc' }} />
              <CardTitle className="line-clamp-1">{project.name}</CardTitle>
            </div>
          </div>
          <CardDescription className="pt-2 line-clamp-3">
             {/* Si no hay descripción, ponemos un espacio invisible para mantener la altura */}
             {project.description || <span>&nbsp;</span>}
          </CardDescription>
        </CardHeader>
        
        {/* 3. mt-auto: ¡LA MAGIA! Esto empuja el botón (CardContent)
               al fondo de este bloque flexible. */}
        <CardContent className="mt-auto pt-4">
          <Link href={`/dashboard/projects/${project.id}`}>
            <Button variant="outline" className="w-full">Open Project</Button>
          </Link>
        </CardContent>
      </div>
      
      <CardFooter className="flex justify-between items-center text-sm text-muted-foreground pt-4 border-t">
        <span className="text-xs px-2 py-1 bg-muted rounded-md capitalize">
          {project.status}
        </span>
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4" />
          <span> 
            {creationDate}
          </span>
        </div>
      </CardFooter>
    </Card>
  );
}