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
    // 1. Añadimos h-full para que la tarjeta llene la celda del grid
    <Card className="flex flex-col h-full">
      
      {/* 2. ELIMINÉ EL DIV ENVOLTORIO que tenías aquí */}
      
      {/* 3. Añadimos flex-1 para que este bloque ocupe todo el espacio sobrante */}
      <CardHeader className="flex-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full flex-shrink-0" style={{ backgroundColor: project.color || '#ccc' }} />
            <CardTitle className="line-clamp-1" title={project.name}>
              {project.name}
            </CardTitle>
          </div>
        </div>
        {/* 4. Añadimos line-clamp para limitar líneas y min-h para consistencia visual */}
        <CardDescription className="pt-2 line-clamp-3">
          {project.description || <span className="italic opacity-50">No description provided</span>}
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-0">
        <Link href={`/dashboard/projects/${project.id}`} className="w-full block">
          <Button variant="outline" className="w-full">Open Project</Button>
        </Link>
      </CardContent>
      
      <CardFooter className="flex justify-between items-center text-sm text-muted-foreground border-t pt-4 mt-auto">
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